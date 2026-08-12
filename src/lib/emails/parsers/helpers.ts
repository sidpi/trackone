import type { GmailMessage } from "../gmail";
import {
  detectCourier,
  extractEstimatedDelivery,
  extractTrackingNumber,
  mapEmailStatus,
  normalizeCourierName,
} from "../patterns";
import type { ParsedShipment } from "../types";

export interface BuildOptions {
  merchant?: string;
  /** Courier from the sender domain (already detected). */
  detectedCourier?: string | null;
}

/**
 * Runs the shared extraction pipeline over an email. Returns null when no
 * usable tracking number is found.
 */
export function buildParsedShipment(
  message: GmailMessage,
  options: BuildOptions = {}
): ParsedShipment | null {
  const detected = options.detectedCourier ?? detectCourier(message);
  const haystack = [message.subject, message.bodyText, message.snippet].join("\n");

  const trackingNumber = extractTrackingNumber(haystack, detected);
  if (!trackingNumber) return null;

  const status = mapEmailStatus(`${message.subject} ${message.bodyText}`);
  const estimatedDelivery = extractEstimatedDelivery(message.bodyText);
  const merchant = options.merchant;

  // Courier = detected courier (normalized), else the merchant name so the
  // dashboard always shows something meaningful.
  const courier = detected ? normalizeCourierName(detected) : (merchant ?? "Unknown");

  const summary = [
    merchant ? `${merchant} order` : null,
    status ? `marked ${status.replaceAll("_", " ")}` : null,
    estimatedDelivery ? `delivery ~${estimatedDelivery.slice(0, 10)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    trackingNumber,
    courier,
    merchant,
    estimatedDelivery,
    status,
    summary: summary || undefined,
  };
}

export function fromAddressMatches(from: string, domains: string[]): boolean {
  const match = /@([\w.-]+)/.exec(from);
  const domain = (match?.[1] ?? "").toLowerCase();
  return domains.some((d) => domain === d || domain.endsWith(`.${d}`));
}
