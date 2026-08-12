/** Shared helpers for tracking providers. */

/**
 * Infers a provider tag from free-text checkpoint detail.
 * Produces normalized tags ("delivered", "intransit", ...) that
 * `mapTagToStatus` in index.ts can consume.
 */
export function inferTag(detail: string): string {
  const text = detail.toLowerCase();
  // "Out for delivery" must be checked before the delivered pattern, which
  // would otherwise match "delivery".
  if (/out for delivery/.test(text)) return "intransit";
  if (/delivered|delivery successful|delivery complete|handed over|recipient/.test(text)) return "delivered";
  if (/customs/.test(text)) return "customs";
  if (/in transit|on the way|dispatched|shipped|transit/.test(text)) return "intransit";
  if (/picked up|information received|received|booked/.test(text)) return "inforeceived";
  if (/return|undelivered|failed|cancel/.test(text)) return "cancelled";
  return "pending";
}

/** Normalizes provider status tags: "InfoReceived" / "info_received" → "inforeceived". */
export function normalizeTag(value?: string | null): string {
  return (value ?? "").toLowerCase().replace(/[^a-z]/g, "");
}

/** Safe ISO conversion; falls back to now for invalid/empty values. */
export function toIsoDate(value?: string | null): string {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}
