import type { GmailMessage } from "../gmail";
import { SHIPPING_KEYWORDS } from "../patterns";
import type { EmailParser, ParsedShipment } from "../types";
import { buildParsedShipment } from "./helpers";

/**
 * Sender display names that don't identify a merchant ("Nykaa Team",
 * "no-reply", "support", …) — we don't want those as the merchant label.
 */
const GENERIC_SENDER_NAME =
  /\b(no[- ]?reply|do[- ]?not[- ]?reply|notification|support|help|team|service|mail(?:er)?|newsletter|info|orders?|update|alerts?|postmaster|gmail|google|account|care)\b/i;

/** "Nykaa <no-reply@nykaa.com>" → "Nykaa"; empty for generic senders. */
export function merchantFromSender(from: string): string | undefined {
  const raw = from.split("<")[0]?.trim().replace(/^"|"$/g, "");
  if (!raw || GENERIC_SENDER_NAME.test(raw)) return undefined;
  // Strip a trailing TLD ("Nykaa.com" → "Nykaa"), but keep single words.
  const merchant = raw.replace(/\.(com|co|in|io|net|org|store)$/i, "").trim();
  return merchant.length >= 2 ? merchant : undefined;
}

/**
 * Fallback parser (registered last): catches shipping/tracking emails from
 * ANY brand — not just the couriers and marketplaces we know by name. Any
 * company that emails tracking details ("your order has been dispatched",
 * AWB numbers, "out for delivery", …) is picked up here.
 */
export const genericParser: EmailParser = {
  name: "Any store / courier",

  matches(message) {
    const text = `${message.subject} ${message.snippet}`.toLowerCase();
    return SHIPPING_KEYWORDS.some((keyword) => text.includes(keyword));
  },

  parse(message: GmailMessage): ParsedShipment | null {
    return buildParsedShipment(message, {
      merchant: merchantFromSender(message.from),
    });
  },
};
