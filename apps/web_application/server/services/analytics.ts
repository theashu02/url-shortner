import { connectToDatabase } from "@/server/db/mongoose";
import { ClickEventModel } from "@/server/models/clickEvent";
import { UrlModel } from "@/server/models/url";

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

export async function getAnalyticsSummary(userId: string): Promise<AnalyticsSummaryItem[]> {
  await connectToDatabase();

  const links = await UrlModel.find({ userId }).select("shortCode url createdAt").lean();
  if (!links.length) return [];

  const shortCodes = links.map((link) => link.shortCode);

  const pipeline: any[] = [
    { $match: { shortCode: { $in: shortCodes } } },
    {
      $facet: {
        basicStats: [
          {
            $group: {
              _id: "$shortCode",
              totalClicks: { $sum: 1 },
              uniqueVisitors: { $addToSet: "$visitorHash" },
              continuedClicks: { $sum: { $cond: ["$continued", 1, 0] } },
              capturedCount: { $sum: { $cond: [{ $ne: ["$capturedAt", null] }, 1, 0] } },
              lastClickedAt: { $max: "$clickedAt" },
            },
          },
          {
            $project: {
              totalClicks: 1,
              uniqueVisitors: { $size: "$uniqueVisitors" },
              continuedClicks: 1,
              capturedCount: 1,
              lastClickedAt: 1,
            },
          },
        ],
        topCountries: [
          { $group: { _id: { shortCode: "$shortCode", country: "$geoCountry" }, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $group: { _id: "$_id.shortCode", topCountry: { $first: "$_id.country" } } },
        ],
        topDevices: [
          { $group: { _id: { shortCode: "$shortCode", device: "$deviceType" }, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $group: { _id: "$_id.shortCode", topDevice: { $first: "$_id.device" } } },
        ],
        topReferrers: [
          { $group: { _id: { shortCode: "$shortCode", referrer: "$referrerType" }, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $group: { _id: "$_id.shortCode", topReferrer: { $first: "$_id.referrer" } } },
        ],
        topScreens: [
          { $match: { screenWidth: { $type: "number" }, screenHeight: { $type: "number" } } },
          { $group: { _id: { shortCode: "$shortCode", w: "$screenWidth", h: "$screenHeight" }, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $group: { _id: "$_id.shortCode", top: { $first: "$_id" } } },
        ],
      },
    },
  ];

  const [aggResult] = await ClickEventModel.aggregate(pipeline);

  const statsMap = new Map(aggResult?.basicStats?.map((s: any) => [s._id, s]) || []);
  const countriesMap = new Map(aggResult?.topCountries?.map((c: any) => [c._id, c.topCountry]) || []);
  const devicesMap = new Map(aggResult?.topDevices?.map((d: any) => [d._id, d.topDevice]) || []);
  const referrersMap = new Map(aggResult?.topReferrers?.map((r: any) => [r._id, r.topReferrer]) || []);
  const screensMap = new Map(
    aggResult?.topScreens?.map(
      (s: { _id: string; top: { w: number; h: number } }) => [s._id, s.top],
    ) || [],
  );

  return links.map((link) => {
    const stats = statsMap.get(link.shortCode) as { totalClicks: number; uniqueVisitors: number; continuedClicks: number; capturedCount: number; lastClickedAt: Date | null } | undefined;
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
      topScreen: topScreenRaw ? `${topScreenRaw.w}×${topScreenRaw.h}` : null,
    };
  });
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
}

export async function getLinkAnalytics(
  shortCode: string,
  userId: string
): Promise<DetailedAnalytics | { status: number; message: string }> {
  await connectToDatabase();

  const link = await UrlModel.findOne({ shortCode, userId }).lean();
  if (!link) {
    return { status: 404, message: "Link not found or access denied." };
  }

  const pipeline: any[] = [
    { $match: { shortCode } },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalClicks: { $sum: 1 },
              uniqueVisitors: { $addToSet: "$visitorHash" },
              continuedClicks: { $sum: { $cond: ["$continued", 1, 0] } },
            },
          },
          {
            $project: {
              totalClicks: 1,
              uniqueVisitors: { $size: "$uniqueVisitors" },
              continuedClicks: 1,
            },
          },
        ],
        timeline: [
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$clickedAt" } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
        devices: [{ $group: { _id: { $ifNull: ["$deviceType", "unknown"] }, count: { $sum: 1 } } }, { $sort: { count: -1 } }],
        browsers: [{ $group: { _id: { $ifNull: ["$browser", "unknown"] }, count: { $sum: 1 } } }, { $sort: { count: -1 } }],
        os: [{ $group: { _id: { $ifNull: ["$os", "unknown"] }, count: { $sum: 1 } } }, { $sort: { count: -1 } }],
        countries: [{ $group: { _id: { $ifNull: ["$geoCountry", "unknown"] }, count: { $sum: 1 } } }, { $sort: { count: -1 } }],
        cities: [{ $group: { _id: { $ifNull: ["$geoCity", "unknown"] }, count: { $sum: 1 } } }, { $sort: { count: -1 } }],
        referrers: [{ $group: { _id: { $ifNull: ["$referrerType", "direct"] }, count: { $sum: 1 } } }, { $sort: { count: -1 } }],
        utmSources: [{ $group: { _id: { $ifNull: ["$utmSource", "none"] }, count: { $sum: 1 } } }, { $sort: { count: -1 } }],
        utmMediums: [{ $group: { _id: { $ifNull: ["$utmMedium", "none"] }, count: { $sum: 1 } } }, { $sort: { count: -1 } }],
        utmCampaigns: [{ $group: { _id: { $ifNull: ["$utmCampaign", "none"] }, count: { $sum: 1 } } }, { $sort: { count: -1 } }],
        bots: [{ $group: { _id: { $ifNull: ["$botReason", "human"] }, count: { $sum: 1 } } }, { $sort: { count: -1 } }],
        languages: [{ $group: { _id: { $ifNull: ["$language", "unknown"] }, count: { $sum: 1 } } }, { $sort: { count: -1 } }],
        inAppBrowsers: [{ $group: { _id: { $ifNull: ["$inAppBrowser", "browser"] }, count: { $sum: 1 } } }, { $sort: { count: -1 } }],
        screenSizes: [
          { $match: { screenWidth: { $type: "number" }, screenHeight: { $type: "number" } } },
          { $group: { _id: { w: "$screenWidth", h: "$screenHeight" }, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 12 },
        ],
        connections: [{ $group: { _id: { $ifNull: ["$connectionType", "unknown"] }, count: { $sum: 1 } } }, { $sort: { count: -1 } }],
      },
    },
  ];

  const [result] = await ClickEventModel.aggregate(pipeline);

  const formatBreakdown = (data: any[]) =>
    data.map((item) => ({ id: item._id, count: item.count })).filter(item => item.id !== "unknown" && item.id !== "none");

  return {
    shortCode: link.shortCode,
    originalUrl: link.url,
    totalClicks: result.summary[0]?.totalClicks || 0,
    continuedClicks: result.summary[0]?.continuedClicks || 0,
    uniqueVisitors: result.summary[0]?.uniqueVisitors || 0,
    timeline: result.timeline.map((t: any) => ({ date: t._id, count: t.count })),
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
    screens: result.screenSizes.map(
      (s: { _id: { w: number; h: number }; count: number }) => ({
      id: `${s._id.w}×${s._id.h}`,
      count: s.count,
    })),
    connections: formatBreakdown(result.connections),
  };
}
