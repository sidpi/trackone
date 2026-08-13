import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  CircleDashed,
  Package,
  Plus,
  Ship,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const previewRows = [
  { id: "SH-1042", origin: "Shanghai", dest: "Los Angeles", status: "In transit" },
  { id: "SH-1041", origin: "Rotterdam", dest: "New York", status: "Customs" },
  { id: "SH-1040", origin: "Singapore", dest: "Sydney", status: "Delivered" },
];

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "Delivered"
      ? "text-emerald-600 dark:text-emerald-400"
      : status === "Customs"
        ? "text-amber-600 dark:text-amber-400"
        : "text-sky-600 dark:text-sky-400";

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${tone}`}>
      {status === "Delivered" ? (
        <CheckCircle2 className="size-3.5" />
      ) : (
        <CircleDashed className="size-3.5" />
      )}
      {status}
    </span>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-24 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-40 -left-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute top-64 -right-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-6 gap-1.5">
            <Ship className="size-3" />
            ShipTrack · Tracking live
          </Badge>

          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Shipment tracking,{" "}
            <span className="bg-linear-to-r from-primary via-sky-600 to-indigo-600 bg-clip-text text-transparent dark:from-primary dark:via-sky-400 dark:to-indigo-400">
              simplified
            </span>
            .
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-pretty text-muted-foreground">
            One clean dashboard for every shipment. Know where your cargo is,
            what&apos;s next, and who&apos;s handling it — without the spreadsheet chaos.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto" render={<Link href="/login?next=/dashboard" />}>
              Sign in to your dashboard
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              render={<Link href="#features" />}
            >
              Explore features
            </Button>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Secure sign-in powered by Supabase · Postgres under the hood
          </p>
        </div>

        {/* Mock dashboard preview */}
        <div className="relative mx-auto mt-16 max-w-4xl sm:mt-20">
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 rounded-3xl bg-linear-to-b from-primary/10 to-transparent blur-2xl"
          />

          <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl">
            {/* Window chrome */}
            <div className="flex items-center gap-1.5 border-b bg-muted/40 px-4 py-2.5">
              <span className="size-2.5 rounded-full bg-red-400/80" />
              <span className="size-2.5 rounded-full bg-amber-400/80" />
              <span className="size-2.5 rounded-full bg-emerald-400/80" />
              <span className="ml-3 hidden flex-1 truncate rounded-md bg-background px-2 py-0.5 text-xs text-muted-foreground sm:block">
                track.sidcandev.online/dashboard
              </span>
            </div>

            <div className="flex">
              {/* Mini sidebar */}
              <aside className="hidden w-44 shrink-0 flex-col gap-1 border-r p-3 sm:flex">
                <div className="mb-2 flex items-center gap-2 px-2">
                  <span className="flex size-5 items-center justify-center rounded bg-primary text-primary-foreground">
                    <Ship className="size-3" />
                  </span>
                  <span className="text-xs font-semibold">ShipTrack</span>
                </div>
                {[
                  { icon: Package, label: "Shipments", active: true },
                  { icon: Boxes, label: "Containers", active: false },
                  { icon: CircleDashed, label: "Tracking", active: false },
                ].map(({ icon: Icon, label, active }) => (
                  <span
                    key={label}
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${
                      active
                        ? "bg-primary/10 font-medium text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="size-3.5" />
                    {label}
                  </span>
                ))}
              </aside>

              {/* Mini content */}
              <div className="min-w-0 flex-1 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Shipments</p>
                    <p className="text-xs text-muted-foreground">
                      3 recent shipments
                    </p>
                  </div>
                  <span className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-xs font-medium text-primary-foreground">
                    <Plus className="size-3.5" />
                    Add shipment
                  </span>
                </div>

                <div className="mt-4 divide-y rounded-lg border">
                  {previewRows.map((row) => (
                    <div
                      key={row.id}
                      className="flex items-center justify-between gap-3 px-3 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <Package className="size-3.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium">{row.id}</p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {row.origin} → {row.dest}
                          </p>
                        </div>
                      </div>
                      <StatusPill status={row.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating chip */}
          <div className="absolute -top-4 -right-2 hidden rotate-2 items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium shadow-lg sm:flex">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            Live · session secured
          </div>
        </div>
      </div>
    </section>
  );
}
