"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FRIENDLY_ERRORS: Record<string, string> = {
  "Invalid login credentials":
    "That email or password doesn't match. Double-check and try again.",
  "Email not confirmed":
    "This email hasn't been confirmed yet. Check your inbox for the confirmation link.",
  "User already registered":
    "An account with this email already exists. Sign in instead.",
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = searchParams.get("next") ?? "/dashboard";
  const error = searchParams.get("error");

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);

  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  React.useEffect(() => {
    if (error === "auth") {
      toast.error("Sign-in failed", {
        description: "We couldn't complete the sign-in. Please try again.",
      });
    }
  }, [error]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsPending(false);

    if (signInError) {
      toast.error(
        FRIENDLY_ERRORS[signInError.message] ??
          "Something went wrong. Please try again."
      );
      return;
    }

    toast.success("Welcome back!");
    router.push(safeNext);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="grid gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <Button type="submit" size="lg" disabled={isPending} className="mt-1 w-full">
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LogIn data-icon="inline-start" />
        )}
        {isPending ? "Signing in…" : "Sign in"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        New here? Ask your workspace admin to create an account — or add one
        from the Supabase dashboard.
      </p>
    </form>
  );
}
