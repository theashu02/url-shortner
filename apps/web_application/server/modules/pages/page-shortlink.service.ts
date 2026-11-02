import { isValidObjectId } from "mongoose";
import { UrlModel } from "@/server/models/url";
import { CUSTOM_SLUG_RE } from "@/server/lib/url";
import type { UtmParamsInput } from "@/server/lib/utm";
import type { IPage } from "@/server/models/page";
import type { IDatabase } from "@/server/core/database";
import type { IPageRepository } from "./page.repositories";
import { toPageDTO } from "./page.mapper";
import type { PageDTO, ServiceError } from "./page.types";
import type { UrlService } from "@/server/modules/url/url.service";

function safePageOrigin(origin: string): string | null {
  try {
    const url = new URL(origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

/** Shared by PageCrudService after slug renames (SRP: cache/destination sync). */
export async function syncShortLinkDestination(page: IPage, origin: string, db: IDatabase): Promise<void> {
  const shortCode = page.linkedShortCode ? String(page.linkedShortCode) : "";
  const base = safePageOrigin(origin);
  if (!shortCode || !base) return;
  try {
    await db.connect();
    await UrlModel.updateOne({ shortCode }, { $set: { url: base + "/p/" + page.slug } });
    await refreshShortLinkCache(shortCode);
  } catch (err) {
    console.error("[pages] short-link sync:", err);
  }
}

async function refreshShortLinkCache(shortCode: string): Promise<void> {
  try {
    const mod = await import("@/server/redis/redis");
    const client = mod.redis;
    const pending = (async () => {
      await client.del("url:" + shortCode).catch(() => {});
      await client.del("dc:" + shortCode).catch(() => {});
    })();
    await Promise.race([pending, new Promise((resolve) => setTimeout(resolve, 1500))]);
  } catch {
  }
}

/**
 * SRP: page <-> short-link binding. Depends on UrlService via its interface (DIP),
 * so the pages domain never imports the url module implementation directly (OCP).
 */
export class PageShortLinkService {
  constructor(
    private readonly pages: IPageRepository,
    private readonly urls: Pick<
      UrlService,
      "createShortUrl"
    >,
    private readonly db: IDatabase,
  ) {}

  async ensureForUser(
    userId: string,
    id: string,
    origin: string,
    input: { customSlug?: string; ip?: string } = {},
  ): Promise<{ page: PageDTO; shortCode: string; shortUrl: string } | ServiceError> {
    if (!isValidObjectId(id)) return { status: 404, message: "Page not found." };
    const base = safePageOrigin(origin);
    if (!base) return { status: 400, message: "Could not determine the public page URL." };
    const customSlug = (input.customSlug ?? "").trim();
    if (customSlug && !CUSTOM_SLUG_RE.test(customSlug)) {
      return { status: 400, message: "Custom alias must be 3-32 characters (letters, numbers, _ hyphen)." };
    }

    const page = await this.pages.findByIdForUser(id, userId);
    if (!page) return { status: 404, message: "Page not found." };
    const destination = base + "/p/" + page.slug;

    if (page.linkedShortCode) {
      await this.db.connect();
      const existing = await UrlModel.findOne({ shortCode: page.linkedShortCode });
      if (existing) {
        if (existing.url !== destination) {
          existing.url = destination;
          await existing.save();
          await refreshShortLinkCache(page.linkedShortCode);
        }
        return { page: toPageDTO(page), shortCode: page.linkedShortCode, shortUrl: base + "/" + page.linkedShortCode };
      }
    }

    let result: Awaited<ReturnType<UrlService["createShortUrl"]>>;
    try {
      result = await this.urls.createShortUrl(
        destination,
        customSlug || undefined,
        userId,
        input.ip ?? `pages:${userId}`,
        undefined,
        undefined as unknown as UtmParamsInput | undefined,
      );
    } catch (err) {
      console.error("[pages] short-link create:", err);
      return { status: 503, message: "Short-link service is unavailable. Try again later." };
    }
    if ("status" in result) return { status: result.status, message: result.message };
    page.linkedShortCode = result.shortCode;
    await this.pages.save(page);
    return { page: toPageDTO(page), shortCode: result.shortCode, shortUrl: base + "/" + result.shortCode };
  }

  async removeForUser(userId: string, id: string): Promise<{ page: PageDTO } | ServiceError> {
    if (!isValidObjectId(id)) return { status: 404, message: "Page not found." };
    const page = await this.pages.findByIdForUser(id, userId);
    if (!page) return { status: 404, message: "Page not found." };
    page.linkedShortCode = undefined as unknown as string;
    await this.pages.save(page);
    return { page: toPageDTO(page) };
  }
}
