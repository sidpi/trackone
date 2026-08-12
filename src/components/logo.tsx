import Link from "next/link";
import { Ship } from "lucide-react";

import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2.5", className)}
      aria-label="ShipTrack home"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Ship className="size-4" />
      </span>
      <span className="text-base font-semibold tracking-tight">
        ShipTrack
      </span>
    </Link>
  );
}
