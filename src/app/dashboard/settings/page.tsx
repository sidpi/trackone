import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, TriangleAlert } from "lucide-react";

import { ConnectedEmails } from "@/components/dashboard/connected-emails";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { ConnectedEmail } from "@/lib/types";

export const metadata: Metadata = {
  title: "Settings",
  description: "Connected emails and account settings.",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const { connected, error } = await searchParams;

  const supabase = await createClient();
  const { data } = await supabase
    .from("connected_emails")
    .select("id, email, provider, status, last_sync_at, last_sync_error, created_at")
    .order("created_at", { ascending: true });

  const emails = (data ?? []) as ConnectedEmail[];

  // Google OAuth (and the token encryption key) live in server secrets.
  // Missing credentials are exactly what makes "Connect another email" show
  // "not configured" in production while working fine locally — surface it
  // up front instead of only after the user clicks the button.
  const emailDiscoveryConfigured =
    Boolean(process.env.GOOGLE_OAUTH_CLIENT_ID) &&
    Boolean(process.env.GOOGLE_OAUTH_CLIENT_SECRET) &&
    Boolean(process.env.EMAIL_TOKEN_ENCRYPTION_KEY);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to shipments
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the email accounts used for automatic shipment discovery.
        </p>
      </div>

      {!emailDiscoveryConfigured && (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-700 dark:text-amber-400">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>
            Email connection isn&apos;t configured on this server yet. The owner
            needs to set{" "}
            <code className="font-mono">GOOGLE_OAUTH_CLIENT_ID</code>,{" "}
            <code className="font-mono">GOOGLE_OAUTH_CLIENT_SECRET</code> and{" "}
            <code className="font-mono">EMAIL_TOKEN_ENCRYPTION_KEY</code>{" "}
            in the Worker environment — locally they live in{" "}
            <code className="font-mono">.env.local</code> /{" "}
            <code className="font-mono">.dev.vars</code>, and after deploying
            you push them with <code className="font-mono">npm run secrets</code>.
          </span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Connected Emails</CardTitle>
          <CardDescription>
            Connect email accounts to automatically find shipment and order
            tracking numbers. Access is authorized with Google OAuth — your
            password is never used, and only tracking information is extracted,
            never stored email content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConnectedEmails
            emails={emails}
            connected={connected === "1"}
            error={error ?? null}
          />
        </CardContent>
      </Card>
    </div>
  );
}
