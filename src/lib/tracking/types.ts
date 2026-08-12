// Tracking provider abstraction. Swap AfterShip for another provider by
// adding a new implementation and updating the factory in index.ts.

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
  /** Optional human-readable title (AfterShip "title"). */
  title?: string;
  /** Shipment creation time (used by the mock provider). */
  createdAt?: string;
}

export interface TrackingProvider {
  name: "aftership" | "mock";
  track(slug: string, trackingNumber: string, opts?: TrackOptions): Promise<TrackResult>;
}
