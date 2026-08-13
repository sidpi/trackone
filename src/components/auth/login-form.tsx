"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, LogIn, MailCheck, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Friendly, user-facing messages for common Supabase OTP errors. Never leak
 * internal details — unknown errors get a generic fallback.
 */
const OTP_ERRORS: Array<[RegExp, string]> = [
  [/invalid (otp|token)/, "That code isn't right — double-check it and try again."],
  [
    /token has expired or is invalid/,
    "That code has expired. Request a new one and try again.",
  ],
  [
    /for security purposes, you can only request this after/,
    "You've requested too many codes. Please wait a minute and try again.",
  ],
  [
    /over_email_send_rate_limit|email rate limit exceeded|rate limit/,
    "We're sending too many codes right now — please wait about an hour and try again.",
  ],
  [
    /email_address_invalid|email address .* is invalid|invalid email/,
    "That email address looks invalid — double-check it and try again.",
  ],
  [/email not confirmed/, "We couldn't verify that email. Request a new code and try again."],
  [/signups not allowed/, "New sign-ups aren't enabled on this site right now."],
  [/email provider is disabled/, "Email sign-in isn't enabled right now. Please try again later."],
];

function friendlyError(message: string): string {
  const match = OTP_ERRORS.find(([pattern]) => pattern.test(message.toLowerCase()));
  return match ? match[1] : "Something went wrong. Please try again.";
}

type Step = "email" | "otp";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = searchParams.get("next") ?? "/dashboard";
  const error = searchParams.get("error");
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  const [step, setStep] = React.useState<Step>("email");
  const [email, setEmail] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);
  const [resendIn, setResendIn] = React.useState(0);

  React.useEffect(() => {
    if (error === "auth") {
      toast.error("Sign-in failed", {
        description: "We couldn't complete the sign-in. Please try again.",
      });
    }
  }, [error]);

  // Resend countdown.
  React.useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  async function sendCode() {
    setIsPending(true);

    const supabase = createClient();
    const { error: sendError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Anyone can create an account with their email (no password).
        shouldCreateUser: true,
        // Magic-link in the email resolves to this route on any origin.
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setIsPending(false);

    if (sendError) {
      toast.error(friendlyError(sendError.message));
      return;
    }

    setStep("otp");
    setResendIn(RESEND_COOLDOWN_SECONDS);
    toast.success("Code sent", {
      description: `We emailed a secure verification code to ${email}.`,
    });
  }

  function handleSendCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendCode();
  }

  async function verifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (otp.trim().length < 6) {
      toast.error("Enter the verification code from the email.");
      return;
    }
    setIsPending(true);

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp.trim(),
      type: "email",
    });

    setIsPending(false);

    if (verifyError) {
      toast.error(friendlyError(verifyError.message));
      return;
    }

    toast.success("Welcome!");
    router.push(safeNext);
    router.refresh();
  }

  if (step === "otp") {
    return (
      <div className="grid gap-4">
        <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5">
          <MailCheck className="size-4 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            We sent a verification code to{" "}
            <strong className="text-foreground">{email}</strong>.
          </p>
        </div>

        <form onSubmit={verifyCode} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="otp">Verification code</Label>
            <Input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={10}
              placeholder="••••••"
              className="text-center text-lg tracking-[0.4em]"
              autoFocus
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <Button type="submit" size="lg" disabled={isPending} className="mt-1 w-full">
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogIn data-icon="inline-start" />
            )}
            {isPending ? "Verifying…" : "Verify & sign in"}
          </Button>
        </form>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setOtp("");
            }}
            className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Use a different email
          </button>
          <button
            type="button"
            disabled={resendIn > 0 || isPending}
            onClick={sendCode}
            className="text-primary transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSendCode} className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Enter your email and we&apos;ll send you a secure verification code.
        </p>
      </div>

      <Button type="submit" size="lg" disabled={isPending} className="mt-1 w-full">
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send data-icon="inline-start" />
        )}
        {isPending ? "Sending code…" : "Send code"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        No password needed — we&apos;ll email you a secure code each time you sign in.
      </p>
    </form>
  );
}
