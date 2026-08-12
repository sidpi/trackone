"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  CircleAlert,
  Loader2,
  Mail,
  RefreshCw,
  Unplug,
} from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { timeAgo } from "@/lib/format";
import type { ConnectedEmail } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SyncPayload {
  error?: string;
  results?: Array<{ stats: { created: number; associated: number } }>;
}

export function ConnectedEmails({
  emails,
  connected,
  error,
}: {
  emails: ConnectedEmail[];
  /** True when we just landed from the OAuth callback (auto-sync once). */
  connected: boolean;
  /** Error reason from the OAuth callback, if any. */
  error: string | null;
}) {
  const router = useRouter();
  const [syncingId, setSyncingId] = React.useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = React.useState<string | null>(null);

  async function runSync(emailId: string | null) {
    const key = emailId ?? "all";
    setSyncingId(key);
    try {
      const res = await fetch("/api/emails/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailId ? { emailId } : {}),
      });
      const data = (await res.json().catch(() => ({}))) as SyncPayload;
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
          ? `Sync complete — ${found} shipment${found === 1 ? "" : "s"} found.`
          : "Sync complete — no new shipments found."
      );
      router.refresh();
    } catch {
      toast.error("Network error while syncing.");
    } finally {
      setSyncingId(null);
    }
  }

  async function disconnect(emailId: string, email: string) {
    if (
      !window.confirm(
        `Disconnect ${email}? Shipments already discovered from this email will be kept.`
      )
    ) {
      return;
    }
    setDisconnectingId(emailId);
    try {
      const res = await fetch("/api/emails/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(data.error ?? "Couldn't disconnect the email.");
        return;
      }
      toast.success(`${email} disconnected.`);
      router.refresh();
    } catch {
      toast.error("Network error while disconnecting.");
    } finally {
      setDisconnectingId(null);
    }
  }

  /** Syncs ALL connected emails (no spinner state — used after OAuth callback). */
  async function syncAll() {
    try {
      const res = await fetch("/api/emails/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = (await res.json().catch(() => ({}))) as SyncPayload;
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
          ? `Sync complete — ${found} shipment${found === 1 ? "" : "s"} found.`
          : "Sync complete — no new shipments found."
      );
      router.refresh();
    } catch {
      toast.error("Network error while syncing.");
    }
  }

  // Auto-sync once when we arrive from the OAuth callback.
  React.useEffect(() => {
    if (connected) {
      syncAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  const busy = syncingId !== null || disconnectingId !== null;

  return (
    <div className="flex flex-col gap-4">
      {connected && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-600 dark:text-emerald-400">
          Email connected! Syncing for shipment tracking numbers…
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <CircleAlert className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {emails.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Mail className="size-6" />
          </span>
          <h3 className="mt-4 text-base font-semibold">No connected emails yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Connect an email account to automatically discover shipment and
            order tracking numbers. Your password is never used — access is
            authorized with Google OAuth.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-xl border">
          {emails.map((email) => (
            <li
              key={email.id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Mail className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <span className="truncate">{email.email}</span>
                    {email.status === "connected" ? (
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                    ) : (
                      <CircleAlert className="size-4 shrink-0 text-destructive" />
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {email.last_sync_at
                      ? `Last synced ${timeAgo(email.last_sync_at)}`
                      : "Never synced"}
                    {email.last_sync_error && ` · ${email.last_sync_error}`}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => runSync(email.id)}
                  disabled={busy}
                >
                  {syncingId === email.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <RefreshCw data-icon="inline-start" />
                  )}
                  {syncingId === email.id ? "Syncing…" : "Sync Now"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => disconnect(email.id, email.email)}
                  disabled={busy}
                >
                  {disconnectingId === email.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Unplug data-icon="inline-start" />
                  )}
                  Disconnect
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/api/emails/connect"
        className={cn(buttonVariants({ variant: "outline" }), "w-fit")}
      >
        <Mail data-icon="inline-start" />
        Connect another email
      </Link>
    </div>
  );
}
