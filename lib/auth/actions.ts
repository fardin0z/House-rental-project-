"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
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

async function getRequestOrigin(): Promise<string> {
  const h = await headers();
  const forwardedProto = (h.get("x-forwarded-proto") ?? "").split(",")[0]?.trim();
  const forwardedHost = (h.get("x-forwarded-host") ?? "").split(",")[0]?.trim();
  const host = forwardedHost || h.get("host");
  if (host) {
    const isLocal = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)/.test(host);
    const proto = forwardedProto || (isLocal ? "http" : "https");
    return `${proto}://${host}`;
  }
  const { CANONICAL_ORIGIN } = await import("@/lib/seo/site");
  return CANONICAL_ORIGIN;
}

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
    const lower = error.message.toLowerCase();
    if (
      id.kind === "email" &&
      (lower.includes("email not confirmed") ||
        lower.includes("email not verified") ||
        lower.includes("confirm your email"))
    ) {
      return {
        ok: true,
        redirectTo: `/verify-email?email=${encodeURIComponent(id.email)}&reason=unverified`,
      };
    }
    if (
      id.kind === "phone" &&
      (lower.includes("phone not confirmed") ||
        lower.includes("phone_not_confirmed"))
    ) {
      return {
        ok: true,
        redirectTo: `/verify-phone?phone=${encodeURIComponent(id.phone)}&reason=unverified`,
      };
    }
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

  const origin = await getRequestOrigin();
  const { data, error } = await supabase.auth.signUp({
    ...credentials,
    options: {
      data: {
        name: parsed.data.name,
        role: parsed.data.role,
      },
      emailRedirectTo:
        id.kind === "email"
          ? `${origin}/auth/confirm?next=${encodeURIComponent(
              "/verify-email?status=verified",
            )}`
          : undefined,
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

  const origin = await getRequestOrigin();
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/confirm?next=${encodeURIComponent("/reset-password")}`,
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

  const origin = await getRequestOrigin();
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(
        "/verify-email?status=verified",
      )}`,
    },
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
  if (
    lower.includes("email not confirmed") ||
    lower.includes("email not verified") ||
    lower.includes("confirm your email")
  ) {
    return "ইমেইল যাচাই করা হয়নি। আপনার ইমেইলে পাঠানো লিংকে ক্লিক করে যাচাই সম্পন্ন করুন।";
  }
  if (
    lower.includes("phone not confirmed") ||
    lower.includes("phone_not_confirmed")
  ) {
    return "মোবাইল নম্বর যাচাই করা হয়নি। SMS-এ পাঠানো OTP দিয়ে যাচাই করুন।";
  }
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
