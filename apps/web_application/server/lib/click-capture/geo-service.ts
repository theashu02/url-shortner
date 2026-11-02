import type Redis from "ioredis";
import { EMPTY_GEO, type GeoInfo } from "./types";
import { isPrivateOrInvalidIp } from "./ip";

export interface GeoProvider {
  lookup(ip: string): Promise<GeoInfo>;
}

export class IpApiGeoProvider implements GeoProvider {
  async lookup(ip: string): Promise<GeoInfo> {
    if (isPrivateOrInvalidIp(ip)) return EMPTY_GEO;

    try {
      const res = await fetch(
        `http://ip-api.com/json/${ip}?fields=country,regionName,city,lat,lon,timezone,isp,org,as`,
        { signal: AbortSignal.timeout(3000) },
      );

      if (!res.ok) return EMPTY_GEO;

      const data = await res.json();
      return {
        country: data.country ?? null,
        region: data.regionName ?? null,
        city: data.city ?? null,
        latitude: data.lat ?? null,
        longitude: data.lon ?? null,
        timezone: data.timezone ?? null,
        isp: data.isp ?? null,
        org: data.org ?? null,
        asNumber: data.as ?? null,
      };
    } catch {
      return EMPTY_GEO;
    }
  }
}

export class CachedGeoProvider implements GeoProvider {
  /**
   * In-flight deduplication (singleflight): concurrent lookups for the same
   * IP share one upstream request instead of stampeding ip-api, whose free
   * tier caps at 45 req/min. Entries are transient and removed on settle,
   * so the map cannot grow without bound.
   */
  private readonly inflight = new Map<string, Promise<GeoInfo>>();

  constructor(
    private readonly inner: GeoProvider,
    private readonly redis: Redis,
    private readonly ttlSeconds = 60 * 60 * 24, // 24h
  ) {}

  async lookup(ip: string): Promise<GeoInfo> {
    const pending = this.inflight.get(ip);
    if (pending) return pending;

    const task = this.resolve(ip);
    this.inflight.set(ip, task);
    try {
      return await task;
    } finally {
      if (this.inflight.get(ip) === task) this.inflight.delete(ip);
    }
  }

  private async resolve(ip: string): Promise<GeoInfo> {
    const cacheKey = `geo:${ip}`;

    const cached = await this.redis.get(cacheKey).catch(() => null);
    if (cached) {
      try {
        return JSON.parse(cached) as GeoInfo;
      } catch {
        // corrupt cache entry - fall through to refresh
      }
    }

    const geo = await this.inner.lookup(ip);

    await this.redis
      .set(cacheKey, JSON.stringify(geo), "EX", this.ttlSeconds)
      .catch(() => {
        // cache write failure should never break enrichment
      });

    return geo;
  }
}
