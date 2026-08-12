import { createIndianCourierApiProvider } from "./indian-courier-api";
import { mockProvider } from "./mock";
import { ship24Provider } from "./ship24";
import { trackcourierProvider } from "./trackcourier";
import type { TrackingProvider } from "./types";
import type { ShipmentStatus } from "@/lib/types";

/**
 * Provider selection (in order):
 *   1. TrackCourier.io   — when TRACKCOURIER_API_KEY is set
 *   2. Ship24            — when SHIP24_API_KEY is set
 *   3. indian-courier-api (self-hosted scraper) — when INDIAN_COURIER_API_URL is set
 *   4. mock              — clearly-labeled simulated data otherwise
 *
 * When more than one real provider is configured, they are chained: each is
 * tried in order until one returns data, so a tracking number unknown to one
 * provider can be resolved by the next.
 */
export function getTrackingProvider(): TrackingProvider {
  const chain: TrackingProvider[] = [];

  if (process.env.TRACKCOURIER_API_KEY) chain.push(trackcourierProvider);
  if (process.env.SHIP24_API_KEY) chain.push(ship24Provider);
  if (process.env.INDIAN_COURIER_API_URL) {
    chain.push(createIndianCourierApiProvider(process.env.INDIAN_COURIER_API_URL));
  }

  if (chain.length === 1) return chain[0];
  if (chain.length > 1) return createChain(chain);
  return mockProvider;
}

export function isMockProvider(): boolean {
  return (
    !process.env.TRACKCOURIER_API_KEY &&
    !process.env.SHIP24_API_KEY &&
    !process.env.INDIAN_COURIER_API_URL
  );
}

/** Tries each provider in order; throws the last error if all fail. */
function createChain(providers: TrackingProvider[]): TrackingProvider {
  return {
    name: "chain",
    async track(trackingNumber, opts) {
      let lastError: unknown = new Error("No tracking providers configured.");
      for (const provider of providers) {
        try {
          return await provider.track(trackingNumber, opts);
        } catch (err) {
          lastError = err;
        }
      }
      throw lastError;
    },
  };
}

/** Provider tag → ShipTrack status. Unknown tags fall back to "pending". */
const TAG_TO_STATUS: Record<string, ShipmentStatus> = {
  pending: "pending",
  inforeceived: "pending",
  intransit: "in_transit",
  outfordelivery: "in_transit",
  availableforpickup: "in_transit",
  customs: "customs",
  delivered: "delivered",
  attemptfail: "cancelled",
  exception: "cancelled",
  expired: "cancelled",
};

export function mapTagToStatus(tag: string): ShipmentStatus {
  return TAG_TO_STATUS[tag] ?? "pending";
}

/** Cache TTL for tracking refreshes (minutes). */
export function getCacheTtlMinutes(): number {
  const raw = Number(process.env.TRACKING_CACHE_TTL_MINUTES);
  return Number.isFinite(raw) && raw > 0 ? raw : 15;
}

/** True when the shipment was successfully synced within the TTL. */
export function isTrackingFresh(checkedAt: string | null | undefined): boolean {
  if (!checkedAt) return false;
  const elapsed = Date.now() - new Date(checkedAt).getTime();
  return elapsed >= 0 && elapsed < getCacheTtlMinutes() * 60_000;
}
