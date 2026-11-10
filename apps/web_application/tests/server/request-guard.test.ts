import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  MemoryRateLimiter,
  checkGlobalRequestBudget,
  checkRedirectBudget,
} from "../../server/core/request-guard";

function apiRequest(path: string, ip?: string): Request {
  const headers: Record<string, string> = {};
  if (ip !== undefined) headers["x-forwarded-for"] = ip;
  return new Request(`http://localhost${path}`, { headers });
}

describe("MemoryRateLimiter", () => {
  it("allows up to the limit then rejects with retryAfter", () => {
    const limiter = new MemoryRateLimiter();
    assert.ok(limiter.check("k", 2, 60, 1000).allowed);
    assert.ok(limiter.check("k", 2, 60, 1000).allowed);
    const third = limiter.check("k", 2, 60, 1000);
    assert.equal(third.allowed, false);
    assert.ok(third.retryAfter > 0);
  });

  it("resets the bucket when the window passes", () => {
    const limiter = new MemoryRateLimiter();
    assert.ok(limiter.check("k", 1, 60, 1000).allowed);
    assert.equal(limiter.check("k", 1, 60, 1000).allowed, false);
    assert.ok(limiter.check("k", 1, 60, 61_001 + 1000).allowed);
  });
});

describe("checkGlobalRequestBudget", () => {
  beforeEach(() => {
    delete process.env.GLOBAL_RL_ENABLED;
    delete process.env.GLOBAL_RL_HOT;
    delete process.env.GLOBAL_RL_DEFAULT;
  });

  it("rejects hot-path floods past the hot budget", () => {
    process.env.GLOBAL_RL_HOT = "3";
    const ip = "10.9.9.1";
    for (let i = 0; i < 3; i++) {
      assert.ok(checkGlobalRequestBudget(apiRequest("/api/device/capture", ip)).allowed);
    }
    const verdict = checkGlobalRequestBudget(apiRequest("/api/device/capture", ip));
    assert.equal(verdict.allowed, false);
    assert.ok(verdict.retryAfterSeconds > 0);
  });

  it("keeps default paths on the generous budget", () => {
    process.env.GLOBAL_RL_DEFAULT = "2";
    const ip = "10.9.9.2";
    assert.ok(checkGlobalRequestBudget(apiRequest("/api/pages", ip)).allowed);
    assert.ok(checkGlobalRequestBudget(apiRequest("/api/pages", ip)).allowed);
    assert.equal(checkGlobalRequestBudget(apiRequest("/api/pages", ip)).allowed, false);
  });

  it("sends unresolvable IPs to the shared unknown bucket, never unlimited", () => {
    process.env.GLOBAL_RL_UNKNOWN = "2";
    assert.ok(checkGlobalRequestBudget(apiRequest("/api/pages/mine")).allowed);
    assert.ok(checkGlobalRequestBudget(apiRequest("/api/pages/mine")).allowed);
    assert.equal(checkGlobalRequestBudget(apiRequest("/api/pages/mine")).allowed, false);
  });

  it("is disabled with GLOBAL_RL_ENABLED=0", () => {
    process.env.GLOBAL_RL_ENABLED = "0";
    process.env.GLOBAL_RL_HOT = "1";
    const verdict = checkGlobalRequestBudget(apiRequest("/api/device/capture", "10.9.9.3"));
    assert.equal(verdict.allowed, true);
  });
});

describe("checkRedirectBudget", () => {
  it("allows normal redirect traffic and caps floods", () => {
    process.env.GLOBAL_RL_REDIRECT = "2";
    const ip = "10.9.9.4";
    const make = () => new Request("http://localhost/abc123", {
      headers: { "x-forwarded-for": ip },
    });
    assert.ok(checkRedirectBudget(make()).allowed);
    assert.ok(checkRedirectBudget(make()).allowed);
    assert.equal(checkRedirectBudget(make()).allowed, false);
  });
});