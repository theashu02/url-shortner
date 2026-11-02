import { isValidObjectId } from "mongoose";
import crypto from "crypto";
import { detectBot } from "@/server/lib/click-capture/bot-detection";
import { isBlockLiveNow, normalizePageSlug, validatePageSlug } from "@/server/lib/pages";
import type { IPage } from "@/server/models/page";
import type { IPageVersion } from "@/server/models/pageVersion";
import type { IPageRepository, IPageRedirectRepository, IPageVersionRepository, IPageViewRepository } from "./page.repositories";
import { toVersionDTO } from "./page.mapper";
import type { PageAnalytics, PageTopBlock, PageTrackingInfo, PublishedPageDTO, ServiceError } from "./page.types";

const CLICKABLE_PAGE_BLOCK_TYPES = new Set(["links", "social", "product", "contact"]);
const PAGE_TRACKING_SALT = process.env.IP_HASH_SALT ?? "default-dev-salt-change-in-prod";

function snapshotBlockLabel(props: Record<string, unknown>): string {
  for (const key of ["title", "heading", "name", "label"]) {
    const value = props[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim().slice(0, 60);
    }
  }
  return "";
}

/**
 * SRP: public tracking reads/writes + page analytics aggregation.
 * Logic mirrors the legacy service exactly; persistence via repositories (DIP).
 */
export class PageTrackingService {
  constructor(
    private readonly pages: IPageRepository,
    private readonly versions: IPageVersionRepository,
    private readonly views: IPageViewRepository,
    private readonly redirects: IPageRedirectRepository,
  ) {}

  resolveRedirect(rawSlug: string): Promise<string | null> {
    return this.redirects.resolve(rawSlug, normalizePageSlug);
  }

  async getPublishedBySlug(rawSlug: string): Promise<PublishedPageDTO | null> {
    const slug = normalizePageSlug(rawSlug);
    if (validatePageSlug(slug) !== null) return null;
    const page = await this.pages.findPublishedBySlug(slug);
    if (!page) return null;
    const typed = page as IPage;
    if (!typed.publishedVersionId) return null;
    const version = await this.versions.findById(typed.publishedVersionId);
    if (!version) return null;
    const dto = toVersionDTO(version as IPageVersion);
    return {
      pageId: String(typed._id),
      slug: String(typed.slug ?? ""),
      title: dto.snapshot.title,
      theme: dto.snapshot.theme,
      blocks: dto.snapshot.blocks,
      version: dto.version,
      views: Number(typed.views ?? 0),
      updatedAt: typed.updatedAt ? new Date(typed.updatedAt).toISOString() : new Date().toISOString(),
    };
  }

  private isBot(userAgent?: string | null): boolean {
    if (!userAgent) return false;
    try {
      return detectBot(userAgent).isBot;
    } catch {
      return false;
    }
  }

  private visitorHash(ip?: string | null, userAgent?: string | null): string | null {
    if (!ip || !userAgent) return null;
    return crypto.createHash("sha256").update("pageview:" + ip + ":" + userAgent + ":" + PAGE_TRACKING_SALT).digest("hex").slice(0, 16);
  }

  async recordView(pageId: string, slug: string, info: PageTrackingInfo = {}): Promise<boolean> {
    if (!isValidObjectId(pageId)) return false;
    if (this.isBot(info.userAgent)) return false;
    try {
      if (!(await this.pages.existsPublished(pageId))) return false;
      await this.views.create({
        pageId,
        slug,
        deviceType: (info.deviceType ?? "desktop").trim().toLowerCase() || "desktop",
        referrer: info.referrer?.trim().slice(0, 500) || null,
        visitorHash: this.visitorHash(info.ip, info.userAgent),
      });
      await this.pages.incrementViews(pageId);
      return true;
    } catch (err) {
      console.error("[pages] record view:", err);
      return false;
    }
  }

  async recordClick(pageId: string, blockKey: string, info: PageTrackingInfo = {}): Promise<true | false | ServiceError> {
    if (!isValidObjectId(pageId)) return { status: 404, message: "Page not found." };
    const key = (blockKey ?? "").trim().slice(0, 120);
    if (!key) return { status: 400, message: "A block key is required." };
    if (this.isBot(info.userAgent)) return false;
    try {
      const doc = await this.pages.findPublishedById(pageId);
      if (!doc || !doc.publishedVersionId) return { status: 404, message: "Page not found." };
      const version = await this.versions.findById(doc.publishedVersionId);
      if (!version) return { status: 404, message: "Page not found." };
      const snapshot = (version as unknown as IPageVersion).snapshot as unknown as {
        blocks?: { key?: unknown; type?: unknown; visible?: unknown; startsAt?: unknown; endsAt?: unknown }[];
      };
      const target = Array.isArray(snapshot.blocks) ? snapshot.blocks.find((b) => String(b?.key ?? "") === key) : undefined;
      if (!target || !CLICKABLE_PAGE_BLOCK_TYPES.has(String(target.type ?? ""))) {
        return { status: 400, message: "This block does not accept clicks." };
      }
      if (target.visible === false || !isBlockLiveNow(target)) {
        return { status: 400, message: "This block is not currently available." };
      }
      await this.views.create({
        pageId,
        slug: String(doc.slug ?? ""),
        clickedBlockKey: key,
        deviceType: (info.deviceType ?? "desktop").trim().toLowerCase() || "desktop",
        referrer: info.referrer?.trim().slice(0, 500) || null,
        visitorHash: this.visitorHash(info.ip, info.userAgent),
      });
      await this.pages.incrementClicks(pageId);
      return true;
    } catch (err) {
      console.error("[pages] record click:", err);
      return false;
    }
  }

