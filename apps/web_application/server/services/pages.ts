import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "@/server/db/mongoose";
import { PageModel } from "@/server/models/page";
import type { IPage } from "@/server/models/page";
import { PageVersionModel } from "@/server/models/pageVersion";
import type { IPageVersion } from "@/server/models/pageVersion";
import { PageViewModel } from "@/server/models/pageView";
import { PageSlugRedirectModel } from "@/server/models/pageSlugRedirect";
import {
  buildSeedBlocks,
  getPageTemplateSeed,
} from "@/server/lib/pageTemplates";
import {
  MAX_BLOCK_ITEMS,
  MAX_PAGE_BLOCKS,
  PAGE_ITEM_SHORT_CODE_RE,
  isBlockLiveNow,
  applyInitialPageUrl,
  normalizePageSlug,
  validatePageBlocks,
  validatePageGoal,
  validatePageSlug,
  validatePageTheme,
} from "@/server/lib/pages";
import type {
  PageButtonShape,
  PageStatus,
  PageTheme,
} from "@/server/lib/pages";
import { generateShortCode } from "@/server/lib/base62";
import { CUSTOM_SLUG_RE, escapeRegex } from "@/server/lib/url";
import { UrlModel } from "@/server/models/url";
import { detectBot } from "@/server/lib/click-capture/bot-detection";
import crypto from "crypto";
import type { UtmParamsInput } from "@/server/lib/utm";

export type PageBlockDTO = {
  key: string;
  type: string;
  position: number;
  visible: boolean;
  pinned: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  props: Record<string, unknown>;
};

export type PageDTO = {
  _id: string;
  slug: string;
  title: string;
  templateId: string;
  goal?: string;
  theme: PageTheme;
  blocks: PageBlockDTO[];
  status: PageStatus;
  publishedVersionId?: string;
  linkedShortCode?: string;
  views: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
};

export type PagePaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
};

export type ServiceError = { status: number; message: string };

function toIsoOrNull(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  const time = value instanceof Date ? value.getTime() : Date.parse(String(value));
  if (!Number.isFinite(time)) return null;
  return new Date(time).toISOString();
}

function toBlockDTO(block: unknown): PageBlockDTO {
  const record =
    typeof block === "object" && block !== null
      ? (block as Record<string, unknown>)
      : {};
  const props = record["props"];
  return {
    key: String(record["key"] ?? ""),
    type: String(record["type"] ?? ""),
    position: Number(record["position"] ?? 0),
    visible: record["visible"] !== false,
    pinned: record["pinned"] === true,
    startsAt: toIsoOrNull(record["startsAt"]),
    endsAt: toIsoOrNull(record["endsAt"]),
    props:
      typeof props === "object" && props !== null && !Array.isArray(props)
        ? (props as Record<string, unknown>)
        : {},
  };
}

export function toThemeDTO(theme: unknown): PageTheme {
  const record =
    typeof theme === "object" && theme !== null
      ? (theme as Record<string, unknown>)
      : {};
  const text = (value: unknown) => (typeof value === "string" ? value : "");
  const dto: PageTheme = {
    header: text(record["header"]) || "#FFFFFF",
    card: text(record["card"]) || "#FFFFFF",
    accent: text(record["accent"]) || "#EA580C",
    dark: record["dark"] === true,
  };
  const description = text(record["description"]);
  if (description) dto.description = description.slice(0, 200);
  const avatarUrl = text(record["avatarUrl"]);
  if (avatarUrl) dto.avatarUrl = avatarUrl.slice(0, 500);
  const shape = text(record["buttonShape"]);
  if (shape === "rounded" || shape === "pill" || shape === "square") {
    dto.buttonShape = shape as PageButtonShape;
  }
  return dto;
}

export function toPageDTO(page: IPage): PageDTO {
  return {
    _id: String(page._id),
    slug: String(page.slug ?? ""),
    title: String(page.title ?? ""),
    templateId: String(page.templateId ?? ""),
    goal: typeof page.goal === "string" && page.goal.length > 0 ? page.goal : undefined,
    theme: toThemeDTO(page.theme),
    blocks: Array.isArray(page.blocks) ? page.blocks.map(toBlockDTO) : [],
    status: page.status === "published" ? "published" : "draft",
    publishedVersionId: page.publishedVersionId
      ? String(page.publishedVersionId)
      : undefined,
    linkedShortCode: page.linkedShortCode
      ? String(page.linkedShortCode)
      : undefined,
    views: Number(page.views ?? 0),
    clicks: Number(page.clicks ?? 0),
    createdAt: page.createdAt
      ? new Date(page.createdAt).toISOString()
      : new Date().toISOString(),
    updatedAt: page.updatedAt
      ? new Date(page.updatedAt).toISOString()
      : new Date().toISOString(),
  };
}

