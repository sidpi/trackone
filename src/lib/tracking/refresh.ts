import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ShipmentStatus,
  ShipmentWithTracking,
  TrackingHistoryEntry,
} from "@/lib/types";
import { getTrackingProvider, isTrackingFresh, mapTagToStatus } from "./index";

export type RefreshOutcome =
  | {
      ok: true;
      shipmentId: string;
      cached: boolean;
      provider: string;
      added: number;
      status: ShipmentStatus;
      lastChecked?: string;
    }
  | {
      ok: false;
      shipmentId: string;
      error: string;
      detail?: string;
      /** Suggested HTTP status for API responses. */
      httpStatus: number;
    };

/**
 * Refreshes tracking for ONE shipment. Ownership is enforced by RLS — the
 * caller passes the signed-in user's Supabase client, so the queries can
 * never touch another user's rows.
 *
 * Shared by the /api/tracking/refresh route, the create-shipment server
 * action and the email sync engine so every entry point behaves identically.
 *
 * opts.force — an explicit user click bypasses the freshness cache; automatic
 * refreshes (create, email sync, dashboard) respect the TTL instead.
 */
export async function refreshShipmentTracking(
  supabase: SupabaseClient,
  shipmentId: string,
  opts: { force?: boolean } = {}
): Promise<RefreshOutcome> {
  const { data: shipment, error: fetchError } = await supabase
    .from("shipments")
    .select("*")
    .eq("id", shipmentId)
    .maybeSingle();

  if (fetchError) {
    console.error("Failed to load shipment for tracking:", fetchError.message);
    return {
      ok: false,
      shipmentId,
      error: "Could not load the shipment.",
      httpStatus: 500,
    };
  }
  if (!shipment) {
    return {
      ok: false,
      shipmentId,
      error: "Shipment not found.",
      httpStatus: 404,
    };
  }

  const row = shipment as ShipmentWithTracking;
  const force = opts.force === true;

  // ── Load existing history (needed for dedupe + cache check) ──
  const { data: existing, error: historyError } = await supabase
    .from("tracking_history")
    .select("occurred_at, message")
    .eq("shipment_id", shipmentId);

  if (historyError) {
    // Almost always means the 0002_tracking.sql migration hasn't been run.
    console.error("Failed to load tracking history:", historyError.message);
    return {
      ok: false,
      shipmentId,
      error:
        "Tracking fetched, but the tracking database isn't set up yet — run sql/0002_tracking.sql in Supabase (SQL Editor).",
      detail: historyError.message,
      httpStatus: 500,
    };
  }

  const history = existing ?? [];

  // ── Simple cache: skip the external API when recently synced AND the
  //    timeline actually has data (self-heals shipments whose earlier
  //    refresh saved nothing). An explicit user click (force) bypasses it. ──
  if (!force && isTrackingFresh(row.tracking_checked_at) && history.length > 0) {
    return {
      ok: true,
      shipmentId,
      cached: true,
      provider: getTrackingProvider().name,
      added: 0,
      status: row.status,
      lastChecked: row.tracking_checked_at ?? undefined,
    };
  }

  // ── Call the courier API ──
  const provider = getTrackingProvider();
  let result;
  try {
    result = await provider.track(row.tracking_number, {
      createdAt: row.created_at,
      courierName: row.courier,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Tracking request failed.";
    console.error("Tracking refresh failed:", message);

    // Persist the error so the details page can show it; tracking_checked_at
    // is left untouched so retries are always allowed.
    await supabase
      .from("shipments")
      .update({ tracking_error: message })
      .eq("id", shipmentId);

    return {
      ok: false,
      shipmentId,
      error: message,
      httpStatus: 502,
    };
  }

  // ── Dedupe + insert timeline entries ──
  const seen = new Set(
    history.map(
      (h: Pick<TrackingHistoryEntry, "occurred_at" | "message">) =>
        `${h.occurred_at}|${h.message}`
    )
  );

  const newCheckpoints = result.checkpoints.filter(
    (c) => !seen.has(`${c.occurredAt}|${c.message}`)
  );

  if (newCheckpoints.length > 0) {
    const { error: insertError } = await supabase
      .from("tracking_history")
      .insert(
        newCheckpoints.map((c) => ({
          shipment_id: shipmentId,
          status: mapTagToStatus(c.tag),
          message: c.message,
          location: c.location,
          occurred_at: c.occurredAt,
          raw: c.raw ?? null,
        }))
      );

    if (insertError) {
      console.error("Failed to persist tracking history:", insertError.message);
      return {
        ok: false,
        shipmentId,
        error: "Tracking fetched, but saving history failed.",
        httpStatus: 500,
      };
    }
  }

  // ── Update shipment status + cache ──
  const latestTag = result.checkpoints.at(-1)?.tag ?? result.tag;
  let status = mapTagToStatus(latestTag);
  // Terminal-delivery rule: a package whose timeline contains a delivered
  // checkpoint IS delivered, even when the provider's newest entry is a
  // stale "in transit" row or a delivery without a reliable timestamp.
  // Only a later cancelled/returned checkpoint overrides it.
  const deliveredIndex = result.checkpoints.findIndex(
    (c) => mapTagToStatus(c.tag) === "delivered"
  );
  if (deliveredIndex !== -1) {
    const laterCancelled = result.checkpoints
      .slice(deliveredIndex + 1)
      .some((c) => mapTagToStatus(c.tag) === "cancelled");
    if (!laterCancelled) status = "delivered";
  }

  const { error: updateError } = await supabase
    .from("shipments")
    .update({
      status,
      tracking_raw: result.raw,
      tracking_checked_at: new Date().toISOString(),
      tracking_error: null,
    })
    .eq("id", shipmentId);

  if (updateError) {
    console.error("Failed to update shipment status:", updateError.message);
    // Best effort: persist the error so the details page can show it.
    await supabase
      .from("shipments")
      .update({ tracking_error: updateError.message })
      .eq("id", shipmentId);
    return {
      ok: false,
      shipmentId,
      error: "Tracking fetched, but updating the shipment failed.",
      detail: updateError.message,
      httpStatus: 500,
    };
  }

  return {
    ok: true,
    shipmentId,
    cached: false,
    provider: provider.name,
    added: newCheckpoints.length,
    status,
  };
}
