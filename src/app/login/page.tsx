import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your ShipTrack dashboard.",
};

export default async function LoginPage() {
  return (
    <div className="relative flex min-h-dvh flex-1 flex-col overflow-hidden">
      {/* Colorful stage behind the frosted card (CodeFronts pattern). */}
      <div
        aria-hidden
        className="glass-stage pointer-events-none absolute inset-0 -z-10"
      />

      <header className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-16">
        <Card className="glass-card w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>
              Enter your email and we&apos;ll send you a secure verification
              code — no password needed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="grid gap-4">
                  <div className="grid gap-1.5">
                    <div className="h-4 w-10 rounded bg-muted" />
                    <div className="h-8 rounded-lg bg-muted/60" />
                  </div>
                  <div className="grid gap-1.5">
                    <div className="h-4 w-16 rounded bg-muted" />
                    <div className="h-8 rounded-lg bg-muted/60" />
                  </div>
                  <div className="mt-1 h-9 rounded-lg bg-muted" />
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          Secured by Supabase Auth
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
