import { Elysia, t } from "elysia";
import { getAuthUserId } from "@/server/lib/auth";
import {
  createShortUrl,
  getUserLinks,
  updateLink,
  deleteLink,
} from "@/server/services/url";

export const urlRoute = new Elysia({ prefix: "/url" })

  .post(
    "/create",
    async ({ body, request, set }) => {
      try {
        const ip = request.headers.get("x-forwarded-for") ?? "unknown";
        const userId = await getAuthUserId(request);
        const result = await createShortUrl(body.url, body.customSlug, userId, ip);

        if ("status" in result) {
          set.status = result.status;
          return { message: result.message };
        }

        set.status = 201;
        return result;
      } catch (err) {
        console.error("[url] create:", err);
        set.status = 500;
        return { message: "Internal server error" };
      }
    },
    {
      body: t.Object({
        url: t.String({ format: "uri", error: "Invalid URL format" }),
        customSlug: t.Optional(t.String()),
      }),
    }
  )

  .get(
    "/my-links",
    async ({ query, request, set }) => {
      try {
        const userId = await getAuthUserId(request);
        if (!userId) {
          set.status = 401;
          return { message: "Unauthorized. Please log in." };
        }
        return await getUserLinks(userId, query);
      } catch (err) {
        console.error("[url] my-links:", err);
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

  .patch(
    "/update",
    async ({ body, request, set }) => {
      try {
        const userId = await getAuthUserId(request);
        if (!userId) {
          set.status = 401;
          return { message: "Unauthorized. Please log in." };
        }

        const result = await updateLink(body.id, body.url, body.customSlug, userId);
        if ("status" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        return result;
      } catch (err) {
        console.error("[url] update:", err);
        set.status = 500;
        return { message: "Internal server error" };
      }
    },
    {
      body: t.Object({
        id: t.String(),
        url: t.String({ format: "uri", error: "Invalid URL format" }),
        customSlug: t.Optional(t.String()),
      }),
    }
  )

  .delete(
    "/remove/:id",
    async ({ params: { id }, request, set }) => {
      try {
        const userId = await getAuthUserId(request);
        if (!userId) {
          set.status = 401;
          return { message: "Unauthorized. Please log in." };
        }

        const result = await deleteLink(id, userId);
        if ("status" in result) {
          set.status = result.status;
          return { message: result.message };
        }
        return result;
      } catch (err) {
        console.error("[url] delete:", err);
        set.status = 500;
        return { message: "Internal server error" };
      }
    },
    {
      params: t.Object({ id: t.String() }),
    }
  );