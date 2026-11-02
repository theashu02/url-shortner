export const PAGE_SLUG_RE = /^[a-z0-9-]{3,50}$/;

export const PAGE_SLUG_MAX_LENGTH = 50;

export const RESERVED_PAGE_SLUGS: readonly string[] = [
  "api",
  "appv1",
  "auth",
  "create",
  "go",
  "link-error",
  "p",
];

export type PageBlockType =
  | "header"
  | "text"
  | "links"
  | "image"
  | "social"
  | "product"
  | "video"
  | "contact"
  | "spacer"
  | "divider";

export const PAGE_BLOCK_TYPES: PageBlockType[] = [
  "header",
  "text",
  "links",
  "image",
  "social",
  "product",
  "video",
  "contact",
  "spacer",
  "divider",
];

export type PageGoal =
  | "grow-audience"
  | "drive-sales"
  | "share-content"
  | "collect-contacts";

export const PAGE_GOALS: PageGoal[] = [
  "grow-audience",
  "drive-sales",
  "share-content",
  "collect-contacts",
];

export const PAGE_GOAL_LABELS: Record<PageGoal, string> = {
  "grow-audience": "Grow an audience",
  "drive-sales": "Drive sales",
  "share-content": "Share content",
  "collect-contacts": "Collect contacts",
};

export function isPageGoal(value: unknown): value is PageGoal {
  return (
    typeof value === "string" &&
    (PAGE_GOALS as string[]).includes(value)
  );
}

export function validatePageGoal(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (!isPageGoal(value)) {
    return `goal must be one of: ${PAGE_GOALS.join(", ")}.`;
  }
  return null;
}

export type PageStatus = "draft" | "published";

export const PAGE_STATUSES: PageStatus[] = ["draft", "published"];

export const MAX_PAGE_BLOCKS = 30;
export const MAX_BLOCK_ITEMS = 20;

export type PageButtonShape = "rounded" | "pill" | "square";

export const PAGE_BUTTON_SHAPES: PageButtonShape[] = [
  "rounded",
  "pill",
  "square",
];

export function isPageButtonShape(value: unknown): value is PageButtonShape {
  return (
    typeof value === "string" &&
    (PAGE_BUTTON_SHAPES as string[]).includes(value)
  );
}

export interface PageTheme {
  header: string;
  card: string;
  accent: string;
  dark: boolean;
  description?: string;
  avatarUrl?: string;
  buttonShape?: PageButtonShape;
}

export interface PageLinkItem {
  label: string;
  url: string;
  shortCode?: string;
}

export const PAGE_ITEM_SHORT_CODE_RE = /^[A-Za-z0-9-]{3,50}$/;

export interface SocialLinkItem {
  network: string;
  url: string;
}

export interface ProductItem {
  name: string;
  url: string;
  price?: string;
  imageUrl?: string;
}

export interface PageBlockInput {
  key: string;
  type: string;
  position: number;
  visible?: boolean;
  pinned?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  props?: Record<string, unknown> | null;
}

export const SCHEDULABLE_BLOCK_TYPES: PageBlockType[] = [
  "links",
  "video",
  "image",
  "product",
];

export const PINNABLE_BLOCK_TYPES: PageBlockType[] = [
  "links",
  "video",
  "image",
  "product",
  "contact",
];

export function normalizePageSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, PAGE_SLUG_MAX_LENGTH);
}

export function isReservedPageSlug(slug: string): boolean {
  return RESERVED_PAGE_SLUGS.includes(slug.toLowerCase());
}

export function validatePageSlug(slug: string): string | null {
  if (!slug || slug.trim().length === 0) return "Slug is required.";
  if (!PAGE_SLUG_RE.test(slug)) {
    return "Slug must be 3-50 characters (lowercase letters, numbers, hyphens only).";
  }
  if (isReservedPageSlug(slug)) {
    return "This slug is reserved. Please choose another.";
  }
  return null;
}

