interface AvatarBlockLike { type?: unknown; props?: unknown; }

export const AVATAR_MAX_LENGTH = 500;
export const AVATAR_UPLOAD_MAX_BYTES = 3 * 1024 * 1024;
export const AVATAR_UPLOAD_MIME = ["image/jpeg", "image/png", "image/webp"] as const;

export function isAvatarSrc(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const v = value.trim();
  if (v.length === 0 || v.length > AVATAR_MAX_LENGTH) return false;
  if (v === "/") return false;
  return v.startsWith("/") || /^https?:\/\/\S+$/i.test(v);
}

function headerAvatar(blocks: AvatarBlockLike[] | undefined): string {
  if (!Array.isArray(blocks)) return "";
  for (const block of blocks) {
    if (block?.type !== "header") continue;
    const props = (block.props ?? {}) as Record<string, unknown>;
    const candidate = props["avatarUrl"];
    if (isAvatarSrc(candidate)) return (candidate as string).trim();
  }
  return "";
}

export function resolveDisplayAvatar(
  theme: unknown,
  blocks?: AvatarBlockLike[]
): string {
  const themed =
    typeof theme === "object" && theme !== null
      ? (theme as Record<string, unknown>)["avatarUrl"]
      : undefined;
  if (isAvatarSrc(themed)) return (themed as string).trim();
  return headerAvatar(blocks);
}

export function normalizeAvatarUrl(value: unknown): string {
  return isAvatarSrc(value) ? (value as string).trim().slice(0, AVATAR_MAX_LENGTH) : "";
}
