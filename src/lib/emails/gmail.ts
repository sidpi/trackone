/**
 * Minimal Gmail API client (read-only). We intentionally fetch as little
 * as possible: a cheap metadata pass (subject + from) to filter, and a
 * full body fetch only for messages the parsers care about. Email content
 * is never persisted — only the parsed tracking facts are stored.
 */

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";
const MAX_BODY_CHARS = 20_000;

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet: string;
}

export interface GmailMessage extends GmailMessageSummary {
  from: string;
  subject: string;
  bodyText: string;
}

export interface GmailProfile {
  emailAddress: string;
  historyId: string;
  messagesTotal: number;
}

/** Discovery query — shipment/order keywords in recent mail. */
export const DISCOVERY_QUERY =
  'newer_than:90d AND (order OR shipped OR dispatch OR dispatched OR delivered OR delivery OR tracking OR awb OR "out for delivery" OR "on the way" OR "on its way" OR "estimated delivery" OR parcel OR package OR consignment OR "delivery update")';

export async function getProfile(accessToken: string): Promise<GmailProfile> {
  const res = await fetch(`${GMAIL_API}/profile`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Gmail profile fetch failed (HTTP ${res.status}).`);
  }
  return (await res.json()) as GmailProfile;
}

export async function listMessages(
  accessToken: string,
  query: string,
  maxResults = 100
): Promise<GmailMessageSummary[]> {
  const url = new URL(`${GMAIL_API}/messages`);
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", String(maxResults));
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) {
    throw new Error(`Gmail message list failed (HTTP ${res.status}).`);
  }
  const json = (await res.json()) as {
    messages?: Array<{ id: string; threadId: string; snippet?: string }>;
  };
  return (json.messages ?? []).map((m) => ({
    id: m.id,
    threadId: m.threadId,
    snippet: m.snippet ?? "",
  }));
}

/** Cheap fetch: subject + from headers only (for filtering). */
export async function getMessageMetadata(
  accessToken: string,
  id: string
): Promise<{ id: string; from: string; subject: string }> {
  const url = new URL(`${GMAIL_API}/messages/${id}`);
  url.searchParams.set("format", "metadata");
  url.searchParams.set("metadataHeaders", "From");
  url.searchParams.set("metadataHeaders", "Subject");
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) {
    throw new Error(`Gmail metadata fetch failed (HTTP ${res.status}).`);
  }
  const json = (await res.json()) as {
    id: string;
    payload?: { headers?: Array<{ name: string; value: string }> };
  };
  const headers = Object.fromEntries(
    (json.payload?.headers ?? []).map((h) => [h.name.toLowerCase(), h.value])
  );
  return {
    id: json.id,
    from: headers.from ?? "",
    subject: headers.subject ?? "",
  };
}

/** Full fetch including body text (only for parser matches). */
export async function getMessage(accessToken: string, id: string): Promise<GmailMessage> {
  const url = new URL(`${GMAIL_API}/messages/${id}`);
  url.searchParams.set("format", "full");
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) {
    throw new Error(`Gmail message fetch failed (HTTP ${res.status}).`);
  }
  const json = (await res.json()) as {
    id: string;
    threadId: string;
    snippet?: string;
    payload?: {
      headers?: Array<{ name: string; value: string }>;
      body?: { data?: string };
      parts?: GmailPart[];
    };
  };
  const headers = Object.fromEntries(
    (json.payload?.headers ?? []).map((h) => [h.name.toLowerCase(), h.value])
  );
  return {
    id: json.id,
    threadId: json.threadId,
    snippet: json.snippet ?? "",
    from: headers.from ?? "",
    subject: headers.subject ?? "",
    bodyText: extractBodyText(json.payload).slice(0, MAX_BODY_CHARS),
  };
}

interface GmailPart {
  mimeType?: string;
  body?: { data?: string };
  parts?: GmailPart[];
}

/** Decodes base64url and prefers text/plain, stripping HTML otherwise. */
function extractBodyText(payload?: {
  body?: { data?: string };
  parts?: GmailPart[];
}): string {
  if (!payload) return "";

  let text: string | null = null;
  const walk = (part: GmailPart | { body?: { data?: string }; parts?: GmailPart[] } | undefined) => {
    if (!part) return;
    const data = part.body?.data;
    if (data) {
      const decoded = Buffer.from(data, "base64url").toString("utf8");
      const mime = (part as GmailPart).mimeType ?? "";
      if (mime === "text/plain") {
        text = text ?? decoded; // prefer the first plain-text part
      } else if (mime === "text/html" && text === null) {
        text = decoded
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/&nbsp;/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }
    }
    for (const child of part.parts ?? []) {
      walk(child);
    }
  };

  walk(payload);
  return (text ?? "").trim();
}
