/* eslint-disable @typescript-eslint/no-explicit-any */
/** Shared constants for URL shortening logic */

export const CUSTOM_SLUG_RE = /^[a-zA-Z0-9-]{3,50}$/;
export const URL_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type LinkDTO = {
  _id: string;
  shortCode: string;
  url: string;
  clicks: number;
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

export function toDTO(link: any): LinkDTO {
  return {
    _id: String(link._id),
    shortCode: String(link.shortCode ?? ""),
    url: String(link.url ?? ""),
    clicks: Number(link.clicks ?? 0),
    createdAt: link.createdAt ? new Date(link.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: link.updatedAt ? new Date(link.updatedAt).toISOString() : new Date().toISOString(),
    expiresAt: link.expiresAt ? new Date(link.expiresAt).toISOString() : undefined,
    utm: link.utm ? { ...link.utm } : undefined,
    __v: link.__v as number | undefined,
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