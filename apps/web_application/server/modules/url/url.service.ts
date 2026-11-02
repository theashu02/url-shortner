import { generateShortCode } from "@/server/lib/base62";
import { appendUtmParams, type UtmParamsInput } from "@/server/lib/utm";
import { calculateRedisTTL } from "@/server/lib/expiration";
import {
  CUSTOM_SLUG_RE,
  URL_TTL_SECONDS,
  escapeRegex,
  toDTO,
  type CreateResult,
  type DeleteResult,
  type LinkDTO,
  type PaginationMeta,
  type UpdateResult,
} from "@/server/lib/url";
import { HttpError } from "@/server/core/http-errors";
import type { ICache } from "@/server/core/cache";
import type { IUrlRepository } from "./url.repository";

/**
 * ISP: code generation is a seam (OCP) - swap strategy without touching the service.
 */
export interface IShortCodeGenerator {
  generate(): string;
}

export class CryptoShortCodeGenerator implements IShortCodeGenerator {
  generate(): string {
    return generateShortCode();
  }
}

/**
 * UrlService owns short-link business rules (SRP).
 * DIP: talks only to IUrlRepository + ICache + IShortCodeGenerator.
 */
export class UrlService {
  constructor(
    private readonly urls: IUrlRepository,
    private readonly cache: ICache,
    private readonly codes: IShortCodeGenerator = new CryptoShortCodeGenerator(),
  ) {}

  async createShortUrl(
    url: string,
    customSlug: string | undefined,
    userId: string | null,
    ip: string,
    expiresAtIso?: string,
    utmParams?: UtmParamsInput,
    deviceCapture?: boolean,
  ): Promise<CreateResult> {
    // Atomic fixed-window budget check (single Redis round trip, fails open).
    const allowed = await this.cache.checkBudget(`ratelimit:${ip}`, 100, 60);
    if (!allowed) return { status: 429, message: "Rate limit exceeded (100 req/min)." };

    let shortCode: string;

    if (customSlug) {
      if (!CUSTOM_SLUG_RE.test(customSlug))
        return { status: 400, message: "Custom alias must be 3-50 characters (letters, numbers, hyphens only)." };
      if (await this.urls.shortCodeTaken(customSlug))
        return { status: 409, message: "This custom alias is already taken. Please choose another." };
      shortCode = customSlug;
    } else {
      shortCode = "";
      for (let i = 0; i < 10; i++) {
        const candidate = this.codes.generate();
        if (!(await this.urls.shortCodeTaken(candidate))) {
          shortCode = candidate;
          break;
        }
      }
      if (!shortCode) return { status: 500, message: "Failed to generate unique short code. Try again." };
    }

    const finalUrl = appendUtmParams(url, utmParams);
    const redisTtl = calculateRedisTTL(expiresAtIso);
    const expiresAt = expiresAtIso ? new Date(expiresAtIso) : undefined;

    if (expiresAtIso && redisTtl <= 0) {
      return { status: 400, message: "Expiration date must be in the future." };
    }

    await this.urls.create({
      shortCode,
      url: finalUrl,
      userId: userId ?? undefined,
      expiresAt,
      utm: utmParams ? { ...utmParams } : undefined,
      deviceCapture: deviceCapture === true,
      redisTtl,
    });

    return { shortCode, originalUrl: finalUrl };
  }

  async getUserLinks(
    userId: string,
    query: { page?: string; limit?: string; search?: string; sortBy?: string; order?: string },
  ): Promise<{ links: LinkDTO[]; pagination: PaginationMeta }> {
    const page = Math.max(1, parseInt(query.page ?? "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit ?? "15", 10) || 15));
    const search = (query.search ?? "").trim();
    const sortBy = query.sortBy === "clicks" ? "clicks" : "createdAt";
    const order = query.order === "asc" ? 1 : -1;

    const filter: Record<string, unknown> = {};
    if (search) {
      const escaped = escapeRegex(search);
      filter.$or = [
        { shortCode: { $regex: escaped, $options: "i" } },
        { url: { $regex: escaped, $options: "i" } },
      ];
    }

    const { docs, total } = await this.urls.listForUser(
      userId,
      filter,
      { [sortBy]: order } as Record<string, 1 | -1>,
      (page - 1) * limit,
      limit,
    );
    const totalPages = Math.ceil(total / limit);

    return {
      links: docs.map(toDTO),
      pagination: { total, page, limit, totalPages, hasMore: page < totalPages },
    };
  }

  async updateLink(
    id: string,
    url: string,
    customSlug: string | undefined,
    userId: string,
    deviceCapture?: boolean,
  ): Promise<UpdateResult> {
    const link = await this.urls.findByIdForUser(id, userId);
    if (!link) return { status: 404, message: "Link not found or access denied." };

    const previousShortCode = link.shortCode;
    let updatedShortCode = previousShortCode;

    if (customSlug && customSlug !== previousShortCode) {
      if (!CUSTOM_SLUG_RE.test(customSlug))
        return { status: 400, message: "Custom alias must be 3-50 characters (letters, numbers, hyphens only)." };
      if (await this.urls.existsOtherWithShortCode(customSlug, id))
        return { status: 409, message: "This custom alias is already taken. Please choose another." };
      updatedShortCode = customSlug;
    }

    link.url = url;
    if (deviceCapture !== undefined) link.deviceCapture = deviceCapture;
    link.shortCode = updatedShortCode;
    const saved = await this.urls.save(link);

    // Single cache sync after the write succeeds: evict the stale alias
    // on rename, then mirror the final state exactly once.
    if (updatedShortCode !== previousShortCode) {
      await this.urls.evictFromCache(previousShortCode);
    }
    await this.urls.mirrorInCache(
      updatedShortCode,
      url,
      saved.deviceCapture === true,
      URL_TTL_SECONDS,
    );

    return { message: "Link updated successfully", link: toDTO(saved) };
  }

  async deleteLink(id: string, userId: string): Promise<DeleteResult> {
    const link = await this.urls.deleteByIdForUser(id, userId);
    if (!link) return { status: 404, message: "Link not found or access denied." };
    return { message: "Link deleted successfully", id };
  }

  /** Throwing variant for controllers that prefer exceptions over unions. */
  async updateLinkOrThrow(
    ...args: Parameters<UrlService["updateLink"]>
  ): Promise<Extract<UpdateResult, { link: LinkDTO }>> {
    const result = await this.updateLink(...args);
    if ("status" in result) throw new HttpError(result.status, result.message);
    return result;
  }
}
