import { normalizeBdPhone, isValidBdPhone } from "./phone";

export type Identifier =
  | { kind: "email"; email: string }
  | { kind: "phone"; phone: string };

export function looksLikeEmail(input: string): boolean {
  return input.includes("@");
}

export function parseIdentifier(input: string): Identifier | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (looksLikeEmail(trimmed)) {
    const email = trimmed.toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return null;
    return { kind: "email", email };
  }

  const phone = normalizeBdPhone(trimmed);
  if (!isValidBdPhone(phone)) return null;
  return { kind: "phone", phone };
}
