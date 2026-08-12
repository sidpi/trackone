"use client";

import * as React from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/format";

export function TrackingRefreshButton({ shipmentId }: { shipmentId: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  async function handleRefresh() {
    setIsPending(true);
    try {
      const res = await fetch("/api/tracking/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipmentId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        detail?: string;
        cached?: boolean;
        lastChecked?: string;
        added?: number;
      };

      if (!res.ok) {
        toast.error(
          data.detail
            ? `${data.error ?? "Tracking refresh failed."} (${data.detail})`
            : (data.error ?? "Tracking refresh failed.")
        );
        return;
      }
      if (data.cached) {
        toast.info(
          data.lastChecked
            ? `Tracking is up to date (last checked ${timeAgo(data.lastChecked)}).`
            : "Tracking is already up to date."
        );
      } else if ((data.added ?? 0) > 0) {
        toast.success(
          `Tracking updated — ${data.added} new update${data.added === 1 ? "" : "s"}.`
        );
      } else {
        toast.success("No new tracking updates.");
      }
      router.refresh();
    } catch {
      toast.error("Network error while refreshing tracking.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleRefresh}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <RefreshCw data-icon="inline-start" />
      )}
      {isPending ? "Checking…" : "Refresh tracking"}
    </Button>
  );
}
