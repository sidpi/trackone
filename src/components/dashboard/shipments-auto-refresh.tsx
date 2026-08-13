"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Silently refreshes tracking for shipments whose cached data is missing or
 * stale, so the dashboard always shows the current status without the user
 * clicking "Refresh tracking". Each shipment is checked in order via the
 * server-side refresh endpoint (which enforces ownership and the 15-minute
 * cache, so provider quota stays low). The list refreshes when it's done.
 */
export function ShipmentsAutoRefresh({
  shipmentIds,
}: {
  shipmentIds: string[];
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(shipmentIds.length > 0);
  const [done, setDone] = React.useState(0);

  React.useEffect(() => {
    if (shipmentIds.length === 0) return;
    let cancelled = false;

    (async () => {
      for (const id of shipmentIds) {
        if (cancelled) return;
        try {
          await fetch("/api/tracking/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shipmentId: id }),
          });
        } catch {
          // Ignore network blips; the row is picked up on the next visit.
        }
        if (!cancelled) setDone((d) => d + 1);
      }
      if (!cancelled) {
        setPending(false);
        router.refresh();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shipmentIds, router]);

  if (!pending) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <Loader2 className="size-3 animate-spin" />
      Updating tracking… {done}/{shipmentIds.length}
    </span>
  );
}
