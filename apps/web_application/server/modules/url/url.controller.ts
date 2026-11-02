import { Elysia } from "elysia";
import { BaseController } from "@/server/core/controller";
import { HttpError } from "@/server/core/http-errors";
import type { IAuthService } from "@/server/core/auth";
import type { UrlService } from "./url.service";
import { CreateUrlBody, MyLinksQuery, RemoveUrlParams, UpdateUrlBody } from "./url.schemas";

/**
 * UrlController is the Elysia adapter for short links (SRP: HTTP only).
 * Business rules live in UrlService; this class only maps HTTP <-> service.
 * NOTE: register() return type is inferred (no explicit Elysia generic annotation) so
 * Eden treaty preserves exact route types.
 */
export class UrlController extends BaseController {
  constructor(
    auth: IAuthService,
    private readonly urls: UrlService,
  ) {
    super(auth);
  }

  register() {
    const app = new Elysia({ prefix: "/url" })
      .post("/create", async ({ body, request, set }) => {
        const ip = request.headers.get("x-forwarded-for") ?? "unknown";
        const userId = await this.auth.getUserId(request);
        const result = await this.urls.createShortUrl(
          body.url,
          body.customSlug,
          userId,
          ip,
          body.expiresAt,
          body.utmParams,
          body.deviceCapture,
        );
        if ("status" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        set.status = 201;
        return result;
      }, { body: CreateUrlBody })
      .get("/my-links", async ({ query, request, set }) => {
        const userId = await this.requireUserId(request);
        return this.urls.getUserLinks(userId, query);
      }, { query: MyLinksQuery })
      .patch("/update", async ({ body, request, set }) => {
        const userId = await this.requireUserId(request);
        const result = await this.urls.updateLink(body.id, body.url, body.customSlug, userId, body.deviceCapture);
        if ("status" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        return result;
      }, { body: UpdateUrlBody })
      .delete("/remove/:id", async ({ params: { id }, request, set }) => {
        const userId = await this.requireUserId(request);
        const result = await this.urls.deleteLink(id, userId);
        if ("status" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        return result;
      }, { params: RemoveUrlParams });

    return this.registerErrorHook(app, "url");
  }
}

/** Convenience for tests: translate service unions to thrown HttpErrors. */
export function toHttpError(result: { status: number; message: string }): HttpError {
  return new HttpError(result.status, result.message);
}


