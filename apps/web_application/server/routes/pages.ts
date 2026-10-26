import { Elysia, t } from "elysia";
import { getAuthUserId } from "@/server/lib/auth";
import { PAGE_TEMPLATE_SEEDS } from "@/server/lib/pageTemplates";
import {
  checkPageSlugAvailability,
  appendPageLinkBlock,
  createPageFromTemplate,
  deleteUserPage,
  duplicateUserPage,
  ensurePageShortLink,
  getPageAnalytics,
  getPageVersion,
  getUserPage,
  listPageVersions,
  listUserPages,
  publishUserPage,
  recordPageClick,
  removePageShortLink,
  unpublishUserPage,
  checkPagesRateLimit,
  PAGES_RATE_LIMITS,
  updateUserPage,
} from "@/server/services/pages";
import { getRequestBaseUrl } from "@/lib/constant";
import { AVATAR_UPLOAD_MAX_BYTES, AVATAR_UPLOAD_MIME } from "@/server/lib/pageAvatar";
import { uploadPageAvatar } from "@/server/services/cloudinary";
import { UAParser } from "ua-parser-js";

const ThemeBody = t.Object({
  header: t.String(),
  card: t.String(),
  accent: t.String(),
  dark: t.Boolean(),
  description: t.Optional(t.String()),
  avatarUrl: t.Optional(t.String()),
  buttonShape: t.Optional(t.String()),
});

const PageBlockBody = t.Object({
  key: t.String(),
  type: t.String(),
  position: t.Number(),
  visible: t.Optional(t.Boolean()),
  pinned: t.Optional(t.Boolean()),
  startsAt: t.Optional(t.Any()),
  endsAt: t.Optional(t.Any()),
  props: t.Optional(t.Any()),
});

