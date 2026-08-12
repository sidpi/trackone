import { NextResponse } from "next/server";

import { EmailSyncError, syncAllConnectedEmails, syncConnectedEmail } from "@/lib/emails/sync";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/emails/sync   { emailId?: string }
 *
 * With `emailId`: syncs that one connected account (must belong to the
 * signed-in user — RLS enforced).
 * Without it: syncs ALL of the user's connected accounts. This endpoint is
 * also the entry point a scheduled background job (e.g. a Cloudflare cron
 * trigger) can call later — it's idempotent and rate-limit friendly.
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
  const emailId =
    typeof body?.emailId === "string" && body.emailId.trim() ? body.emailId : null;

  try {
    const results = emailId
      ? [await syncConnectedEmail(emailId, supabase)]
      : await syncAllConnectedEmails(supabase);

    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email sync failed.";
    const needsReauth = err instanceof EmailSyncError && err.needsReauth;
    return NextResponse.json(
      { error: message },
      { status: needsReauth ? 401 : 502 }
    );
  }
}
