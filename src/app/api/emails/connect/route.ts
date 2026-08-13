import { randomBytes } from "node:crypto";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { buildAuthUrl } from "@/lib/emails/oauth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/emails/connect
 * Starts the Google OAuth flow for connecting an email account.
 * The user must be signed in; a CSRF state is stored in a cookie.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const state = randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("email_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
  });

  const origin = new URL(request.url).origin;

  try {
    return NextResponse.redirect(buildAuthUrl(origin, state));
  } catch (err) {
    // Missing Google OAuth credentials throw inside buildAuthUrl. Surface a
    // friendly message on the settings page instead of a raw 500.
    console.error("Email connect failed:", err);
    return NextResponse.redirect(
      new URL(
        `/dashboard/settings?error=${encodeURIComponent(
          "Email connection isn't configured yet. The owner needs to add the Google OAuth credentials (GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET) to the server environment."
        )}`,
        request.url
      )
    );
  }
}