async function suggestUniqueSlug(base: string): Promise<string> {
  const normalized = normalizePageSlug(base);
  const root = normalized.length > 0 ? normalized : "page";

  await connectToDatabase();
  if (
    validatePageSlug(root) === null &&
    !(await PageModel.exists({ slug: root }))
  ) {
    return root;
  }
  for (let attempt = 2; attempt <= 9; attempt += 1) {
    const candidate = `${root}-${attempt}`;
    if (
      validatePageSlug(candidate) === null &&
      !(await PageModel.exists({ slug: candidate }))
    ) {
      return candidate;
    }
  }
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = `${root}-${generateShortCode(4).toLowerCase()}`;
    if (
      validatePageSlug(candidate) === null &&
      !(await PageModel.exists({ slug: candidate }))
    ) {
      return candidate;
    }
  }
  return `${root}-${Date.now().toString(36)}`;
}

export async function checkPageSlugAvailability(
  rawSlug: string
): Promise<{ slug: string; available: boolean; message?: string }> {
  const slug = normalizePageSlug(rawSlug);
  const error = validatePageSlug(slug);
  if (error) return { slug, available: false, message: error };
  await connectToDatabase();
  if (await PageModel.exists({ slug })) {
    return {
      slug,
      available: false,
      message: "This URL is already taken. Please choose another.",
    };
  }
  return { slug, available: true };
}

/**
 * Best-effort per-key rate limit. Fails open when Redis is unavailable
 * so pages stay usable during cache outages.
 */
export async function checkPagesRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    // Lazy so that importing this module never opens a Redis connection.
    const { redis } = await import("@/server/redis/redis");
    const full = `pages-rl:${key}`;
    const count = await redis.incr(full);
    if (count === 1) await redis.expire(full, windowSeconds);
    return count <= limit;
  } catch {
    return true;
  }
}

export const PAGES_RATE_LIMITS = {
  create: { limit: 20, windowSeconds: 60 },
  appendLink: { limit: 30, windowSeconds: 60 },
  publish: { limit: 30, windowSeconds: 60 },
  click: { limit: 120, windowSeconds: 60 },
} as const;

export async function createPageFromTemplate(
  userId: string,
  input: {
    templateId: string;
    title?: string;
    slug?: string;
    goal?: string;
    initialUrl?: string;
  }
): Promise<PageDTO | ServiceError> {
  const seed = getPageTemplateSeed(input.templateId);
  if (!seed) return { status: 404, message: "Template not found." };

  const goalError = validatePageGoal(input.goal);
  if (goalError) return { status: 400, message: goalError };
  const goal =
    typeof input.goal === "string" && input.goal.length > 0 ? input.goal : undefined;

  const title =
    input.title && input.title.trim().length > 0
      ? input.title.trim().slice(0, 120)
      : seed.name;

  let slug: string;
  if (input.slug && input.slug.trim().length > 0) {
    slug = normalizePageSlug(input.slug);
    const error = validatePageSlug(slug);
    if (error) return { status: 400, message: error };
    await connectToDatabase();
    if (await PageModel.exists({ slug })) {
      return {
        status: 409,
        message: "This URL is already taken. Please choose another.",
      };
    }
  } else {
    slug = await suggestUniqueSlug(title);
  }

  const blocks = applyInitialPageUrl(
    buildSeedBlocks(seed.id).map((block) => ({
      ...block,
      props: { ...(block.props ?? {}) },
    })),
    input.initialUrl
  );
  const blockErrors = validatePageBlocks(blocks);
  if (blockErrors.length > 0) {
    return { status: 400, message: blockErrors[0] ?? "Invalid page blocks." };
  }
  await connectToDatabase();
  const page = await PageModel.create({
    userId,
    slug,
    title,
    templateId: seed.id,
    goal,
    theme: { ...seed.theme },
    blocks,
    status: "draft",
    views: 0,
  });
  return toPageDTO(page);
}