  async getAnalytics(userId: string, id: string, daysInput?: string): Promise<PageAnalytics | ServiceError> {
    if (!isValidObjectId(id)) return { status: 404, message: "Page not found." };
    const parsed = parseInt(daysInput ?? "30", 10);
    const days = Math.min(90, Math.max(1, Number.isFinite(parsed) ? parsed : 30));
    const page = await this.pages.findLeanByIdForUser(id, userId);
    if (!page) return { status: 404, message: "Page not found." };
    const typed = page as unknown as IPage;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const rows = await this.views.aggregate([
      { $match: { pageId: typed._id, viewedAt: { $gte: since } } },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                views: { $sum: { $cond: [{ $eq: ["$clickedBlockKey", null] }, 1, 0] } },
                clicks: { $sum: { $cond: [{ $ne: ["$clickedBlockKey", null] }, 1, 0] } },
                visitors: { $addToSet: "$visitorHash" },
              },
            },
            { $project: { _id: 0, views: 1, clicks: 1, visitors: 1 } },
          ],
          clicksTimeline: [
            { $match: { clickedBlockKey: { $ne: null } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$viewedAt" } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: "$_id", count: 1 } },
          ],
          timeline: [
            { $match: { clickedBlockKey: null } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$viewedAt" } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: "$_id", count: 1 } },
          ],
          devices: [
            { $group: { _id: "$deviceType", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 6 },
            { $project: { _id: 0, id: "$_id", count: 1 } },
          ],
          referrers: [
            { $group: { _id: "$referrer", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 6 },
            { $project: { _id: 0, id: "$_id", count: 1 } },
          ],
          topBlocks: [
            { $match: { clickedBlockKey: { $ne: null } } },
            { $group: { _id: "$clickedBlockKey", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $project: { _id: 0, key: "$_id", count: 1 } },
          ],
        },
      },
    ]);
    const agg = ((rows[0] ?? {}) as Record<string, unknown>);
    const totalRow = (Array.isArray(agg["totals"]) ? (agg["totals"] as unknown[])[0] : undefined) as
      | { views?: unknown; clicks?: unknown; visitors?: unknown }
      | undefined;
    const rawVisitors: unknown = totalRow?.visitors;
    const uniqueVisitors = new Set(
      (Array.isArray(rawVisitors) ? rawVisitors : []).filter((v): v is string => typeof v === "string" && v.length > 0),
    ).size;
    const meta = new Map<string, { type: string; label: string }>();
    try {
      if (typed.publishedVersionId) {
        const version = await this.versions.findById(typed.publishedVersionId);
        const snapshot = (version as unknown as IPageVersion | null)?.snapshot as unknown as
          | { blocks?: { key?: unknown; type?: unknown; props?: unknown }[] }
          | undefined;
        if (snapshot && Array.isArray(snapshot.blocks)) {
          for (const block of snapshot.blocks) {
            const blockKey = String(block?.key ?? "");
            if (!blockKey || meta.has(blockKey)) continue;
            const props = typeof block?.props === "object" && block?.props !== null ? (block.props as Record<string, unknown>) : {};
            meta.set(blockKey, { type: String(block?.type ?? ""), label: snapshotBlockLabel(props) });
          }
        }
      }
    } catch (err) {
      console.error("[pages] analytics snapshot:", err);
    }
    const rawBlocks: unknown = agg["topBlocks"];
    const blockRows: { key?: unknown; count?: unknown }[] = Array.isArray(rawBlocks)
      ? (rawBlocks as { key?: unknown; count?: unknown }[])
      : [];
    const topBlocks: PageTopBlock[] = blockRows.map((row) => {
      const info = meta.get(String(row.key ?? ""));
      return { key: String(row.key ?? ""), type: info?.type ?? "", label: info?.label ?? "", count: Number(row.count ?? 0) };
    });
    const mapTimeline = (value: unknown) => {
      const list: { date?: unknown; count?: unknown }[] = Array.isArray(value) ? (value as { date?: unknown; count?: unknown }[]) : [];
      return list.map((row) => ({ date: String(row.date ?? ""), count: Number(row.count ?? 0) }));
    };
    const mapBreakdown = (value: unknown, fallback: string) => {
      const list: { id?: unknown; count?: unknown }[] = Array.isArray(value) ? (value as { id?: unknown; count?: unknown }[]) : [];
      return list.map((row) => ({ id: row.id ? String(row.id) : fallback, count: Number(row.count ?? 0) }));
    };
    return {
      page: {
        id: String(typed._id),
        title: String(typed.title ?? ""),
        slug: String(typed.slug ?? ""),
        status: typed.status === "published" ? "published" : "draft",
        views: Number(typed.views ?? 0),
        clicks: Number(typed.clicks ?? 0),
        linkedShortCode: typed.linkedShortCode ? String(typed.linkedShortCode) : undefined,
      },
      range: { days, since: since.toISOString() },
      totals: { views: Number(totalRow?.views ?? 0), clicks: Number(totalRow?.clicks ?? 0), uniqueVisitors },
      timeline: mapTimeline(agg["timeline"]),
      clicksTimeline: mapTimeline(agg["clicksTimeline"]),
      devices: mapBreakdown(agg["devices"], "unknown"),
      referrers: mapBreakdown(agg["referrers"], "direct"),
      topBlocks,
    };
  }
}
