import Link from "next/link";
import { Package } from "lucide-react";

import { ShipmentRowActions } from "@/components/dashboard/shipment-row-actions";
import { ShipmentStatusBadge } from "@/components/dashboard/shipment-status-badge";
import { extractTrackingSummary } from "@/lib/tracking/summary";
import type { ShipmentWithTracking } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ShipmentRow({ shipment }: { shipment: ShipmentWithTracking }) {
  const label = shipment.nickname || shipment.tracking_number;
  // Prefer the delivery estimate extracted from the order email; fall back to
  // the courier provider's ETA from the cached tracking payload.
  const eta =
    shipment.estimated_delivery ??
    extractTrackingSummary(shipment.tracking_raw).eta ??
    null;

  return (
    <tr className="transition-colors hover:bg-muted/40">
      <td className="px-4 py-3">
        <Link
          href={`/dashboard/shipments/${shipment.id}`}
          className="group flex items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            <Package className="size-4" />
          </span>
          <div className="min-w-0">
            <p
              className="truncate font-medium transition-colors group-hover:text-primary"
              title={label}
            >
              {label}
            </p>
            <p className="truncate font-mono text-xs text-muted-foreground">
              {shipment.tracking_number}
            </p>
            {shipment.merchant && (
              <p className="truncate text-xs text-muted-foreground/80">
                {shipment.merchant}
              </p>
            )}
          </div>
        </Link>
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        <span className="block">{shipment.courier}</span>
        {shipment.source === "email" && shipment.source_email && (
          <span className="block text-xs text-muted-foreground/70">
            via {shipment.source_email}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <ShipmentStatusBadge status={shipment.status} />
      </td>
      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
        {eta ? formatDate(eta) : "—"}
      </td>
      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
        {formatDate(shipment.created_at)}
      </td>
      <td className="px-4 py-3">
        <ShipmentRowActions shipment={shipment} />
      </td>
    </tr>
  );
}

export function ShipmentsTable({ shipments }: { shipments: ShipmentWithTracking[] }) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Tracking</th>
              <th className="px-4 py-3 font-medium">Courier</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">
                Est. delivery
              </th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">
                Created
              </th>
              <th className="px-4 py-3 text-right font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {shipments.map((shipment) => (
              <ShipmentRow key={shipment.id} shipment={shipment} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
