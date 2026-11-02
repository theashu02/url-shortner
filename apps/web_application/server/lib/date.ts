/**
 * Safe ISO serialization for values that may arrive as Date, ISO strings,
 * epoch numbers, or driver-specific shapes (SRP: one coercion rule).
 * Never throws; returns null when the value carries no valid timestamp.
 */
export function toIsoStringOrNull(value: unknown): string | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }
  return null;
}
