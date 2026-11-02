import { api } from "@/lib/eden";
import {
  AVATAR_UPLOAD_MAX_BYTES,
  AVATAR_UPLOAD_MIME,
  isAvatarSrc,
} from "@/server/lib/pageAvatar";

export function validateAvatarFile(file: File): string | null {
  const allowed = AVATAR_UPLOAD_MIME as readonly string[];
  if (!allowed.includes(file.type)) return "Upload a JPEG, PNG or WebP image.";
  if (file.size <= 0) return "That file looks empty. Pick another image.";
  if (file.size > AVATAR_UPLOAD_MAX_BYTES) return "Image must be 3MB or smaller.";
  return null;
}

export function validateAvatarLink(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (!isAvatarSrc(trimmed)) return "Paste an https image URL or a /site-path.";
  return null;
}

function treatyErrorMessage(res: { error?: unknown }): string | null {
  const error = res.error;
  if (error && typeof error === "object" && "value" in error) {
    const value = (error as { value?: unknown }).value;
    if (value && typeof value === "object" && "message" in value) {
      const message = (value as { message?: unknown }).message;
      if (typeof message === "string" && message.length > 0) return message;
    }
  }
  return null;
}

export async function uploadAvatar(file: File): Promise<string> {
  const invalid = validateAvatarFile(file);
  if (invalid) throw new Error(invalid);
  const res = await api.pages["upload-avatar"].post({ avatar: file });
  if (res.data && "url" in res.data) {
    const url = (res.data as { url?: unknown }).url;
    if (typeof url === "string" && isAvatarSrc(url)) return url.trim();
    throw new Error("Upload returned a bad URL.");
  }
  throw new Error(treatyErrorMessage(res) ?? "Image upload failed. Try again.");
}
