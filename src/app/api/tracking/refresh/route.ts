import { NextResponse } from "next/server";

import { refreshShipmentTracking } from "@/lib/tracking/refresh";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/tracking/refresh  { shipmentId, force? }
 *
 * Securely refreshes tracking for ONE of the signed-in user's own
 * shipments: ownership is enforced by RLS + an explicit id lookup, and the
 * courier API key never leaves the server environment. A simple cache
 * (tracking_checked_at within TTL) skips the external call when fresh —
 * an explicit user click (force: true) always re-checks with the courier.
 * The heavy lifting lives in src/lib/tracking/refresh.ts, shared with the
 * create-shipment action and the email sync engine.
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
  // An explicit user click always hits the courier; the cache only applies
  // to automatic/programmatic refreshes.
  const force = body?.force === true;

  const outcome = await refreshShipmentTracking(supabase, shipmentId, { force });

  if (!outcome.ok) {
    return NextResponse.json(
      { error: outcome.error, detail: outcome.detail },
      { status: outcome.httpStatus }
    );
  }

  return NextResponse.json({
    shipmentId: outcome.shipmentId,
    cached: outcome.cached,
    provider: outcome.provider,
    added: outcome.added,
    status: outcome.status,
    lastChecked: outcome.lastChecked,
  });
}
