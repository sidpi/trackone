import Link from "next/link";

import { Logo } from "@/components/logo";

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

        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="#features" className="transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="#roadmap" className="transition-colors hover:text-foreground">
            Roadmap
          </Link>
          <Link href="/login" className="transition-colors hover:text-foreground">
            Sign in
          </Link>
        </nav>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} ShipTrack · Next.js on Cloudflare ·
          Supabase
        </p>
      </div>
    </footer>
  );
}
