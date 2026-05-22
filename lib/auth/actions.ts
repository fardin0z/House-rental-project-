"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  consumeDevOtp,
  devEmailForPhone,
  devPasswordForPhone,
  generateDevOtp,
  isDevOtpEnabled,
  storeDevOtp,
} from "./dev-otp";
import { sendOtpInput, verifyOtpInput } from "./schema";

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
};

export async function sendOtpAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = sendOtpInput.safeParse({
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { fieldErrors: flattenZodErrors(parsed.error) };
  }

  if (isDevOtpEnabled()) {
    const code = generateDevOtp();
    storeDevOtp(parsed.data.phone, code);
    console.info(`\n[DEV OTP] ${parsed.data.phone} → ${code}\n`);
    redirect(`/verify-otp?phone=${encodeURIComponent(parsed.data.phone)}`);
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    phone: parsed.data.phone,
    options: { channel: "sms" },
  });

  if (error) {
    return { error: mapSupabaseAuthError(error.message) };
  }

  redirect(`/verify-otp?phone=${encodeURIComponent(parsed.data.phone)}`);
}

export async function verifyOtpAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = verifyOtpInput.safeParse({
    phone: formData.get("phone"),
    token: formData.get("token"),
  });

  if (!parsed.success) {
    return { fieldErrors: flattenZodErrors(parsed.error) };
  }

  if (isDevOtpEnabled()) {
    return await verifyDevOtp(parsed.data.phone, parsed.data.token);
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    phone: parsed.data.phone,
    token: parsed.data.token,
    type: "sms",
  });

  if (error) {
    return { error: mapSupabaseAuthError(error.message) };
  }

  redirect("/onboarding/role");
}

export async function signOutAction() {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

async function verifyDevOtp(phone: string, token: string): Promise<ActionState> {
  if (!consumeDevOtp(phone, token)) {
    return { error: "ভুল কোড। আবার চেষ্টা করুন।" };
  }

  let admin;
  try {
    admin = getSupabaseAdminClient();
  } catch {
    return {
      error: "DEV মোডে SUPABASE_SECRET_KEY প্রয়োজন। .env ফাইল চেক করুন।",
    };
  }

  const email = devEmailForPhone(phone);
  const password = devPasswordForPhone(phone);

  const { error: createError } = await admin.auth.admin.createUser({
    email,
    phone,
    password,
    email_confirm: true,
    phone_confirm: true,
  });

  if (createError) {
    const alreadyExists = /already|registered|exists/i.test(createError.message);
    if (alreadyExists) {
      const { data, error: listError } = await admin.auth.admin.listUsers();
      if (listError) {
        return { error: `ব্যবহারকারী লোডে সমস্যা: ${listError.message}` };
      }
      const existing = data.users.find((u) => u.email === email);
      if (existing) {
        const { error: updateError } = await admin.auth.admin.updateUserById(
          existing.id,
          { password },
        );
        if (updateError) {
          return { error: `পাসওয়ার্ড আপডেটে সমস্যা: ${updateError.message}` };
        }
      }
    } else {
      return { error: `ব্যবহারকারী তৈরিতে সমস্যা: ${createError.message}` };
    }
  }

  const supabase = await getSupabaseServerClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return { error: `সাইন ইনে সমস্যা: ${signInError.message}` };
  }

  redirect("/onboarding/role");
}

function flattenZodErrors(error: import("zod").ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (path && !out[path]) out[path] = issue.message;
  }
  return out;
}

function mapSupabaseAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("rate limit")) return "অনেক বেশি অনুরোধ। কিছুক্ষণ পর আবার চেষ্টা করুন।";
  if (lower.includes("invalid") && lower.includes("otp")) return "ভুল কোড। আবার চেষ্টা করুন।";
  if (lower.includes("expired")) return "কোডের মেয়াদ শেষ। নতুন কোড নিন।";
  if (lower.includes("phone")) return "বৈধ মোবাইল নম্বর দিন।";
  return "সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।";
}
