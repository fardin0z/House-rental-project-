export const SITE_NAME = "ToletZoo";
export const SITE_NAME_BN = "বাসা ভাড়া";
export const SITE_TAGLINE_EN = "Verified house rentals in Bangladesh";
export const SITE_TAGLINE_BN = "যাচাইকৃত মালিকের কাছ থেকে দালাল ছাড়াই বাসা ভাড়া।";

export const CANONICAL_HOST = "toletzoo.com";
export const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return CANONICAL_ORIGIN;
  try {
    const parsed = new URL(raw);
    const host = parsed.host.toLowerCase();
    if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
      return `${parsed.protocol}//${parsed.host}`;
    }
    return CANONICAL_ORIGIN;
  } catch {
    return CANONICAL_ORIGIN;
  }
}

export function getCanonicalHost(): string {
  return new URL(getSiteUrl()).host;
}

export function buildCanonicalPath(pathname: string): string {
  if (!pathname.startsWith("/")) return `/${pathname}`;
  return pathname;
}
