"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BellRing, X } from "lucide-react";

import { ShipmentStatusBadge } from "@/components/dashboard/shipment-status-badge";
import { Button } from "@/components/ui/button";
import type { ShipmentWithTracking } from "@/lib/types";

const STATUS_TEXT: Record<ShipmentWithTracking["status"], string> = {
  pending: "Awaiting the first tracking update.",
  in_transit: "Your shipment is on the move.",
  out_for_delivery: "Out for delivery — keep an eye out.",
  customs: "Held in customs — nothing needed from you.",
  delivered: "Delivered. Enjoy!",
  cancelled: "This shipment was cancelled.",
};

/**
 * Floating frosted-glass notification (CodeFronts dashboard overlay pattern
 * adapted): shows the latest shipment's status in a glass panel pinned to
 * the bottom-right, with a link to the shipment and a dismiss button.
 */
export function ShipmentAlert({ shipment }: { shipment: ShipmentWithTracking }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  const label = shipment.nickname || shipment.tracking_number;

  return (
    <div
      role="alert"
      className="glass-notify fixed right-4 bottom-4 left-4 z-50 flex gap-3 rounded-2xl p-4 sm:left-auto sm:w-96"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-300">
        <BellRing className="size-4.5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold" title={label}>
            {label}
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Dismiss notification"
            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-muted-foreground">
            {shipment.courier}
          </p>
          <ShipmentStatusBadge status={shipment.status} />
        </div>

        <p className="mt-1.5 text-sm text-muted-foreground">
          {STATUS_TEXT[shipment.status]}
        </p>

        <div className="mt-3">
          <Button size="sm" render={<Link href={`/dashboard/shipments/${shipment.id}`} />}>
            View shipment
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </div>
  );
}