export function isPageBlockType(value: string): value is PageBlockType {
  return (PAGE_BLOCK_TYPES as string[]).includes(value);
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function isNonEmptyString(value: unknown, max: number): boolean {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= max
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isOptionalString(value: unknown, max: number): boolean {
  return (
    value === undefined ||
    (typeof value === "string" && value.length <= max)
  );
}

function isHttpUrl(value: unknown): boolean {
  return typeof value === "string" && /^https?:\/\/\S+$/i.test(value);
}

const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{11}$/;

export function extractYouTubeId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (YOUTUBE_ID_RE.test(value)) return value;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0] ?? "";
    return YOUTUBE_ID_RE.test(id) ? id : null;
  }
  if (host === "youtube.com" || host === "m.youtube.com") {
    const path = url.pathname;
    if (path === "/watch") {
      const id = url.searchParams.get("v") ?? "";
      return YOUTUBE_ID_RE.test(id) ? id : null;
    }
    for (const prefix of ["/embed/", "/shorts/", "/live/"]) {
      if (path.startsWith(prefix)) {
        const id = path.slice(prefix.length).split("/")[0] ?? "";
        return YOUTUBE_ID_RE.test(id) ? id : null;
      }
    }
  }
  if (host === "youtube-nocookie.com") {
    const match = url.pathname.match(/^\/embed\/([^/]+)/);
    const id = match?.[1] ?? "";
    return YOUTUBE_ID_RE.test(id) ? id : null;
  }
  return null;
}

export function parseBlockDate(value: unknown): Date | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return null;
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return null;
  return new Date(time);
}

export function validateBlockSchedule(
  record: Record<string, unknown>,
  label: string
): string[] {
  const errors: string[] = [];
  const startsAt = record["startsAt"];
  const endsAt = record["endsAt"];
  let start: Date | null = null;
  let end: Date | null = null;
  if (startsAt !== undefined && startsAt !== null && startsAt !== "") {
    start = parseBlockDate(startsAt);
    if (!start) errors.push(`${label}.startsAt must be a valid date/time.`);
  }
  if (endsAt !== undefined && endsAt !== null && endsAt !== "") {
    end = parseBlockDate(endsAt);
    if (!end) errors.push(`${label}.endsAt must be a valid date/time.`);
  }
  if (start && end && end.getTime() <= start.getTime()) {
    errors.push(`${label}.endsAt must be after startsAt.`);
  }
  return errors;
}

/**
 * Prefill the first link-like block with the destination URL the user
 * entered in the creation wizard. Returns a new array; input is untouched.
 */
export function applyInitialPageUrl<T extends PageBlockInput>(
  blocks: T[],
  rawUrl: unknown
): T[] {
  if (typeof rawUrl !== "string" || !isHttpUrl(rawUrl)) return blocks;
  const url = rawUrl.trim();
  // Prefer the most link-like home for the URL: a links list first, then
  // product/video blocks, and only then a social row.
  const priority: PageBlockType[] = ["links", "product", "video", "social"];
  for (const type of priority) {
    const index = blocks.findIndex((block) => block.type === type);
    if (index === -1) continue;
    const block = blocks[index] as T;
    if (type === "video") {
      return blocks.map((entry, i) =>
        i === index
          ? ({ ...entry, props: { ...((entry as T).props ?? {}), url } } as T)
          : entry
      );
    }
    const props = { ...((block as T).props ?? {}) };
    const items = Array.isArray(props["items"]) ? [...(props["items"] as unknown[])] : [];
    const first = items[0];
    if (!first || typeof first !== "object" || Array.isArray(first)) continue;
    items[0] = { ...(first as Record<string, unknown>), url };
    return blocks.map((entry, i) =>
      i === index ? ({ ...entry, props: { ...props, items } } as T) : entry
    );
  }
  return blocks;
}

/**
 * Server-side schedule evaluation. The public renderer hides blocks outside
 * their [startsAt, endsAt) window. `visible: false` is checked separately.
 */
export function isBlockLiveNow(
  block: { startsAt?: unknown; endsAt?: unknown },
  now: Date = new Date()
): boolean {
  const start = parseBlockDate(block.startsAt);
  const end = parseBlockDate(block.endsAt);
  const time = now.getTime();
  if (start && time < start.getTime()) return false;
  if (end && time >= end.getTime()) return false;
  return true;
}

function isImageSrc(value: unknown): boolean {
  return (
    typeof value === "string" &&
    (value.startsWith("/") || /^https?:\/\/\S+$/i.test(value))
  );
}