export async function listUserPages(
  userId: string,
  query: {
    page?: string;
    limit?: string;
    search?: string;
    sortBy?: string;
    order?: string;
  }
): Promise<{ pages: PageDTO[]; pagination: PagePaginationMeta }> {
  const page = Math.max(1, parseInt(query.page ?? "1", 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, parseInt(query.limit ?? "12", 10) || 12)
  );
  const search = (query.search ?? "").trim();
  const allowedSort = ["updatedAt", "createdAt", "title"];
  const sortBy = allowedSort.includes(query.sortBy ?? "")
    ? (query.sortBy as string)
    : "updatedAt";
  const order = query.order === "asc" ? 1 : -1;

  await connectToDatabase();
  const filter: Record<string, unknown> = { userId };
  if (search) {
    const escaped = escapeRegex(search);
    filter.$or = [
      { slug: { $regex: escaped, $options: "i" } },
      { title: { $regex: escaped, $options: "i" } },
    ];
  }

  const [docs, total] = await Promise.all([
    PageModel.find(filter)
      .sort({ [sortBy]: order })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    PageModel.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);
  return {
    pages: (docs as IPage[]).map(toPageDTO),
    pagination: { total, page, limit, totalPages, hasMore: page < totalPages },
  };
}

export async function appendPageLinkBlock(
  userId: string,
  id: string,
  input: { label?: string; url?: string; shortCode?: string }
): Promise<PageDTO | ServiceError> {
  if (!isValidObjectId(id)) return { status: 404, message: "Page not found." };
  const label = (input.label ?? "").trim().slice(0, 80);
  if (!label) return { status: 400, message: "A link label is required." };
  const url = (input.url ?? "").trim();
  if (!/^https?:\/\/\S+$/i.test(url)) {
    return { status: 400, message: "Link URL must start with http:// or https://." };
  }
  let shortCode: string | undefined;
  if (input.shortCode !== undefined && input.shortCode !== "") {
    shortCode = String(input.shortCode).trim();
    if (!PAGE_ITEM_SHORT_CODE_RE.test(shortCode)) {
      return {
        status: 400,
        message: "Short code must be 3-50 characters (letters, numbers, hyphens only).",
      };
    }
  }
  await connectToDatabase();
  const page = await PageModel.findOne({ _id: id, userId });
  if (!page) return { status: 404, message: "Page not found." };
  if (shortCode) {
    const link = await UrlModel.findOne({ shortCode }).lean();
    if (!link) return { status: 404, message: "Short link not found." };
    if ((link as { userId?: string }).userId !== userId) {
      return { status: 403, message: "You can only attach your own short links." };
    }
  }
  const blocks = JSON.parse(JSON.stringify(page.blocks ?? [])) as IPage["blocks"];
  const target = blocks.find((block) => block.type === "links");
  const item: Record<string, unknown> = { label, url };
  if (shortCode) item["shortCode"] = shortCode;
  if (target) {
    const props = (target.props ?? {}) as Record<string, unknown>;
    const items = Array.isArray(props["items"]) ? [...(props["items"] as unknown[])] : [];
    if (items.length >= MAX_BLOCK_ITEMS) {
      return { status: 400, message: `Link blocks support up to ${MAX_BLOCK_ITEMS} items.` };
    }
    items.push(item);
    target.props = { ...props, items };
  } else {
    if (blocks.length >= MAX_PAGE_BLOCKS) {
      return { status: 400, message: `Pages support up to ${MAX_PAGE_BLOCKS} blocks.` };
    }
    blocks.push({
      key: `links-${Date.now().toString(36)}`,
      type: "links",
      position: blocks.length,
      visible: true,
      pinned: false,
      props: { style: "stack", items: [item] },
    });
  }
  const errors = validatePageBlocks(blocks);
  if (errors.length > 0) {
    return { status: 400, message: errors[0] ?? "Invalid page blocks." };
  }
  page.blocks = blocks;
  page.markModified("blocks");
  await page.save();
  return toPageDTO(page);
}

export async function getUserPage(
  userId: string,
  id: string
): Promise<PageDTO | ServiceError> {
  if (!isValidObjectId(id)) return { status: 404, message: "Page not found." };
  await connectToDatabase();
  const page = await PageModel.findOne({ _id: id, userId }).lean();
  if (!page) return { status: 404, message: "Page not found." };
  return toPageDTO(page as IPage);
}

export async function updateUserPage(
  userId: string,
  id: string,
  patch: {
    title?: string;
    slug?: string;
    theme?: unknown;
    blocks?: unknown;
  },
  opts: { origin?: string } = {}
): Promise<PageDTO | ServiceError> {
  if (!isValidObjectId(id)) return { status: 404, message: "Page not found." };
  await connectToDatabase();
  const page = await PageModel.findOne({ _id: id, userId });
  if (!page) return { status: 404, message: "Page not found." };

  if (patch.title !== undefined) {
    const title = patch.title.trim();
    if (title.length === 0) {
      return { status: 400, message: "Title is required." };
    }
    page.title = title.slice(0, 120);
  }

  let slugChanged = false;
  if (patch.slug !== undefined) {
    const slug = normalizePageSlug(patch.slug);
    const error = validatePageSlug(slug);
    if (error) return { status: 400, message: error };
    if (
      slug !== page.slug &&
      (await PageModel.exists({ slug, _id: { $ne: page._id } }))
    ) {
      return {
        status: 409,
        message: "This URL is already taken. Please choose another.",
      };
    }
    slugChanged = slug !== page.slug;
    if (slugChanged) {
      try {
        await recordPageSlugRedirect(page._id, String(page.slug), slug);
      } catch (err) {
        console.error("[pages] redirect record:", err);
      }
    }
    page.slug = slug;
  }

  if (patch.theme !== undefined) {
    const errors = validatePageTheme(patch.theme);
    if (errors.length > 0) return { status: 400, message: errors.join(" ") };
    page.theme = patch.theme as PageTheme;
  }

  if (patch.blocks !== undefined) {
    const errors = validatePageBlocks(patch.blocks);
    if (errors.length > 0) return { status: 400, message: errors.join(" ") };
    page.blocks = patch.blocks as IPage["blocks"];
  }

  await page.save();
  if (slugChanged && page.linkedShortCode && opts.origin) {
    await syncPageShortLinkDestination(page, opts.origin);
  }
  return toPageDTO(page);
}

export async function deleteUserPage(
  userId: string,
  id: string
): Promise<{ message: string; id: string } | ServiceError> {
  if (!isValidObjectId(id)) return { status: 404, message: "Page not found." };
  await connectToDatabase();
  const page = await PageModel.findOneAndDelete({ _id: id, userId });
  if (!page) return { status: 404, message: "Page not found." };
  await Promise.all([
    PageVersionModel.deleteMany({ pageId: page._id }),
    PageViewModel.deleteMany({ pageId: page._id }),
    PageSlugRedirectModel.deleteMany({ pageId: page._id }),
  ]);
  return { message: "Page deleted successfully", id };
}

export async function duplicateUserPage(
  userId: string,
  id: string,
  input: { title?: string; slug?: string }
): Promise<PageDTO | ServiceError> {
  if (!isValidObjectId(id)) return { status: 404, message: "Page not found." };
  await connectToDatabase();
  const page = await PageModel.findOne({ _id: id, userId }).lean();
  if (!page) return { status: 404, message: "Page not found." };
  const source = page as IPage;

  const title =
    input.title && input.title.trim().length > 0
      ? input.title.trim().slice(0, 120)
      : `${source.title} copy`;

  let slug: string;
  if (input.slug && input.slug.trim().length > 0) {
    slug = normalizePageSlug(input.slug);
    const error = validatePageSlug(slug);
    if (error) return { status: 400, message: error };
    if (await PageModel.exists({ slug })) {
      return {
        status: 409,
        message: "This URL is already taken. Please choose another.",
      };
    }
  } else {
    slug = await suggestUniqueSlug(`${source.slug}-copy`);
  }

  const clonedBlocks = JSON.parse(JSON.stringify(source.blocks ?? [])) as IPage["blocks"];
  for (const block of clonedBlocks) {
    if (block.type !== "links") continue;
    const props = (block.props ?? {}) as Record<string, unknown>;
    if (!Array.isArray(props["items"])) continue;
    props["items"] = (props["items"] as Record<string, unknown>[]).map((item) => {
      if (typeof item !== "object" || item === null || Array.isArray(item)) return item;
      const next = { ...item };
      delete next["shortCode"];
      return next;
    });
    block.props = props;
  }
  const copy = await PageModel.create({
    userId,
    slug,
    title,
    templateId: source.templateId,
    goal: typeof source.goal === "string" ? source.goal : undefined,
    theme: JSON.parse(JSON.stringify(source.theme)) as PageTheme,
    blocks: clonedBlocks,
    status: "draft",
    views: 0,
  });
  return toPageDTO(copy);
}

export type PageVersionDTO = {
  _id: string;
  pageId: string;
  version: number;
  snapshot: {
    title: string;
    theme: PageTheme;
    blocks: PageBlockDTO[];
  };
  createdBy: string;
  createdAt: string;
};

export type PublishedPageDTO = {
  pageId: string;
  slug: string;
  title: string;
  theme: PageTheme;
  blocks: PageBlockDTO[];
  version: number;
  views: number;
  updatedAt: string;
};

function toVersionDTO(version: IPageVersion): PageVersionDTO {
  const snapshot = version.snapshot as unknown as Record<string, unknown>;
  const theme = snapshot["theme"] as PageTheme;
  const rawBlocks = Array.isArray(snapshot["blocks"]) ? snapshot["blocks"] : [];
  return {
    _id: String(version._id),
    pageId: String(version.pageId),
    version: Number(version.version),
    snapshot: {
      title: String(snapshot["title"] ?? ""),
      theme: toThemeDTO(theme),
      blocks: (rawBlocks as unknown[]).map(toBlockDTO),
    },
    createdBy: String(version.createdBy ?? ""),
    createdAt: version.createdAt
      ? new Date(version.createdAt).toISOString()
      : new Date().toISOString(),
  };
}

function frozenSnapshotOf(page: IPage): {
  title: string;
  theme: PageTheme;
  blocks: IPage["blocks"];
} {
  return JSON.parse(
    JSON.stringify({
      title: page.title,
      theme: page.theme,
      blocks: page.blocks ?? [],
    })
  ) as { title: string; theme: PageTheme; blocks: IPage["blocks"] };
}

function validateDraftForPublish(page: IPage): string | null {
  if (!page.title || page.title.trim().length === 0) {
    return "Add a page title before publishing.";
  }
  const themeErrors = validatePageTheme(page.theme);
  if (themeErrors.length > 0) return themeErrors[0] as string;
  const blockErrors = validatePageBlocks(page.blocks ?? []);
  if (blockErrors.length > 0) return blockErrors[0] as string;
  return null;
}

export async function publishUserPage(
  userId: string,
  id: string
): Promise<{ page: PageDTO; version: PageVersionDTO } | ServiceError> {
  if (!isValidObjectId(id)) return { status: 404, message: "Page not found." };
  await connectToDatabase();
  const page = await PageModel.findOne({ _id: id, userId });
  if (!page) return { status: 404, message: "Page not found." };

  const invalid = validateDraftForPublish(page);
  if (invalid) return { status: 400, message: invalid };

  const snapshot = frozenSnapshotOf(page);
  let versionDoc = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const latest = await PageVersionModel.findOne({ pageId: page._id })
      .sort({ version: -1 })
      .select("version")
      .lean();
    const next = (latest ? Number((latest as { version: number }).version) : 0) + 1;
    try {
      versionDoc = await PageVersionModel.create({
        pageId: page._id,
        version: next,
        snapshot,
        createdBy: userId,
      });
      break;
    } catch (err) {
      const code = (err as { code?: number })?.code;
      if (code === 11000 && attempt < 2) continue;
      throw err;
    }
  }
  if (!versionDoc) {
    return { status: 409, message: "Publish conflict. Please try again." };
  }

  page.status = "published";
  page.publishedVersionId = versionDoc._id;
  await page.save();
  return { page: toPageDTO(page), version: toVersionDTO(versionDoc) };
}

