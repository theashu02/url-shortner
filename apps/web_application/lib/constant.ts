export const SHORT_CODE_RE = /^[a-zA-Z0-9_-]{3,32}$/;

export const REFRESH_THROTTLE_MS = process.env.REFRESH_THROTTLE as unknown as number || 3000;

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

export const urlRegex =
  /^(https?:\/\/)?((([a-zA-Z\d]([a-zA-Z\d-]*[a-zA-Z\d])*)\.)+[a-zA-Z]{2,}|localhost|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[-a-zA-Z\d%_.~+]*)*(\?[;&a-zA-Z\d%_.~+=-]*)?(#[-a-zA-Z\d_]*)?$/i;

const FORWARDED_HOST_RE = /^[a-zA-Z0-9.-]+(?::\d{1,5})?$/;

function firstHeaderValue(value: string | null): string {
  return value?.split(",")[0]?.trim() ?? "";
}

function parseRfc7239(value: string): { host: string; proto: string } {
  let host = "";
  let proto = "";
  for (const part of value.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim().toLowerCase();
    const val = part.slice(eq + 1).trim().replace(/^"|"$/g, "");
    if (key === "host" && !host) host = val;
    else if (key === "proto" && !proto) proto = val.toLowerCase();
  }
  return { host, proto };
}

function isHttpProto(value: string): boolean {
  return value === "http" || value === "https";
}

/**
 * Public base URL for the incoming request, proxy-aware.
 *
 * Prefers validated forwarded-host headers (ngrok, nginx, ...) so redirects
 * stay on the public URL when the Host header points at an internal upstream.
 * Falls back to Host, then to the framework-provided origin.
 */
export function getRequestBaseUrl(
  headers: Headers,
  fallbackOrigin: string,
): string {
  let fallbackHost = "";
  let fallbackProto = "https";
  try {
    const parsed = new URL(fallbackOrigin);
    fallbackHost = parsed.host;
    fallbackProto = parsed.protocol.replace(":", "") || "https";
  } catch {
    // Invalid fallback — headers only.
  }

  const forwarded = parseRfc7239(firstHeaderValue(headers.get("forwarded")));

  const host =
    [
      firstHeaderValue(headers.get("x-forwarded-host")),
      forwarded.host,
      firstHeaderValue(headers.get("x-original-host")),
      firstHeaderValue(headers.get("host")),
      fallbackHost,
    ].find((candidate) => FORWARDED_HOST_RE.test(candidate)) ?? "";

  const forwardedProto = firstHeaderValue(
    headers.get("x-forwarded-proto"),
  ).toLowerCase();
  const proto =
    [forwardedProto, forwarded.proto].find(isHttpProto) ?? fallbackProto;

  if (!host) return fallbackOrigin;
  return `${proto}://${host}`;
}

export function displayUrl(url: string) {
  return url.replace(/^https?:\/\//, "");
}