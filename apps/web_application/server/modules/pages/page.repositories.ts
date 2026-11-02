import { PageModel, type IPage } from "@/server/models/page";
import { PageVersionModel, type IPageVersion, type IPageVersionSnapshot } from "@/server/models/pageVersion";
import { PageViewModel } from "@/server/models/pageView";
import { PageSlugRedirectModel } from "@/server/models/pageSlugRedirect";
import { Types, type PipelineStage } from "mongoose";
import type { IDatabase } from "@/server/core/database";

/** One raw aggregation output document (facet branches). Typed at use sites. */
export type PageViewAggregateRow = Record<string, unknown>;

/** SRP: page-document persistence. */
export interface IPageRepository {
  existsBySlug(slug: string, exceptId?: string): Promise<boolean>;
  findByIdForUser(id: string, userId: string): Promise<IPage | null>;
  findLeanByIdForUser(id: string, userId: string): Promise<IPage | null>;
  owned(id: string, userId: string): Promise<boolean>;
  create(data: Record<string, unknown>): Promise<IPage>;
  save(page: IPage): Promise<IPage>;
  deleteByIdForUser(id: string, userId: string): Promise<IPage | null>;
  listForUser(filter: Record<string, unknown>, sort: Record<string, 1 | -1>, skip: number, limit: number): Promise<{ docs: IPage[]; total: number }>;
  findPublishedBySlug(slug: string): Promise<IPage | null>;
  findPublishedById(id: string): Promise<IPage | null>;
  existsPublished(id: string): Promise<boolean>;
  incrementViews(id: string): Promise<void>;
  incrementClicks(id: string): Promise<void>;
}

export class MongoPageRepository implements IPageRepository {
  constructor(private readonly db: IDatabase) {}

  async existsBySlug(slug: string, exceptId?: string): Promise<boolean> {
    await this.db.connect();
    return (await PageModel.exists({ slug, ...(exceptId !== undefined ? { _id: { $ne: exceptId } } : {}) })) !== null;
  }

  async findByIdForUser(id: string, userId: string): Promise<IPage | null> {
    await this.db.connect();
    return PageModel.findOne({ _id: id, userId });
  }

  async findLeanByIdForUser(id: string, userId: string): Promise<IPage | null> {
    await this.db.connect();
    return PageModel.findOne({ _id: id, userId }).lean() as unknown as Promise<IPage | null>;
  }

  async owned(id: string, userId: string): Promise<boolean> {
    await this.db.connect();
    return (await PageModel.exists({ _id: id, userId })) !== null;
  }

  async create(data: Record<string, unknown>): Promise<IPage> {
    await this.db.connect();
    return PageModel.create(data);
  }

  async save(page: IPage): Promise<IPage> {
    return page.save();
  }

  async deleteByIdForUser(id: string, userId: string): Promise<IPage | null> {
    await this.db.connect();
    const page = await PageModel.findOneAndDelete({ _id: id, userId });
    if (!page) return null;
    await Promise.all([
      PageVersionModel.deleteMany({ pageId: page._id }),
      PageViewModel.deleteMany({ pageId: page._id }),
      PageSlugRedirectModel.deleteMany({ pageId: page._id }),
    ]);
    return page;
  }

  async listForUser(
    filter: Record<string, unknown>,
    sort: Record<string, 1 | -1>,
    skip: number,
    limit: number,
  ): Promise<{ docs: IPage[]; total: number }> {
    await this.db.connect();
    const [docs, total] = await Promise.all([
      PageModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      PageModel.countDocuments(filter),
    ]);
    return { docs: docs as unknown as IPage[], total };
  }

  async findPublishedBySlug(slug: string): Promise<IPage | null> {
    await this.db.connect();
    return PageModel.findOne({ slug, status: "published" }).lean() as unknown as Promise<IPage | null>;
  }

  async findPublishedById(id: string): Promise<IPage | null> {
    await this.db.connect();
    return PageModel.findOne({ _id: id, status: "published" }).lean() as unknown as Promise<IPage | null>;
  }

  async existsPublished(id: string): Promise<boolean> {
    await this.db.connect();
    return (await PageModel.exists({ _id: id, status: "published" })) !== null;
  }

