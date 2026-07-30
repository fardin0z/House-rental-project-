"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowUpRightIcon,
  KeyRoundIcon,
  RefreshCwIcon,
  SmartphoneIcon,
} from "lucide-react";
import {
  requestPhoneOtpAction,
  verifyPhoneOtpAction,
} from "@/lib/sms/otp-actions";
import type { ActionState } from "@/lib/auth/actions";
import { formatBdPhoneForDisplay } from "@/lib/auth/phone";

const initial: ActionState = {};

export function VerifyPhonePanel({ phone }: { phone: string }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [resendState, resendAction, resendPending] = useActionState(
    requestPhoneOtpAction,
    initial,
  );
  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifyPhoneOtpAction,
    initial,
  );

  useEffect(() => {
    if (verifyState.ok && verifyState.redirectTo) {
      router.replace(verifyState.redirectTo);
    }
  }, [verifyState, router]);

  const displayPhone = formatBdPhoneForDisplay(phone) ?? phone;

  return (
    <div className="space-y-4">
      <div className="rounded-[18px] bg-white p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-lime-400/25 text-ink-900">
            <SmartphoneIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[12px] font-bold uppercase tracking-wider text-ink-500">
              {t("phoneLabel")}
            </p>
            <p className="mt-1 truncate text-[15px] font-semibold text-ink-900">
              {displayPhone}
            </p>
          </div>
        </div>
        <p className="mt-4 text-[13px] leading-relaxed text-ink-500">
          {phone
            ? t("verifyPhoneSent", { phone: displayPhone })
            : t("verifyPhoneSubtitle")}
        </p>
      </div>

      <form action={verifyAction} className="space-y-3">
        <input type="hidden" name="phone" value={phone} />
        <label className="input-card block rounded-[18px] bg-white p-4">
          <span className="block text-[12px] font-bold text-ink-500">
            {t("verifyPhoneCodeLabel")}
          </span>
          <div className="mt-3 flex items-center gap-3">
            <KeyRoundIcon className="h-5 w-5 text-ink-500/40" />
            <input
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="১২৩৪৫৬"
              required
              aria-invalid={Boolean(verifyState.fieldErrors?.code)}
              className="w-full border-0 bg-transparent text-[22px] font-bold tracking-[0.5em] text-ink-900 outline-none placeholder:text-ink-500/30"
            />
          </div>
          {verifyState.fieldErrors?.code ? (
            <p className="mt-2 text-[12px] font-semibold text-red-600">
              {verifyState.fieldErrors.code}
            </p>
          ) : null}
        </label>

        <p className="min-h-5 text-[13px] font-semibold leading-5 text-red-600">
          {verifyState.error ?? ""}
        </p>

        <button
          type="submit"
          disabled={verifyPending}
          className="inline-flex h-14 w-full items-center justify-center rounded-full bg-lime-400 text-[15px] font-bold text-ink-900 transition hover:bg-lime-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {verifyPending ? "..." : t("verifyPhoneCta")}
          <ArrowUpRightIcon className="ml-2 h-5 w-5" />
        </button>
      </form>

      <form action={resendAction} className="space-y-2">
        <input type="hidden" name="phone" value={phone} />
        <button
          type="submit"
          disabled={resendPending}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-ink/15 bg-white text-[13px] font-bold text-ink-900 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCwIcon className="h-4 w-4" />
          {resendPending ? "..." : t("verifyPhoneResend")}
        </button>
        {resendState.ok ? (
          <p className="text-center text-[13px] font-semibold text-emerald-600">
            {t("verifyPhoneResent")}
          </p>
        ) : null}
        {resendState.error ? (
          <p className="text-center text-[13px] font-semibold text-red-600">
            {resendState.error}
          </p>
        ) : null}
      </form>

      <p className="pt-2 text-center text-[14px] font-medium text-ink-500">
        <Link
          href="/login"
          className="font-bold text-ink-900 hover:underline"
        >
          {t("backToLogin")}
        </Link>
      </p>
    </div>
  );
}
