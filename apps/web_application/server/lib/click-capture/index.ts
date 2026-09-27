export { captureVisitor, type CaptureConfig } from "./capture-visitor";
export { IpApiGeoProvider, CachedGeoProvider, type GeoProvider } from "./geo-service";
export { detectBot, detectInAppBrowser } from "./bot-detection";
export { getClientIp, type IpResolverConfig } from "./ip";
export type {
  RawClickCapture,
  EnrichedClickEvent,
  GeoInfo,
  UtmParams,
  DeviceType,
  ReferrerType,
} from "./types";
export { EMPTY_GEO } from "./types";
