/**
 * Extracts a human-readable journey summary (origin, destination, ETA,
 * latest status text) from a cached provider payload (`shipments.tracking_raw`).
 * Handles TrackCourier and Ship24 shapes; returns only what's available.
 */

export interface TrackingSummary {
  /** e.g. TrackCourier "MostRecentStatus" or Ship24 statusMilestone. */
  currentStatus?: string;
  origin?: string;
  destination?: string;
  eta?: string;
}

export function extractTrackingSummary(raw: unknown): TrackingSummary {
  if (!raw || typeof raw !== "object") return {};
  const data = (raw as { data?: Record<string, unknown> }).data;
  if (!data || typeof data !== "object") return {};

  const s: TrackingSummary = {};

  // TrackCourier: documented top-level fields (may be absent for some couriers).
  for (const [key, value] of Object.entries(data)) {
    if (typeof value !== "string" || !value.trim()) continue;
    if (/^MostRecentStatus$/i.test(key)) s.currentStatus = value.trim();
    else if (/^OriginCity$/i.test(key)) s.origin = value.trim();
    else if (/^DestinationCity$/i.test(key)) s.destination = value.trim();
    else if (/^(ExpectedDeliveryDate|DeliveredDate)$/i.test(key) && !s.eta) {
      s.eta = value.trim();
    }
  }

  // Ship24: shipment-level fields under data.trackings[0].shipment.
  const trackings = data.trackings as
    | Array<{ shipment?: Record<string, unknown> }>
    | undefined;
  const shipment = trackings?.[0]?.shipment;
  if (shipment && typeof shipment === "object") {
    const delivery = shipment.delivery as
      | { estimatedDeliveryDate?: string | null }
      | null
      | undefined;
    if (delivery?.estimatedDeliveryDate && !s.eta) {
      s.eta = delivery.estimatedDeliveryDate;
    }

    const recipient = shipment.recipient as
      | { city?: string | null }
      | null
      | undefined;
    const destCity = recipient?.city ?? undefined;
    const destCountry =
      typeof shipment.destinationCountryCode === "string"
        ? shipment.destinationCountryCode
        : undefined;
    if (destCity || destCountry) {
      s.destination ??= [destCity, destCountry].filter(Boolean).join(", ");
    }

    if (!s.origin && typeof shipment.originCountryCode === "string") {
      s.origin = shipment.originCountryCode;
    }
    if (!s.currentStatus && typeof shipment.statusMilestone === "string") {
      s.currentStatus = shipment.statusMilestone;
    }
  }

  return s;
}