export const pagesRoute = new Elysia({ prefix: "/pages" })

  .get("/templates", async () => {
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
  .post(
    "/upload-avatar",
    async ({ body, request, set }) => {
      try {
        const userId = await getAuthUserId(request);
        if (!userId) {
          set.status = 401;
          return { message: "Unauthorized. Please log in." };
        }
        if (
          !(await checkPagesRateLimit(
            `upload-avatar:${userId}`,
            20,
            60
          ))
        ) {
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
        const url = await uploadPageAvatar(buffer);
        return { url };
      } catch (err) {
        console.error("[pages] upload-avatar:", err);
        set.status = 500;
        return { message: "Image upload failed. Try again." };
      }
    },
    {
      body: t.Object({ avatar: t.File() }),
    }
  )



  .post(
    "/check-slug",
    async ({ body }) => {
      return checkPageSlugAvailability(body.slug);
    },
    {
      body: t.Object({ slug: t.String() }),
    }
  )

  .post(
    "/",
    async ({ body, request, set }) => {
      try {
        const userId = await getAuthUserId(request);
        if (!userId) {
          set.status = 401;
          return { message: "Unauthorized. Please log in." };
        }
        if (
          !(await checkPagesRateLimit(
            `create:${userId}`,
            PAGES_RATE_LIMITS.create.limit,
            PAGES_RATE_LIMITS.create.windowSeconds
          ))
        ) {
          set.status = 429;
          return { message: "Too many pages created. Please wait a minute and try again." };
        }
        const result = await createPageFromTemplate(userId, {
          templateId: body.templateId,
          title: body.title,
          slug: body.slug,
          goal: body.goal,
          initialUrl: body.initialUrl,
        });
        if ("message" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        set.status = 201;
        return { page: result };
      } catch (err) {
        console.error("[pages] create:", err);
        set.status = 500;
        return { message: "Internal server error" };
      }
    },
    {
      body: t.Object({
        templateId: t.String(),
        title: t.Optional(t.String()),
        slug: t.Optional(t.String()),
        goal: t.Optional(t.String()),
        initialUrl: t.Optional(t.String()),
      }),
    }
  )

  .get(
    "/mine",
    async ({ query, request, set }) => {
      try {
        const userId = await getAuthUserId(request);
        if (!userId) {
          set.status = 401;
          return { message: "Unauthorized. Please log in." };
        }
        return await listUserPages(userId, query);
      } catch (err) {
        console.error("[pages] mine:", err);
        set.status = 500;
        return { message: "Internal server error" };
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        search: t.Optional(t.String()),
        sortBy: t.Optional(t.String()),
        order: t.Optional(t.String()),
      }),
    }
  )

  .get(
    "/:id",
    async ({ params: { id }, request, set }) => {
      try {
        const userId = await getAuthUserId(request);
        if (!userId) {
          set.status = 401;
          return { message: "Unauthorized. Please log in." };
        }
        const result = await getUserPage(userId, id);
        if ("message" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        return { page: result };
      } catch (err) {
        console.error("[pages] get:", err);
        set.status = 500;
        return { message: "Internal server error" };
      }
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )

  .patch(
    "/:id",
    async ({ params: { id }, body, request, set }) => {
      try {
        const userId = await getAuthUserId(request);
        if (!userId) {
          set.status = 401;
          return { message: "Unauthorized. Please log in." };
        }
        const origin = getRequestBaseUrl(request.headers, new URL(request.url).origin);
        const result = await updateUserPage(userId, id, {
          title: body.title,
          slug: body.slug,
          theme: body.theme,
          blocks: body.blocks,
        }, { origin });
        if ("message" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        return { page: result };
      } catch (err) {
        console.error("[pages] update:", err);
        set.status = 500;
        return { message: "Internal server error" };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        title: t.Optional(t.String()),
        slug: t.Optional(t.String()),
        theme: t.Optional(ThemeBody),
        blocks: t.Optional(t.Array(PageBlockBody)),
      }),
    }
  )

  .delete(
    "/:id",
    async ({ params: { id }, request, set }) => {
      try {
        const userId = await getAuthUserId(request);
        if (!userId) {
          set.status = 401;
          return { message: "Unauthorized. Please log in." };
        }
        const result = await deleteUserPage(userId, id);
        if ("status" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        return result;
      } catch (err) {
        console.error("[pages] delete:", err);
        set.status = 500;
        return { message: "Internal server error" };
      }
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )

  .post(
    "/:id/append-link",
    async ({ params: { id }, body, request, set }) => {
      try {
        const userId = await getAuthUserId(request);
        if (!userId) {
          set.status = 401;
          return { message: "Unauthorized. Please log in." };
        }
        if (
          !(await checkPagesRateLimit(
            `append:${userId}`,
            PAGES_RATE_LIMITS.appendLink.limit,
            PAGES_RATE_LIMITS.appendLink.windowSeconds
          ))
        ) {
          set.status = 429;
          return { message: "Too many requests. Please wait a minute and try again." };
        }
        const result = await appendPageLinkBlock(userId, id, {
          label: body.label,
          url: body.url,
          shortCode: body.shortCode,
        });
        if ("message" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        return { page: result };
      } catch (err) {
        console.error("[pages] append-link:", err);
        set.status = 500;
        return { message: "Internal server error" };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        label: t.Optional(t.String()),
        url: t.Optional(t.String()),
        shortCode: t.Optional(t.String()),
      }),
    }
  )

  .post(
    "/:id/duplicate",
    async ({ params: { id }, body, request, set }) => {
      try {
        const userId = await getAuthUserId(request);
        if (!userId) {
          set.status = 401;
          return { message: "Unauthorized. Please log in." };
        }
        const result = await duplicateUserPage(userId, id, {
          title: body.title,
          slug: body.slug,
        });
        if ("message" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        set.status = 201;
        return { page: result };
      } catch (err) {
        console.error("[pages] duplicate:", err);
        set.status = 500;
        return { message: "Internal server error" };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        title: t.Optional(t.String()),
        slug: t.Optional(t.String()),
      }),
    }
  )

  .post(
    "/:id/publish",
    async ({ params: { id }, request, set }) => {
      try {
        const userId = await getAuthUserId(request);
        if (!userId) {
          set.status = 401;
          return { message: "Unauthorized. Please log in." };
        }
        if (
          !(await checkPagesRateLimit(
            `publish:${userId}`,
            PAGES_RATE_LIMITS.publish.limit,
            PAGES_RATE_LIMITS.publish.windowSeconds
          ))
        ) {
          set.status = 429;
          return { message: "Too many publish requests. Please wait a minute and try again." };
        }
        const result = await publishUserPage(userId, id);
        if ("message" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        return result;
      } catch (err) {
        console.error("[pages] publish:", err);
        set.status = 500;
        return { message: "Internal server error" };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({}),
    }
  )

  .post(
    "/:id/unpublish",
    async ({ params: { id }, request, set }) => {
      try {
        const userId = await getAuthUserId(request);
        if (!userId) {
          set.status = 401;
          return { message: "Unauthorized. Please log in." };
        }
        const result = await unpublishUserPage(userId, id);
        if ("message" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        return { page: result };
      } catch (err) {
        console.error("[pages] unpublish:", err);
        set.status = 500;
        return { message: "Internal server error" };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({}),
    }
  )

  .post(
    "/:id/click",
    async ({ params: { id }, body, request, set }) => {
      try {
        const headers = request.headers;
        const ua = headers.get("user-agent") ?? "";
        const forwarded = headers.get("x-forwarded-for") ?? "";
        const ip = forwarded.split(",")[0]?.trim() || headers.get("x-real-ip")?.trim() || null;
        let deviceType = "desktop";
        try {
          deviceType = new UAParser(ua).getDevice().type ?? "desktop";
        } catch {
        }
        if (
          ip &&
          !(await checkPagesRateLimit(
            `click:${ip}`,
            PAGES_RATE_LIMITS.click.limit,
            PAGES_RATE_LIMITS.click.windowSeconds
          ))
        ) {
          set.status = 429;
          return { message: "Too many requests. Please wait a minute and try again." };
        }
        const result = await recordPageClick(id, body.blockKey, {
          deviceType,
          referrer: body.referrer ?? headers.get("referer") ?? headers.get("referrer"),
          userAgent: ua || null,
          ip,
        });
        if (result === true) return { ok: true, recorded: true };
        if (result === false) return { ok: true, recorded: false };
        set.status = result.status;
        return { message: result.message };
      } catch (err) {
        console.error("[pages] click:", err);
        set.status = 500;
        return { message: "Internal server error" };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        blockKey: t.String(),
        referrer: t.Optional(t.String()),
      }),
    }
  )

  .get(
    "/:id/analytics",
    async ({ params: { id }, query, request, set }) => {
      try {
        const userId = await getAuthUserId(request);
        if (!userId) {
          set.status = 401;
          return { message: "Unauthorized. Please log in." };
        }
        const result = await getPageAnalytics(userId, id, query.days);
        if ("message" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        return result;
      } catch (err) {
        console.error("[pages] analytics:", err);
        set.status = 500;
        return { message: "Internal server error" };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      query: t.Object({ days: t.Optional(t.String()) }),
    }
  )

  .post(
    "/:id/short-link",
    async ({ params: { id }, body, request, set }) => {
      try {
        const userId = await getAuthUserId(request);
        if (!userId) {
          set.status = 401;
          return { message: "Unauthorized. Please log in." };
        }
        const origin = getRequestBaseUrl(request.headers, new URL(request.url).origin);
        const forwarded = request.headers.get("x-forwarded-for") ?? "";
        const ip = forwarded.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || ("pages:" + userId);
        const result = await ensurePageShortLink(userId, id, origin, {
          customSlug: body.customSlug,
          ip,
        });
        if ("message" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        set.status = 201;
        return result;
      } catch (err) {
        console.error("[pages] short-link:", err);
        set.status = 500;
        return { message: "Internal server error" };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({ customSlug: t.Optional(t.String()) }),
    }
  )

  .delete(
    "/:id/short-link",
    async ({ params: { id }, request, set }) => {
      try {
        const userId = await getAuthUserId(request);
        if (!userId) {
          set.status = 401;
          return { message: "Unauthorized. Please log in." };
        }
        const result = await removePageShortLink(userId, id);
        if ("message" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        return result;
      } catch (err) {
        console.error("[pages] short-link remove:", err);
        set.status = 500;
        return { message: "Internal server error" };
      }
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )
  .get(
    "/:id/versions",
    async ({ params: { id }, request, set }) => {
      try {
        const userId = await getAuthUserId(request);
        if (!userId) {
          set.status = 401;
          return { message: "Unauthorized. Please log in." };
        }
        const result = await listPageVersions(userId, id);
        if ("message" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        return result;
      } catch (err) {
        console.error("[pages] versions:", err);
        set.status = 500;
        return { message: "Internal server error" };
      }
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )

  .get(
    "/:id/versions/:version",
    async ({ params, request, set }) => {
      try {
        const userId = await getAuthUserId(request);
        if (!userId) {
          set.status = 401;
          return { message: "Unauthorized. Please log in." };
        }
        const result = await getPageVersion(userId, params.id, Number(params.version));
        if ("message" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        return result;
      } catch (err) {
        console.error("[pages] version:", err);
        set.status = 500;
        return { message: "Internal server error" };
      }
    },
    {
      params: t.Object({ id: t.String(), version: t.String() }),
    }
  );

