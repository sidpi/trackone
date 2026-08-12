"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SyncNowButton({ hasConnectedEmails }: { hasConnectedEmails: boolean }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  if (!hasConnectedEmails) {
    return (
      <Link
        href="/dashboard/settings"
        className={cn(buttonVariants({ variant: "outline" }))}
      >
        <RefreshCw data-icon="inline-start" />
        Sync Now
      </Link>
    );
  }

  async function handle() {
    setPending(true);
    try {
      const res = await fetch("/api/emails/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        results?: Array<{ stats: { created: number; associated: number } }>;
      };
      if (!res.ok) {
        toast.error(data.error ?? "Sync failed.");
        return;
      }
      const found = (data.results ?? []).reduce(
        (acc, r) => acc + r.stats.created + r.stats.associated,
        0
      );
      toast.success(
        found > 0
          ? `Synced — ${found} shipment${found === 1 ? "" : "s"} found.`
          : "Synced — no new shipments found."
      );
      router.refresh();
    } catch {
      toast.error("Network error while syncing.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button variant="outline" onClick={handle} disabled={pending}>
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <RefreshCw data-icon="inline-start" />
      )}
      {pending ? "Syncing…" : "Sync Now"}
    </Button>
  );
}
