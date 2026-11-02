import type { FacetCountRow, IAnalyticsRepository } from "./analytics.repository";
import { EMPTY_DETAIL_RESULT } from "./analytics.repository";

export interface AnalyticsSummaryItem {
  shortCode: string;
  originalUrl: string;
  totalClicks: number;
  uniqueVisitors: number;
  lastClickedAt: Date | null;
  topCountry: string | null;
  topDevice: string | null;
  topReferrer: string | null;
  continuedClicks: number;
  capturedCount: number;
  topScreen: string | null;
}

export interface BreakdownItem {
  id: string;
  count: number;
}

export interface DetailedAnalytics {
  shortCode: string;
  originalUrl: string;
  totalClicks: number;
  uniqueVisitors: number;
  continuedClicks: number;
  timeline: { date: string; count: number }[];
  devices: BreakdownItem[];
  browsers: BreakdownItem[];
  os: BreakdownItem[];
  countries: BreakdownItem[];
  cities: BreakdownItem[];
  referrers: BreakdownItem[];
  utmSources: BreakdownItem[];
  utmMediums: BreakdownItem[];
  utmCampaigns: BreakdownItem[];
  bots: BreakdownItem[];
  languages: BreakdownItem[];
  inAppBrowsers: BreakdownItem[];
  screens: BreakdownItem[];
  connections: BreakdownItem[];
  capturedCount: number;
}

/**
 * SRP: analytics aggregation orchestration. Queries via IAnalyticsRepository (DIP).
 */
export class AnalyticsService {
  constructor(private readonly analytics: IAnalyticsRepository) {}

  async getAnalyticsSummary(userId: string): Promise<AnalyticsSummaryItem[]> {
    const links = await this.analytics.findUserShortCodes(userId);
    if (!links.length) return [];

    const shortCodes = links.map((link) => link.shortCode);
    const aggResult = await this.analytics.summaryAggregate(shortCodes);

    const statsMap = new Map(aggResult?.basicStats?.map((s) => [s._id, s]) || []);
    const countriesMap = new Map(aggResult?.topCountries?.map((c) => [c._id, c.topCountry]) || []);
    const devicesMap = new Map(aggResult?.topDevices?.map((d) => [d._id, d.topDevice]) || []);
    const referrersMap = new Map(aggResult?.topReferrers?.map((r) => [r._id, r.topReferrer]) || []);
    const screensMap = new Map(
      aggResult?.topScreens?.map((s) => [s._id, s.top]) || [],
    );

    return links.map((link) => {
      const stats = statsMap.get(link.shortCode) as
        | { totalClicks: number; uniqueVisitors: number; continuedClicks: number; capturedCount: number; lastClickedAt: Date | null }
        | undefined;
      const defaultStats = { totalClicks: 0, uniqueVisitors: 0, continuedClicks: 0, capturedCount: 0, lastClickedAt: null };
      const finalStats = stats || defaultStats;
      const topScreenRaw = screensMap.get(link.shortCode) as { w: number; h: number } | undefined;
      return {
        shortCode: link.shortCode,
        originalUrl: link.url,
        totalClicks: finalStats.totalClicks || 0,
        uniqueVisitors: finalStats.uniqueVisitors || 0,
        lastClickedAt: finalStats.lastClickedAt || null,
        topCountry: (countriesMap.get(link.shortCode) as string) || null,
        topDevice: (devicesMap.get(link.shortCode) as string) || null,
        topReferrer: (referrersMap.get(link.shortCode) as string) || null,
        continuedClicks: finalStats.continuedClicks || 0,
        capturedCount: finalStats.capturedCount || 0,
        topScreen: topScreenRaw ? `${topScreenRaw.w}x${topScreenRaw.h}` : null,
      };
    });
  }

  async getLinkAnalytics(
    shortCode: string,
    userId: string,
  ): Promise<DetailedAnalytics | { status: number; message: string }> {
    const link = await this.analytics.findLinkForUser(shortCode, userId);
    if (!link) {
      return { status: 404, message: "Link not found or access denied." };
    }

    const result = (await this.analytics.detailAggregate(shortCode)) ?? EMPTY_DETAIL_RESULT;
    const formatBreakdown = (data: FacetCountRow[]) =>
      data.map((item) => ({ id: item._id, count: item.count })).filter((item) => item.id !== "unknown" && item.id !== "none");

    return {
      shortCode: link.shortCode,
      originalUrl: link.url,
      totalClicks: result.summary[0]?.totalClicks || 0,
      continuedClicks: result.summary[0]?.continuedClicks || 0,
      capturedCount: result.summary[0]?.capturedCount || 0,
      uniqueVisitors: result.summary[0]?.uniqueVisitors || 0,
      timeline: result.timeline.map((t) => ({ date: t._id, count: t.count })),
      devices: formatBreakdown(result.devices),
      browsers: formatBreakdown(result.browsers),
      os: formatBreakdown(result.os),
      countries: formatBreakdown(result.countries),
      cities: formatBreakdown(result.cities),
      referrers: formatBreakdown(result.referrers),
      utmSources: formatBreakdown(result.utmSources),
      utmMediums: formatBreakdown(result.utmMediums),
      utmCampaigns: formatBreakdown(result.utmCampaigns),
      bots: formatBreakdown(result.bots),
      languages: formatBreakdown(result.languages),
      inAppBrowsers: formatBreakdown(result.inAppBrowsers),
      screens: result.screenSizes.map((s) => ({
        id: `${s._id.w}x${s._id.h}`,
        count: s.count,
      })),
      connections: formatBreakdown(result.connections),
    };
  }
}


