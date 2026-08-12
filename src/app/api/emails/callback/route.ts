import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { encryptSecret } from "@/lib/emails/encryption";
import { emailFromIdToken, exchangeCode } from "@/lib/emails/oauth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/emails/callback
 * Google redirects here after consent. Exchanges the code for tokens,
 * encrypts the refresh token, and saves (or updates) the connected email.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("email_oauth_state")?.value;
  cookieStore.delete("email_oauth_state");

  const failRedirect = (reason: string) =>
    NextResponse.redirect(
      new URL(`/dashboard/settings?error=${encodeURIComponent(reason)}`, url.origin)
    );

  if (oauthError) {
    return failRedirect("You didn't authorize email access.");
  }
  if (!code || !state || !savedState || state !== savedState) {
    return failRedirect("The email connection request was invalid. Please try again.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return failRedirect("Please sign in, then try connecting again.");
  }

  try {
    const token = await exchangeCode(code, url.origin);
    const email = emailFromIdToken(token.id_token);
    if (!email) {
      throw new Error("Google did not return an email address.");
    }
    const refreshToken = token.refresh_token;
    if (!refreshToken) {
      throw new Error("Google did not return a refresh token.");
    }

    const encrypted = encryptSecret(refreshToken);

    const { data: existing } = await supabase
      .from("connected_emails")
      .select("id")
      .eq("user_id", user.id)
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("connected_emails")
        .update({
          refresh_token_encrypted: encrypted,
          status: "connected",
          last_sync_error: null,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("connected_emails").insert({
        user_id: user.id,
        email,
        provider: "gmail",
        refresh_token_encrypted: encrypted,
      });
    }

    return NextResponse.redirect(
      new URL("/dashboard/settings?connected=1", url.origin)
    );
  } catch (err) {
    console.error("Email connect callback failed:", err);
    return failRedirect("Couldn't connect the email account. Please try again.");
  }
}
