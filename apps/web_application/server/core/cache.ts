import type Redis from "ioredis";

/**
 * Fixed-window check executed as one atomic Lua script (INCR + TTL repair +
 * budget comparison in a single round trip). The TTL repair also heals keys
 * written by older non-atomic code paths that may lack an expiry.
 */
const FIXED_WINDOW_SCRIPT = [
  "local current = redis.call('INCR', KEYS[1])",
  "if redis.call('TTL', KEYS[1]) == -1 then",
  "  redis.call('EXPIRE', KEYS[1], ARGV[1])",
  "end",
  "if current <= tonumber(ARGV[2]) then return 1 else return 0 end",
].join("\n");

/**
 * Minimal cache contract used by services (ISP: only what services need).
 * Implemented by RedisCache; swappable for tests via this interface (LSP/DIP).
 */
export interface ICache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<unknown>;
  setex(key: string, seconds: number, value: string): Promise<unknown>;
  del(...keys: string[]): Promise<unknown>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<unknown>;
  /**
   * Atomically increments a fixed-window counter and reports whether the
   * caller is within budget. Fails open (true) when Redis is unavailable so
   * rate limiting degrades to allowing traffic instead of 500s.
   */
  checkBudget(key: string, limit: number, windowSeconds: number): Promise<boolean>;
}

export class RedisCache implements ICache {
  constructor(private readonly client: Redis) {}

  get(key: string): Promise<string | null> {
    return this.client.get(key).catch(() => null);
  }

  set(key: string, value: string): Promise<unknown> {
    return this.client.set(key, value).catch(() => null);
  }

  setex(key: string, seconds: number, value: string): Promise<unknown> {
    return this.client.setex(key, seconds, value).catch(() => null);
  }

  del(...keys: string[]): Promise<unknown> {
    if (keys.length === 0) return Promise.resolve(0);
    return this.client.del(...keys).catch(() => null);
  }

  incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  expire(key: string, seconds: number): Promise<unknown> {
    return this.client.expire(key, seconds).catch(() => null);
  }

  async checkBudget(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    try {
      const result = await this.client.eval(
        FIXED_WINDOW_SCRIPT,
        1,
        key,
        String(windowSeconds),
        String(limit),
      );
      return result === 1;
    } catch {
      return true;
    }
  }
}
