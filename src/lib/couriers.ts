// Static courier list — Indian e-commerce couriers plus the marketplaces
// and India Post that email discovery can surface (Track 4). Courier
// slugs/codes for the tracking providers live in each provider's own map
// (src/lib/tracking/trackcourier.ts, ship24.ts, indian-courier-api.ts) —
// names without a slug fall through to Ship24's auto-detection.

export const COURIERS = [
  "Ekart",
  "Ecom",
  "Delhivery",
  "Xpressbees",
  "Bluedart",
  "Gati",
  "DTDC",
  "Shadowfax",
  "DHL",
  "India Post",
  "Amazon",
  "Flipkart",
  "Myntra",
  "Meesho",
] as const;

export type Courier = (typeof COURIERS)[number];

/** Labels in the same order as `COURIERS` — add pretty names if needed. */
export const COURIER_LABELS: Record<Courier, string> = {
  Ekart: "Ekart",
  Ecom: "Ecom",
  Delhivery: "Delhivery",
  Xpressbees: "Xpressbees",
  Bluedart: "Bluedart",
  Gati: "Gati",
  DTDC: "DTDC",
  Shadowfax: "Shadowfax",
  DHL: "DHL",
  "India Post": "India Post",
  Amazon: "Amazon",
  Flipkart: "Flipkart",
  Myntra: "Myntra",
  Meesho: "Meesho",
};
