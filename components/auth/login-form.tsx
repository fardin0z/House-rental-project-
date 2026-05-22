"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRightIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { sendOtpAction, type ActionState } from "@/lib/auth/actions";
import { DevModeBanner } from "@/components/auth/dev-mode-banner";

const initial: ActionState = {};

export function LoginForm() {
  const t = useTranslations("auth");
  const [state, formAction, pending] = useActionState(sendOtpAction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <DevModeBanner message="যেকোনো নম্বর দিন। OTP সার্ভার টার্মিনালে প্রিন্ট হবে।" />
      <label className="flex flex-col gap-2">
        <span className="text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft">
          {t("phoneLabel")}
        </span>
        <Input
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={t("phonePlaceholder")}
          aria-invalid={Boolean(state.fieldErrors?.phone)}
          required
          className="h-14 rounded-2xl border-rule bg-paper px-5 text-base"
        />
      </label>
      {state.fieldErrors?.phone ? (
        <p className="-mt-2 text-sm text-destructive">{state.fieldErrors.phone}</p>
      ) : null}
      {state.error ? (
        <p className="-mt-2 text-sm text-destructive">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="group inline-flex items-center justify-between rounded-full bg-ink px-6 py-4 text-base font-medium text-paper transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span>{pending ? "..." : t("sendOtp")}</span>
        <span className="grid size-9 place-items-center rounded-full bg-ember text-paper transition-transform group-hover:rotate-12">
          <ArrowUpRightIcon className="size-4" />
        </span>
      </button>

      <p className="text-xs text-ink-soft">
        চালিয়ে যাওয়ার মাধ্যমে আপনি <span className="text-ink underline-offset-4 hover:underline">শর্তাবলী</span> ও{" "}
        <span className="text-ink underline-offset-4 hover:underline">গোপনীয়তা নীতি</span> মেনে নিচ্ছেন।
      </p>
    </form>
  );
}
