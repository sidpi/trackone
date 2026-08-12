import { NextResponse } from "next/server";

import { decryptSecret } from "@/lib/emails/encryption";
import { revokeToken } from "@/lib/emails/oauth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/emails/disconnect  { emailId }
 *
 * Disconnects a connected email account: revokes the Google token
 * (best effort) and deletes the connection row. Shipments that were
 * previously discovered from this email are intentionally KEPT.
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const emailId = typeof body?.emailId === "string" ? body.emailId : null;
  if (!emailId) {
    return NextResponse.json({ error: "emailId is required." }, { status: 400 });
  }

  // RLS scopes this to the user's own connection rows.
  const { data: row } = await supabase
    .from("connected_emails")
    .select("id, refresh_token_encrypted")
    .eq("id", emailId)
    .maybeSingle();

  if (row) {
    try {
      await revokeToken(decryptSecret(row.refresh_token_encrypted));
    } catch {
      // Revocation is best effort — the row is removed regardless.
    }
    await supabase.from("connected_emails").delete().eq("id", emailId);
  }

  return NextResponse.json({ ok: true });
}
