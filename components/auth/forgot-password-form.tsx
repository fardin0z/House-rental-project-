"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRightIcon, MailCheckIcon, MailIcon } from "lucide-react";
import { requestPasswordResetAction, type ActionState } from "@/lib/auth/actions";

const initial: ActionState = {};

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    initial,
  );

  if (state.ok) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[22px] bg-white px-6 py-10 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-lime-400 text-ink-900">
          <MailCheckIcon className="h-6 w-6" />
        </div>
        <p className="text-[15px] font-medium text-ink-700">{t("resetSent")}</p>
        <Link
          href="/login"
          className="text-[14px] font-bold text-ink-900 hover:underline"
        >
          {t("backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <label className="input-card block rounded-[18px] bg-white p-4">
        <span className="block text-[12px] font-bold text-ink-500">
          {t("emailLabel")}
        </span>
        <div className="mt-3 flex items-center gap-3">
          <MailIcon className="h-5 w-5 text-ink-500/40" />
          <input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(state.fieldErrors?.email)}
            required
            className="w-full border-0 bg-transparent text-[17px] font-semibold tracking-tight text-ink-900 outline-none placeholder:text-ink-500/35"
          />
        </div>
        {state.fieldErrors?.email ? (
          <p className="mt-2 text-[12px] font-semibold text-red-600">
            {state.fieldErrors.email}
          </p>
        ) : null}
      </label>

      <p className="min-h-5 text-[13px] font-semibold leading-5 text-red-600">
        {state.error ?? ""}
      </p>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-14 w-full items-center justify-center rounded-full bg-lime-400 text-[15px] font-bold text-ink-900 transition hover:bg-lime-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "..." : t("sendResetLink")}
        <ArrowUpRightIcon className="ml-2 h-5 w-5" />
      </button>

      <p className="pt-2 text-center text-[14px] font-medium text-ink-500">
        <Link href="/login" className="font-bold text-ink-900 hover:underline">
          {t("backToLogin")}
        </Link>
      </p>
    </form>
  );
}
