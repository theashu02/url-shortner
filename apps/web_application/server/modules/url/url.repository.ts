import { UrlModel, type IUrl } from "@/server/models/url";
import type { IDatabase } from "@/server/core/database";
import type { ICache } from "@/server/core/cache";
import { URL_TTL_SECONDS } from "@/server/lib/url";

/**
 * SRP: persistence + cache mirror for short URLs only. No business rules.
 * DIP: depends on IDatabase/ICache abstractions, not singletons.
 *
 * Every Redis key written here carries a TTL so the cache stays bounded:
 * `url:`/`dc:` mirror the link TTL, `slug:taken:` is a negative/positive
 * guard with the same bound. The database remains the source of truth, so an
 * expired guard transparently falls back to a DB check (shortCodeTaken).
 */
export interface IUrlRepository {
  shortCodeTaken(shortCode: string): Promise<boolean>;
  create(input: {
    shortCode: string;
    url: string;
    userId?: string;
    expiresAt?: Date;
    utm?: Record<string, string | undefined>;
    deviceCapture: boolean;
    redisTtl: number;
  }): Promise<void>;
  findByIdForUser(id: string, userId: string): Promise<IUrl | null>;
  findByShortCodeForUser(shortCode: string, userId: string): Promise<IUrl | null>;
  existsOtherWithShortCode(shortCode: string, exceptId: string): Promise<boolean>;
  save(link: IUrl): Promise<IUrl>;
  deleteByIdForUser(id: string, userId: string): Promise<IUrl | null>;
  listForUser(
    userId: string,
    filter: Record<string, unknown>,
    sort: Record<string, 1 | -1>,
    skip: number,
    limit: number,
  ): Promise<{ docs: IUrl[]; total: number }>;
  mirrorInCache(shortCode: string, url: string, deviceCapture: boolean, ttl: number): Promise<void>;
  evictFromCache(shortCode: string): Promise<void>;
}

export class MongoUrlRepository implements IUrlRepository {
  constructor(
    private readonly db: IDatabase,
    private readonly cache: ICache,
  ) {}

  async shortCodeTaken(shortCode: string): Promise<boolean> {
    const cached = await this.cache.get(`slug:taken:${shortCode}`);
    if (cached) return true;
    await this.db.connect();
    if (await UrlModel.exists({ shortCode })) {
      await this.cache.setex(`slug:taken:${shortCode}`, URL_TTL_SECONDS, "1");
      return true;
    }
    return false;
  }

  async create(input: {
    shortCode: string;
    url: string;
    userId?: string;
    expiresAt?: Date;
    utm?: Record<string, string | undefined>;
    deviceCapture: boolean;
    redisTtl: number;
  }): Promise<void> {
    await this.db.connect();
    await Promise.all([
      UrlModel.create({
        shortCode: input.shortCode,
        url: input.url,
        userId: input.userId ?? undefined,
        expiresAt: input.expiresAt,
        utm: input.utm ? { ...input.utm } : undefined,
        deviceCapture: input.deviceCapture,
      }),
      this.cache.setex(`url:${input.shortCode}`, input.redisTtl, input.url),
      this.cache.setex(`dc:${input.shortCode}`, input.redisTtl, input.deviceCapture ? "1" : "0"),
      this.cache.setex(`slug:taken:${input.shortCode}`, input.redisTtl, "1"),
    ]);
  }

  async findByIdForUser(id: string, userId: string): Promise<IUrl | null> {
    await this.db.connect();
    return UrlModel.findOne({ _id: id, userId });
  }

  async findByShortCodeForUser(shortCode: string, userId: string): Promise<IUrl | null> {
    await this.db.connect();
    return UrlModel.findOne({ shortCode, userId }).lean() as unknown as Promise<IUrl | null>;
  }

  async existsOtherWithShortCode(shortCode: string, exceptId: string): Promise<boolean> {
    await this.db.connect();
    return (await UrlModel.findOne({ shortCode, _id: { $ne: exceptId } }).lean()) !== null;
  }

  async save(link: IUrl): Promise<IUrl> {
    return link.save();
  }

  async deleteByIdForUser(id: string, userId: string): Promise<IUrl | null> {
    await this.db.connect();
    const link = await UrlModel.findOneAndDelete({ _id: id, userId });
    if (!link) return null;
    await this.evictFromCache(link.shortCode);
    return link;
  }

  async listForUser(
    userId: string,
    filter: Record<string, unknown>,
    sort: Record<string, 1 | -1>,
    skip: number,
    limit: number,
  ): Promise<{ docs: IUrl[]; total: number }> {
    await this.db.connect();
    const [docs, total] = await Promise.all([
      UrlModel.find({ userId, ...filter }).sort(sort).skip(skip).limit(limit).lean(),
      UrlModel.countDocuments({ userId, ...filter }),
    ]);
    return { docs: docs as unknown as IUrl[], total };
  }

  async mirrorInCache(
    shortCode: string,
    url: string,
    deviceCapture: boolean,
    ttl: number,
  ): Promise<void> {
    await this.cache.setex(`url:${shortCode}`, ttl, url);
    await this.cache.setex(`dc:${shortCode}`, ttl, deviceCapture ? "1" : "0");
    await this.cache.setex(`slug:taken:${shortCode}`, ttl, "1");
  }

  async evictFromCache(shortCode: string): Promise<void> {
    await this.cache.del(`url:${shortCode}`, `slug:taken:${shortCode}`, `dc:${shortCode}`);
  }

  /** Exposed for TTL parity with the legacy update path. */
  defaultTtl(): number {
    return URL_TTL_SECONDS;
  }
}