export async function unpublishUserPage(
  userId: string,
  id: string
): Promise<PageDTO | ServiceError> {
  if (!isValidObjectId(id)) return { status: 404, message: "Page not found." };
  await connectToDatabase();
  const page = await PageModel.findOne({ _id: id, userId });
  if (!page) return { status: 404, message: "Page not found." };
  page.status = "draft";
  page.publishedVersionId = undefined;
  await page.save();
  return toPageDTO(page);
}

export async function listPageVersions(
  userId: string,
  id: string
): Promise<{ versions: PageVersionDTO[] } | ServiceError> {
  if (!isValidObjectId(id)) return { status: 404, message: "Page not found." };
  await connectToDatabase();
  const owned = await PageModel.exists({ _id: id, userId });
  if (!owned) return { status: 404, message: "Page not found." };
  const docs = await PageVersionModel.find({ pageId: id })
    .sort({ version: -1 })
    .lean();
  return { versions: (docs as IPageVersion[]).map(toVersionDTO) };
}

export async function getPageVersion(
  userId: string,
  id: string,
  version: number
): Promise<{ version: PageVersionDTO } | ServiceError> {
  if (!isValidObjectId(id)) return { status: 404, message: "Page not found." };
  if (!Number.isInteger(version) || version < 1) {
    return { status: 404, message: "Version not found." };
  }
  await connectToDatabase();
  const owned = await PageModel.exists({ _id: id, userId });
  if (!owned) return { status: 404, message: "Page not found." };
  const doc = await PageVersionModel.findOne({ pageId: id, version }).lean();
  if (!doc) return { status: 404, message: "Version not found." };
  return { version: toVersionDTO(doc as IPageVersion) };
}

