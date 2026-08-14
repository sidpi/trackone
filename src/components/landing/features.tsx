import { Cloud, PackageSearch, ShieldCheck, Users } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { FeaturesMotion } from "./features-motion";

const features = [
  {
    icon: PackageSearch,
    title: "Shipment visibility",
    description:
      "Every shipment in one place with clear statuses — in transit, customs, delivered — and a full history trail.",
  },
  {
    icon: Users,
    title: "Built for teams",
    description:
      "Invite teammates, share a single source of truth, and stop forwarding spreadsheets over email.",
  },
  {
    icon: Cloud,
    title: "Cloud-native data",
    description:
      "Postgres on Supabase means your data is secure, realtime-capable, and backed up by default.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    description:
      "Row-level security protects every record. Sign-in is handled by Supabase Auth with refreshable sessions.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 border-t bg-muted/30">
      <FeaturesMotion>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div data-features-head className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-primary">Features</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Everything a small freight team needs
            </h2>
            <p className="mt-4 text-muted-foreground">
              Start with a clean dashboard and grow into the full shipment
              workflow as each track ships.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description }) => (
              <Card key={title} size="sm" className="gap-3" data-feature-card>
              <CardHeader>
                <span className="mb-1 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4.5" />
                </span>
                <CardTitle className="text-sm">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed">
                  {description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      </FeaturesMotion>
    </section>
  );
}
