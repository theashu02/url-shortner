import { Elysia } from "elysia";
import { UAParser } from "ua-parser-js";
import { PAGE_TEMPLATE_SEEDS } from "@/server/lib/pageTemplates";
import { getRequestBaseUrl } from "@/lib/constant";
import { AVATAR_UPLOAD_MAX_BYTES, AVATAR_UPLOAD_MIME } from "@/server/lib/pageAvatar";
import { BaseController } from "@/server/core/controller";
import { RateLimitError } from "@/server/core/http-errors";
import type { IAuthService } from "@/server/core/auth";
import type { IRateLimiter } from "@/server/core/rate-limit";
import type { PageService } from "./page.service";
import {
  AnalyticsQuery,
  AppendLinkBody,
  AvatarBody,
  CheckSlugBody,
  ClickBody,
  CreatePageBody,
  DuplicatePageBody,
  EmptyBody,
  IdParams,
  ListPagesQuery,
  ShortLinkBody,
  UpdatePageBody,
  VersionParams,
} from "./page.schemas";

export const PAGES_RATE_LIMITS = {
  create: { limit: 20, windowSeconds: 60 },
  appendLink: { limit: 30, windowSeconds: 60 },
  publish: { limit: 30, windowSeconds: 60 },
  click: { limit: 120, windowSeconds: 60 },
} as const;

interface AvatarStorage {
  upload(buffer: Buffer): Promise<string>;
}

/**
 * SRP: HTTP adapter for the pages domain (19 endpoints).
 * Rate limiting + avatar upload behind injected seams (DIP).
 */
export class PageController extends BaseController {
  constructor(
    auth: IAuthService,
    private readonly pages: PageService,
    private readonly limiter: IRateLimiter,
    private readonly avatars: AvatarStorage,
  ) {
    super(auth);
  }

