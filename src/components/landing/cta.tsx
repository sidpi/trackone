import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import { CtaMotion } from "./cta-motion";

export function Cta() {
  return (
    <section className="border-t">
      <CtaMotion>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <div className="relative overflow-hidden rounded-2xl border bg-card px-6 py-16 text-center sm:px-12">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
            >
              <div
                data-cta-glow
                className="absolute -top-20 left-1/2 h-64 w-[36rem] rounded-full bg-primary/10 blur-3xl"
              />
            </div>

            <div className="relative">
              <h2
                data-cta-enter
                className="mx-auto max-w-xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
              >
                Ready to move your first shipment?
              </h2>
              <p data-cta-enter className="mx-auto mt-4 max-w-md text-muted-foreground">
                Sign in and manage your shipments — add them, update their status,
                and keep everything in one place.
              </p>
              <div
                data-cta-enter
                className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
              >
                <Button size="lg" className="w-full sm:w-auto" render={<Link href="/login?next=/dashboard" />}>
                  Sign in now
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CtaMotion>
    </section>
  );
}
