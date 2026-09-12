"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeBdPhone, isValidBdPhone } from "./phone";
import { roleFromJwt, redirectPathForRole } from "./jwt-claims";
import { mapAuthError, type ActionState } from "./actions";

export async function resendPhoneOtpAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const phone = normalizeBdPhone(String(formData.get("phone") ?? ""));
  if (!isValidBdPhone(phone)) {
    return { fieldErrors: { phone: "বৈধ মোবাইল নম্বর দিন" } };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.resend({ type: "sms", phone });

  if (error) {
    console.error("[resendPhoneOtp]", error.message);
    return { error: mapAuthError(error.message) };
  }
  return { ok: true };
}

export async function verifyPhoneOtpAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const phone = normalizeBdPhone(String(formData.get("phone") ?? ""));
  const code = String(formData.get("code") ?? "").trim();

  if (!isValidBdPhone(phone)) {
    return { fieldErrors: { phone: "বৈধ মোবাইল নম্বর দিন" } };
  }
  if (!/^\d{6}$/.test(code)) {
    return { fieldErrors: { code: "৬ সংখ্যার কোড দিন" } };
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token: code,
    type: "sms",
  });

  if (error) {
    console.error("[verifyPhoneOtp]", error.message);
    return { fieldErrors: { code: mapAuthError(error.message) } };
  }

  revalidatePath("/", "layout");
  const role = data.session?.access_token
    ? roleFromJwt(data.session.access_token)
    : null;
  return { ok: true, redirectTo: redirectPathForRole(role) };
}
