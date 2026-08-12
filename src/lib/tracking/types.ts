// Tracking provider abstraction. Add a provider by implementing this
// interface and registering it in the factory in index.ts.

export interface TrackingCheckpoint {
  /** ISO timestamp of the event. */
  occurredAt: string;
  /** Provider tag, e.g. "in_transit", "delivered". */
  tag: string;
  /** Human-readable message, e.g. "Package arrived at hub". */
  message: string;
  /** Optional location, e.g. "Louisville, KY". */
  location: string | null;
  /** Raw provider payload for this checkpoint (optional). */
  raw?: unknown;
}

export interface TrackResult {
  /** Overall provider tag, e.g. "in_transit". */
  tag: string;
  /** Checkpoints ordered oldest → newest. */
  checkpoints: TrackingCheckpoint[];
  /** Full raw provider payload (stored on the shipment as a cache). */
  raw: unknown;
}

export interface TrackOptions {
  /** Shipment creation time (used by the mock provider). */
  createdAt?: string;
  /** Courier display name (e.g. "Ekart") — used by providers that need it. */
  courierName?: string;
}

export interface TrackingProvider {
  name: "trackcourier" | "ship24" | "indian-courier-api" | "chain" | "mock";
  track(trackingNumber: string, opts?: TrackOptions): Promise<TrackResult>;
}
