import { aftershipProvider } from "./aftership";
import { mockProvider } from "./mock";
import type { TrackingProvider } from "./types";
import type { ShipmentStatus } from "@/lib/types";

/**
 * Returns the real provider when an API key is configured, otherwise the
 * mock provider (clearly labeled in the UI so nobody mistakes it for real
 * tracking data).
 */
export function getTrackingProvider(): TrackingProvider {
  return process.env.AFTERSHIP_API_KEY ? aftershipProvider : mockProvider;
}

export function isMockProvider(): boolean {
  return !process.env.AFTERSHIP_API_KEY;
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
