export const SHORT_CODE_RE = /^[a-zA-Z0-9_-]{3,32}$/;

export function resolveSafeUrl(raw: string): string | null {
  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
} as const;

export const truncateUrl = (url: string, maxLength = 90) => {
  if (url.length <= maxLength) return url;

  const charsEachSide = Math.floor((maxLength - 3) / 2);

  return `${url.slice(0, charsEachSide)}...${url.slice(-charsEachSide)}`;
};