import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/**
 * Server-side encryption for OAuth refresh tokens (AES-256-GCM).
 * The key comes from EMAIL_TOKEN_ENCRYPTION_KEY (base64, 32 bytes):
 *   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 */

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const raw = process.env.EMAIL_TOKEN_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("EMAIL_TOKEN_ENCRYPTION_KEY is not configured.");
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("EMAIL_TOKEN_ENCRYPTION_KEY must be 32 bytes encoded as base64.");
  }
  return key;
}

/** Returns "iv.tag.ciphertext" (all base64). */
export function encryptSecret(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv.toString("base64"), cipher.getAuthTag().toString("base64"), ciphertext.toString("base64")].join(".");
}

export function decryptSecret(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(".");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Invalid encrypted payload.");
  }
  const decipher = createDecipheriv(ALGO, getKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
