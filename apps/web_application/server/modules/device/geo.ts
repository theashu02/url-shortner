import { CachedGeoProvider, IpApiGeoProvider, type GeoProvider } from "@/server/lib/click-capture";
import type Redis from "ioredis";

/** OCP/LSP: geo lookup behind the existing GeoProvider seam. */
export type IGeoProvider = GeoProvider;

let shared: IGeoProvider | null = null;

/** Composition helper: process-wide cached geo provider over the shared Redis. */
export function getSharedGeoProvider(redis: Redis): IGeoProvider {
  if (!shared) shared = new CachedGeoProvider(new IpApiGeoProvider(), redis);
  return shared;
}
