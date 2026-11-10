import { ClickEventModel } from "@/server/models/clickEvent";
import { UrlModel } from "@/server/models/url";
import type { PipelineStage } from "mongoose";
import type { IDatabase } from "@/server/core/database";
import type { ICache } from "@/server/core/cache";

/**
 * Analytics tolerates brief staleness: one computation serves all viewers
 * for this window instead of re-running the full aggregation per view.
 */
const DETAIL_CACHE_TTL_SECONDS = 120;

const detailCacheKey = (shortCode: string) => `analytics:detail:${shortCode.slice(0, 128)}`;

/** One `{ _id, count }` breakdown row from a `$group` facet branch. */
export interface FacetCountRow {
  _id: string;
  count: number;
}

export interface SummaryBasicStat {
  _id: string;
  totalClicks: number;
  uniqueVisitors: number;
  continuedClicks: number;
  capturedCount: number;
  lastClickedAt: Date | null;
}

export interface SummaryAggregateResult {
  basicStats: SummaryBasicStat[];
  topCountries: { _id: string; topCountry: string }[];
  topDevices: { _id: string; topDevice: string }[];
  topReferrers: { _id: string; topReferrer: string }[];
  topScreens: { _id: string; top: { w: number; h: number } }[];
}

export const EMPTY_DETAIL_RESULT: DetailAggregateResult = {
  summary: [],
  timeline: [],
  devices: [],
  browsers: [],
  os: [],
  countries: [],
  cities: [],
  referrers: [],
  utmSources: [],
  utmMediums: [],
  utmCampaigns: [],
  bots: [],
  languages: [],
  inAppBrowsers: [],
  screenSizes: [],
  connections: [],
};

export interface DetailAggregateResult {
  summary: { totalClicks: number; uniqueVisitors: number; continuedClicks: number; capturedCount: number }[];
  timeline: FacetCountRow[];
  devices: FacetCountRow[];
  browsers: FacetCountRow[];
  os: FacetCountRow[];
  countries: FacetCountRow[];
  cities: FacetCountRow[];
  referrers: FacetCountRow[];
  utmSources: FacetCountRow[];
  utmMediums: FacetCountRow[];
  utmCampaigns: FacetCountRow[];
  bots: FacetCountRow[];
  languages: FacetCountRow[];
  inAppBrowsers: FacetCountRow[];
  screenSizes: { _id: { w: number; h: number }; count: number }[];
  connections: FacetCountRow[];
}

/**
 * SRP: Mongo aggregation queries for analytics. No auth, no HTTP.
 */
export interface IAnalyticsRepository {
  findUserShortCodes(userId: string): Promise<{ shortCode: string; url: string }[]>;
  summaryAggregate(shortCodes: string[]): Promise<SummaryAggregateResult | undefined>;
  detailAggregate(shortCode: string): Promise<DetailAggregateResult | undefined>;
  findLinkForUser(shortCode: string, userId: string): Promise<{ shortCode: string; url: string } | null>;
}

export class MongoAnalyticsRepository implements IAnalyticsRepository {
  constructor(
    private readonly db: IDatabase,
    private readonly cache?: ICache,
  ) {}

  async findUserShortCodes(userId: string): Promise<{ shortCode: string; url: string }[]> {
    await this.db.connect();
    return UrlModel.find({ userId }).select("shortCode url createdAt").lean() as unknown as Promise<
      { shortCode: string; url: string }[]
    >;
  }

  async findLinkForUser(shortCode: string, userId: string) {
    await this.db.connect();
    return UrlModel.findOne({ shortCode, userId }).lean() as unknown as Promise<{
      shortCode: string;
      url: string;
    } | null>;
  }

  async summaryAggregate(shortCodes: string[]): Promise<SummaryAggregateResult | undefined> {
    await this.db.connect();
    const pipeline: PipelineStage[] = [
      { $match: { shortCode: { $in: shortCodes } } },
      // Slim documents before the fan-out: only fields the facets read.
      {
        $project: {
          _id: 0,
          shortCode: 1,
          visitorHash: 1,
          continued: 1,
          capturedAt: 1,
          clickedAt: 1,
          geoCountry: 1,
          deviceType: 1,
          referrerType: 1,
          screenWidth: 1,
          screenHeight: 1,
        },
      },
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
    const results = (await ClickEventModel.aggregate(pipeline).allowDiskUse(true).option({ maxTimeMS: 30000 })) as unknown as SummaryAggregateResult[];
    return results[0];
  }

  async detailAggregate(shortCode: string): Promise<DetailAggregateResult | undefined> {
    await this.db.connect();
    if (this.cache) {
      try {
        const cached = await this.cache.get(detailCacheKey(shortCode));
        if (cached) return JSON.parse(cached) as DetailAggregateResult;
      } catch {
        // Cache read failures fall through to the live aggregation.
      }
    }
    const pipeline: PipelineStage[] = [
      { $match: { shortCode } },
      // Slim documents before the fan-out: only fields the facets read.
      {
        $project: {
          _id: 0,
          deviceType: 1,
          browser: 1,
          os: 1,
          geoCountry: 1,
          geoCity: 1,
          referrerType: 1,
          utmSource: 1,
          utmMedium: 1,
          utmCampaign: 1,
          botReason: 1,
          language: 1,
          inAppBrowser: 1,
          connectionType: 1,
          screenWidth: 1,
          screenHeight: 1,
          visitorHash: 1,
          continued: 1,
          capturedAt: 1,
          clickedAt: 1,
        },
      },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalClicks: { $sum: 1 },
                uniqueVisitors: { $addToSet: "$visitorHash" },
                continuedClicks: { $sum: { $cond: ["$continued", 1, 0] } },
                capturedCount: { $sum: { $cond: [{ $ne: ["$capturedAt", null] }, 1, 0] } },
              },
            },
            {
              $project: {
                totalClicks: 1,
                uniqueVisitors: { $size: "$uniqueVisitors" },
                continuedClicks: 1,
                capturedCount: 1,
              },
            },
          ],
          timeline: [
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$clickedAt" } }, count: { $sum: 1 } } },
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
    const results = (await ClickEventModel.aggregate(pipeline).allowDiskUse(true).option({ maxTimeMS: 30000 })) as unknown as DetailAggregateResult[];
    const result = results[0];
    if (this.cache && result) {
      try {
        await this.cache.setex(detailCacheKey(shortCode), DETAIL_CACHE_TTL_SECONDS, JSON.stringify(result));
      } catch {
        // Cache write failures must never fail the request.
      }
    }
    return result;
  }
}


