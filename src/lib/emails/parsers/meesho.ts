import type { GmailMessage } from "../gmail";
import type { EmailParser, ParsedShipment } from "../types";
import { buildParsedShipment, fromAddressMatches } from "./helpers";

const MEESHO_DOMAINS = ["meesho.com", "meesho.io"];

export const meeshoParser: EmailParser = {
  name: "Meesho",

  matches(message) {
    return (
      fromAddressMatches(message.from, MEESHO_DOMAINS) ||
      /\bmeesho\b/i.test(message.subject)
    );
  },

  parse(message: GmailMessage): ParsedShipment | null {
    return buildParsedShipment(message, { merchant: "Meesho" });
  },
};
