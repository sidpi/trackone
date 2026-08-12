import type { TrackingProvider } from "./types";

const API_BASE = "https://api.aftership.com/v9";

/**
 * AfterShip Tracking API (v9) provider.
 * Uses AFTERSHIP_API_KEY from the server environment — never exposed to
 * the client. See https://www.aftership.com/docs/tracking/self-host-api
 */
export const aftershipProvider: TrackingProvider = {
  name: "aftership",

  async track(slug, trackingNumber, opts) {
    const apiKey = process.env.AFTERSHIP_API_KEY;
    if (!apiKey) {
      throw new Error("AFTERSHIP_API_KEY is not configured.");
    }

    const headers = {
      "aftership-api-key": apiKey,
      "Content-Type": "application/json",
    };

    // AfterShip needs the tracking to exist before it can be queried.
    // Creating is idempotent-ish: an existing tracking returns 409, which
    // we treat as success.
    const createRes = await fetch(`${API_BASE}/trackings`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        tracking: {
          slug,
          tracking_number: trackingNumber,
          ...(opts?.title ? { title: opts.title } : {}),
        },
      }),
    });

    if (createRes.status !== 201 && createRes.status !== 409) {
      const body = await createRes.text().catch(() => "");
      throw new Error(
        `AfterShip create failed (${createRes.status})${body ? `: ${body}` : ""}`
      );
    }

    const res = await fetch(
      `${API_BASE}/trackings/${encodeURIComponent(slug)}/${encodeURIComponent(trackingNumber)}`,
      { headers }
    );

    if (!res.ok) {
      throw new Error(`AfterShip tracking request failed (${res.status}).`);
    }

    const json = (await res.json()) as {
      data?: {
        tracking?: {
          tag?: string;
          status?: string;
          checkpoints?: Array<{
            checkpoint_time?: string;
            status?: string;
            tag?: string;
            message?: string;
            location?: string;
          }>;
        };
      };
    };

    const tracking = json.data?.tracking;
    if (!tracking) {
      throw new Error("AfterShip returned an unexpected response.");
    }

    const checkpoints = (tracking.checkpoints ?? [])
      .filter((c) => c.checkpoint_time || c.message)
      .map((c) => ({
        occurredAt: normalizeTime(c.checkpoint_time),
        tag: normalizeTag(c.tag ?? c.status),
        message: c.message ?? "Status update",
        location: c.location ?? null,
        raw: c,
      }))
      .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));

    return {
      tag: normalizeTag(tracking.tag ?? checkpoints.at(-1)?.tag ?? "pending"),
      checkpoints,
      raw: json,
    };
  },
};

/** AfterShip returns "2024-01-01 12:00:00" (no timezone) — treat as UTC. */
function normalizeTime(value?: string) {
  if (!value) return new Date().toISOString();
  const normalized = value.includes("Z") || value.includes("+")
    ? value
    : `${value.replace(" ", "T")}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

/** "InfoReceived" / "info_received" → "inforeceived". */
function normalizeTag(value?: string) {
  return (value ?? "").toLowerCase().replace(/[^a-z]/g, "");
}
