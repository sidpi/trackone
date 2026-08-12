import type { GmailMessage } from "../gmail";
import { SENDER_DOMAINS } from "../patterns";
import type { EmailParser, ParsedShipment } from "../types";
import { buildParsedShipment, fromAddressMatches } from "./helpers";

const COURIER_DOMAINS = SENDER_DOMAINS.filter(
  (entry) => !["Amazon", "Flipkart", "Myntra", "Meesho"].includes(entry.courier)
).flatMap((entry) => entry.domains);

export const courierParser: EmailParser = {
  name: "Courier notification",

  matches(message) {
    return fromAddressMatches(message.from, COURIER_DOMAINS);
  },

  parse(message: GmailMessage): ParsedShipment | null {
    // Sender domain already tells us the courier; no merchant involved.
    return buildParsedShipment(message, {});
  },
};