  async incrementViews(id: string): Promise<void> {
    await this.db.connect();
    await PageModel.updateOne({ _id: id }, { $inc: { views: 1 } });
  }

  async incrementClicks(id: string): Promise<void> {
    await this.db.connect();
    await PageModel.updateOne({ _id: id }, { $inc: { clicks: 1 } });
  }
}

/** SRP: version-snapshot persistence. */
export interface IPageVersionRepository {
  latestNumber(pageId: string): Promise<number>;
  create(input: { pageId: string; version: number; snapshot: IPageVersionSnapshot; createdBy: string }): Promise<IPageVersion>;
  list(pageId: string): Promise<IPageVersion[]>;
  find(pageId: string, version: number): Promise<IPageVersion | null>;
  findById(id: string | Types.ObjectId): Promise<IPageVersion | null>;
}

export class MongoPageVersionRepository implements IPageVersionRepository {
  constructor(private readonly db: IDatabase) {}

  async latestNumber(pageId: string): Promise<number> {
    await this.db.connect();
    const latest = await PageVersionModel.findOne({ pageId }).sort({ version: -1 }).select("version").lean();
    return latest ? Number((latest as { version: number }).version) : 0;
  }

  async create(input: { pageId: string; version: number; snapshot: IPageVersionSnapshot; createdBy: string }): Promise<IPageVersion> {
    await this.db.connect();
    return PageVersionModel.create({ ...input, pageId: new Types.ObjectId(input.pageId) });
  }

  async list(pageId: string): Promise<IPageVersion[]> {
    await this.db.connect();
    return PageVersionModel.find({ pageId }).sort({ version: -1 }).lean() as unknown as Promise<IPageVersion[]>;
  }

  async find(pageId: string, version: number): Promise<IPageVersion | null> {
    await this.db.connect();
    return PageVersionModel.findOne({ pageId, version }).lean() as unknown as Promise<IPageVersion | null>;
  }

  async findById(id: string | Types.ObjectId): Promise<IPageVersion | null> {
    await this.db.connect();
    return PageVersionModel.findById(id).lean() as unknown as Promise<IPageVersion | null>;
  }
}

/** SRP: view/click event writes + aggregation passthrough. */
export interface IPageViewRepository {
  create(input: Record<string, unknown>): Promise<void>;
  aggregate(pipeline: PipelineStage[]): Promise<PageViewAggregateRow[]>;
}

export class MongoPageViewRepository implements IPageViewRepository {
  constructor(private readonly db: IDatabase) {}

  async create(input: Record<string, unknown>): Promise<void> {
    await this.db.connect();
    await PageViewModel.create(input);
  }

  async aggregate(pipeline: PipelineStage[]): Promise<PageViewAggregateRow[]> {
    await this.db.connect();
    const rows = (await PageViewModel.aggregate(pipeline)) as unknown as PageViewAggregateRow[];
    return rows;
  }
}

/** SRP: slug-rename redirect chain persistence. */
export interface IPageRedirectRepository {
  record(pageId: unknown, from: string, to: string): Promise<void>;
  resolve(rawSlug: string, normalize: (s: string) => string): Promise<string | null>;
}

export class MongoPageRedirectRepository implements IPageRedirectRepository {
  constructor(private readonly db: IDatabase) {}

  async record(pageId: unknown, from: string, to: string): Promise<void> {
    if (!from || !to || from === to) return;
    await this.db.connect();
    await PageSlugRedirectModel.deleteMany({ oldSlug: to });
    await PageSlugRedirectModel.updateMany({ newSlug: from }, { $set: { newSlug: to } });
    await PageSlugRedirectModel.updateOne({ oldSlug: from }, { $set: { newSlug: to, pageId } }, { upsert: true });
  }

  async resolve(rawSlug: string, normalize: (s: string) => string): Promise<string | null> {
    let current = normalize(rawSlug);
    if (!current) return null;
    const seen = new Set<string>([current]);
    await this.db.connect();
    for (let hop = 0; hop < 5; hop += 1) {
      const doc = await PageSlugRedirectModel.findOne({ oldSlug: current }).lean();
      if (!doc) return hop === 0 ? null : current;
      const next = String((doc as unknown as { newSlug?: unknown }).newSlug ?? "");
      if (!next || seen.has(next)) return null;
      seen.add(next);
      current = next;
    }
    return null;
  }
}




