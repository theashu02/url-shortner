import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { RedisRateLimiter } from "../../server/core/rate-limit";
import type { ICache } from "../../server/core/cache";

/** In-memory ICache mirroring the FIXED_WINDOW_SCRIPT semantics. */
class FakeCache implements ICache {
  private readonly counters = new Map<string, { count: number; expiresAt: number }>();
  fail = false;
  now = 0;

  async get(): Promise<string | null> { return null; }
  async set(): Promise<unknown> { return null; }
  async setex(): Promise<unknown> { return null; }
  async del(): Promise<unknown> { return 0; }
  async incr(): Promise<number> { return 0; }
  async expire(): Promise<unknown> { return null; }

  async checkBudget(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    if (this.fail) throw new Error("redis down");
    const entry = this.counters.get(key);
    const current = entry !== undefined && entry.expiresAt > this.now ? entry.count + 1 : 1;
    this.counters.set(key, { count: current, expiresAt: this.now + windowSeconds * 1000 });
    return current <= limit;
  }
}

describe("RedisRateLimiter", () => {
  it("allows requests within budget then blocks", async () => {
    const limiter = new RedisRateLimiter(new FakeCache(), "test");
    assert.equal(await limiter.check("ip", 2, 60), true);
    assert.equal(await limiter.check("ip", 2, 60), true);
    assert.equal(await limiter.check("ip", 2, 60), false);
  });

  it("resets after the window elapses", async () => {
    const cache = new FakeCache();
    const limiter = new RedisRateLimiter(cache, "test");
    assert.equal(await limiter.check("ip", 1, 60), true);
    assert.equal(await limiter.check("ip", 1, 60), false);
    cache.now += 61 * 1000;
    assert.equal(await limiter.check("ip", 1, 60), true);
  });

  it("isolates namespaces and keys", async () => {
    const cache = new FakeCache();
    const a = new RedisRateLimiter(cache, "a");
    const b = new RedisRateLimiter(cache, "b");
    assert.equal(await a.check("ip", 1, 60), true);
    assert.equal(await a.check("ip", 1, 60), false);
    assert.equal(await b.check("ip", 1, 60), true);
  });

  it("fails open when Redis is down", async () => {
    const cache = new FakeCache();
    cache.fail = true;
    const limiter = new RedisRateLimiter(cache, "test");
    assert.equal(await limiter.check("ip", 1, 60), true);
  });
});
