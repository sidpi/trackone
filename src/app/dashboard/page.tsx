import type { Metadata } from "next";
import Link from "next/link";
import { Boxes } from "lucide-react";

import { AddShipmentButton } from "@/components/dashboard/add-shipment-button";
import { ShipmentsAutoRefresh } from "@/components/dashboard/shipments-auto-refresh";
import { ShipmentsTable } from "@/components/dashboard/shipments-table";
import { SyncNowButton } from "@/components/dashboard/sync-now-button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { isTrackingFresh } from "@/lib/tracking";
import type { ShipmentStatus, ShipmentWithTracking } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your ShipTrack dashboard.",
};

export const dynamic = "force-dynamic";

/** Filter tabs → the shipment status(es) they match. */
const FILTERS: Array<{
  key: string;
  label: string;
  status?: ShipmentStatus;
}> = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming", status: "pending" },
  { key: "in_transit", label: "In transit", status: "in_transit" },
  { key: "out_for_delivery", label: "Out for delivery", status: "out_for_delivery" },
  { key: "delivered", label: "Delivered", status: "delivered" },
  { key: "exception", label: "Exception", status: "cancelled" },
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusKey } = await searchParams;
  const activeFilter = FILTERS.find((f) => f.key === statusKey) ?? FILTERS[0];

  const supabase = await createClient();

  let query = supabase.from("shipments").select("*");
  if (activeFilter.status) {
    query = query.eq("status", activeFilter.status);
  }
  const { data: shipments, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) {
    console.error("Failed to load shipments:", error.message);
  }

  const rows = (shipments ?? []) as ShipmentWithTracking[];

  // Shipments that should auto-refresh in the background after this page
  // renders: anything never checked (e.g. created before auto-sync, or whose
  // first check failed) plus stale non-terminal shipments. Terminal statuses
  // (delivered / cancelled) are not re-checked to keep provider quota low.
  const autoRefreshIds = rows
    .filter((s) => {
      if (!s.tracking_checked_at) return true;
      if (s.status === "delivered" || s.status === "cancelled") return false;
      return !isTrackingFresh(s.tracking_checked_at);
    })
    // Bound the per-visit work so a big list can't stall the page.
    .slice(0, 10)
    .map((s) => s.id);

  const { count: emailCount } = await supabase
    .from("connected_emails")
    .select("id", { count: "exact", head: true });

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Shipments</h1>
            <Badge variant="secondary">Tracks 1–4 · Live</Badge>
            <ShipmentsAutoRefresh shipmentIds={autoRefreshIds} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {rows.length === 0
              ? "Add a shipment manually or connect an email to discover them automatically."
              : `${rows.length} shipment${rows.length === 1 ? "" : "s"} — only you can see these.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SyncNowButton hasConnectedEmails={(emailCount ?? 0) > 0} />
          <AddShipmentButton />
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {FILTERS.map((filter) => {
          const active = filter.key === activeFilter.key;
          return (
            <Link
              key={filter.key}
              href={filter.key === "all" ? "/dashboard" : `/dashboard?status=${filter.key}`}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                active
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {rows.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Boxes className="size-7" />
          </span>
          <h2 className="mt-5 text-lg font-semibold">
            {activeFilter.status ? "No shipments in this view" : "No shipments yet"}
          </h2>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            {activeFilter.status
              ? "Shipments that match this status will show up here."
              : "Add a shipment manually, or connect an email account in Settings to discover tracking numbers automatically."}
          </p>
          <div className="mt-6 flex items-center gap-2">
            <SyncNowButton hasConnectedEmails={(emailCount ?? 0) > 0} />
            <AddShipmentButton />
          </div>
        </div>
      ) : (
        <ShipmentsTable shipments={rows} />
      )}
    </div>
  );
}
