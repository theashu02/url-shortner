import { t } from "elysia";

export const ThemeBody = t.Object({
  header: t.String(),
  card: t.String(),
  accent: t.String(),
  dark: t.Boolean(),
  description: t.Optional(t.String()),
  avatarUrl: t.Optional(t.String()),
  buttonShape: t.Optional(t.String()),
});

export const PageBlockBody = t.Object({
  key: t.String(),
  type: t.String(),
  position: t.Number(),
  visible: t.Optional(t.Boolean()),
  pinned: t.Optional(t.Boolean()),
  startsAt: t.Optional(t.Any()),
  endsAt: t.Optional(t.Any()),
  props: t.Optional(t.Any()),
});

export const IdParams = t.Object({ id: t.String() });
export const VersionParams = t.Object({ id: t.String(), version: t.String() });

export const CreatePageBody = t.Object({
  templateId: t.String(),
  title: t.Optional(t.String()),
  slug: t.Optional(t.String()),
  goal: t.Optional(t.String()),
  initialUrl: t.Optional(t.String()),
});

export const UpdatePageBody = t.Object({
  title: t.Optional(t.String()),
  slug: t.Optional(t.String()),
  theme: t.Optional(ThemeBody),
  blocks: t.Optional(t.Array(PageBlockBody)),
});

export const ListPagesQuery = t.Object({
  page: t.Optional(t.String()),
  limit: t.Optional(t.String()),
  search: t.Optional(t.String()),
  sortBy: t.Optional(t.String()),
  order: t.Optional(t.String()),
});

export const AppendLinkBody = t.Object({
  label: t.Optional(t.String()),
  url: t.Optional(t.String()),
  shortCode: t.Optional(t.String()),
});

export const DuplicatePageBody = t.Object({
  title: t.Optional(t.String()),
  slug: t.Optional(t.String()),
});

export const CheckSlugBody = t.Object({ slug: t.String() });
export const ClickBody = t.Object({ blockKey: t.String(), referrer: t.Optional(t.String()) });
export const AnalyticsQuery = t.Object({ days: t.Optional(t.String()) });
export const ShortLinkBody = t.Object({ customSlug: t.Optional(t.String()) });
export const AvatarBody = t.Object({ avatar: t.File() });
export const EmptyBody = t.Object({});
