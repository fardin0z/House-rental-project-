"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowUpRightIcon, LockIcon } from "lucide-react";
import { updatePasswordAction, type ActionState } from "@/lib/auth/actions";

const initial: ActionState = {};

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [state, formAction, pending] = useActionState(updatePasswordAction, initial);

  useEffect(() => {
    if (state.ok && state.redirectTo) {
      router.replace(state.redirectTo);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      <label className="input-card block rounded-[18px] bg-white p-4">
        <span className="block text-[12px] font-bold text-ink-500">
          {t("newPasswordLabel")}
        </span>
        <div className="mt-3 flex items-center gap-3">
          <LockIcon className="h-5 w-5 text-ink-500/40" />
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder={t("passwordHint")}
            aria-invalid={Boolean(state.fieldErrors?.password)}
            required
            className="w-full border-0 bg-transparent text-[17px] font-semibold tracking-tight text-ink-900 outline-none placeholder:text-ink-500/35"
          />
        </div>
        {state.fieldErrors?.password ? (
          <p className="mt-2 text-[12px] font-semibold text-red-600">
            {state.fieldErrors.password}
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
        {pending ? "..." : t("updatePassword")}
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
