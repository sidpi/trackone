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
