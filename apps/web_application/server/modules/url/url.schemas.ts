import { t } from "elysia";

/** ISP: one schema object per endpoint - controllers pick only what they need. */
export const CreateUrlBody = t.Object({
  url: t.String({ format: "uri", error: "Invalid URL format" }),
  customSlug: t.Optional(t.String()),
  expiresAt: t.Optional(t.String()),
  deviceCapture: t.Optional(t.Boolean()),
  utmParams: t.Optional(
    t.Object({
      source: t.Optional(t.String()),
      medium: t.Optional(t.String()),
      campaign: t.Optional(t.String()),
      term: t.Optional(t.String()),
      content: t.Optional(t.String()),
    }),
  ),
});

export const MyLinksQuery = t.Object({
  page: t.Optional(t.String()),
  limit: t.Optional(t.String()),
  search: t.Optional(t.String()),
  sortBy: t.Optional(t.String()),
  order: t.Optional(t.String()),
});

export const UpdateUrlBody = t.Object({
  id: t.String(),
  deviceCapture: t.Optional(t.Boolean()),
  url: t.String({ format: "uri", error: "Invalid URL format" }),
  customSlug: t.Optional(t.String()),
});

export const RemoveUrlParams = t.Object({ id: t.String() });
