export type DeviceType =
  | "desktop"
  | "mobile"
  | "tablet"
  | "smarttv"
  | "console"
  | "wearable"
  | "embedded"
  | "unknown";

export type ReferrerType = "search" | "social" | "email" | "direct" | "other";

export interface GeoInfo {
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  isp: string | null;
  org: string | null;
  asNumber: string | null;
}

export const EMPTY_GEO: GeoInfo = {
  country: null,
  region: null,
  city: null,
  latitude: null,
  longitude: null,
  timezone: null,
  isp: null,
  org: null,
  asNumber: null,
};

export interface UtmParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
}

export interface RawClickCapture {
  browser: string | undefined;
  browserVersion: string | undefined;
  os: string | undefined;
  osVersion: string | undefined;
  deviceType: DeviceType;
  deviceVendor: string | undefined;
  deviceModel: string | undefined;
  isBot: boolean;
  botReason: string | null;
  inAppBrowser: string | null;

  language: string | null;
  languageList: string[];

  referrer: string | null;
  referrerDomain: string | null;
  referrerType: ReferrerType;

  utm: UtmParams;

  protocol: string;

  ipRaw: string | null;
  ipHash: string | null;
  visitorHash: string | null;

  geoFromHeaders: Partial<GeoInfo> | null;

  clickedAt: string;
}

export type EnrichedClickEvent = Omit<RawClickCapture, "ipRaw" | "geoFromHeaders"> & {
  geo: GeoInfo;
};
