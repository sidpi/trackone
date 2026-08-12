import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
