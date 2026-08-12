import type { GmailMessage } from "../gmail";
import type { EmailParser, ParsedShipment } from "../types";
import { buildParsedShipment, fromAddressMatches } from "./helpers";

const FLIPKART_DOMAINS = ["flipkart.com", "flipkartmail.com"];

export const flipkartParser: EmailParser = {
  name: "Flipkart",

  matches(message) {
    return (
      fromAddressMatches(message.from, FLIPKART_DOMAINS) ||
      /\bflipkart\b/i.test(message.subject)
    );
  },

  parse(message: GmailMessage): ParsedShipment | null {
    return buildParsedShipment(message, { merchant: "Flipkart" });
  },
};
