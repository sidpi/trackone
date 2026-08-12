import { CheckCircle2, Circle } from "lucide-react";

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
    icon: Circle,
    title: "Track 3 — Tracking",
    status: "Planned",
    tone: "outline" as const,
    points: [
      "Live courier status updates",
      "Email notifications",
      "Analytics & reporting",
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
            Track 1 and 2 are live — sign in, add shipments, and track their
            status. Live courier tracking arrives in Track 3.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
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
