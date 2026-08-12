import { inferTag, normalizeTag, toIsoDate } from "./infer";
import type { TrackingProvider, TrackingCheckpoint } from "./types";

/**
 * TrackCourier.io provider (https://api.trackcourier.io).
 * Auth: X-API-Key header. Free tier: 100 requests/month — the app's
 * 15-minute cache helps stay inside that.
 *
 * NOTE: the real API response does not match the docs — checkpoint fields
 * are capitalized (`Checkpoints[].Activity / CheckpointState / Date /
 * Time / Location`) and "not found" is reported as `success: true` with
 * `Result: "failure"` + `isEmptyTable: true`.
 */
export const TRACKCOURIER_SLUGS: Record<string, string> = {
  Ekart: "ekart",
  Ecom: "ecomexpress",
  Delhivery: "delhivery",
  Xpressbees: "xpressbees",
  Bluedart: "bluedart",
  Gati: "gati",
  DTDC: "dtdc",
  Shadowfax: "shadowfax",
  DHL: "dhl",
};

interface TrackCourierCheckpoint {
  Activity?: string;
  CheckpointState?: string;
  CourierName?: string;
  /** e.g. "12-Aug-2026" */
  Date?: string;
  /** e.g. "12:50 hrs" or "" */
  Time?: string;
  Location?: string;
}

/** Strips HTML tags ("No information… <a href>…</a>") and collapses whitespace. */
function cleanText(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Parses TrackCourier's "12-Aug-2026" + "12:50 hrs" into an ISO string. */
function parseTrackCourierDate(date: string, time: string): string {
  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };
  const m = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(date.trim());
  if (!m) return toIsoDate(undefined);
  const t = /^(\d{1,2}):(\d{2})/.exec(time.trim());
  const d = new Date(
    Date.UTC(
      Number(m[3]),
      months[m[2].toLowerCase()] ?? 0,
      Number(m[1]),
      t ? Number(t[1]) : 0,
      t ? Number(t[2]) : 0
    )
  );
  return Number.isNaN(d.getTime()) ? toIsoDate(undefined) : d.toISOString();
}

export const trackcourierProvider: TrackingProvider = {
  name: "trackcourier",

  async track(trackingNumber, opts) {
    const apiKey = process.env.TRACKCOURIER_API_KEY;
    if (!apiKey) {
      throw new Error("TRACKCOURIER_API_KEY is not configured.");
    }

    const courierName = opts?.courierName ?? "";
    const slug = TRACKCOURIER_SLUGS[courierName];
    if (!slug) {
      throw new Error(`Courier "${courierName}" isn't supported by TrackCourier.`);
    }

    const url =
      `https://api.trackcourier.io/v1/track` +
      `?courier=${encodeURIComponent(slug)}` +
      `&tracking_number=${encodeURIComponent(trackingNumber)}`;

    const res = await fetch(url, { headers: { "X-API-Key": apiKey } });

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;
      throw new Error(
        body?.error?.message ?? `TrackCourier error (HTTP ${res.status}).`
      );
    }

    const json = (await res.json()) as {
      success?: boolean;
      error?: { message?: string };
      data?: {
        Result?: string;
        MostRecentStatus?: string;
        Checkpoints?: TrackCourierCheckpoint[];
      };
    };

    if (!json.success) {
      throw new Error(json.error?.message ?? "TrackCourier returned an unexpected response.");
    }

    // The real API reports "not found" as success:true + Result:"failure".
    if (json.data?.Result === "failure") {
      throw new Error("TrackCourier found no tracking data for this number.");
    }

    const checkpoints: TrackingCheckpoint[] = (json.data?.Checkpoints ?? [])
      // Filter placeholder rows like "No information present for consignment…".
      .filter(
        (c) =>
          c.Activity &&
          !/no information|no results found|not found|no record/i.test(c.Activity)
      )
      .map((c) => {
        const message = cleanText(c.Activity ?? "");
        return {
          occurredAt: parseTrackCourierDate(c.Date ?? "", c.Time ?? ""),
          tag: c.CheckpointState
            ? normalizeTag(c.CheckpointState)
            : inferTag(message),
          message: message || c.CheckpointState || "Status update",
          location: cleanText(c.Location ?? "") || null,
          raw: c,
        };
      })
      .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));

    return {
      // TrackCourier states (pending/in_transit/out_for_delivery/delivered/
      // exception) normalize cleanly through mapTagToStatus.
      tag: checkpoints.at(-1)?.tag ?? "pending",
      checkpoints,
      raw: json,
    };
  },
};
