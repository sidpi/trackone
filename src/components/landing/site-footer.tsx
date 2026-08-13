import Link from "next/link";

import { Logo } from "@/components/logo";

const CONTACT_EMAIL = "sidhantaadityan@outlook.com";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row sm:px-6">
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Shipment tracking, simplified.
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="#features" className="transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-foreground">
            Terms of Service
          </Link>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="transition-colors hover:text-foreground"
          >
            Contact
          </a>
        </nav>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} ShipTrack. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
