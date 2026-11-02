import type { IPage } from "@/server/models/page";
import type { PageTheme } from "@/server/lib/pages";
import type { PageBlockDTO, PageDTO, PageVersionDTO } from "./page.types";
import type { IPageVersion } from "@/server/models/pageVersion";

function toIsoOrNull(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  const time = value instanceof Date ? value.getTime() : Date.parse(String(value));
  if (!Number.isFinite(time)) return null;
  return new Date(time).toISOString();
}

function toBlockDTO(block: unknown): PageBlockDTO {
  const record = typeof block === "object" && block !== null ? (block as Record<string, unknown>) : {};
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
  const record = typeof theme === "object" && theme !== null ? (theme as Record<string, unknown>) : {};
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
    dto.buttonShape = shape;
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
    publishedVersionId: page.publishedVersionId ? String(page.publishedVersionId) : undefined,
    linkedShortCode: page.linkedShortCode ? String(page.linkedShortCode) : undefined,
    views: Number(page.views ?? 0),
    clicks: Number(page.clicks ?? 0),
    createdAt: page.createdAt ? new Date(page.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: page.updatedAt ? new Date(page.updatedAt).toISOString() : new Date().toISOString(),
  };
}

export function toVersionDTO(version: IPageVersion): PageVersionDTO {
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
    createdAt: version.createdAt ? new Date(version.createdAt).toISOString() : new Date().toISOString(),
  };
}

