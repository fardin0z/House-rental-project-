const BD_PHONE_PATTERN = /^\+8801[3-9]\d{8}$/;

export function normalizeBdPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("880") && digits.length === 13) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 11) return `+88${digits}`;
  if (digits.length === 10) return `+880${digits}`;
  return `+${digits}`;
}

export function isValidBdPhone(phone: string): boolean {
  return BD_PHONE_PATTERN.test(phone);
}

export function formatBdPhoneForDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("880")) {
    return `0${digits.slice(3)}`;
  }
  return phone;
}
