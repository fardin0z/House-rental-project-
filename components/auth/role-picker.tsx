"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRightIcon, HomeIcon, KeyIcon } from "lucide-react";
import { setRoleAction } from "@/lib/auth/onboarding-actions";
import type { ActionState } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

type Role = "tenant" | "landlord";

const initial: ActionState = {};

export function RolePicker({ initialRole }: { initialRole: Role }) {
  const t = useTranslations("auth");
  const [selected, setSelected] = useState<Role>(initialRole);
  const [state, formAction, pending] = useActionState(setRoleAction, initial);

  const options: {
    value: Role;
    icon: typeof HomeIcon;
    title: string;
    desc: string;
    accent: string;
  }[] = [
    {
      value: "tenant",
      icon: HomeIcon,
      title: t("roleTenant"),
      desc: t("roleTenantDesc"),
      accent: "from-ember/15 via-transparent to-transparent",
    },
    {
      value: "landlord",
      icon: KeyIcon,
      title: t("roleLandlord"),
      desc: t("roleLandlordDesc"),
      accent: "from-clay/15 via-transparent to-transparent",
    },
  ];

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="role" value={selected} />

      <div className="grid gap-3">
        {options.map((option) => {
          const isActive = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelected(option.value)}
              className={cn(
                "group relative flex items-center gap-5 overflow-hidden rounded-3xl border bg-paper p-5 text-left transition-all",
                isActive
                  ? "border-ink/80 shadow-[0_18px_60px_-30px_oklch(0.30_0.04_60/0.45)]"
                  : "border-rule/70 hover:border-ink/30",
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 bg-linear-to-br opacity-0 transition-opacity",
                  option.accent,
                  isActive ? "opacity-100" : "group-hover:opacity-60",
                )}
              />
              <div
                className={cn(
                  "relative grid size-14 shrink-0 place-items-center rounded-2xl transition-colors",
                  isActive
                    ? "bg-ink text-paper"
                    : "bg-canvas-deep text-ink group-hover:bg-ink/10",
                )}
              >
                <option.icon className="size-6" strokeWidth={1.75} />
              </div>
              <div className="relative flex flex-1 flex-col gap-0.5">
                <span className="font-display text-2xl italic leading-tight text-ink">
                  {option.title}
                </span>
                <span className="text-sm text-ink-soft">{option.desc}</span>
              </div>
              <div
                className={cn(
                  "relative grid size-9 place-items-center rounded-full border transition-colors",
                  isActive ? "border-ember bg-ember text-paper" : "border-rule",
                )}
              >
                {isActive ? (
                  <span className="size-2 rounded-full bg-paper" />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="group inline-flex items-center justify-between rounded-full bg-ink px-6 py-4 text-base font-medium text-paper transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span>{pending ? "..." : t("nextStep")}</span>
        <span className="grid size-9 place-items-center rounded-full bg-ember text-paper transition-transform group-hover:rotate-12">
          <ArrowUpRightIcon className="size-4" />
        </span>
      </button>
    </form>
  );
}
