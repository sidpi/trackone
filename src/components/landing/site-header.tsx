import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Logo } from "@/components/logo";
import { UserMenu } from "@/components/dashboard/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

import { HeaderFrost } from "./header-frost";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <HeaderFrost />
      <header
        id="site-header"
        className="site-header sticky top-0 z-40 border-b"
      >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="#features" className="transition-colors hover:text-foreground">
            Features
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <UserMenu
              name={
                user.user_metadata?.full_name ??
                user.email?.split("@")[0] ??
                "User"
              }
              email={user.email ?? ""}
            />
          ) : (
            <Button variant="default" render={<Link href="/login?next=/dashboard" />}>
              Sign in
              <ArrowRight data-icon="inline-end" />
            </Button>
          )}
        </div>
      </div>
      </header>
    </>
  );
}
