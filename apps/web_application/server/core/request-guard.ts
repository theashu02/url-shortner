import { getClientIp, type IpResolverConfig } from "../lib/click-capture/ip";

export function getIpConfig(): Required<IpResolverConfig> {
  const trusted = Number(process.env.TRUSTED_PROXY_COUNT ?? "0");
  return {
    behindCloudflare: process.env.BEHIND_CLOUDFLARE === "1",
    trustedProxyCount: Number.isFinite(trusted) && trusted > 0 ? Math.floor(trusted) : 0,
  };
}

interface Bucket {
  count: number;
  resetAt: number;
}

export class MemoryRateLimiter {
  private static readonly MAX_KEYS = 20_000;
  private static readonly SWEEP_INTERVAL_MS = 60_000;

  private readonly buckets = new Map<string, Bucket>();
  private lastSweep = 0;

  check(
    key: string,
    limit: number,
    windowSeconds: number,
    now: number = Date.now(),
  ): { allowed: boolean; retryAfter: number } {
    let bucket = this.buckets.get(key);
    if (bucket === undefined || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowSeconds * 1000 };
      this.buckets.set(key, bucket);
    }
    if (now - this.lastSweep > MemoryRateLimiter.SWEEP_INTERVAL_MS) {
      this.sweep(now);
    }
    if (bucket.count >= limit) {
      return {
        allowed: false,
        retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      };
    }
    bucket.count += 1;
    if (this.buckets.size > MemoryRateLimiter.MAX_KEYS) {
      const oldest = this.buckets.keys().next();
      if (!oldest.done) this.buckets.delete(oldest.value);
    }
    return { allowed: true, retryAfter: 0 };
  }

  private sweep(now: number): void {
    this.lastSweep = now;
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
  }
}

const HOT_PATH_FRAGMENTS = [
  "/device",
  "/click",
  "/append-link",
  "/analytics",
  "/urls",
  "/mine",
  "/versions",
] as const;

function isHotApiPath(pathname: string): boolean {
  return HOT_PATH_FRAGMENTS.some((fragment) => pathname.includes(fragment));
}

function numEnv(name: string, fallback: number): number {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export interface GuardVerdict {
  allowed: boolean;
  retryAfterSeconds: number;
}

const sharedLimiter = new MemoryRateLimiter();

function resolveIpKey(request: Request, scope: "std" | "hot" | "redirect"): string {
  const ip = getClientIp(request.headers, getIpConfig());
  if (ip === null) return `${scope}:unknown`;
  return `${scope}:${ip}`;
}

export function checkGlobalRequestBudget(request: Request): GuardVerdict {
  if (process.env.GLOBAL_RL_ENABLED === "0") {
    return { allowed: true, retryAfterSeconds: 0 };
  }
  let pathname = "/";
  try {
    pathname = new URL(request.url).pathname;
  } catch {
    pathname = "/";
  }
  const hot = isHotApiPath(pathname);
  // No anonymous bypass: unresolvable IPs share one strict bucket.
  if (getClientIp(request.headers, getIpConfig()) === null) {
    const limited = sharedLimiter.check("std:unknown", numEnv("GLOBAL_RL_UNKNOWN", 60), 60);
    return { allowed: limited.allowed, retryAfterSeconds: limited.retryAfter };
  }
  const scope = hot ? "hot" : "std";
  const limit = hot ? numEnv("GLOBAL_RL_HOT", 60) : numEnv("GLOBAL_RL_DEFAULT", 300);
  const result = sharedLimiter.check(resolveIpKey(request, scope), limit, 60);
  return { allowed: result.allowed, retryAfterSeconds: result.retryAfter };
}


export function checkRedirectBudget(request: Request): GuardVerdict {
  const unknown = getClientIp(request.headers, getIpConfig()) === null;
  const key = resolveIpKey(request, "redirect");
  const limit = unknown ? numEnv("GLOBAL_RL_UNKNOWN", 60) : numEnv("GLOBAL_RL_REDIRECT", 180);
  const result = sharedLimiter.check(key, limit, 60);
  return { allowed: result.allowed, retryAfterSeconds: result.retryAfter };
}