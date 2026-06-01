import { formatBdPhoneForDisplay } from "@/lib/auth/phone";

export function resolveCounterpartName(counterpart: {
  name: string | null;
  phone: string | null;
  email: string | null;
}): string {
  const name = counterpart.name?.trim();
  if (name) return name;
  const phone = formatBdPhoneForDisplay(counterpart.phone);
  if (phone) return phone;
  const email = counterpart.email?.trim();
  if (email) return email;
  return "অজানা ব্যবহারকারী";
}
