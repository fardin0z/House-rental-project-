"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowUpRightIcon,
  CheckCircle2Icon,
  MailIcon,
  RefreshCwIcon,
  XCircleIcon,
} from "lucide-react";
import {
  resendVerificationAction,
  type ActionState,
} from "@/lib/auth/actions";

type Status = "pending" | "verified" | "error";

const initial: ActionState = {};

export function VerifyEmailPanel({
  email,
  status = "pending",
  reason = "",
}: {
  email: string;
  status?: Status;
  reason?: string;
}) {
  const t = useTranslations("auth");
  const [state, formAction, pending] = useActionState(
    resendVerificationAction,
    initial,
  );

  if (status === "verified") {
    return (
      <div className="space-y-4">
        <div className="rounded-[18px] bg-emerald-50 p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-emerald-500 text-white">
              <CheckCircle2Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-emerald-800">
                {t("verifyEmailSuccessTitle")}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-emerald-700/85">
                {t("verifyEmailSuccessBody")}
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/login"
          className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-lime-400 text-[15px] font-bold text-ink-900 transition hover:bg-lime-500"
        >
          {t("verifyEmailSuccessCta")}
          <ArrowUpRightIcon className="ml-1 h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {status === "error" ? (
        <div className="rounded-[18px] bg-red-50 p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-red-500 text-white">
              <XCircleIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-red-800">
                {t("verifyEmailErrorTitle")}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-red-700/85">
                {t("verifyEmailErrorBody")}
              </p>
              {reason ? (
                <p className="mt-2 text-[11px] font-medium text-red-700/70">
                  {reason}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-[18px] bg-white p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-lime-400/25 text-ink-900">
            <MailIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[12px] font-bold uppercase tracking-wider text-ink-500">
              {t("emailLabel")}
            </p>
            <p className="mt-1 truncate text-[15px] font-semibold text-ink-900">
              {email || "—"}
            </p>
          </div>
        </div>
        <p className="mt-4 text-[13px] leading-relaxed text-ink-500">
          {email
            ? t("verifyEmailSent", { email })
            : t("verifyEmailSubtitle")}
        </p>
        <p className="mt-3 text-[12px] font-medium text-ink-500/80">
          {t("verifyEmailHint")}
        </p>
      </div>

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="email" value={email} />
        <button
          type="submit"
          disabled={pending || !email}
          className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-lime-400 text-[15px] font-bold text-ink-900 transition hover:bg-lime-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCwIcon className="h-4 w-4" />
          {pending ? "..." : t("verifyEmailResend")}
        </button>

        {state.ok ? (
          <p className="text-center text-[13px] font-semibold text-emerald-600">
            {t("verifyEmailResent")}
          </p>
        ) : null}
        {state.error ? (
          <p className="text-center text-[13px] font-semibold text-red-600">
            {state.error}
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
