import { Clock } from "lucide-react";

import { formatDateTime } from "@/lib/format";
import type { ShipmentStatus, TrackingHistoryEntry } from "@/lib/types";

const DOT_COLORS: Record<ShipmentStatus, string> = {
  pending: "bg-amber-500",
  in_transit: "bg-sky-500",
  out_for_delivery: "bg-orange-500",
  customs: "bg-violet-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-red-500",
};

export function TrackingTimeline({
  history,
}: {
  history: TrackingHistoryEntry[];
}) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
        <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Clock className="size-5" />
        </span>
        <p className="text-sm font-medium">No tracking updates yet</p>
        <p className="text-xs text-muted-foreground">
          Hit “Refresh tracking” to check with the courier.
        </p>
      </div>
    );
  }

  return (
    <ol className="relative ml-3 border-l border-border pl-6">
      {history.map((entry) => (
        <li key={entry.id} className="relative pb-7 last:pb-0">
          <span
            aria-hidden
            className={`absolute top-1 -left-[31px] size-2.5 rounded-full ring-4 ring-background ${
              DOT_COLORS[entry.status ?? "pending"]
            }`}
          />
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium">{entry.message}</p>
            {entry.location && (
              <p className="text-xs text-muted-foreground">{entry.location}</p>
            )}
            <time className="text-xs text-muted-foreground" dateTime={entry.occurred_at}>
              {formatDateTime(entry.occurred_at)}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}
