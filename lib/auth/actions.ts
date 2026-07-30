"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { parseIdentifier } from "./identifier";
import {
  loginInput,
  signupInput,
  resetRequestInput,
  updatePasswordInput,
} from "./schema";

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
  redirectTo?: string;
};

export async function loginAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginInput.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: flattenZodErrors(parsed.error) };
  }

  const id = parseIdentifier(parsed.data.identifier);
  if (!id) return { fieldErrors: { identifier: "বৈধ মোবাইল নম্বর বা ইমেইল দিন" } };

  const supabase = await getSupabaseServerClient();
  const credentials =
    id.kind === "email"
      ? { email: id.email, password: parsed.data.password }
      : { phone: id.phone, password: parsed.data.password };

  const { data: signInData, error } =
    await supabase.auth.signInWithPassword(credentials);

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  revalidatePath("/", "layout");

  const { roleFromJwt, redirectPathForRole } = await import(
    "@/lib/auth/jwt-claims"
  );
  const role = signInData.session?.access_token
    ? roleFromJwt(signInData.session.access_token)
    : null;
  return { ok: true, redirectTo: redirectPathForRole(role) };
}

export async function signupAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signupInput.safeParse({
    name: formData.get("name"),
    identifier: formData.get("identifier"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { fieldErrors: flattenZodErrors(parsed.error) };
  }

  const id = parseIdentifier(parsed.data.identifier);
  if (!id) return { fieldErrors: { identifier: "বৈধ মোবাইল নম্বর বা ইমেইল দিন" } };

  const supabase = await getSupabaseServerClient();
  const credentials =
    id.kind === "email"
      ? { email: id.email, password: parsed.data.password }
      : { phone: id.phone, password: parsed.data.password };

  const { CANONICAL_ORIGIN } = await import("@/lib/seo/site");
  const { data, error } = await supabase.auth.signUp({
    ...credentials,
    options: {
      data: {
        name: parsed.data.name,
        role: parsed.data.role,
      },
      emailRedirectTo:
        id.kind === "email" ? `${CANONICAL_ORIGIN}/login` : undefined,
    },
  });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  if (id.kind === "phone") {
    const { requestPhoneOtpAction } = await import("@/lib/sms/otp-actions");
    const otpForm = new FormData();
    otpForm.set("phone", id.phone);
    await requestPhoneOtpAction({}, otpForm);
    return {
      ok: true,
      redirectTo: `/verify-phone?phone=${encodeURIComponent(id.phone)}`,
    };
  }

  if (!data.session) {
    return {
      ok: true,
      redirectTo: `/verify-email?email=${encodeURIComponent(id.email)}`,
    };
  }

  revalidatePath("/", "layout");
  const { redirectPathForRole } = await import("@/lib/auth/jwt-claims");
  return {
    ok: true,
    redirectTo: redirectPathForRole(parsed.data.role),
  };
}

export async function requestPasswordResetAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetRequestInput.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { fieldErrors: flattenZodErrors(parsed.error) };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/reset-password`,
  });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  return { ok: true };
}

export async function updatePasswordAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = updatePasswordInput.safeParse({
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: flattenZodErrors(parsed.error) };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  revalidatePath("/", "layout");
  return { ok: true, redirectTo: "/" };
}

export async function signOutAction() {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function resendVerificationAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "বৈধ ইমেইল দিন" };
  }

  const { CANONICAL_ORIGIN } = await import("@/lib/seo/site");
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${CANONICAL_ORIGIN}/login` },
  });

  if (error) return { error: mapAuthError(error.message) };
  return { ok: true };
}

function flattenZodErrors(error: import("zod").ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (path && !out[path]) out[path] = issue.message;
  }
  return out;
}

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return "ভুল তথ্য। মোবাইল/ইমেইল বা পাসওয়ার্ড মিলছে না।";
  }
  if (lower.includes("already registered") || lower.includes("already exists")) {
    return "এই অ্যাকাউন্ট আগে থেকেই আছে। লগইন করুন।";
  }
  if (lower.includes("rate limit")) {
    return "অনেক বেশি অনুরোধ। কিছুক্ষণ পর আবার চেষ্টা করুন।";
  }
  if (lower.includes("weak") || lower.includes("password")) {
    return "পাসওয়ার্ড দুর্বল। আরও শক্তিশালী পাসওয়ার্ড দিন।";
  }
  return "সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।";
}
