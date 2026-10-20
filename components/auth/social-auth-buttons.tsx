"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
export type SocialRole = "tenant" | "landlord";
type Props = { role?: SocialRole };
export function SocialAuthButtons({ role: initialRole = "tenant" }: Props) {
  const t = useTranslations("auth");
  const [role, setRole] = useState<SocialRole>(initialRole);
  const [pending, setPending] = useState<"google" | "facebook" | null>(null);
  const [error, setError] = useState("");
  async function continueWith(provider: "google" | "facebook") {
    setError(""); setPending(provider);
    const callback = new URL("/auth/confirm", window.location.origin);
    callback.searchParams.set("role", role);
    const { error: authError } = await getSupabaseBrowserClient().auth.signInWithOAuth({ provider, options: { redirectTo: callback.toString() } });
    if (authError) { setError(authError.message); setPending(null); }
  }
  return <div className="space-y-3">
    <div className="rounded-[18px] bg-white p-4">
      <p className="text-[12px] font-bold text-ink-500">{"অ্যাকাউন্টের ধরন বেছে নিন"}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" aria-pressed={role === "tenant"} onClick={() => setRole("tenant")} className={role === "tenant" ? selectedClass : unselectedClass}>{t("roleTenant")}</button>
        <button type="button" aria-pressed={role === "landlord"} onClick={() => setRole("landlord")} className={role === "landlord" ? selectedClass : unselectedClass}>{t("roleLandlord")}</button>
      </div>
    </div>
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <button type="button" disabled={pending !== null} onClick={() => continueWith("google")} className={socialButtonClass}><span className="grid h-7 w-7 place-items-center rounded-full bg-white text-[15px] font-bold text-[#4285F4]">G</span>{pending === "google" ? "..." : "Google দিয়ে চালিয়ে যান"}</button>
      <button type="button" disabled={pending !== null} onClick={() => continueWith("facebook")} className={socialButtonClass}><span className="grid h-7 w-7 place-items-center rounded-full bg-[#1877F2] text-[15px] font-bold text-white">f</span>{pending === "facebook" ? "..." : "Facebook দিয়ে চালিয়ে যান"}</button>
    </div>
    {error ? <p className="text-center text-[12px] font-semibold text-red-600">{error}</p> : null}
    <div className="flex items-center gap-3 py-1 text-[11px] font-bold uppercase tracking-[.18em] text-ink-500/50"><span className="h-px flex-1 bg-ink-900/10" />{"অথবা"}<span className="h-px flex-1 bg-ink-900/10" /></div>
  </div>;
}
const selectedClass = "rounded-full bg-ink-900 px-3 py-2 text-[12px] font-bold text-white shadow-[0_0_0_2px_#A4E861]";
const unselectedClass = "rounded-full bg-ink-50 px-3 py-2 text-[12px] font-bold text-ink-900";
const socialButtonClass = "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-3 text-[13px] font-bold text-ink-900 transition hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-60";

