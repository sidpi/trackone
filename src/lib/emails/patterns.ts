/**
 * Courier detection + tracking/AWB number extraction.
 *
 * Detection strategy:
 *   1. Sender domain (most reliable — the courier's own notifications).
 *   2. Courier keywords in subject/body (e.g. "Blue Dart" in an Amazon mail).
 *   3. Number shape: per-courier patterns, then a generic fallback.
 */

import type { GmailMessage } from "./gmail";

export const NORMALIZE_COURIER: Record<string, string> = {
  "blue dart": "Bluedart",
  "bluedart": "Bluedart",
  "ekart": "Ekart",
  "e kart": "Ekart",
  "ecom express": "Ecom",
  "ecom": "Ecom",
  "xpressbees": "Xpressbees",
  "xpress bees": "Xpressbees",
  "gati-kwe": "Gati",
  "gati kwe": "Gati",
  "gati": "Gati",
  "dtdc": "DTDC",
  "shadowfax": "Shadowfax",
  "dhl": "DHL",
  "delhivery": "Delhivery",
  "india post": "India Post",
  "speed post": "India Post",
  "fedex": "FedEx",
  "ups": "UPS",
  "usps": "USPS",
  "aramex": "Aramex",
  "tnt": "TNT",
  "safexpress": "Safexpress",
  "trackon": "Trackon",
  "porter": "Porter",
  "amazon": "Amazon",
  "flipkart": "Flipkart",
  "myntra": "Myntra",
  "meesho": "Meesho",
  "ajio": "Ajio",
  "nykaa": "Nykaa",
  "snapdeal": "Snapdeal",
  "tata cliq": "Tata CLiQ",
  "tatacliq": "Tata CLiQ",
  "croma": "Croma",
  "reliance digital": "Reliance Digital",
  "reliancedigital": "Reliance Digital",
  "limeroad": "Limeroad",
  "1mg": "1mg",
};

export function normalizeCourierName(raw: string): string {
  const key = raw.trim().toLowerCase();
  return NORMALIZE_COURIER[key] ?? raw.trim();
}

/** Sender domains → courier / merchant. */
export const SENDER_DOMAINS: Array<{ courier: string; domains: string[] }> = [
  { courier: "Delhivery", domains: ["delhivery.com"] },
  { courier: "Bluedart", domains: ["bluedart.com", "firstflight.net"] },
  { courier: "Ekart", domains: ["ekartlogistics.com"] },
  { courier: "DTDC", domains: ["dtdc.in", "dtdc.com"] },
  { courier: "Shadowfax", domains: ["shadowfax.in"] },
  { courier: "Xpressbees", domains: ["xpressbees.com"] },
  { courier: "Gati", domains: ["gati.com", "gati-kwe.com", "gatike.com"] },
  { courier: "DHL", domains: ["dhl.com", "dhlindia.com"] },
  { courier: "Ecom", domains: ["ecomexpress.com", "ecom-ex.com"] },
  { courier: "India Post", domains: ["indiapost.gov.in"] },
  { courier: "FedEx", domains: ["fedex.com"] },
  { courier: "UPS", domains: ["ups.com"] },
  { courier: "USPS", domains: ["usps.com"] },
  { courier: "Aramex", domains: ["aramex.com"] },
  { courier: "TNT", domains: ["tnt.com", "tntexpress.com"] },
  { courier: "Safexpress", domains: ["safexpress.com"] },
  { courier: "Trackon", domains: ["trackon.in", "trackoncourier.com"] },
  { courier: "Porter", domains: ["porter.in"] },
  { courier: "Amazon", domains: ["amazon.in", "amazon.com", "amazon.co.uk"] },
  { courier: "Flipkart", domains: ["flipkart.com"] },
  { courier: "Myntra", domains: ["myntra.com"] },
  { courier: "Meesho", domains: ["meesho.com"] },
  // More merchants/brands — their shipping notifications carry AWBs too.
  { courier: "Ajio", domains: ["ajio.com"] },
  { courier: "Nykaa", domains: ["nykaa.com", "nykaamail.com"] },
  { courier: "Snapdeal", domains: ["snapdeal.com"] },
  { courier: "Tata CLiQ", domains: ["tatacliq.com"] },
  { courier: "Croma", domains: ["croma.com"] },
  { courier: "Reliance Digital", domains: ["reliancedigital.in"] },
  { courier: "Limeroad", domains: ["limeroad.com"] },
  { courier: "1mg", domains: ["1mg.com"] },
];

