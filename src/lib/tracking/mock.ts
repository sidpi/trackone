import type { TrackingProvider, TrackResult } from "./types";

/**
 * Mock provider — used when AFTERSHIP_API_KEY is not set so the feature is
 * demoable locally. Progresses deterministically based on how long the
 * shipment has existed. Never used in production once a real key is set.
 */
export const mockProvider: TrackingProvider = {
  name: "mock",

  async track(_slug, trackingNumber, opts) {
    const created = opts?.createdAt ? new Date(opts.createdAt).getTime() : Date.now();
    const ageDays = (Date.now() - created) / 86_400_000;
    const seed = [...trackingNumber].reduce((acc, c) => acc + c.charCodeAt(0), 0);

    // Deterministic "hub" names from the tracking number so re-fetches are stable.
    const hubs = ["Origin hub", "Regional hub", "Destination hub"];
    const hub = hubs[seed % hubs.length];

    const checkpoints: TrackResult["checkpoints"] = [
      {
        occurredAt: new Date(created).toISOString(),
        tag: "inforeceived",
        message: "Shipment information received",
        location: null,
      },
    ];

    if (ageDays >= 0.3) {
      checkpoints.push({
        occurredAt: new Date(created + 0.3 * 86_400_000).toISOString(),
        tag: "intransit",
        message: "Package picked up by courier",
        location: hub,
      });
    }
    if (ageDays >= 1) {
      checkpoints.push({
        occurredAt: new Date(created + 1 * 86_400_000).toISOString(),
        tag: "intransit",
        message: "In transit to destination",
        location: "Transit network",
      });
    }
    if (ageDays >= 3) {
      checkpoints.push({
        occurredAt: new Date(created + 3 * 86_400_000).toISOString(),
        tag: "intransit",
        message: "Arrived at destination hub",
        location: hub,
      });
    }
    if (ageDays >= 5) {
      checkpoints.push({
        occurredAt: new Date(created + 5 * 86_400_000).toISOString(),
        tag: "delivered",
        message: "Delivered — package left with recipient",
        location: "Recipient address",
      });
    }

    return {
      tag: checkpoints.at(-1)!.tag,
      checkpoints,
      raw: { provider: "mock", tracking_number: trackingNumber },
    };
  },
};
