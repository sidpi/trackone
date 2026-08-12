// Shared domain types for shipments (mirrors sql/0001_shipments.sql).

export const SHIPMENT_STATUSES = [
  "pending",
  "in_transit",
  "out_for_delivery",
  "customs",
  "delivered",
  "cancelled",
] as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export interface Shipment {
  id: string;
  user_id: string;
  tracking_number: string;
  courier: string;
  nickname: string | null;
  status: ShipmentStatus;
  /** How this shipment got into the app: "manual" or "email" (Track 4). */
  source: "manual" | "email";
  /** Connected email that discovered it (email-sourced only). */
  source_email: string | null;
  /** Merchant / marketplace, e.g. "Amazon" (email-sourced only). */
  merchant: string | null;
  /** Estimated delivery date when extracted from email. */
  estimated_delivery: string | null;
  created_at: string;
  updated_at: string;
}

/** Payload for creating a new shipment (status defaults to "pending"). */
export type NewShipmentInput = {
  trackingNumber: string;
  courier: string;
  nickname: string;
};

/** Payload for updating an existing shipment. */
export type UpdateShipmentInput = NewShipmentInput & {
  status: ShipmentStatus;
};

/** One row of the tracking timeline (sql/0002_tracking.sql). */
export interface TrackingHistoryEntry {
  id: string;
  shipment_id: string;
  status: ShipmentStatus | null;
  message: string;
  location: string | null;
  occurred_at: string;
  raw: unknown | null;
  created_at: string;
}

/** Shipment row shape after 0002_tracking.sql columns are added. */
export type ShipmentWithTracking = Shipment & {
  tracking_checked_at: string | null;
  tracking_error: string | null;
  tracking_raw: unknown | null;
};

/** One connected email account (sql/0004_email_discovery.sql). */
export interface ConnectedEmail {
  id: string;
  email: string;
  provider: string;
  status: "connected" | "error" | "revoked";
  last_sync_at: string | null;
  last_sync_error: string | null;
  created_at: string;
}
