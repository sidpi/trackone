import type { ShipmentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<ShipmentStatus, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  in_transit: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  customs: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  delivered: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  pending: "Pending",
  in_transit: "In transit",
  customs: "Customs",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function ShipmentStatusBadge({
  status,
  className,
}: {
  status: ShipmentStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit items-center gap-1.5 rounded-full px-2 text-xs font-medium",
        STATUS_STYLES[status],
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {STATUS_LABELS[status]}
    </span>
  );
}
