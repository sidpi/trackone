import type { GmailMessage } from "../gmail";
import type { EmailParser, ParsedShipment } from "../types";
import { buildParsedShipment, fromAddressMatches } from "./helpers";

const AMAZON_DOMAINS = ["amazon.in", "amazon.com", "amazon.co.uk", "amazon.com.au"];

export const amazonParser: EmailParser = {
  name: "Amazon",

  matches(message) {
    return (
      fromAddressMatches(message.from, AMAZON_DOMAINS) ||
      /\bamazon\b/i.test(message.subject)
    );
  },

  parse(message: GmailMessage): ParsedShipment | null {
    return buildParsedShipment(message, {
      merchant: "Amazon",
      detectedCourier: null, // courier is detected from the body text
    });
  },
};
