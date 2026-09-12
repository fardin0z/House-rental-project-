import { createHmac, timingSafeEqual } from "crypto";

const TOLERANCE_SECONDS = 5 * 60;

function decodeSecret(raw: string): Buffer {
  const stripped = raw.trim().replace(/^v1,/, "").replace(/^whsec_/, "");
  return Buffer.from(stripped, "base64");
}

export function verifyStandardWebhook(
  rawBody: string,
  headers: {
    id: string | null;
    timestamp: string | null;
    signature: string | null;
  },
  secret: string,
): boolean {
  if (!headers.id || !headers.timestamp || !headers.signature) return false;

  const ts = Number.parseInt(headers.timestamp, 10);
  if (!Number.isFinite(ts)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > TOLERANCE_SECONDS) return false;

  const key = decodeSecret(secret);
  const expected = createHmac("sha256", key)
    .update(`${headers.id}.${headers.timestamp}.${rawBody}`)
    .digest();

  return headers.signature
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .some((part) => {
      const [version, sig] = part.split(",");
      if (version !== "v1" || !sig) return false;
      const candidate = Buffer.from(sig, "base64");
      return (
        candidate.length === expected.length &&
        timingSafeEqual(candidate, expected)
      );
    });
}
