"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRightIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { updatePasswordAction, type ActionState } from "@/lib/auth/actions";

const initial: ActionState = {};

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const [state, formAction, pending] = useActionState(updatePasswordAction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft">
          {t("newPasswordLabel")}
        </span>
        <Input
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder={t("passwordHint")}
          aria-invalid={Boolean(state.fieldErrors?.password)}
          required
          className="h-14 rounded-2xl border-rule bg-paper px-5 text-base"
        />
        {state.fieldErrors?.password ? (
          <p className="text-sm text-destructive">{state.fieldErrors.password}</p>
        ) : null}
      </label>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="group inline-flex items-center justify-between rounded-full bg-ink px-6 py-4 text-base font-medium text-paper transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span>{pending ? "..." : t("updatePassword")}</span>
        <span className="grid size-9 place-items-center rounded-full bg-ember text-paper transition-transform group-hover:rotate-12">
          <ArrowUpRightIcon className="size-4" />
        </span>
      </button>
    </form>
  );
}
