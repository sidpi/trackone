import { CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const tracks = [
  {
    icon: CheckCircle2,
    title: "Track 1 — Foundations",
    status: "Live now",
    tone: "default" as const,
    points: [
      "Polished landing page",
      "Supabase auth — sign in & sign out",
      "Protected dashboard shell",
    ],
  },
  {
    icon: CheckCircle2,
    title: "Track 2 — Shipments",
    status: "Live now",
    tone: "default" as const,
    points: [
      "Create, edit & delete shipments",
      "Status tracking with badges",
      "Private per user (RLS)",
    ],
  },
  {
    icon: CheckCircle2,
    title: "Track 3 — Tracking",
    status: "Live now",
    tone: "default" as const,
    points: [
      "Courier tracking (TrackCourier + Ship24)",
      "Status timeline on every shipment",
      "Caching & error handling",
    ],
  },
  {
    icon: CheckCircle2,
    title: "Track 4 — Auto-discovery",
    status: "Live now",
    tone: "default" as const,
    points: [
      "Connect multiple email accounts (OAuth)",
      "Shipments discovered from order emails",
      "Duplicate-safe unified dashboard",
    ],
  },
];

export function Roadmap() {
  return (
    <section id="roadmap" className="scroll-mt-20 border-t">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Roadmap</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Built in tracks, shipped incrementally
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tracks 1–4 are live — add shipments manually or connect your email
            accounts and let tracking numbers be discovered automatically.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tracks.map(({ icon: Icon, title, status, tone, points }) => (
            <Card key={title} className="gap-3">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="size-4.5" />
                  </span>
                  <Badge variant={tone}>{status}</Badge>
                </div>
                <CardTitle className="mt-2 text-sm">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" />
                      {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