export async function recordPageSlugRedirect(
  pageId: unknown,
  oldSlug: string,
  newSlug: string
): Promise<void> {
  const from = normalizePageSlug(oldSlug);
  const to = normalizePageSlug(newSlug);
  if (!from || !to || from === to) return;
  if (validatePageSlug(from) !== null || validatePageSlug(to) !== null) return;
  await connectToDatabase();
  await PageSlugRedirectModel.deleteMany({ oldSlug: to });
  await PageSlugRedirectModel.updateMany({ newSlug: from }, { $set: { newSlug: to } });
  await PageSlugRedirectModel.updateOne(
    { oldSlug: from },
    { $set: { newSlug: to, pageId } },
    { upsert: true }
  );
}

/**
 * Follow slug renames to the current slug. Loop-safe: tracks visited slugs
 * and stops after a small number of hops. Returns null when there is no
 * redirect chain for the given slug.
 */
export async function resolvePageSlugRedirect(rawSlug: string): Promise<string | null> {
  let current = normalizePageSlug(rawSlug);
  if (!current) return null;
  const seen = new Set<string>([current]);
  await connectToDatabase();
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

export async function getPublishedPageBySlug(
  rawSlug: string
): Promise<PublishedPageDTO | null> {
  const slug = normalizePageSlug(rawSlug);
  if (validatePageSlug(slug) !== null) return null;
  await connectToDatabase();
  const page = await PageModel.findOne({ slug, status: "published" }).lean();
  if (!page) return null;
  const typed = page as IPage;
  if (!typed.publishedVersionId) return null;
  const version = await PageVersionModel.findById(typed.publishedVersionId).lean();
  if (!version) return null;
  const dto = toVersionDTO(version as IPageVersion);
  return {
    pageId: String(typed._id),
    slug: String(typed.slug ?? ""),
    title: dto.snapshot.title,
    theme: dto.snapshot.theme,
    blocks: dto.snapshot.blocks,
    version: dto.version,
    views: Number(typed.views ?? 0),
    updatedAt: typed.updatedAt
      ? new Date(typed.updatedAt).toISOString()
      : new Date().toISOString(),
  };
}

const CLICKABLE_PAGE_BLOCK_TYPES = new Set(["links", "social", "product", "contact"]);

const PAGE_TRACKING_SALT =
  process.env.IP_HASH_SALT ?? "default-dev-salt-change-in-prod";

export type PageTrackingInfo = {
  deviceType?: string;
  referrer?: string | null;
  userAgent?: string | null;
  ip?: string | null;
};

function isPageTrackingBot(userAgent?: string | null): boolean {
  if (!userAgent) return false;
  try {
    return detectBot(userAgent).isBot;
  } catch {
    return false;
  }
};

function hashPageVisitor(ip?: string | null, userAgent?: string | null): string | null {
  if (!ip || !userAgent) return null;
  return crypto
    .createHash("sha256")
    .update("pageview:" + ip + ":" + userAgent + ":" + PAGE_TRACKING_SALT)
    .digest("hex")
    .slice(0, 16);
};

function normalizeTrackingDevice(deviceType?: string): string {
  const value = (deviceType ?? "desktop").trim().toLowerCase();
  return value.length > 0 ? value : "desktop";
};

function normalizeTrackingReferrer(referrer?: string | null): string | null {
  if (!referrer) return null;
  const value = referrer.trim().slice(0, 500);
  return value.length > 0 ? value : null;
};

function safePageOrigin(origin: string): string | null {
  try {
    const url = new URL(origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
};

function snapshotBlockLabel(props: Record<string, unknown>): string {
  for (const key of ["title", "heading", "name", "label"]) {
    const value = props[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim().slice(0, 60);
    }
  }
  return "";
};

export async function recordPageView(
  pageId: string,
  slug: string,
  info: PageTrackingInfo = {}
): Promise<boolean> {
  if (!isValidObjectId(pageId)) return false;
  if (isPageTrackingBot(info.userAgent)) return false;
  try {
    await connectToDatabase();
    const published = await PageModel.exists({ _id: pageId, status: "published" });
    if (!published) return false;
    await Promise.all([
      PageViewModel.create({
        pageId,
        slug,
        deviceType: normalizeTrackingDevice(info.deviceType),
        referrer: normalizeTrackingReferrer(info.referrer),
        visitorHash: hashPageVisitor(info.ip, info.userAgent),
      }),
      PageModel.updateOne({ _id: pageId }, { $inc: { views: 1 } }),
    ]);
    return true;
  } catch (err) {
    console.error("[pages] record view:", err);
    return false;
  }
};

export async function recordPageClick(
  pageId: string,
  blockKey: string,
  info: PageTrackingInfo = {}
): Promise<true | false | ServiceError> {
  if (!isValidObjectId(pageId)) return { status: 404, message: "Page not found." };
  const key = (blockKey ?? "").trim().slice(0, 120);
  if (!key) return { status: 400, message: "A block key is required." };
  if (isPageTrackingBot(info.userAgent)) return false;
  try {
    await connectToDatabase();
    const page = await PageModel.findOne({ _id: pageId, status: "published" }).lean();
    if (!page || !(page as IPage).publishedVersionId) {
      return { status: 404, message: "Page not found." };
    }
    const typed = page as unknown as IPage;
    const version = await PageVersionModel.findById(typed.publishedVersionId).lean();
    if (!version) return { status: 404, message: "Page not found." };
    const snapshot = (version as unknown as IPageVersion).snapshot as unknown as {
      blocks?: {
        key?: unknown;
        type?: unknown;
        visible?: unknown;
        startsAt?: unknown;
        endsAt?: unknown;
      }[];
    };
    const target = Array.isArray(snapshot.blocks)
      ? snapshot.blocks.find((block) => String(block?.key ?? "") === key)
      : undefined;
    if (!target || !CLICKABLE_PAGE_BLOCK_TYPES.has(String(target.type ?? ""))) {
      return { status: 400, message: "This block does not accept clicks." };
    }
    if (target.visible === false || !isBlockLiveNow(target)) {
      return { status: 400, message: "This block is not currently available." };
    }
    await Promise.all([
      PageViewModel.create({
        pageId,
        slug: String(typed.slug ?? ""),
        clickedBlockKey: key,
        deviceType: normalizeTrackingDevice(info.deviceType),
        referrer: normalizeTrackingReferrer(info.referrer),
        visitorHash: hashPageVisitor(info.ip, info.userAgent),
      }),
      PageModel.updateOne({ _id: pageId }, { $inc: { clicks: 1 } }),
    ]);
    return true;
  } catch (err) {
    console.error("[pages] record click:", err);
    return false;
  }
};

export type PageTopBlock = {
  key: string;
  type: string;
  label: string;
  count: number;
};

export type PageAnalytics = {
  page: {
    id: string;
    title: string;
    slug: string;
    status: PageStatus;
    views: number;
    clicks: number;
    linkedShortCode?: string;
  };
  range: { days: number; since: string };
  totals: { views: number; clicks: number; uniqueVisitors: number };
  timeline: { date: string; count: number }[];
  clicksTimeline: { date: string; count: number }[];
  devices: { id: string; count: number }[];
  referrers: { id: string; count: number }[];
  topBlocks: PageTopBlock[];
};

export async function getPageAnalytics(
  userId: string,
  id: string,
  daysInput?: string
): Promise<PageAnalytics | ServiceError> {
  if (!isValidObjectId(id)) return { status: 404, message: "Page not found." };
  const parsed = parseInt(daysInput ?? "30", 10);
  const days = Math.min(90, Math.max(1, Number.isFinite(parsed) ? parsed : 30));
  await connectToDatabase();
  const page = await PageModel.findOne({ _id: id, userId }).lean();
  if (!page) return { status: 404, message: "Page not found." };
  const typed = page as unknown as IPage;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = (await PageViewModel.aggregate([
    { $match: { pageId: typed._id, viewedAt: { $gte: since } } },
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              views: { $sum: { $cond: [{ $eq: ["$clickedBlockKey", null] }, 1, 0] } },
              clicks: { $sum: { $cond: [{ $ne: ["$clickedBlockKey", null] }, 1, 0] } },
              visitors: { $addToSet: "$visitorHash" },
            },
          },
          { $project: { _id: 0, views: 1, clicks: 1, visitors: 1 } },
        ],
        clicksTimeline: [
          { $match: { clickedBlockKey: { $ne: null } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$viewedAt" } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
          { $project: { _id: 0, date: "$_id", count: 1 } },
        ],
        timeline: [
          { $match: { clickedBlockKey: null } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$viewedAt" } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
          { $project: { _id: 0, date: "$_id", count: 1 } },
        ],
        devices: [
          { $group: { _id: "$deviceType", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 6 },
          { $project: { _id: 0, id: "$_id", count: 1 } },
        ],
        referrers: [
          { $group: { _id: "$referrer", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 6 },
          { $project: { _id: 0, id: "$_id", count: 1 } },
        ],
        topBlocks: [
          { $match: { clickedBlockKey: { $ne: null } } },
          { $group: { _id: "$clickedBlockKey", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          { $project: { _id: 0, key: "$_id", count: 1 } },
        ],
      },
    },
  ])) as Array<Record<string, unknown>>;
  const agg = (rows[0] ?? {}) as Record<string, unknown>;
  const totalRow = (
    Array.isArray(agg.totals) ? (agg.totals as unknown[])[0] : undefined
  ) as { views?: unknown; clicks?: unknown; visitors?: unknown } | undefined;
  const rawVisitors: unknown = totalRow?.visitors;
  const uniqueVisitors = new Set(
    (Array.isArray(rawVisitors) ? rawVisitors : []).filter(
      (v): v is string => typeof v === "string" && v.length > 0
    )
  ).size;
  const meta = new Map<string, { type: string; label: string }>();
  try {
    if (typed.publishedVersionId) {
      const version = await PageVersionModel.findById(typed.publishedVersionId).lean();
      const snapshot = (version as unknown as IPageVersion | null)?.snapshot as unknown as
        | { blocks?: { key?: unknown; type?: unknown; props?: unknown }[] }
        | undefined;
      if (snapshot && Array.isArray(snapshot.blocks)) {
        for (const block of snapshot.blocks) {
          const blockKey = String(block?.key ?? "");
          if (!blockKey || meta.has(blockKey)) continue;
          const props =
            typeof block?.props === "object" && block?.props !== null
              ? (block.props as Record<string, unknown>)
              : {};
          meta.set(blockKey, {
            type: String(block?.type ?? ""),
            label: snapshotBlockLabel(props),
          });
        }
      }
    }
  } catch (err) {
    console.error("[pages] analytics snapshot:", err);
  }
  const rawBlocks: unknown = agg.topBlocks;
  const blockRows: { key?: unknown; count?: unknown }[] = Array.isArray(rawBlocks)
    ? (rawBlocks as { key?: unknown; count?: unknown }[])
    : [];
  const topBlocks: PageTopBlock[] = blockRows.map((row) => {
    const info = meta.get(String(row.key ?? ""));
    return {
      key: String(row.key ?? ""),
      type: info?.type ?? "",
      label: info?.label ?? "",
      count: Number(row.count ?? 0),
    };
  });
  const mapTimeline = (value: unknown) => {
    const list: { date?: unknown; count?: unknown }[] = Array.isArray(value)
      ? (value as { date?: unknown; count?: unknown }[])
      : [];
    return list.map((row) => ({
      date: String(row.date ?? ""),
      count: Number(row.count ?? 0),
    }));
  };
  const mapBreakdown = (value: unknown, fallback: string) => {
    const list: { id?: unknown; count?: unknown }[] = Array.isArray(value)
      ? (value as { id?: unknown; count?: unknown }[])
      : [];
    return list.map((row) => ({
      id: row.id ? String(row.id) : fallback,
      count: Number(row.count ?? 0),
    }));
  };
  return {
    page: {
      id: String(typed._id),
      title: String(typed.title ?? ""),
      slug: String(typed.slug ?? ""),
      status: typed.status === "published" ? "published" : "draft",
      views: Number(typed.views ?? 0),
      clicks: Number(typed.clicks ?? 0),
      linkedShortCode: typed.linkedShortCode ? String(typed.linkedShortCode) : undefined,
    },
    range: { days, since: since.toISOString() },
    totals: {
      views: Number(totalRow?.views ?? 0),
      clicks: Number(totalRow?.clicks ?? 0),
      uniqueVisitors,
    },
    timeline: mapTimeline(agg.timeline),
    clicksTimeline: mapTimeline(agg.clicksTimeline),
    devices: mapBreakdown(agg.devices, "unknown"),
    referrers: mapBreakdown(agg.referrers, "direct"),
    topBlocks,
  };
};

async function refreshPageShortLinkCache(shortCode: string): Promise<void> {
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
};

async function syncPageShortLinkDestination(page: IPage, origin: string): Promise<void> {
  const shortCode = page.linkedShortCode ? String(page.linkedShortCode) : "";
  const base = safePageOrigin(origin);
  if (!shortCode || !base) return;
  try {
    await connectToDatabase();
    await UrlModel.updateOne({ shortCode }, { $set: { url: base + "/p/" + page.slug } });
    await refreshPageShortLinkCache(shortCode);
  } catch (err) {
    console.error("[pages] short-link sync:", err);
  }
};

export async function ensurePageShortLink(
  userId: string,
  id: string,
  origin: string,
  input: { customSlug?: string; ip?: string } = {}
): Promise<{ page: PageDTO; shortCode: string; shortUrl: string } | ServiceError> {
  if (!isValidObjectId(id)) return { status: 404, message: "Page not found." };
  const base = safePageOrigin(origin);
  if (!base) return { status: 400, message: "Could not determine the public page URL." };
  const customSlug = (input.customSlug ?? "").trim();
  if (customSlug && !CUSTOM_SLUG_RE.test(customSlug)) {
    return { status: 400, message: "Custom alias must be 3-32 characters (letters, numbers, _ hyphen)." };
  }
  await connectToDatabase();
  const page = await PageModel.findOne({ _id: id, userId });
  if (!page) return { status: 404, message: "Page not found." };
  const destination = base + "/p/" + page.slug;
  if (page.linkedShortCode) {
    const existing = await UrlModel.findOne({ shortCode: page.linkedShortCode });
    if (existing) {
      if (existing.url !== destination) {
        existing.url = destination;
        await existing.save();
        await refreshPageShortLinkCache(page.linkedShortCode);
      }
      return { page: toPageDTO(page), shortCode: page.linkedShortCode, shortUrl: base + "/" + page.linkedShortCode };
    }
  }
  let createShortUrl: (
    url: string,
    customSlug: string | undefined,
    userId: string | null,
    ip: string,
    expiresAtIso?: string,
    utmParams?: UtmParamsInput,
    deviceCapture?: boolean
  ) => Promise<{ shortCode: string; originalUrl: string } | { status: number; message: string }>;
  try {
    createShortUrl = (await import("@/server/services/url")).createShortUrl;
  } catch (err) {
    console.error("[pages] short-link module:", err);
    return { status: 503, message: "Short-link service is unavailable. Try again later." };
  }
  let result;
  try {
    result = await createShortUrl(destination, customSlug || undefined, userId, input.ip ?? ("pages:" + userId));
  } catch (err) {
    console.error("[pages] short-link create:", err);
    return { status: 503, message: "Short-link service is unavailable. Try again later." };
  }
  if ("status" in result) return { status: result.status, message: result.message };
  page.linkedShortCode = result.shortCode;
  await page.save();
  return { page: toPageDTO(page), shortCode: result.shortCode, shortUrl: base + "/" + result.shortCode };
};

export async function removePageShortLink(
  userId: string,
  id: string
): Promise<{ page: PageDTO } | ServiceError> {
  if (!isValidObjectId(id)) return { status: 404, message: "Page not found." };
  await connectToDatabase();
  const page = await PageModel.findOne({ _id: id, userId });
  if (!page) return { status: 404, message: "Page not found." };
  page.linkedShortCode = undefined;
  await page.save();
  return { page: toPageDTO(page) };
};