/** Courier/merchant keywords that may appear in a subject or body. */
export const COURIER_KEYWORDS: Array<{ courier: string; keywords: string[] }> = [
  { courier: "Delhivery", keywords: ["delhivery"] },
  { courier: "Bluedart", keywords: ["blue dart", "bluedart"] },
  { courier: "Ekart", keywords: ["ekart", "ekartlogistics"] },
  { courier: "DTDC", keywords: ["dtdc"] },
  { courier: "Shadowfax", keywords: ["shadowfax"] },
  { courier: "Xpressbees", keywords: ["xpressbees", "xpress bees"] },
  { courier: "Gati", keywords: ["gati"] },
  { courier: "DHL", keywords: ["dhl"] },
  { courier: "Ecom", keywords: ["ecom express", "ecomexpress"] },
  { courier: "India Post", keywords: ["india post", "speed post"] },
  { courier: "FedEx", keywords: ["fedex"] },
  // Short courier names use space-delimited forms to avoid substring
  // false positives ("ups" matches "cups", "tnt" matches nothing common
  // but is safer with spaces).
  { courier: "UPS", keywords: ["ups tracking", "ups package", "ups delivery", "ups shipment", "united parcel", "ups my choice", " ups ", "ups.com"] },
  { courier: "USPS", keywords: ["usps"] },
  { courier: "Aramex", keywords: ["aramex"] },
  { courier: "TNT", keywords: ["tnt express", " tnt ", "tnt.com"] },
  { courier: "Safexpress", keywords: ["safexpress", "safe express"] },
  { courier: "Trackon", keywords: ["trackon"] },
  { courier: "Porter", keywords: ["porter", "porter.in"] },
  { courier: "Amazon", keywords: ["amazon"] },
  { courier: "Flipkart", keywords: ["flipkart"] },
  { courier: "Myntra", keywords: ["myntra"] },
  { courier: "Meesho", keywords: ["meesho"] },
  { courier: "Ajio", keywords: ["ajio"] },
  { courier: "Nykaa", keywords: ["nykaa"] },
  { courier: "Snapdeal", keywords: ["snapdeal"] },
  { courier: "Tata CLiQ", keywords: ["tata cliq", "tatacliq"] },
  { courier: "Croma", keywords: ["croma"] },
  { courier: "Reliance Digital", keywords: ["reliance digital", "reliancedigital"] },
  { courier: "Limeroad", keywords: ["limeroad"] },
  { courier: "1mg", keywords: ["1mg"] },
];

/**
 * Words that mark an email as a shipping/tracking notification from ANY
 * store or courier — used by the generic fallback parser so brands we
 * don't know by name still get picked up when they send tracking details.
 */
export const SHIPPING_KEYWORDS: string[] = [
  "shipped",
  "shipping update",
  "dispatch",
  "dispatched",
  "dispatching",
  "delivered",
  "delivery update",
  "tracking",
  "track your",
  "track package",
  "awb",
  "out for delivery",
  "on the way",
  "on its way",
  "in transit",
  "parcel",
  "package",
  "shipment",
  "consignment",
  "courier",
  "estimated delivery",
  "arriving",
];

/**
 * Tracking/AWB shapes per courier, tried in order after courier detection.
 * Patterns are intentionally conservative; the generic fallbacks catch
 * numbers that don't match a known shape.
 */
