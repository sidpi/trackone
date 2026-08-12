// Static courier list — Indian e-commerce couriers. No courier API
// beyond the AfterShip tracking integration (Track 3).
//
// AfterShip slug notes (verified against AfterShip's supported-couriers
// list): Ekart, Ecom Express, XpressBees, DTDC and Shadowfax track with
// just the API key. Delhivery, BlueDart, Gati-KWE and DHL need a
// "courier connection" set up in the AfterShip dashboard before tracking
// returns data.

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
};

/** AfterShip slugs for tracking. */
export const COURIER_SLUGS: Record<string, string> = {
  Ekart: "ekart",
  Ecom: "ecom-express",
  Delhivery: "delhivery",
  Xpressbees: "xpressbees",
  Bluedart: "bluedart",
  Gati: "gati-kwe",
  DTDC: "dtdc",
  Shadowfax: "shadowfax",
  DHL: "dhl",
};

/** Returns the AfterShip slug for a courier display name, or null. */
export function getCourierSlug(courier: string): string | null {
  return COURIER_SLUGS[courier] ?? null;
}
