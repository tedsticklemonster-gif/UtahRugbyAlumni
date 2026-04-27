import { createHmac } from "crypto";

const SEPARATOR = ".";

function getSecret(): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for unsubscribe tokens");
  return secret;
}

/** Create an HMAC-signed unsubscribe token for an alumni ID */
export function createUnsubscribeToken(alumniId: string): string {
  const sig = createHmac("sha256", getSecret())
    .update(alumniId)
    .digest("hex")
    .slice(0, 16);
  return `${alumniId}${SEPARATOR}${sig}`;
}

/** Verify and extract alumni ID from an unsubscribe token. Returns null if invalid. */
export function verifyUnsubscribeToken(token: string): string | null {
  const idx = token.lastIndexOf(SEPARATOR);
  if (idx === -1) return null;

  const alumniId = token.slice(0, idx);
  const sig = token.slice(idx + 1);

  const expected = createHmac("sha256", getSecret())
    .update(alumniId)
    .digest("hex")
    .slice(0, 16);

  if (sig !== expected) return null;
  return alumniId;
}

/** Build the full unsubscribe URL for use in emails */
export function unsubscribeUrl(alumniId: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://alumni.utah-rugby.com";
  const token = createUnsubscribeToken(alumniId);
  return `${appUrl}/api/unsubscribe?token=${encodeURIComponent(token)}`;
}