export const COURIER_PATTERNS: Array<{ courier: string; pattern: RegExp }> = [
  { courier: "India Post", pattern: /\b[A-Z]{2}\d{9}IN\b/i },
  { courier: "Delhivery", pattern: /\b[A-Z]{2}\d{14}\b/i },
  { courier: "Bluedart", pattern: /\b\d{11}\b/ },
  { courier: "DTDC", pattern: /\b\d{10,12}\b/ },
  { courier: "DHL", pattern: /\b\d{10}\b/ },
  { courier: "Ekart", pattern: /\b[A-Z]{2}\d{13,16}\b/i },
  { courier: "Ecom", pattern: /\b[A-Z]{2}\d{12,16}\b/i },
  { courier: "FedEx", pattern: /\b\d{12}\b/ },
  { courier: "UPS", pattern: /\b1Z[A-Z0-9]{15,16}\b/i },
  { courier: "USPS", pattern: /\b\d{20,22}\b/ },
  { courier: "TNT", pattern: /\b\d{9}\b/ },
  { courier: "Safexpress", pattern: /\b\d{9}\b/ },
  { courier: "Trackon", pattern: /\b\d{12}\b/ },
];

/** Amazon-style order/tracking id: 3-7-7 digits. */
const AMAZON_PATTERN = /\b\d{3}-\d{7}-\d{7}\b/;

/** matchAll() requires a global regex — clone with the /g flag. */
function globalize(re: RegExp): RegExp {
  return re.flags.includes("g") ? re : new RegExp(re.source, `${re.flags}g`);
}

/** Generic fallbacks (applied when no courier-specific match lands). */
const GENERIC_PATTERNS: RegExp[] = [
  /\b[A-Z]{2}\d{12,16}\b/i, // alphanumeric AWB (Ekart, Ecom, Delhivery, …)
  /\b\d{12,16}\b/, // long digit AWB
];

