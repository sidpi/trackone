import { inferTag, normalizeTag, toIsoDate } from "./infer";
import type { TrackingProvider, TrackingCheckpoint } from "./types";

/**
 * Ship24 provider (https://docs.ship24.com).
 * Auth: Authorization Bearer. Uses POST /public/v1/trackers/track which
 * creates a tracker and returns results synchronously — the first call for
 * a number can take up to ~60s.
 */
export const SHIP24_CODES: Record<string, string> = {
  Ekart: "ekart",
  Ecom: "ecom-express",
  Delhivery: "delhivery",
  Xpressbees: "xpressbees",
  Bluedart: "bluedart",
  Gati: "gati",
  DTDC: "dtdc",
  Shadowfax: "shadowfax",
  DHL: "dhl",
};

interface Ship24Event {
  /** The actual timestamp field in Ship24 responses. */
  occurrenceDatetime?: string;
  status?: string;
  statusMilestone?: string;
  description?: string;
  location?: string | null;
}

export const ship24Provider: TrackingProvider = {
  name: "ship24",

  async track(trackingNumber, opts) {
    const apiKey = process.env.SHIP24_API_KEY;
    if (!apiKey) {
      throw new Error("SHIP24_API_KEY is not configured.");
    }

    const courierName = opts?.courierName ?? "";
    // When a courier code is known we pass it for accuracy; otherwise Ship24
    // auto-detects the courier from the tracking number.
    const courierCode = SHIP24_CODES[courierName];

    const body: Record<string, string> = { trackingNumber };
    if (courierCode) {
      body.courierCode = courierCode;
    }

    const res = await fetch("https://api.ship24.com/public/v1/trackers/track", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Ship24 error (HTTP ${res.status}): ${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      data?: { trackings?: Array<{ events?: Ship24Event[] }> };
    };

    const tracking = json.data?.trackings?.[0];
    if (!tracking) {
      throw new Error("Ship24 returned no tracking data.");
    }

    const checkpoints: TrackingCheckpoint[] = (tracking.events ?? [])
      .map((e) => ({
        occurredAt: toIsoDate(e.occurrenceDatetime),
        tag: normalizeTag(e.statusMilestone ?? e.status ?? inferTag(e.description ?? "")),
        message: e.description ?? e.status ?? "Status update",
        location: e.location || null,
        raw: e,
      }))
      .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));

    return {
      tag: checkpoints.at(-1)?.tag ?? "pending",
      checkpoints,
      raw: json,
    };
  },
};
