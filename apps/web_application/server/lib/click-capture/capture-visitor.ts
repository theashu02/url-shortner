import { UAParser } from "ua-parser-js";
import { parse as parseLanguage } from "accept-language-parser";
import crypto from "crypto";
import { getClientIp, type IpResolverConfig } from "./ip";
import { detectBot, detectInAppBrowser } from "./bot-detection";
import type {
  RawClickCapture,
  UtmParams,
  ReferrerType,
  DeviceType,
} from "./types";

const SEARCH_ENGINES =
  /google\.|bing\.|yahoo\.|duckduckgo\.|baidu\.|yandex\.|ecosia\.|ask\./i;
const SOCIAL_NETWORKS =
  /facebook\.|twitter\.|x\.com|instagram\.|linkedin\.|reddit\.|pinterest\.|tiktok\.|snapchat\.|youtube\.|t\.co\//i;
const EMAIL_PROVIDERS =
  /mail\.|outlook\.|gmail\.|mailchimp\.|sendgrid\./i;

export interface CaptureConfig {
  ip: IpResolverConfig;
  hashSalt: string;
}

export function captureVisitor(
  headers: Headers,
  requestUrl: URL,
  destinationUrl: string | undefined,
  config: CaptureConfig,
): RawClickCapture {
  const ua = headers.get("user-agent") ?? "";
  const parser = new UAParser(ua);
  const result = parser.getResult();

  const { isBot, reason: botReason } = detectBot(ua);
  const inAppBrowser = detectInAppBrowser(ua);
  const deviceType =
    (result.device.type as DeviceType | undefined) ?? "desktop";
  
  const acceptLang = headers.get("accept-language") ?? "";
  const languages = parseLanguage(acceptLang);
  const language =
    languages.length > 0
      ? `${languages[0].code}${languages[0].region ? `-${languages[0].region}` : ""}`
      : null;
  const languageList = languages.map(
    (l) => `${l.code}${l.region ? `-${l.region}` : ""}`,
  );

  const referrer = headers.get("referer") || headers.get("referrer") || null;
  const referrerDomain = extractDomain(referrer);
  const referrerType = classifyReferrer(referrer, referrerDomain);

  const utm = extractUtm(requestUrl, destinationUrl);

  const ip = getClientIp(headers, config.ip);
  const protocol =
    headers.get("x-forwarded-proto") ?? requestUrl.protocol.replace(":", "");

  const ipHash = ip ? hash(`ip:${ip}:${config.hashSalt}`) : null;
  const visitorHash =
    ip && ua
      ? hash(`visitor:${ip}:${ua}:${config.hashSalt}`).slice(0, 16)
      : null;

  const geoFromHeaders = extractCdnGeoHeaders(headers);

  return {
    browser: result.browser.name,
    browserVersion: result.browser.version,
    os: result.os.name,
    osVersion: result.os.version,
    deviceType,
    deviceVendor: result.device.vendor,
    deviceModel: result.device.model,
    isBot,
    botReason,
    inAppBrowser,
    language,
    languageList,
    referrer,
    referrerDomain,
    referrerType,
    utm,
    protocol,
    ipRaw: ip, // internal only — stripped before storage
    ipHash,
    visitorHash,
    geoFromHeaders,
    clickedAt: new Date().toISOString(),
  };
}

function extractCdnGeoHeaders(headers: Headers): Partial<import("./types").GeoInfo> | null {
  // Vercel headers
  const vercelCountry = headers.get("x-vercel-ip-country");
  if (vercelCountry) {
    return {
      country: vercelCountry,
      region: headers.get("x-vercel-ip-country-region") ?? null,
      city: headers.get("x-vercel-ip-city") ? decodeURIComponent(headers.get("x-vercel-ip-city")!) : null,
      latitude: headers.get("x-vercel-ip-latitude") ? parseFloat(headers.get("x-vercel-ip-latitude")!) : null,
      longitude: headers.get("x-vercel-ip-longitude") ? parseFloat(headers.get("x-vercel-ip-longitude")!) : null,
      timezone: headers.get("x-vercel-ip-timezone") ?? null,
    };
  }

  const cfCountry = headers.get("cf-ipcountry");
  if (cfCountry && cfCountry !== "XX") {
    return {
      country: cfCountry,
      city: headers.get("cf-ipcity") ?? null,
      latitude: headers.get("cf-iplatitude") ? parseFloat(headers.get("cf-iplatitude")!) : null,
      longitude: headers.get("cf-iplongitude") ? parseFloat(headers.get("cf-iplongitude")!) : null,
    };
  }

  return null;
}

function extractUtm(
  requestUrl: URL,
  destinationUrl?: string,
): UtmParams {
  let destParams: URLSearchParams | null = null;
  if (destinationUrl) {
    try {
      destParams = new URL(destinationUrl).searchParams;
    } catch {
      /* invalid destination URL — skip */
    }
  }

  const get = (key: string): string | null => {
    const value =
      requestUrl.searchParams.get(key) ?? destParams?.get(key) ?? null;
    return value ? sanitizeUtmValue(value) : null;
  };

  return {
    utm_source: get("utm_source"),
    utm_medium: get("utm_medium"),
    utm_campaign: get("utm_campaign"),
    utm_term: get("utm_term"),
    utm_content: get("utm_content"),
  };
}

function sanitizeUtmValue(value: string): string {
  return value.replace(/[\x00-\x1F\x7F]/g, "").slice(0, 100);
}

function extractDomain(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname;
  } catch {
    return null;
  }
}

function classifyReferrer(
  referrer: string | null,
  domain: string | null,
): ReferrerType {
  if (!referrer || !domain) return "direct";
  if (SEARCH_ENGINES.test(domain)) return "search";
  if (SOCIAL_NETWORKS.test(domain)) return "social";
  if (EMAIL_PROVIDERS.test(domain)) return "email";
  return "other";
}

function hash(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}