function isBoundedList(value: unknown): value is unknown[] {
  return (
    Array.isArray(value) && value.length > 0 && value.length <= MAX_BLOCK_ITEMS
  );
}

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

export function validatePageTheme(theme: unknown): string[] {
  const errors: string[] = [];
  const record = asRecord(theme);
  for (const field of ["header", "card", "accent"] as const) {
    const value = record[field];
    if (typeof value !== "string" || !HEX_COLOR_RE.test(value)) {
      errors.push(`theme.${field} must be a hex color like #EA580C.`);
    }
  }
  if (typeof record["dark"] !== "boolean") {
    errors.push("theme.dark must be a boolean.");
  }
  const description = record["description"];
  if (
    description !== undefined &&
    description !== "" &&
    (typeof description !== "string" || description.length > 200)
  ) {
    errors.push("theme.description must be at most 200 characters.");
  }
  const avatarUrl = record["avatarUrl"];
  if (
    avatarUrl !== undefined &&
    avatarUrl !== "" &&
    !isImageSrc(avatarUrl)
  ) {
    errors.push("theme.avatarUrl must be an https URL or site path.");
  }
  const buttonShape = record["buttonShape"];
  if (
    buttonShape !== undefined &&
    buttonShape !== "" &&
    !isPageButtonShape(buttonShape)
  ) {
    errors.push(`theme.buttonShape must be one of: ${PAGE_BUTTON_SHAPES.join(", ")}.`);
  }
  return errors;
}

export interface PageDraftLike {
  title?: unknown;
  theme?: unknown;
  blocks?: unknown;
}

export interface PageSnapshotLike {
  title?: unknown;
  theme?: unknown;
  blocks?: unknown;
}

function normalizeThemeForCompare(theme: unknown): Record<string, unknown> {
  const record = asRecord(theme);
  const out: Record<string, unknown> = {};
  for (const key of [
    "header",
    "card",
    "accent",
    "dark",
    "description",
    "avatarUrl",
    "buttonShape",
  ]) {
    const value = record[key];
    if (typeof value === "string" ? value.length > 0 : value !== undefined) {
      out[key] = value;
    }
  }
  return out;
}

/**
 * True when the saved draft matches the published snapshot (no unpublished
 * changes). Compares title, theme and the ordered block list.
 */
export function pageDraftMatchesSnapshot(
  draft: PageDraftLike,
  snapshot: PageSnapshotLike
): boolean {
  const draftTitle = typeof draft.title === "string" ? draft.title : "";
  const snapshotTitle =
    typeof snapshot.title === "string" ? snapshot.title : "";
  if (draftTitle !== snapshotTitle) return false;
  if (
    JSON.stringify(normalizeThemeForCompare(draft.theme)) !==
    JSON.stringify(normalizeThemeForCompare(snapshot.theme))
  ) {
    return false;
  }
  const normBlocks = (blocks: unknown) =>
    (Array.isArray(blocks) ? blocks : []).map((entry) => {
      const record = asRecord(entry);
      return {
        key: record["key"],
        type: record["type"],
        position: record["position"],
        visible: record["visible"] ?? true,
        pinned: record["pinned"] ?? false,
        startsAt: record["startsAt"] ?? null,
        endsAt: record["endsAt"] ?? null,
        props: record["props"] ?? {},
      };
    });
  return (
    JSON.stringify(normBlocks(draft.blocks)) ===
    JSON.stringify(normBlocks(snapshot.blocks))
  );
}

