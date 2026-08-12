import type { GmailMessage } from "./gmail";
import type { ShipmentStatus } from "@/lib/types";

/** What an email parser extracts from one email. */
export interface ParsedShipment {
  /** Tracking / AWB number (unmodified, for display). */
  trackingNumber: string;
  /**
   * Courier when identifiable (e.g. "Delhivery", "Ekart"). Falls back to the
   * merchant name (e.g. "Amazon") so the dashboard always has something.
   */
  courier: string;
  /** Merchant / marketplace, e.g. "Amazon", "Flipkart". */
  merchant?: string;
  /** Estimated delivery as ISO timestamp when parseable. */
  estimatedDelivery?: string;
  /** Mapped ShipTrack status when the email states one, else undefined. */
  status?: ShipmentStatus;
  /** One-line human summary (used as the shipment nickname). */
  summary?: string;
}

/**
 * A modular email parser. Register parsers in `parsers/index.ts`.
 * `matches` runs on cheap metadata (from + subject); `parse` receives the
 * full message (with body text) and returns extracted facts or null.
 */
export interface EmailParser {
  name: string;
  matches(message: Pick<GmailMessage, "from" | "subject" | "snippet">): boolean;
  parse(message: GmailMessage): ParsedShipment | null;
}

export interface SyncStats {
  /** Messages matched by the discovery query. */
  scanned: number;
  /** Messages fully fetched and parsed. */
  parsed: number;
  /** New shipments created. */
  created: number;
  /** Tracking numbers that matched an existing shipment (no duplicate). */
  associated: number;
  /** Messages parsed but unusable (no tracking number, invalid, …). */
  skipped: number;
  /** Non-fatal problems during the sync (parsing errors, rate limits). */
  errors: string[];
}

export interface SyncResult {
  email: string;
  stats: SyncStats;
}
