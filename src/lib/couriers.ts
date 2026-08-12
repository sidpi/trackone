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
