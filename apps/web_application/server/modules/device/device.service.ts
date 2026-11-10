import {
  captureVisitor,
  EMPTY_GEO,
  getClientIp,
  buildClickEventDoc,
  type GeoInfo,
} from "@/server/lib/click-capture";
import type { DeviceDetails } from "@/lib/device-info";
import type { IRateLimiter } from "@/server/core/rate-limit";
import { getIpConfig } from "@/server/core/request-guard";
import type { IDeviceClickRepository } from "./device.repository";
import type { IGeoProvider } from "./geo";

export interface CaptureConfig {
  ip: { behindCloudflare: boolean; trustedProxyCount: number };
  hashSalt: string;
}

export class DeviceService {
  constructor(
    private readonly clicks: IDeviceClickRepository,
    private readonly limiter: IRateLimiter,
    private readonly geo: IGeoProvider,
  ) {}

  getCaptureConfig(): CaptureConfig {
    return {
      ip: getIpConfig(),
      hashSalt: process.env.IP_HASH_SALT ?? "default-dev-salt-change-in-prod",
    };
  }

  getRequestIp(headers: Headers): string | null {
    return getClientIp(headers, this.getCaptureConfig().ip);
  }

  checkRateLimit(ip: string | null): Promise<boolean> {
    // No anonymous bypass: traffic without a resolvable IP shares one
    // strict bucket instead of skipping the limit entirely.
    if (!ip) return this.limiter.check("device:unknown", 60, 60);
    return this.limiter.check(`device:${ip}`, 120, 60);
  }

  /** Records the interstitial click; returns the click-event id. */
  async createInterstitialClickEvent(input: {
    shortCode: string;
    headers: Headers;
    requestUrl: URL;
    destinationUrl: string;
  }): Promise<string> {
    const { shortCode, headers, requestUrl, destinationUrl } = input;
    const capture = captureVisitor(headers, requestUrl, destinationUrl, this.getCaptureConfig());
    const { ipRaw, geoFromHeaders, ...rest } = capture;
    const geo: GeoInfo = { ...EMPTY_GEO, ...geoFromHeaders };

    const eventId = await this.clicks.createInterstitialClick(
      shortCode,
      destinationUrl,
      buildClickEventDoc(shortCode, { ...rest, geo }) as Record<string, unknown>,
    );

    if (ipRaw && !geoFromHeaders) {
      void this.backfillGeo(eventId, shortCode, ipRaw).catch((err) => {
        console.error("[DeviceCapture] geo backfill failed:", err);
      });
    }
    return eventId;
  }

  private async backfillGeo(eventId: string, shortCode: string, ip: string): Promise<void> {
    const geo = await this.geo.lookup(ip);
    await this.clicks.updateGeo(eventId, shortCode, {
      geoCountry: geo.country,
      geoRegion: geo.region,
      geoCity: geo.city,
      geoLatitude: geo.latitude,
      geoLongitude: geo.longitude,
      geoTimezone: geo.timezone,
      geoIsp: geo.isp,
      geoOrg: geo.org,
      geoAsNumber: geo.asNumber,
    });
  }

  sanitizeDeviceDetails(input: DeviceDetails): Record<string, number | string | boolean | null> {
    const clampInt = (value: unknown, max: number): number | null => {
      if (typeof value !== "number" || !Number.isFinite(value)) return null;
      const n = Math.floor(value);
      if (n < 0 || n > max) return null;
      return n;
    };
    const clampFloat = (value: unknown, max: number): number | null => {
      if (typeof value !== "number" || !Number.isFinite(value)) return null;
      if (value < 0 || value > max) return null;
      return value;
    };
    const cleanString = (value: unknown, maxLength: number): string | null => {
      if (typeof value !== "string") return null;
      const trimmed = value.trim().slice(0, maxLength);
      return trimmed ? trimmed : null;
    };
    const cleanBool = (value: unknown): boolean | null => (typeof value === "boolean" ? value : null);
    return {
      screenWidth: clampInt(input.screenWidth, 100000),
      screenHeight: clampInt(input.screenHeight, 100000),
      viewportWidth: clampInt(input.viewportWidth, 100000),
      viewportHeight: clampInt(input.viewportHeight, 100000),
      touchSupport: cleanBool(input.touchSupport),
      cpuCores: clampInt(input.cpuCores, 1024),
      deviceMemory: clampFloat(input.deviceMemory, 1024),
      platform: cleanString(input.platform, 64),
      clientTimezone: cleanString(input.clientTimezone, 64),
      clientUa: cleanString(input.clientUa, 512),
      connectionType: cleanString(input.connectionType, 32),
      connectionDownlink: clampFloat(input.connectionDownlink, 10000),
      connectionRtt: clampInt(input.connectionRtt, 60000),
      connectionSaveData: cleanBool(input.connectionSaveData),
      uaPlatform: cleanString(input.uaPlatform, 64),
      uaPlatformVersion: cleanString(input.uaPlatformVersion, 32),
      uaArchitecture: cleanString(input.uaArchitecture, 32),
      uaBitness: cleanString(input.uaBitness, 16),
      uaModel: cleanString(input.uaModel, 128),
      uaMobile: cleanBool(input.uaMobile),
    };
  }

  saveDeviceDetails(eventId: string, shortCode: string, details: DeviceDetails): Promise<boolean> {
    return this.clicks.updateDetails(eventId, shortCode, this.sanitizeDeviceDetails(details));
  }

  markContinued(eventId: string, shortCode: string): Promise<boolean> {
    return this.clicks.markContinued(eventId, shortCode);
  }
}





