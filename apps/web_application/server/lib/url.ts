/** Shared constants for URL shortening logic */

export const CUSTOM_SLUG_RE = /^[a-zA-Z0-9_-]{3,32}$/;
export const URL_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type LinkDTO = {
  _id: string;
  shortCode: string;
  url: string;
  clicks: number;
  deviceCapture: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  __v?: number;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
};

/** Structural shape accepted by toDTO (mongoose doc or lean object). */
export interface UrlLike {
  _id: unknown;
  shortCode?: unknown;
  url?: unknown;
  clicks?: unknown;
  deviceCapture?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  expiresAt?: unknown;
  utm?: unknown;
  __v?: unknown;
}

function toUtm(value: unknown): LinkDTO["utm"] {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  const pick = (key: string): string | undefined => (typeof record[key] === "string" ? (record[key] as string) : undefined);
  return {
    source: pick("source"),
    medium: pick("medium"),
    campaign: pick("campaign"),
    term: pick("term"),
    content: pick("content"),
  };
}

function toIsoString(value: unknown): string | undefined {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" || typeof value === "number") {
    const time = new Date(value).getTime();
    if (Number.isFinite(time)) return new Date(value).toISOString();
  }
  return undefined;
}

export function toDTO(link: UrlLike): LinkDTO {
  return {
    _id: String(link._id),
    shortCode: String(link.shortCode ?? ""),
    url: String(link.url ?? ""),
    clicks: Number(link.clicks ?? 0),
    deviceCapture: link.deviceCapture === true,
    createdAt: toIsoString(link.createdAt) ?? new Date().toISOString(),
    updatedAt: toIsoString(link.updatedAt) ?? new Date().toISOString(),
    expiresAt: toIsoString(link.expiresAt),
    utm: toUtm(link.utm),
    __v: typeof link.__v === "number" ? link.__v : undefined,
  };
}

export type CreateResult =
  | { shortCode: string; originalUrl: string }
  | { status: number; message: string };

export type DeleteResult =
  | { message: string; id: string }
  | { status: number; message: string };

export type UpdateResult =
  | { message: string; link: LinkDTO }
  | { status: number; message: string };

