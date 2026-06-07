"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowUpRightIcon, LockIcon, MailIcon, UserIcon } from "lucide-react";
import { signupAction, type ActionState } from "@/lib/auth/actions";

const initial: ActionState = {};

export function SignupForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [state, formAction, pending] = useActionState(signupAction, initial);

  useEffect(() => {
    if (state.ok && state.redirectTo) {
      router.replace(state.redirectTo);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      <InputCard
        label={t("nameLabel")}
        icon={<UserIcon className="h-5 w-5 text-ink-500/40" />}
      >
        <input
          name="name"
          type="text"
          autoComplete="name"
          placeholder={t("namePlaceholder")}
          aria-invalid={Boolean(state.fieldErrors?.name)}
          required
          className="w-full border-0 bg-transparent text-[17px] font-semibold tracking-tight text-ink-900 outline-none placeholder:text-ink-500/35"
        />
        {state.fieldErrors?.name ? (
          <FieldError message={state.fieldErrors.name} />
        ) : null}
      </InputCard>

      <InputCard
        label={t("identifierLabel")}
        icon={<MailIcon className="h-5 w-5 text-ink-500/40" />}
      >
        <input
          name="identifier"
          type="text"
          inputMode="email"
          autoComplete="username"
          placeholder={t("identifierPlaceholder")}
          aria-invalid={Boolean(state.fieldErrors?.identifier)}
          required
          className="w-full border-0 bg-transparent text-[17px] font-semibold tracking-tight text-ink-900 outline-none placeholder:text-ink-500/35"
        />
        {state.fieldErrors?.identifier ? (
          <FieldError message={state.fieldErrors.identifier} />
        ) : null}
      </InputCard>

      <InputCard
        label={t("passwordLabel")}
        icon={<LockIcon className="h-5 w-5 text-ink-500/40" />}
      >
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder={t("passwordHint")}
          aria-invalid={Boolean(state.fieldErrors?.password)}
          required
          className="w-full border-0 bg-transparent text-[17px] font-semibold tracking-tight text-ink-900 outline-none placeholder:text-ink-500/35"
        />
        {state.fieldErrors?.password ? (
          <FieldError message={state.fieldErrors.password} />
        ) : null}
      </InputCard>

      <p className="min-h-5 text-[13px] font-semibold leading-5 text-red-600">
        {state.error ?? ""}
      </p>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-14 w-full items-center justify-center rounded-full bg-lime-400 text-[15px] font-bold text-ink-900 transition hover:bg-lime-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "..." : t("signupCta")}
        <ArrowUpRightIcon className="ml-2 h-5 w-5" />
      </button>

      <p className="pt-2 text-center text-[14px] font-medium text-ink-500">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-bold text-ink-900 hover:underline">
          {t("loginCta")}
        </Link>
      </p>
    </form>
  );
}

function InputCard({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="input-card block rounded-[18px] bg-white p-4">
      <span className="block text-[12px] font-bold text-ink-500">{label}</span>
      <div className="mt-3 flex items-center gap-3">
        {icon}
        {children}
      </div>
    </label>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="mt-2 text-[12px] font-semibold text-red-600">{message}</p>
  );
}