  register() {
    const app = new Elysia({ prefix: "/pages" })
      .get("/templates", async ({ request }) => {
        await this.requireUserId(request);
        return {
          templates: PAGE_TEMPLATE_SEEDS.map((seed) => ({
          id: seed.id,
          name: seed.name,
          useCase: seed.useCase,
          theme: seed.theme,
          blockCount: seed.defaultBlocks.length,
          blocks: seed.defaultBlocks,
          })),
        };
      })
      .post("/upload-avatar", async ({ body, request, set }) => {
        const userId = await this.requireUserId(request);
        if (!(await this.limiter.check(`upload-avatar:${userId}`, 20, 60))) {
          set.status = 429;
          return { message: "Too many uploads. Please wait a minute and try again." };
        }
        const file = (body as { avatar?: unknown }).avatar;
        if (!(file instanceof File)) {
          set.status = 400;
          return { message: "No image file received." };
        }
        const allowed = AVATAR_UPLOAD_MIME as readonly string[];
        if (!allowed.includes(file.type) || file.size <= 0) {
          set.status = 400;
          return { message: "Upload a JPEG, PNG or WebP image." };
        }
        if (file.size > AVATAR_UPLOAD_MAX_BYTES) {
          set.status = 400;
          return { message: "Image must be 3MB or smaller." };
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        const url = await this.avatars.upload(buffer);
        return { url };
      }, { body: AvatarBody })
      .post("/check-slug", async ({ body }) => this.pages.checkSlugAvailability(body.slug), {
        body: CheckSlugBody,
      })
      .post("/", async ({ body, request, set }) => {
        const userId = await this.requireUserId(request);
        if (!(await this.limiter.check(`create:${userId}`, PAGES_RATE_LIMITS.create.limit, PAGES_RATE_LIMITS.create.windowSeconds))) {
          set.status = 429;
          return { message: "Too many pages created. Please wait a minute and try again." };
        }
        const result = await this.pages.createFromTemplate(userId, body);
        if ("message" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        set.status = 201;
        return { page: result };
      }, { body: CreatePageBody })
      .get("/mine", async ({ query, request }) => {
        const userId = await this.requireUserId(request);
        return this.pages.listForUser(userId, query);
      }, { query: ListPagesQuery })
      .get("/:id", async ({ params: { id }, request, set }) => {
        const userId = await this.requireUserId(request);
        const result = await this.pages.getForUser(userId, id);
        if ("message" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        return { page: result };
      }, { params: IdParams })
      .patch("/:id", async ({ params: { id }, body, request, set }) => {
        const userId = await this.requireUserId(request);
        const origin = getRequestBaseUrl(request.headers, new URL(request.url).origin);
        const result = await this.pages.updateForUser(userId, id, body, { origin });
        if ("message" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        return { page: result };
      }, { params: IdParams, body: UpdatePageBody })
      .delete("/:id", async ({ params: { id }, request, set }) => {
        const userId = await this.requireUserId(request);
        const result = await this.pages.deleteForUser(userId, id);
        if ("status" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        return result;
      }, { params: IdParams })
      .post("/:id/append-link", async ({ params: { id }, body, request, set }) => {
        const userId = await this.requireUserId(request);
        if (!(await this.limiter.check(`append:${userId}`, PAGES_RATE_LIMITS.appendLink.limit, PAGES_RATE_LIMITS.appendLink.windowSeconds))) {
          set.status = 429;
          return { message: "Too many requests. Please wait a minute and try again." };
        }
        const result = await this.pages.appendLinkBlock(userId, id, body);
        if ("message" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        return { page: result };
      }, { params: IdParams, body: AppendLinkBody })
      .post("/:id/duplicate", async ({ params: { id }, body, request, set }) => {
        const userId = await this.requireUserId(request);
        const result = await this.pages.duplicateForUser(userId, id, body);
        if ("message" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        set.status = 201;
        return { page: result };
      }, { params: IdParams, body: DuplicatePageBody })
      .post("/:id/publish", async ({ params: { id }, request, set }) => {
        const userId = await this.requireUserId(request);
        if (!(await this.limiter.check(`publish:${userId}`, PAGES_RATE_LIMITS.publish.limit, PAGES_RATE_LIMITS.publish.windowSeconds))) {
          set.status = 429;
          return { message: "Too many publish requests. Please wait a minute and try again." };
        }
        const result = await this.pages.publishForUser(userId, id);
        if ("message" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        return result;
      }, { params: IdParams, body: EmptyBody })
      .post("/:id/unpublish", async ({ params: { id }, request, set }) => {
        const userId = await this.requireUserId(request);
        const result = await this.pages.unpublishForUser(userId, id);
        if ("message" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        return { page: result };
      }, { params: IdParams, body: EmptyBody })
      .post("/:id/click", async ({ params: { id }, body, request, set }) => {
        const headers = request.headers;
        const ua = headers.get("user-agent") ?? "";
        const forwarded = headers.get("x-forwarded-for") ?? "";
        const ip = forwarded.split(",")[0]?.trim() || headers.get("x-real-ip")?.trim() || null;
        let deviceType = "desktop";
        try {
          deviceType = new UAParser(ua).getDevice().type ?? "desktop";
        } catch {
        }
        if (ip && !(await this.limiter.check(`click:${ip}`, PAGES_RATE_LIMITS.click.limit, PAGES_RATE_LIMITS.click.windowSeconds))) {
          set.status = 429;
          return { message: "Too many requests. Please wait a minute and try again." };
        }
        const result = await this.pages.recordClick(id, body.blockKey, {
          deviceType,
          referrer: body.referrer ?? headers.get("referer") ?? headers.get("referrer"),
          userAgent: ua || null,
          ip,
        });
        if (result === true) return { ok: true, recorded: true };
        if (result === false) return { ok: true, recorded: false };
        set.status = result.status;
        return { message: result.message };
      }, { params: IdParams, body: ClickBody })
      .get("/:id/analytics", async ({ params: { id }, query, request, set }) => {
        const userId = await this.requireUserId(request);
        const result = await this.pages.getAnalytics(userId, id, query.days);
        if ("message" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        return result;
      }, { params: IdParams, query: AnalyticsQuery })
      .post("/:id/short-link", async ({ params: { id }, body, request, set }) => {
        const userId = await this.requireUserId(request);
        const origin = getRequestBaseUrl(request.headers, new URL(request.url).origin);
        const forwarded = request.headers.get("x-forwarded-for") ?? "";
        const ip = forwarded.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || `pages:${userId}`;
        const result = await this.pages.ensureShortLink(userId, id, origin, { customSlug: body.customSlug, ip });
        if ("message" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        set.status = 201;
        return result;
      }, { params: IdParams, body: ShortLinkBody })
      .delete("/:id/short-link", async ({ params: { id }, request, set }) => {
        const userId = await this.requireUserId(request);
        const result = await this.pages.removeShortLink(userId, id);
        if ("message" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        return result;
      }, { params: IdParams })
      .get("/:id/versions", async ({ params: { id }, request, set }) => {
        const userId = await this.requireUserId(request);
        const result = await this.pages.listVersionsForUser(userId, id);
        if ("message" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        return result;
      }, { params: IdParams })
      .get("/:id/versions/:version", async ({ params, request, set }) => {
        const userId = await this.requireUserId(request);
        const result = await this.pages.getVersionForUser(userId, params.id, Number(params.version));
        if ("message" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        return result;
      }, { params: VersionParams });

    return this.registerErrorHook(app, "pages");
  }
}


