"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowUpRightIcon } from "lucide-react";
import { updatePasswordAction, type ActionState } from "@/lib/auth/actions";
import { PasswordField } from "./password-field";

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
      <PasswordField
        label={t("newPasswordLabel")}
        name="password"
        placeholder={t("passwordHint")}
        autoComplete="new-password"
        invalid={Boolean(state.fieldErrors?.password)}
      />
      {state.fieldErrors?.password ? (
        <p className="mt-2 text-[12px] font-semibold text-red-600">
          {state.fieldErrors.password}
        </p>
      ) : null}

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
