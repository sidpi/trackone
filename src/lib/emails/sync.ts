import type { SupabaseClient } from "@supabase/supabase-js";

import { decryptSecret } from "./encryption";
import {
  DISCOVERY_QUERY,
  getMessage,
  getMessageMetadata,
  getProfile,
  listMessages,
} from "./gmail";
import { refreshAccessToken } from "./oauth";
import { matchingParsers, parseMessage } from "./parsers";
import type { SyncResult, SyncStats } from "./types";

/** Fatal sync failure — e.g. the user revoked access or the token expired. */
export class EmailSyncError extends Error {
  constructor(
    message: string,
    /** True when the user must reauthorize (token invalid/revoked). */
    public readonly needsReauth = false
  ) {
    super(message);
  }
}

interface ConnectedEmailRow {
  id: string;
  user_id: string;
  email: string;
  refresh_token_encrypted: string;
  status: string;
}

interface ExistingShipment {
  id: string;
  tracking_number: string;
  source_email: string | null;
}

export function normalizeTrackingNumber(value: string): string {
  return value.trim().toUpperCase();
}

const MAX_FULL_FETCHES = 30;

export function emptyStats(error?: string): SyncStats {
  return {
    scanned: 0,
    parsed: 0,
    created: 0,
    associated: 0,
    skipped: 0,
    errors: error ? [error] : [],
  };
}

/** Syncs one connected email account for the signed-in user. */
export async function syncConnectedEmail(
  emailId: string,
  supabase: SupabaseClient
): Promise<SyncResult> {
  const { data: row } = await supabase
    .from("connected_emails")
    .select("id, user_id, email, refresh_token_encrypted, status")
    .eq("id", emailId)
    .maybeSingle();

  if (!row) {
    throw new EmailSyncError("Connected email not found.");
  }
  const email = row as ConnectedEmailRow;

  const stats: SyncStats = emptyStats();

  // ── Refresh the access token (in memory only) ──
  let accessToken: string;
  try {
    const refreshToken = decryptSecret(email.refresh_token_encrypted);
    accessToken = await refreshAccessToken(refreshToken);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to refresh the email connection.";
    const needsReauth = /invalid_grant|unauthorized|token/i.test(message);
    await supabase
      .from("connected_emails")
      .update({
        status: needsReauth ? "error" : email.status,
        last_sync_error: needsReauth
          ? "Authorization expired or was revoked — reconnect this email."
          : message,
      })
      .eq("id", emailId);
    throw new EmailSyncError(message, needsReauth);
  }

  try {
    // ── Scan recent shipment-ish messages ──
    const profile = await getProfile(accessToken);
    const messages = await listMessages(accessToken, DISCOVERY_QUERY, 100);
    stats.scanned = messages.length;

    // Cheap metadata pass (subject + from) to decide what needs a body fetch.
    const candidates: Array<{ id: string; from: string; subject: string; snippet: string }> = [];
    for (const m of messages) {
      try {
        const meta = await getMessageMetadata(accessToken, m.id);
        if (matchingParsers({ from: meta.from, subject: meta.subject, snippet: m.snippet }).length > 0) {
          candidates.push({ ...meta, snippet: m.snippet });
        }
      } catch {
        stats.errors.push("Couldn't read one message header — skipped.");
      }
      if (candidates.length >= MAX_FULL_FETCHES) break;
    }

    // Load existing shipments once for duplicate protection.
    const { data: existingRows } = await supabase
      .from("shipments")
      .select("id, tracking_number, source_email");
    const byNumber = new Map<string, ExistingShipment>(
      ((existingRows ?? []) as ExistingShipment[]).map((s) => [
        normalizeTrackingNumber(s.tracking_number),
        s,
      ])
    );

    // ── Parse each candidate and create/associate shipments ──
    for (const candidate of candidates) {
      let message;
      try {
        message = await getMessage(accessToken, candidate.id);
      } catch {
        stats.errors.push("Couldn't read one message body — skipped.");
        continue;
      }

      const parsed = parseMessage(message);
      if (!parsed) {
        stats.skipped += 1;
        continue;
      }

      stats.parsed += 1;
      const key = normalizeTrackingNumber(parsed.trackingNumber);
      const existing = byNumber.get(key);

      if (existing) {
        // Duplicate protection: associate, never create a second row.
        if (!existing.source_email) {
          await supabase
            .from("shipments")
            .update({ source_email: email.email })
            .eq("id", existing.id);
        }
        byNumber.set(key, { ...existing, source_email: existing.source_email ?? email.email });
        stats.associated += 1;
        continue;
      }

      const { error: insertError } = await supabase.from("shipments").insert({
        user_id: email.user_id,
        tracking_number: parsed.trackingNumber,
        courier: parsed.courier,
        nickname: parsed.summary || parsed.merchant || null,
        status: parsed.status ?? "pending",
        source: "email",
        source_email: email.email,
        merchant: parsed.merchant ?? null,
        estimated_delivery: parsed.estimatedDelivery ?? null,
      });

      if (insertError) {
        // Likely a race with the unique index — re-check and associate.
        stats.errors.push(insertError.message);
        continue;
      }
      byNumber.set(key, {
        id: "created",
        tracking_number: parsed.trackingNumber,
        source_email: email.email,
      });
      stats.created += 1;
    }

    // ── Record sync state ──
    await supabase
      .from("connected_emails")
      .update({
        status: "connected",
        last_sync_at: new Date().toISOString(),
        last_history_id: profile.historyId,
        last_sync_error: null,
      })
      .eq("id", emailId);

    return { email: email.email, stats };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email sync failed.";
    const rateLimited = /429|rate limit|quota|403/i.test(message);
    await supabase
      .from("connected_emails")
      .update({
        last_sync_error: rateLimited
          ? "Temporary Gmail rate limit — try again in a moment."
          : message,
      })
      .eq("id", emailId);
    throw new EmailSyncError(message);
  }
}

/** Syncs every connected email for the signed-in user (for "Sync Now" / cron). */
export async function syncAllConnectedEmails(
  supabase: SupabaseClient
): Promise<SyncResult[]> {
  const { data: emails } = await supabase
    .from("connected_emails")
    .select("id, email")
    .eq("status", "connected");

  const results: SyncResult[] = [];
  for (const email of emails ?? []) {
    try {
      results.push(await syncConnectedEmail(email.id, supabase));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Email sync failed.";
      results.push({ email: email.email, stats: emptyStats(message) });
    }
  }
  return results;
}
