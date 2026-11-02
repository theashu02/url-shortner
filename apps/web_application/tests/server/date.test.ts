import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toIsoStringOrNull } from "../../server/lib/date";

describe("toIsoStringOrNull", () => {
  it("serializes valid Dates", () => {
    assert.equal(toIsoStringOrNull(new Date("2024-01-02T03:04:05.000Z")), "2024-01-02T03:04:05.000Z");
  });

  it("coerces ISO strings and epoch numbers", () => {
    assert.equal(toIsoStringOrNull("2024-01-02T03:04:05.000Z"), "2024-01-02T03:04:05.000Z");
    assert.equal(toIsoStringOrNull(0), "1970-01-01T00:00:00.000Z");
  });

  it("returns null for invalid or missing values", () => {
    assert.equal(toIsoStringOrNull(new Date("not-a-date")), null);
    assert.equal(toIsoStringOrNull("garbage"), null);
    assert.equal(toIsoStringOrNull(null), null);
    assert.equal(toIsoStringOrNull(undefined), null);
    assert.equal(toIsoStringOrNull({}), null);
  });
});
