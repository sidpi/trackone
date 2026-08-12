// Shared domain types for shipments (mirrors sql/0001_shipments.sql).

export const SHIPMENT_STATUSES = [
  "pending",
  "in_transit",
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
