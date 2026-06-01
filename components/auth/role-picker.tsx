"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRightIcon, KeyRoundIcon, SearchIcon } from "lucide-react";
import { setRoleAction } from "@/lib/auth/onboarding-actions";
import type { ActionState } from "@/lib/auth/actions";

type Role = "tenant" | "landlord";

const initial: ActionState = {};

export function RolePicker({ initialRole }: { initialRole: Role }) {
  const t = useTranslations("auth");
  const [selected, setSelected] = useState<Role>(initialRole);
  const [state, formAction, pending] = useActionState(setRoleAction, initial);

  const options: {
    value: Role;
    icon: React.ReactNode;
    title: string;
    desc: string;
  }[] = [
    {
      value: "tenant",
      icon: <SearchIcon className="h-6 w-6" />,
      title: t("roleTenant"),
      desc: t("roleTenantDesc"),
    },
    {
      value: "landlord",
      icon: <KeyRoundIcon className="h-6 w-6" />,
      title: t("roleLandlord"),
      desc: t("roleLandlordDesc"),
    },
  ];

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="role" value={selected} />

      <div className="grid grid-cols-1 gap-4">
        {options.map((option) => {
          const isActive = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelected(option.value)}
              className={
                isActive
                  ? "rounded-[22px] bg-ink-900 p-5 text-left text-white shadow-[0_0_0_2px_#A4E861] transition"
                  : "rounded-[22px] bg-white p-5 text-left text-ink-900 transition hover:bg-white/80"
              }
            >
              <div className="flex items-center gap-4">
                <span
                  className={
                    isActive
                      ? "flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-lime-400 text-ink-900"
                      : "flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink-50 text-ink-900"
                  }
                >
                  {option.icon}
                </span>
                <span className="flex-1">
                  <span className="block text-[24px] font-semibold leading-none tracking-tight">
                    {option.title}
                  </span>
                  <span
                    className={
                      isActive
                        ? "mt-2 block text-[14px] font-semibold text-white/65"
                        : "mt-2 block text-[14px] font-semibold text-ink-500"
                    }
                  >
                    {option.desc}
                  </span>
                </span>
                <span
                  className={
                    isActive
                      ? "hidden text-[12px] font-bold text-white/65 md:inline"
                      : "hidden text-[12px] font-bold text-ink-500 md:inline"
                  }
                >
                  {isActive ? "নির্বাচিত" : "নির্বাচন করুন"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="min-h-5 text-[13px] font-semibold leading-5 text-red-600">
        {state.error ?? ""}
      </p>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-14 w-full items-center justify-center rounded-full bg-lime-400 text-[15px] font-bold text-ink-900 transition hover:bg-lime-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "..." : t("nextStep")}
        <ArrowUpRightIcon className="ml-2 h-5 w-5" />
      </button>
    </form>
  );
}
