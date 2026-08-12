// Static courier list — no courier API yet (per Track 2 scope).
// A tracking-URL builder can be added here later per courier.

export const COURIERS = [
  "DHL",
  "FedEx",
  "UPS",
  "USPS",
  "TNT",
  "Aramex",
  "DPD",
  "GLS",
  "Royal Mail",
  "China Post",
  "Other",
] as const;

export type Courier = (typeof COURIERS)[number];

/** Labels in the same order as `COURIERS` — add pretty names if needed. */
export const COURIER_LABELS: Record<Courier, string> = {
  DHL: "DHL",
  FedEx: "FedEx",
  UPS: "UPS",
  USPS: "USPS",
  TNT: "TNT",
  Aramex: "Aramex",
  DPD: "DPD",
  GLS: "GLS",
  "Royal Mail": "Royal Mail",
  "China Post": "China Post",
  Other: "Other",
};

/** AfterShip slugs for tracking. "Other" has no slug → not trackable. */
export const COURIER_SLUGS: Record<string, string> = {
  DHL: "dhl",
  FedEx: "fedex",
  UPS: "ups",
  USPS: "usps",
  TNT: "tnt",
  Aramex: "aramex",
  DPD: "dpd",
  GLS: "gls",
  "Royal Mail": "royal-mail",
  "China Post": "china-post",
};

/** Returns the AfterShip slug for a courier display name, or null. */
export function getCourierSlug(courier: string): string | null {
  return COURIER_SLUGS[courier] ?? null;
}
