import { inferTag, toIsoDate } from "./infer";
import type { TrackingProvider, TrackingCheckpoint } from "./types";

/**
 * TrackCourier.io provider (https://api.trackcourier.io/docs).
 * Auth: X-API-Key header. Free tier: 100 requests/month — the app's
 * 15-minute cache helps stay inside that.
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
  timestamp?: string;
  status?: string;
  location?: string | null;
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
        status?: string;
        checkpoints?: TrackCourierCheckpoint[];
      };
    };

    if (!json.success) {
      throw new Error(json.error?.message ?? "TrackCourier returned an unexpected response.");
    }

    const checkpoints: TrackingCheckpoint[] = (json.data?.checkpoints ?? [])
      .map((c) => ({
        occurredAt: toIsoDate(c.timestamp),
        tag: inferTag(c.status ?? ""),
        message: c.status ?? "Status update",
        location: c.location || null,
        raw: c,
      }))
      .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));

    return {
      // TrackCourier statuses (pending/in_transit/out_for_delivery/delivered/
      // exception) normalize cleanly through mapTagToStatus.
      tag: checkpoints.at(-1)?.tag ?? "pending",
      checkpoints,
      raw: json,
    };
  },
};
