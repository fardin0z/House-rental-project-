const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

export function bengaliToAsciiDigits(input: string): string {
  return input.replace(/[০-৯]/g, (digit) => String(BN_DIGITS.indexOf(digit)));
}

export function parseBengaliInt(input: FormDataEntryValue | null): number | null {
  if (input == null) return null;
  const ascii = bengaliToAsciiDigits(String(input)).replace(/[^\d]/g, "");
  if (!ascii) return null;
  const value = Number.parseInt(ascii, 10);
  return Number.isFinite(value) ? value : null;
}
