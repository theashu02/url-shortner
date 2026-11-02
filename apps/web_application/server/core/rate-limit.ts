import type { ICache } from "./cache";

/**
 * ISP: tiny contract for per-key fixed-window rate limiting.
 * RedisRateLimiter fails OPEN when Redis is down (pages stay usable).
 */
export interface IRateLimiter {
  /** Returns true when the caller is within budget. */
  check(key: string, limit: number, windowSeconds: number): Promise<boolean>;
}

export class RedisRateLimiter implements IRateLimiter {
  constructor(
    private readonly cache: ICache,
    private readonly namespace = "rl",
  ) {}

  async check(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    try {
      return await this.cache.checkBudget(`${this.namespace}:${key}`, limit, windowSeconds);
    } catch {
      return true;
    }
  }
}
