import type { Metadata } from "next";
import { Boxes } from "lucide-react";

import { AddShipmentButton } from "@/components/dashboard/add-shipment-button";
import { ShipmentsTable } from "@/components/dashboard/shipments-table";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import type { Shipment } from "@/lib/types";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your ShipTrack dashboard.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: shipments, error } = await supabase
    .from("shipments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load shipments:", error.message);
  }

  const rows = (shipments ?? []) as Shipment[];

  return (
    <div className="flex flex-col gap-8">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Shipments</h1>
            <Badge variant="secondary">Track 2 · Live</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {rows.length === 0
              ? "Add your first shipment to start tracking."
              : `${rows.length} shipment${rows.length === 1 ? "" : "s"} — only you can see these.`}
          </p>
        </div>
        <AddShipmentButton />
      </div>

      {rows.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-20 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Boxes className="size-7" />
          </span>
          <h2 className="mt-5 text-lg font-semibold">No shipments yet</h2>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            Create your first shipment with a tracking number and courier, then
            update its status as it moves.
          </p>
          <div className="mt-6">
            <AddShipmentButton />
          </div>
        </div>
      ) : (
        <ShipmentsTable shipments={rows} />
      )}
    </div>
  );
}
