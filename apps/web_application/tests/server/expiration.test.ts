import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateRedisTTL } from "../../server/lib/expiration";
import { URL_TTL_SECONDS, escapeRegex } from "../../server/lib/url";

describe("calculateRedisTTL", () => {
  it("defaults when no expiry is given", () => {
    assert.equal(calculateRedisTTL(undefined), URL_TTL_SECONDS);
    assert.equal(calculateRedisTTL(null), URL_TTL_SECONDS);
  });

  it("returns 0 for past dates", () => {
    assert.equal(calculateRedisTTL(new Date(Date.now() - 1000).toISOString()), 0);
  });

  it("caps future dates at the default TTL", () => {
    const far = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    assert.equal(calculateRedisTTL(far), URL_TTL_SECONDS);
    const near = new Date(Date.now() + 60 * 1000).toISOString();
    const ttl = calculateRedisTTL(near);
    assert.ok(ttl > 0 && ttl <= 60, `expected 1..60, got ${ttl}`);
  });

  it("falls back to default on invalid input", () => {
    assert.equal(calculateRedisTTL("not-a-date"), URL_TTL_SECONDS);
  });
});

describe("escapeRegex", () => {
  it("neutralizes regex metacharacters", () => {
    const evil = "a+b(c).d*e?f$g^h{i}j|k[l\\m";
    assert.doesNotThrow(() => new RegExp(escapeRegex(evil)));
    assert.ok(new RegExp(escapeRegex("a+b")).test("a+b"));
    assert.equal(new RegExp(escapeRegex("a+b")).test("aab"), false);
  });
});
