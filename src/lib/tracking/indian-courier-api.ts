import { inferTag } from "./infer";
import type { TrackingCheckpoint, TrackingProvider, TrackResult } from "./types";

/**
 * Provider for the self-hosted "indian-courier-api" scraper service
 * (github.com/rajatdhoot123/indian-courier-api). That service scrapes
 * AfterShip's public tracking pages with a headless browser and returns
 * checkpoints shaped like { location, detail, date }.
 *
 * The service must be hosted separately (it needs a Chromium-capable
 * runtime — it cannot run on Cloudflare Workers). Point
 * INDIAN_COURIER_API_URL at your deployment, e.g.
 * https://your-service.example.com
 */

/** Courier display name → path segment the service expects. */
export const INDIAN_COURIER_PATHS: Record<string, string> = {
  Ekart: "ekart",
  Ecom: "ecom", // their constants also list "ecomexpress" — keep if needed
  Delhivery: "delhivery",
  Xpressbees: "xpressbees",
  Bluedart: "bluedart",
  Gati: "gati",
  DTDC: "dtdc",
  Shadowfax: "shadowfax",
  DHL: "dhl",
};

export function getIndianCourierPath(courierName: string): string | null {
  return INDIAN_COURIER_PATHS[courierName] ?? null;
}

/** "26 Mar, 2018 12:50 hrs" → ISO string (falls back to now). */
function parseDate(value?: string): string {
  if (!value) return new Date().toISOString();

  const m = value.match(/(\d{1,2})\s+(\w{3})[,\s]*(\d{4})\s+(\d{1,2}):(\d{2})/);
  if (m) {
    const months: Record<string, number> = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
    };
    const month = months[m[2]];
    if (month !== undefined) {
      return new Date(Date.UTC(+m[3], month, +m[1], +m[4], +m[5])).toISOString();
    }
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

interface ServiceCheckpoint {
  location?: string;
  detail?: string;
  date?: string;
}

interface ServiceResponse {
  status?: string;
  message?: string;
  data?: ServiceCheckpoint[];
}

export function createIndianCourierApiProvider(baseUrl: string): TrackingProvider {
  const normalized = baseUrl.replace(/\/+$/, "");

  return {
    name: "indian-courier-api",

    async track(trackingNumber, opts) {
      const courierName = opts?.courierName ?? "";
      const path = getIndianCourierPath(courierName);
      if (!path) {
        throw new Error(`Courier "${courierName}" isn't supported by the tracking service.`);
      }

      const url = `${normalized}/api/track/${encodeURIComponent(path)}/${encodeURIComponent(trackingNumber)}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });

      if (!res.ok) {
        throw new Error(`Tracking service error (HTTP ${res.status}).`);
      }

      const json = (await res.json().catch(() => null)) as ServiceResponse | null;

      if (!json || json.status === "failed") {
        throw new Error(json?.message || "Tracking service returned no results.");
      }

      const checkpoints: TrackingCheckpoint[] = (json.data ?? [])
        .map((item) => ({
          occurredAt: parseDate(item.date),
          tag: inferTag(item.detail ?? ""),
          message: item.detail ?? "Status update",
          location: item.location || null,
          raw: item,
        }))
        .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));

      return {
        tag: checkpoints.at(-1)?.tag ?? "pending",
        checkpoints,
        raw: json,
      } satisfies TrackResult;
    },
  };
}
