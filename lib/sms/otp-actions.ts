"use server";

import { createHash, randomInt } from "crypto";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeBdPhone, isValidBdPhone } from "@/lib/auth/phone";
import { buildOtpMessage, sendSms } from "./gateway";
import type { ActionState } from "@/lib/auth/actions";

const OTP_TTL_MINUTES = 5;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_SECONDS = 60;

type OtpRow = {
  id: string;
  code_hash: string;
  attempts: number;
  expires_at: string;
  sent_at: string;
};

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function generateCode(): string {
  return String(randomInt(0, 1000000)).padStart(6, "0");
}

function otpTable() {
  const supabase = getSupabaseAdminClient();
  return (
    supabase as unknown as {
      from: (t: string) => {
        insert: (row: Record<string, unknown>) => Promise<{ error: unknown }>;
        update: (
          row: Record<string, unknown>,
        ) => {
          eq: (col: string, val: string) => {
            is: (col: string, val: null) => Promise<{ error: unknown }>;
            select: () => Promise<{ error: unknown }>;
          } & Promise<{ error: unknown }>;
        };
        select: (cols: string) => {
          eq: (col: string, val: string) => {
            is: (col: string, val: null) => {
              order: (
                col: string,
                opts: { ascending: boolean },
              ) => {
                limit: (n: number) => {
                  maybeSingle: () => Promise<{
                    data: OtpRow | null;
                    error: unknown;
                  }>;
                };
              };
            };
          };
        };
      };
    }
  ).from("phone_otps");
}

export async function requestPhoneOtpAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = String(formData.get("phone") ?? "");
  const phone = normalizeBdPhone(raw);
  if (!isValidBdPhone(phone)) {
    return { fieldErrors: { phone: "বৈধ মোবাইল নম্বর দিন" } };
  }

  const { data: recent } = await otpTable()
    .select("id, code_hash, attempts, expires_at, sent_at")
    .eq("phone", phone)
    .is("consumed_at", null)
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recent?.sent_at) {
    const elapsed = (Date.now() - new Date(recent.sent_at).getTime()) / 1000;
    if (elapsed < OTP_RESEND_SECONDS) {
      const wait = Math.ceil(OTP_RESEND_SECONDS - elapsed);
      return { error: `আবার পাঠাতে ${wait} সেকেন্ড অপেক্ষা করুন` };
    }
  }

  await otpTable()
    .update({ consumed_at: new Date().toISOString() })
    .eq("phone", phone)
    .is("consumed_at", null);

  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);

  const { error: insertError } = await otpTable().insert({
    phone,
    code_hash: hashCode(code),
    purpose: "signup",
    expires_at: expiresAt.toISOString(),
  });

  if (insertError) {
    console.error("[otp] insert failed", insertError);
    return { error: "OTP তৈরিতে সমস্যা হয়েছে" };
  }

  if (process.env.NODE_ENV !== "production") {
    console.log(`[otp:dev] phone=${phone} code=${code}`);
  }

  const sms = await sendSms(phone, buildOtpMessage(code));
  if (!sms.ok) return { error: sms.error };

  return { ok: true };
}

export async function verifyPhoneOtpAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = String(formData.get("phone") ?? "");
  const phone = normalizeBdPhone(raw);
  const code = String(formData.get("code") ?? "").trim();

  if (!isValidBdPhone(phone)) {
    return { fieldErrors: { phone: "বৈধ মোবাইল নম্বর দিন" } };
  }
  if (!/^\d{6}$/.test(code)) {
    return { fieldErrors: { code: "৬ সংখ্যার কোড দিন" } };
  }

  const { data: otp } = await otpTable()
    .select("id, code_hash, attempts, expires_at, sent_at")
    .eq("phone", phone)
    .is("consumed_at", null)
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!otp) {
    return { error: "OTP মেয়াদ শেষ। নতুন কোড নিন।" };
  }

  const consume = () =>
    otpTable()
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", otp.id)
      .select();

  if (new Date(otp.expires_at) < new Date()) {
    await consume();
    return { error: "OTP মেয়াদ শেষ। নতুন কোড নিন।" };
  }

  if (otp.attempts >= OTP_MAX_ATTEMPTS) {
    await consume();
    return { error: "অনেকবার ভুল চেষ্টা। নতুন কোড নিন।" };
  }

  if (hashCode(code) !== otp.code_hash) {
    await otpTable()
      .update({ attempts: otp.attempts + 1 })
      .eq("id", otp.id);
    return { fieldErrors: { code: "কোড মিলছে না" } };
  }

  await consume();

  const supabase = getSupabaseAdminClient();
  const profilesRead = supabase as unknown as {
    from: (t: string) => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          maybeSingle: () => Promise<{
            data: { id: string; role: string | null } | null;
          }>;
        };
      };
    };
  };
  const { data: profile } = await profilesRead
    .from("profiles")
    .select("id, role")
    .eq("phone", phone)
    .maybeSingle();

  await (
    supabase as unknown as {
      from: (t: string) => {
        update: (row: Record<string, unknown>) => {
          eq: (col: string, val: string) => Promise<{ error: unknown }>;
        };
      };
    }
  )
    .from("profiles")
    .update({ phone_verified_at: new Date().toISOString() })
    .eq("phone", phone);

  const { redirectPathForRole } = await import("@/lib/auth/jwt-claims");
  const role =
    profile?.role === "admin" ||
    profile?.role === "landlord" ||
    profile?.role === "tenant"
      ? profile.role
      : null;

  return { ok: true, redirectTo: redirectPathForRole(role) };
}