export function validatePageBlocks(blocks: unknown): string[] {
  if (!Array.isArray(blocks)) return ["blocks must be an array."];
  if (blocks.length > MAX_PAGE_BLOCKS) {
    return [`pages support up to ${MAX_PAGE_BLOCKS} blocks.`];
  }
  const errors: string[] = [];
  const seen = new Set<string>();
  blocks.forEach((entry, index) => {
    const label = `blocks[${index}]`;
    const record = asRecord(entry);
    const key = record["key"];
    if (typeof key !== "string" || key.trim().length === 0 || key.length > 64) {
      errors.push(`${label}.key must be 1-64 characters.`);
    } else if (seen.has(key)) {
      errors.push(`${label}.key "${key}" is duplicated.`);
    } else {
      seen.add(key);
    }
    const type = record["type"];
    if (typeof type !== "string" || !isPageBlockType(type)) {
      errors.push(
        `${label}.type must be one of: ${PAGE_BLOCK_TYPES.join(", ")}.`
      );
      return;
    }
    const position = record["position"];
    if (
      typeof position !== "number" ||
      !Number.isInteger(position) ||
      position < 0
    ) {
      errors.push(`${label}.position must be an integer >= 0.`);
    }
    if (
      record["visible"] !== undefined &&
      typeof record["visible"] !== "boolean"
    ) {
      errors.push(`${label}.visible must be a boolean.`);
    }
    if (
      record["pinned"] !== undefined &&
      typeof record["pinned"] !== "boolean"
    ) {
      errors.push(`${label}.pinned must be a boolean.`);
    }
    if (
      record["pinned"] === true &&
      !(PINNABLE_BLOCK_TYPES as string[]).includes(type)
    ) {
      errors.push(
        `${label}.pinned is only supported for: ${PINNABLE_BLOCK_TYPES.join(", ")}.`
      );
    }
    if ((SCHEDULABLE_BLOCK_TYPES as string[]).includes(type)) {
      errors.push(...validateBlockSchedule(record, label));
    } else if (
      (record["startsAt"] !== undefined &&
        record["startsAt"] !== null &&
        record["startsAt"] !== "") ||
      (record["endsAt"] !== undefined &&
        record["endsAt"] !== null &&
        record["endsAt"] !== "")
    ) {
      errors.push(
        `${label} schedule is only supported for: ${SCHEDULABLE_BLOCK_TYPES.join(", ")}.`
      );
    }
    errors.push(...validateBlockProps(type, record["props"], label));
  });
  return errors;
}

