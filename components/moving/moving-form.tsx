"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowUpRightIcon,
  CalendarIcon,
  HomeIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from "lucide-react";
import {
  submitMovingRequestAction,
  type MovingActionState,
} from "@/lib/moving/actions";

const initial: MovingActionState = {};

export function MovingForm({ defaultPhone }: { defaultPhone?: string }) {
  const t = useTranslations("moving");
  const [state, formAction, pending] = useActionState(
    submitMovingRequestAction,
    initial,
  );

  return (
    <form action={formAction} className="space-y-4">
      <Field
        label={t("nameLabel")}
        icon={<UserIcon className="h-5 w-5 text-ink-500/40" />}
        error={state.fieldErrors?.name}
      >
        <input
          name="name"
          type="text"
          autoComplete="name"
          placeholder={t("namePlaceholder")}
          required
          className="w-full border-0 bg-transparent text-[16px] font-semibold tracking-tight text-ink-900 outline-none placeholder:text-ink-500/35"
        />
      </Field>

      <Field
        label={t("phoneLabel")}
        icon={<PhoneIcon className="h-5 w-5 text-ink-500/40" />}
        error={state.fieldErrors?.phone}
      >
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={t("phonePlaceholder")}
          defaultValue={defaultPhone}
          required
          className="w-full border-0 bg-transparent text-[16px] font-semibold tracking-tight text-ink-900 outline-none placeholder:text-ink-500/35"
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label={t("fromArea")}
          icon={<MapPinIcon className="h-5 w-5 text-ink-500/40" />}
          error={state.fieldErrors?.fromArea}
        >
          <input
            name="fromArea"
            type="text"
            placeholder={t("fromAreaPlaceholder")}
            required
            className="w-full border-0 bg-transparent text-[16px] font-semibold tracking-tight text-ink-900 outline-none placeholder:text-ink-500/35"
          />
        </Field>

        <Field
          label={t("toArea")}
          icon={<MapPinIcon className="h-5 w-5 text-lime-600" />}
          error={state.fieldErrors?.toArea}
        >
          <input
            name="toArea"
            type="text"
            placeholder={t("toAreaPlaceholder")}
            required
            className="w-full border-0 bg-transparent text-[16px] font-semibold tracking-tight text-ink-900 outline-none placeholder:text-ink-500/35"
          />
        </Field>
      </div>

      <Field
        label={t("flatDetails")}
        icon={<HomeIcon className="h-5 w-5 text-ink-500/40" />}
        error={state.fieldErrors?.flatDetails}
      >
        <textarea
          name="flatDetails"
          rows={4}
          placeholder={t("flatDetailsPlaceholder")}
          className="w-full resize-none border-0 bg-transparent text-[15px] font-medium leading-relaxed text-ink-900 outline-none placeholder:text-ink-500/35"
        />
      </Field>

      <Field
        label={
          <>
            {t("preferredDate")}{" "}
            <span className="text-ink-500/50">· {t("preferredDateHint")}</span>
          </>
        }
        icon={<CalendarIcon className="h-5 w-5 text-ink-500/40" />}
        error={state.fieldErrors?.requestedDate}
      >
        <input
          name="requestedDate"
          type="date"
          className="w-full border-0 bg-transparent text-[16px] font-semibold tracking-tight text-ink-900 outline-none"
        />
      </Field>

      {state.error ? (
        <p className="text-[13px] font-semibold text-red-600">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink-900 px-6 text-[15px] font-bold text-white transition hover:bg-ink-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? t("submitting") : t("submitCta")}
        <ArrowUpRightIcon className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </form>
  );
}

function Field({
  label,
  icon,
  children,
  error,
}: {
  label: React.ReactNode;
  icon: React.ReactNode;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <label className="block rounded-[18px] bg-white p-4">
      <span className="block text-[12px] font-bold text-ink-500">{label}</span>
      <div className="mt-3 flex items-start gap-3">
        {icon}
        <div className="flex-1">{children}</div>
      </div>
      {error ? (
        <p className="mt-2 text-[12px] font-semibold text-red-600">{error}</p>
      ) : null}
    </label>
  );
}
