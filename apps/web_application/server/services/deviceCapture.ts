import mongoose from "mongoose";
import { connectToDatabase } from "@/server/db/mongoose";
import { ClickEventModel } from "@/server/models/clickEvent";
import { UrlModel } from "@/server/models/url";
import { redis } from "@/server/redis/redis";
import {
  captureVisitor,
  CachedGeoProvider,
  IpApiGeoProvider,
  EMPTY_GEO,
  getClientIp,
  buildClickEventDoc,
  type CaptureConfig,
  type GeoInfo,
} from "@/server/lib/click-capture";
import type { DeviceDetails } from "@/lib/device-info";

const geoProvider = new CachedGeoProvider(new IpApiGeoProvider(), redis);

export function getCaptureConfig(): CaptureConfig {
  return {
    ip: { behindCloudflare: false, trustedProxyCount: 0 },
    hashSalt: process.env.IP_HASH_SALT ?? "default-dev-salt-change-in-prod",
  };
}

export function getRequestIp(headers: Headers): string | null {
  return getClientIp(headers, getCaptureConfig().ip);
}

export async function checkDeviceRateLimit(
  ip: string | null,
): Promise<boolean> {
  if (!ip) return true;
  try {
    const key = `ratelimit:device:${ip}`;
    const requests = await redis.incr(key);
    if (requests === 1) await redis.expire(key, 60);
    return requests <= 120;
  } catch {
    return true;
  }
}

/**
 * Records the click when a visitor lands on the device-interstitial page.
 * The click event id is returned so the browser can attach device details
 * and the continue-through signal to the same event.
 */
export async function createInterstitialClickEvent(input: {
  shortCode: string;
  headers: Headers;
  requestUrl: URL;
  destinationUrl: string;
}): Promise<string> {
  const { shortCode, headers, requestUrl, destinationUrl } = input;
  const capture = captureVisitor(
    headers,
    requestUrl,
    destinationUrl,
    getCaptureConfig(),
  );

  const { ipRaw, geoFromHeaders, ...rest } = capture;
  const geo: GeoInfo = { ...EMPTY_GEO, ...geoFromHeaders };

  await connectToDatabase();
  const [doc] = await Promise.all([
    ClickEventModel.create({
      ...buildClickEventDoc(shortCode, { ...rest, geo }),
      destinationUrl,
      continued: false,
    }),
    UrlModel.updateOne({ shortCode }, { $inc: { clicks: 1 } }),
  ]);

  if (ipRaw && !geoFromHeaders) {
    void backfillGeo(String(doc._id), ipRaw).catch((err) => {
      console.error("[DeviceCapture] geo backfill failed:", err);
    });
  }

  return String(doc._id);
}

async function backfillGeo(eventId: string, ip: string): Promise<void> {
  const geo = await geoProvider.lookup(ip);
  await connectToDatabase();
  await ClickEventModel.updateOne(
    { _id: eventId },
    {
      $set: {
        geoCountry: geo.country,
        geoRegion: geo.region,
        geoCity: geo.city,
        geoLatitude: geo.latitude,
        geoLongitude: geo.longitude,
        geoTimezone: geo.timezone,
        geoIsp: geo.isp,
        geoOrg: geo.org,
        geoAsNumber: geo.asNumber,
      },
    },
  );
}

function clampInt(value: unknown, max: number): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const n = Math.floor(value);
  if (n < 0 || n > max) return null;
  return n;
}

function clampFloat(value: unknown, max: number): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value < 0 || value > max) return null;
  return value;
}

function cleanString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, maxLength);
  return trimmed ? trimmed : null;
}

function cleanBool(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

export function sanitizeDeviceDetails(
  input: DeviceDetails,
): Record<string, number | string | boolean | null> {
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

function toObjectId(id: string): mongoose.Types.ObjectId | null {
  try {
    return new mongoose.Types.ObjectId(id);
  } catch {
    return null;
  }
}

export async function saveDeviceDetails(
  eventId: string,
  shortCode: string,
  details: DeviceDetails,
): Promise<"ok" | "not-found"> {
  const _id = toObjectId(eventId);
  if (!_id) return "not-found";
  await connectToDatabase();
  const res = await ClickEventModel.updateOne(
    { _id, shortCode },
    { $set: { ...sanitizeDeviceDetails(details), capturedAt: new Date() } },
  );
  return res.matchedCount > 0 ? "ok" : "not-found";
}

export async function markContinued(
  eventId: string,
  shortCode: string,
): Promise<"ok" | "not-found"> {
  const _id = toObjectId(eventId);
  if (!_id) return "not-found";
  await connectToDatabase();
  const res = await ClickEventModel.updateOne(
    { _id, shortCode },
    { $set: { continued: true, continuedAt: new Date() } },
  );
  return res.matchedCount > 0 ? "ok" : "not-found";
}
