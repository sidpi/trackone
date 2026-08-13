import type { GmailMessage } from "../gmail";
import type { EmailParser, ParsedShipment } from "../types";
import { amazonParser } from "./amazon";
import { courierParser } from "./courier";
import { flipkartParser } from "./flipkart";
import { genericParser } from "./generic";
import { meeshoParser } from "./meesho";
import { myntraParser } from "./myntra";

/**
 * Registry of email parsers, tried in order. To support a new merchant:
 * add a file in this folder implementing `EmailParser`, then register it
 * here. `genericParser` (last) catches shipping notifications from any
 * brand we don't know by name.
 */
export const EMAIL_PARSERS: EmailParser[] = [
  amazonParser,
  flipkartParser,
  myntraParser,
  meeshoParser,
  courierParser,
  genericParser,
];

/**
 * Cheap filter over metadata (from + subject) — used to decide which
 * messages deserve a full body fetch.
 */
export function matchingParsers(
  message: Pick<GmailMessage, "from" | "subject" | "snippet">
): EmailParser[] {
  return EMAIL_PARSERS.filter((parser) => parser.matches(message));
}

/** Runs all matching parsers on a full message; returns the first hit. */
export function parseMessage(message: GmailMessage): ParsedShipment | null {
  for (const parser of matchingParsers(message)) {
    const parsed = parser.parse(message);
    if (parsed) return parsed;
  }
  return null;
}
