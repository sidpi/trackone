import Link from "next/link";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/dashboard/user-menu";

export function DashboardHeader({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo href="/dashboard" />
          <nav className="hidden items-center gap-1 text-sm sm:flex">
            <Link
              href="/dashboard"
              className="rounded-md bg-primary/10 px-3 py-1.5 font-medium text-foreground"
            >
              Shipments
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu name={name} email={email} />
        </div>
      </div>
    </header>
  );
}
