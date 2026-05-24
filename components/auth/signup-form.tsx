"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRightIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { signupAction, type ActionState } from "@/lib/auth/actions";

const initial: ActionState = {};

export function SignupForm() {
  const t = useTranslations("auth");
  const [state, formAction, pending] = useActionState(signupAction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft">
          {t("nameLabel")}
        </span>
        <Input
          name="name"
          type="text"
          autoComplete="name"
          placeholder={t("namePlaceholder")}
          aria-invalid={Boolean(state.fieldErrors?.name)}
          required
          className="h-14 rounded-2xl border-rule bg-paper px-5 text-base"
        />
        {state.fieldErrors?.name ? (
          <p className="text-sm text-destructive">{state.fieldErrors.name}</p>
        ) : null}
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft">
          {t("identifierLabel")}
        </span>
        <Input
          name="identifier"
          type="text"
          inputMode="email"
          autoComplete="username"
          placeholder={t("identifierPlaceholder")}
          aria-invalid={Boolean(state.fieldErrors?.identifier)}
          required
          className="h-14 rounded-2xl border-rule bg-paper px-5 text-base"
        />
        {state.fieldErrors?.identifier ? (
          <p className="text-sm text-destructive">{state.fieldErrors.identifier}</p>
        ) : null}
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft">
          {t("passwordLabel")}
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
        <span>{pending ? "..." : t("signupCta")}</span>
        <span className="grid size-9 place-items-center rounded-full bg-ember text-paper transition-transform group-hover:rotate-12">
          <ArrowUpRightIcon className="size-4" />
        </span>
      </button>

      <p className="text-center text-sm text-ink-soft">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-medium text-ink hover:underline">
          {t("loginCta")}
        </Link>
      </p>
    </form>
  );
}
