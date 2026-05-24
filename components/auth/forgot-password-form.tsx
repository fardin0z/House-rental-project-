"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRightIcon, MailCheckIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
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
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-emerald-300/50 bg-emerald-50/50 px-6 py-10 text-center">
        <div className="grid size-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
          <MailCheckIcon className="size-6" />
        </div>
        <p className="text-sm text-ink">{t("resetSent")}</p>
        <Link href="/login" className="text-sm font-medium text-ink hover:underline">
          {t("backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft">
          {t("emailLabel")}
        </span>
        <Input
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(state.fieldErrors?.email)}
          required
          className="h-14 rounded-2xl border-rule bg-paper px-5 text-base"
        />
        {state.fieldErrors?.email ? (
          <p className="text-sm text-destructive">{state.fieldErrors.email}</p>
        ) : null}
      </label>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="group inline-flex items-center justify-between rounded-full bg-ink px-6 py-4 text-base font-medium text-paper transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span>{pending ? "..." : t("sendResetLink")}</span>
        <span className="grid size-9 place-items-center rounded-full bg-ember text-paper transition-transform group-hover:rotate-12">
          <ArrowUpRightIcon className="size-4" />
        </span>
      </button>

      <p className="text-center text-sm text-ink-soft">
        <Link href="/login" className="font-medium text-ink hover:underline">
          {t("backToLogin")}
        </Link>
      </p>
    </form>
  );
}
