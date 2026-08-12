import type { GmailMessage } from "../gmail";
import type { EmailParser, ParsedShipment } from "../types";
import { buildParsedShipment, fromAddressMatches } from "./helpers";

const MYNTRA_DOMAINS = ["myntra.com", "myntra-mail.com"];

export const myntraParser: EmailParser = {
  name: "Myntra",

  matches(message) {
    return (
      fromAddressMatches(message.from, MYNTRA_DOMAINS) ||
      /\bmyntra\b/i.test(message.subject)
    );
  },

  parse(message: GmailMessage): ParsedShipment | null {
    return buildParsedShipment(message, { merchant: "Myntra" });
  },
};
