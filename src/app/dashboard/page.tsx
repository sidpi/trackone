import type { Metadata } from "next";
import { Boxes } from "lucide-react";

import { AddShipmentButton } from "@/components/dashboard/add-shipment-button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your ShipTrack dashboard.",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Shipments
            </h1>
            <Badge variant="secondary">Track 1 placeholder</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Your shipments will appear here once Track 2 ships the APIs.
          </p>
        </div>
        <AddShipmentButton />
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-20 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Boxes className="size-7" />
        </span>
        <h2 className="mt-5 text-lg font-semibold">No shipments yet</h2>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          Shipment management is coming in Track 2. The dashboard is ready and
          waiting for your first shipment.
        </p>
        <div className="mt-6">
          <AddShipmentButton />
        </div>
      </div>
    </div>
  );
}
