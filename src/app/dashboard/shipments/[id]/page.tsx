import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FlaskConical, MapPin, TriangleAlert } from "lucide-react";

import { ShipmentStatusBadge } from "@/components/dashboard/shipment-status-badge";
import { TrackingRefreshButton } from "@/components/dashboard/tracking-refresh-button";
import { TrackingTimeline } from "@/components/dashboard/tracking-timeline";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, formatDateTime, timeAgo } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { isMockProvider } from "@/lib/tracking";
import { extractTrackingSummary } from "@/lib/tracking/summary";
import type { TrackingHistoryEntry } from "@/lib/types";

export const metadata: Metadata = {
  title: "Shipment",
  description: "Shipment tracking details and timeline.",
};

export const dynamic = "force-dynamic";

export default async function ShipmentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: shipment, error } = await supabase
    .from("shipments")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !shipment) {
    notFound();
  }

  const { data: history } = await supabase
    .from("tracking_history")
    .select("*")
    .eq("shipment_id", id)
    .order("occurred_at", { ascending: false });

  const timeline = (history ?? []) as TrackingHistoryEntry[];
  const title = shipment.nickname || shipment.tracking_number;
  const mock = isMockProvider();
  const summary = extractTrackingSummary(shipment.tracking_raw);
  const latest = timeline[0];

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to shipments
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-semibold tracking-tight" title={title}>
              {title}
            </h1>
            <ShipmentStatusBadge status={shipment.status} />
          </div>
          <p className="mt-1 truncate font-mono text-sm text-muted-foreground">
            {shipment.tracking_number} · {shipment.courier}
          </p>
        </div>
        <TrackingRefreshButton shipmentId={shipment.id} />
      </div>

      {mock && (
        <div className="flex items-center gap-2 rounded-lg border border-dashed bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
          <FlaskConical className="size-4 shrink-0" />
          Demo mode — no courier provider key configured, so updates are
          simulated. Set <code className="font-mono">TRACKCOURIER_API_KEY</code> or{" "}
          <code className="font-mono">SHIP24_API_KEY</code> for live tracking.
        </div>
      )}

      {shipment.tracking_error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <TriangleAlert className="size-4 shrink-0" />
          <span>
            Tracking update failed: <strong>{shipment.tracking_error}</strong>.
            Try refreshing again in a moment.
          </span>
        </div>
      )}

      {latest && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="flex-row items-center justify-between gap-2 py-4">
            <CardTitle className="text-sm">Latest update</CardTitle>
            <ShipmentStatusBadge status={latest.status ?? shipment.status} />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm font-medium">{latest.message}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {latest.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {latest.location}
                </span>
              )}
              <time dateTime={latest.occurred_at}>{timeAgo(latest.occurred_at)}</time>
            </div>
            {(summary.origin || summary.destination || summary.eta) && (
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                {summary.origin && summary.destination && (
                  <span>
                    {summary.origin} <span aria-hidden>→</span> {summary.destination}
                  </span>
                )}
                {summary.eta && (
                  <span>Expected delivery: {formatDate(summary.eta)}</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tracking timeline</CardTitle>
            <CardDescription>
              Latest updates first, most recent at the top.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TrackingTimeline history={timeline} />
          </CardContent>
        </Card>

        {/* Details */}
        <Card size="sm" className="h-fit gap-3">
          <CardHeader>
            <CardTitle className="text-sm">Shipment details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Tracking number</dt>
                <dd className="truncate font-mono text-right">
                  {shipment.tracking_number}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Courier</dt>
                <dd>{shipment.courier}</dd>
              </div>
              {shipment.merchant && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Merchant</dt>
                  <dd>{shipment.merchant}</dd>
                </div>
              )}
              {shipment.estimated_delivery && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Estimated delivery</dt>
                  <dd>{formatDate(shipment.estimated_delivery)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Source</dt>
                <dd className="text-right">
                  {shipment.source === "email"
                    ? shipment.source_email
                      ? `Email · ${shipment.source_email}`
                      : "Email"
                    : "Added manually"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Created</dt>
                <dd>{formatDateTime(shipment.created_at)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Last checked</dt>
                <dd>
                  {shipment.tracking_checked_at
                    ? timeAgo(shipment.tracking_checked_at)
                    : "Never"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