function validateBlockProps(
  type: PageBlockType,
  props: unknown,
  label: string
): string[] {
  const record = asRecord(props);
  switch (type) {
    case "header": {
      const errors: string[] = [];
      if (!isNonEmptyString(record["title"], 120)) {
        errors.push(`${label}.props.title is required (max 120 characters).`);
      }
      if (!isOptionalString(record["subtitle"], 160)) {
        errors.push(`${label}.props.subtitle must be at most 160 characters.`);
      }
      if (
        record["avatarUrl"] !== undefined &&
        !isImageSrc(record["avatarUrl"])
      ) {
        errors.push(
          `${label}.props.avatarUrl must be an https URL or site path.`
        );
      }
      return errors;
    }
    case "text": {
      const errors: string[] = [];
      if (!isNonEmptyString(record["body"], 2000)) {
        errors.push(`${label}.props.body is required (max 2000 characters).`);
      }
      if (!isOptionalString(record["heading"], 120)) {
        errors.push(`${label}.props.heading must be at most 120 characters.`);
      }
      return errors;
    }
    case "links": {
      if (!isBoundedList(record["items"])) {
        return [
          `${label}.props.items must list 1-${MAX_BLOCK_ITEMS} links.`,
        ];
      }
      const errors: string[] = [];
      record["items"].forEach((item, itemIndex) => {
        const itemRecord = asRecord(item);
        if (!isNonEmptyString(itemRecord["label"], 80)) {
          errors.push(
            `${label}.props.items[${itemIndex}].label is required (max 80 characters).`
          );
        }
        if (!isHttpUrl(itemRecord["url"])) {
          errors.push(
            `${label}.props.items[${itemIndex}].url must start with http:// or https://.`
          );
        }
        const shortCode = itemRecord["shortCode"];
        if (
          shortCode !== undefined &&
          shortCode !== "" &&
          (typeof shortCode !== "string" || !PAGE_ITEM_SHORT_CODE_RE.test(shortCode))
        ) {
          errors.push(
            `${label}.props.items[${itemIndex}].shortCode must be 3-50 characters (letters, numbers, hyphens only).`
          );
        }
      });
      return errors;
    }
    case "image": {
      const errors: string[] = [];
      if (!isImageSrc(record["src"])) {
        errors.push(
          `${label}.props.src must be an https URL or site path.`
        );
      }
      if (!isOptionalString(record["alt"], 160)) {
        errors.push(`${label}.props.alt must be at most 160 characters.`);
      }
      if (!isOptionalString(record["caption"], 200)) {
        errors.push(`${label}.props.caption must be at most 200 characters.`);
      }
      return errors;
    }
    case "social": {
      if (!isBoundedList(record["items"])) {
        return [
          `${label}.props.items must list 1-${MAX_BLOCK_ITEMS} social links.`,
        ];
      }
      const errors: string[] = [];
      record["items"].forEach((item, itemIndex) => {
        const itemRecord = asRecord(item);
        if (!isNonEmptyString(itemRecord["network"], 40)) {
          errors.push(
            `${label}.props.items[${itemIndex}].network is required (max 40 characters).`
          );
        }
        if (!isHttpUrl(itemRecord["url"])) {
          errors.push(
            `${label}.props.items[${itemIndex}].url must start with http:// or https://.`
          );
        }
      });
      return errors;
    }
    case "product": {
      if (!isBoundedList(record["items"])) {
        return [
          `${label}.props.items must list 1-${MAX_BLOCK_ITEMS} products.`,
        ];
      }
      const errors: string[] = [];
      record["items"].forEach((item, itemIndex) => {
        const itemRecord = asRecord(item);
        if (!isNonEmptyString(itemRecord["name"], 120)) {
          errors.push(
            `${label}.props.items[${itemIndex}].name is required (max 120 characters).`
          );
        }
        if (!isHttpUrl(itemRecord["url"])) {
          errors.push(
            `${label}.props.items[${itemIndex}].url must start with http:// or https://.`
          );
        }
        if (!isOptionalString(itemRecord["price"], 40)) {
          errors.push(
            `${label}.props.items[${itemIndex}].price must be at most 40 characters.`
          );
        }
        if (
          itemRecord["imageUrl"] !== undefined &&
          !isImageSrc(itemRecord["imageUrl"])
        ) {
          errors.push(
            `${label}.props.items[${itemIndex}].imageUrl must be an https URL or site path.`
          );
        }
      });
      return errors;
    }
    case "video": {
      const errors: string[] = [];
      if (!isHttpUrl(record["url"])) {
        errors.push(`${label}.props.url must start with http:// or https://.`);
      } else if (!extractYouTubeId(record["url"])) {
        errors.push(`${label}.props.url must be a valid YouTube video URL.`);
      }
      if (!isOptionalString(record["title"], 120)) {
        errors.push(`${label}.props.title must be at most 120 characters.`);
      }
      return errors;
    }
    case "contact": {
      const errors: string[] = [];
      if (!isNonEmptyString(record["name"], 120)) {
        errors.push(`${label}.props.name is required (max 120 characters).`);
      }
      if (!isOptionalString(record["title"], 120)) {
        errors.push(`${label}.props.title must be at most 120 characters.`);
      }
      if (!isOptionalString(record["company"], 120)) {
        errors.push(`${label}.props.company must be at most 120 characters.`);
      }
      const email = record["email"];
      if (email !== undefined && email !== "" && (typeof email !== "string" || !EMAIL_RE.test(email.trim()) || email.length > 160)) {
        errors.push(`${label}.props.email must be a valid email address.`);
      }
      if (!isOptionalString(record["phone"], 40)) {
        errors.push(`${label}.props.phone must be at most 40 characters.`);
      }
      if (record["website"] !== undefined && record["website"] !== "" && !isHttpUrl(record["website"])) {
        errors.push(`${label}.props.website must start with http:// or https://.`);
      }
      if (!isOptionalString(record["buttonLabel"], 40)) {
        errors.push(`${label}.props.buttonLabel must be at most 40 characters.`);
      }
      return errors;
    }
    case "spacer": {
      const errors: string[] = [];
      const height = record["height"];
      if (height !== undefined && (typeof height !== "number" || !Number.isInteger(height) || height < 8 || height > 160)) {
        errors.push(`${label}.props.height must be an integer between 8 and 160.`);
      }
      return errors;
    }
    case "divider": {
      const errors: string[] = [];
      const style = record["style"];
      if (style !== undefined && style !== "line" && style !== "dots") {
        errors.push(`${label}.props.style must be "line" or "dots".`);
      }
      return errors;
    }
  }
}