/** Strong tracking labels (a carrier AWB right after these is gold). */
const TRACKING_LABEL =
  /\b(tracking|awb|consignment|waybill)\s*(number|no|id|#)?\s*[:#-]?\s*$/i;

/** Weaker label — a marketplace order id, less useful than an AWB. */
const ORDER_LABEL = /\border\s*(number|no|id|#)?\s*[:#-]?\s*$/i;

function domainOf(from: string): string {
  const match = /@([\w.-]+)/.exec(from);
  return (match?.[1] ?? "").toLowerCase();
}

const REAL_COURIERS = new Set([
  "Delhivery", "Bluedart", "Ekart", "DTDC", "Shadowfax",
  "Xpressbees", "Gati", "DHL", "Ecom", "India Post",
  "FedEx", "UPS", "USPS", "Aramex", "TNT", "Safexpress",
  "Trackon", "Porter",
]);

export function detectCourier(message: Pick<GmailMessage, "from" | "subject" | "snippet"> & {
  bodyText?: string;
}): string | null {
  const fromDomain = domainOf(message.from);
  const text = `${message.subject} ${message.snippet} ${message.bodyText ?? ""}`.toLowerCase();

  // 1) A carrier named in the body/subject wins — e.g. an Amazon email that
  //    says "shipped via Delhivery" is a Delhivery shipment.
  for (const { courier, keywords } of COURIER_KEYWORDS) {
    if (REAL_COURIERS.has(courier) && keywords.some((k) => text.includes(k))) {
      return courier;
    }
  }

  // 2) The sender domain (reliable for courier notifications).
  for (const { courier, domains } of SENDER_DOMAINS) {
    if (domains.some((d) => fromDomain === d || fromDomain.endsWith(`.${d}`))) {
      return courier;
    }
  }

  // 3) Marketplace names (fallback — used as the courier display).
  for (const { courier, keywords } of COURIER_KEYWORDS) {
    if (keywords.some((k) => text.includes(k))) {
      return courier;
    }
  }
  return null;
}

export interface ExtractedNumber {
  number: string;
  courier: string | null;
}

/**
 * Extracts a tracking/AWB number from an email's text, preferring numbers
 * near a tracking label and matching a known courier's shape.
 */
export function extractTrackingNumber(
  text: string,
  detectedCourier: string | null
): string | null {
  const candidates: Array<{ number: string; score: number }> = [];

  const add = (number: string, score: number) => {
    const cleaned = number.trim();
    if (cleaned.length >= 6) {
      candidates.push({ number: cleaned, score });
    }
  };

  // 1) Amazon-style order/tracking ids (order ids — useful, but a carrier
  //    AWB elsewhere in the email should win).
  for (const m of text.matchAll(globalize(AMAZON_PATTERN))) {
    add(m[0], 15);
  }

  // 2) Courier-specific shapes when the courier is known.
  if (detectedCourier) {
    for (const { courier, pattern } of COURIER_PATTERNS) {
      if (courier === detectedCourier) {
        for (const m of text.matchAll(globalize(pattern))) {
          add(m[0], 25);
        }
      }
    }
  }

  // 3) Generic fallbacks (alphanumeric AWB / long digits).
  for (const pattern of GENERIC_PATTERNS) {
    for (const m of text.matchAll(globalize(pattern))) {
      add(m[0], 10);
    }
  }

  if (candidates.length === 0) return null;

  // Boost numbers that appear right after a tracking label (strong boost
  // for "tracking/awb/consignment", small boost for "order").
  for (const c of candidates) {
    const idx = text.indexOf(c.number);
    if (idx >= 0) {
      const before = text.slice(Math.max(0, idx - 60), idx);
      if (TRACKING_LABEL.test(before)) c.score += 30;
      else if (ORDER_LABEL.test(before)) c.score += 5;
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].number;
}

/**
 * Maps status words in an email to a ShipTrack status.
 *
 * Marketplace emails mention "delivered" and "returns" in passing all the
 * time ("we'll email you when your order has been delivered", "easy
 * returns"), so bare keyword matching marks every order as delivered or
 * cancelled. We strip future/conditional clauses first, then only treat a
 * surviving "delivered" as an actual delivery.
 */
export function mapEmailStatus(
  text: string
): import("@/lib/types").ShipmentStatus | undefined {
  let t = text.toLowerCase();

  // Remove conditional clauses: "when/once/after your order has been
  // delivered" does not mean the package was delivered.
  t = t.replace(/\b(when|once|as soon as|after|until|if)\b[^.!?\n]{0,120}\bdelivered\b/g, " ");
  // Remove future/negative forms: "will be delivered", "not been delivered",
  // "being delivered", "get it delivered", "to be delivered".
  t = t
    .replace(
      /\b(will|would|should|to|is|are|being|getting|get|gets|it|be|not)\s+(?:be\s+)?delivered\b/g,
      " "
    )
    .replace(/\bnot\s+(?:been\s+)?delivered\b/g, " ");
  // Remove generic delivery-estimate phrases (harmless, but noisy).
  t = t.replace(/\bdelivery\s+(?:estimate|date|expected|by|before)\b[^.!?\n]{0,60}/g, " ");
  // Future "dispatched": "will be dispatched" is not shipped yet.
  t = t.replace(/\b(will|would|should|to|is|are|be|being|not)\s+(?:be\s+)?dispatched\b/g, " ");

  if (/out for delivery/.test(t)) return "out_for_delivery";
  // Only a surviving past-tense "delivered" counts as a real delivery.
  if (/delivered/.test(t)) return "delivered";
  if (/customs/.test(t)) return "customs";
  // Conservative exception signals — not bare "return"/"cancel"/"failed",
  // which appear in refund/returns policies on every order.
  if (
    /exception|rto|undelivered|returned|return to sender|cancelled|delivery failed|failed delivery|delivery attempt failed|attempt failed/.test(
      t
    )
  )
    return "cancelled";
  // Past-tense only: "dispatched" (not "before dispatch").
  if (/transit|shipped|dispatched|on the way|picked up/.test(t)) return "in_transit";
  return undefined;
}

/** Tries to parse a delivery-date phrase ("Tue, Aug 18", "Aug 18, 2026", …). */
export function extractEstimatedDelivery(text: string): string | undefined {
  const patterns: RegExp[] = [
    /(?:estimated|expected|delivery|arriv(?:e|al)|by|before)\s*(?:date\s*)?[:#-]?\s*([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})/i,
    /(?:estimated|expected|delivery)\s*(?:date\s*)?[:#-]?\s*([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?)/i,
    /([A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})/i,
  ];
  for (const pattern of patterns) {
    const m = pattern.exec(text);
    if (!m) continue;
    const date = new Date(
      m[1].replace(/(\d{1,2})(st|nd|rd|th)/i, "$1").replace(/,/g, "")
    );
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  return undefined;
}
