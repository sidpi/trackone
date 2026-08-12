import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import {
  getTrackingProvider,
  isTrackingFresh,
  mapTagToStatus,
} from "@/lib/tracking";
import type { TrackingHistoryEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/tracking/refresh  { shipmentId }
 *
 * Securely refreshes tracking for ONE of the signed-in user's own
 * shipments: ownership is enforced by RLS + an explicit id lookup, and the
 * courier API key never leaves the server environment. A simple cache
 * (tracking_checked_at within TTL) skips the external call when fresh.
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const shipmentId = body?.shipmentId;
  if (typeof shipmentId !== "string" || !shipmentId.trim()) {
    return NextResponse.json(
      { error: "A shipmentId is required." },
      { status: 400 }
    );
  }

  // RLS scopes this to the user's own rows.
  const { data: shipment, error: fetchError } = await supabase
    .from("shipments")
    .select("*")
    .eq("id", shipmentId)
    .maybeSingle();

  if (fetchError) {
    console.error("Failed to load shipment for tracking:", fetchError.message);
    return NextResponse.json(
      { error: "Could not load the shipment." },
      { status: 500 }
    );
  }
  if (!shipment) {
    return NextResponse.json(
      { error: "Shipment not found." },
      { status: 404 }
    );
  }

  // ── Simple cache: skip the external API when recently synced ──
  if (isTrackingFresh(shipment.tracking_checked_at)) {
    return NextResponse.json({
      shipmentId,
      cached: true,
      provider: getTrackingProvider().name,
    });
  }

  // ── Call the courier API ──
  const provider = getTrackingProvider();
  let result;
  try {
    result = await provider.track(shipment.tracking_number, {
      createdAt: shipment.created_at,
      courierName: shipment.courier,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Tracking request failed.";
    console.error("Tracking refresh failed:", message);

    // Persist the error so the details page can show it; tracking_checked_at
    // is left untouched so retries are always allowed.
    await supabase
      .from("shipments")
      .update({ tracking_error: message })
      .eq("id", shipmentId);

    return NextResponse.json({ error: message }, { status: 502 });
  }

  // ── Dedupe + insert timeline entries ──
  const { data: existing, error: historyError } = await supabase
    .from("tracking_history")
    .select("occurred_at, message")
    .eq("shipment_id", shipmentId);

  if (historyError) {
    // Almost always means the 0002_tracking.sql migration hasn't been run.
    console.error("Failed to load tracking history:", historyError.message);
    return NextResponse.json(
      {
        error:
          "Tracking fetched, but the tracking database isn't set up yet — run sql/0002_tracking.sql in Supabase (SQL Editor).",
        detail: historyError.message,
      },
      { status: 500 }
    );
  }

  const seen = new Set(
    (existing ?? []).map((h: Pick<TrackingHistoryEntry, "occurred_at" | "message">) =>
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
      return NextResponse.json(
        { error: "Tracking fetched, but saving history failed." },
        { status: 500 }
      );
    }
  }

  // ── Update shipment status + cache ──
  const latestTag = result.checkpoints.at(-1)?.tag ?? result.tag;
  const { error: updateError } = await supabase
    .from("shipments")
    .update({
      status: mapTagToStatus(latestTag),
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
    return NextResponse.json(
      {
        error: "Tracking fetched, but updating the shipment failed.",
        detail: updateError.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    shipmentId,
    cached: false,
    provider: provider.name,
    added: newCheckpoints.length,
    status: mapTagToStatus(latestTag),
  });
}
