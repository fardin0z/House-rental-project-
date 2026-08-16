const BD_PHONE_PATTERN = /^\+8801[3-9]\d{8}$/;

const BN_TO_ASCII_DIGIT: Record<string, string> = {
  "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
  "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
};

function toAsciiDigits(input: string): string {
  return input.replace(/[০-৯]/g, (c) => BN_TO_ASCII_DIGIT[c] ?? c);
}

export function normalizeBdPhone(input: string): string {
  const digits = toAsciiDigits(input).replace(/\D/g, "");
  if (digits.startsWith("880") && digits.length === 13) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 11) return `+88${digits}`;
  if (digits.length === 10) return `+880${digits}`;
  return `+${digits}`;
}

export function isValidBdPhone(phone: string): boolean {
  return BD_PHONE_PATTERN.test(phone);
}

export function formatBdPhoneForDisplay(phone: string | null): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("880")) {
    return `0${digits.slice(3)}`;
  }
  return phone;
}
