"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";

const TYPE_VALUES = [
  "family_flat",
  "bachelor",
  "sublet",
  "office",
  "shop",
] as const;

const BUDGET_VALUES = [
  { value: "0-10000", key: "budgetUnder10" },
  { value: "10000-20000", key: "budget10to20" },
  { value: "20000-40000", key: "budget20to40" },
  { value: "40000-", key: "budgetAbove40" },
] as const;

export function ListingsFilterBar() {
  const t = useTranslations("listings");
  const params = useSearchParams();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [area, setArea] = useState(params.get("area") ?? "");
  const [type, setType] = useState(params.get("type") ?? "");
  const [budget, setBudget] = useState(params.get("budget") ?? "");

  useEffect(() => {
    setArea(params.get("area") ?? "");
    setType(params.get("type") ?? "");
    setBudget(params.get("budget") ?? "");
  }, [params]);

  function commit(next: { area?: string; type?: string; budget?: string }) {
    const sp = new URLSearchParams(params.toString());
    const apply = (key: string, value: string | undefined) => {
      if (value && value.trim()) sp.set(key, value.trim());
      else sp.delete(key);
    };
    apply("area", next.area ?? area);
    apply("type", next.type ?? type);
    apply("budget", next.budget ?? budget);
    const qs = sp.toString();
    startTransition(() => {
      router.push(qs ? `/listings?${qs}` : "/listings");
    });
  }

  function onAreaSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    commit({ area });
  }

  function clearAll() {
    setArea("");
    setType("");
    setBudget("");
    startTransition(() => router.push("/listings"));
  }

  const anyActive = Boolean(area || type || budget);

  return (
    <div className="rounded-[24px] bg-white p-3 md:p-4">
      <div className="grid gap-3 md:grid-cols-[1.6fr_1fr_1fr_auto] md:items-stretch">
        <form
          onSubmit={onAreaSubmit}
          className="flex items-center gap-3 rounded-[18px] bg-ink-50 px-4 py-3"
        >
          <SearchIcon className="h-5 w-5 text-ink-500/50" />
          <div className="flex flex-1 flex-col">
            <span className="text-[11px] font-bold uppercase tracking-[.18em] text-ink-500/70">
              {t("filterArea")}
            </span>
            <input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder={t("filterAreaPlaceholder")}
              className="mt-1 w-full bg-transparent text-[15px] font-semibold tracking-tight text-ink-900 outline-none placeholder:text-ink-500/40"
            />
          </div>
        </form>

        <FilterSelect
          label={t("filterType")}
          value={type}
          anyLabel={t("filterAny")}
          options={TYPE_VALUES.map((v) => ({
            value: v,
            label: t(`rentalType.${v}`),
          }))}
          onChange={(v) => {
            setType(v);
            commit({ type: v });
          }}
        />

        <FilterSelect
          label={t("filterBudget")}
          value={budget}
          anyLabel={t("filterAny")}
          options={BUDGET_VALUES.map((b) => ({
            value: b.value,
            label: t(b.key),
          }))}
          onChange={(v) => {
            setBudget(v);
            commit({ budget: v });
          }}
        />

        {anyActive ? (
          <button
            type="button"
            onClick={clearAll}
            disabled={pending}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink-900 px-5 text-[13px] font-bold text-white transition hover:bg-ink-700 disabled:opacity-60 md:h-auto"
          >
            <XIcon className="h-4 w-4" />
            {t("filterClear")}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  anyLabel,
  options,
  onChange,
}: {
  label: string;
  value: string;
  anyLabel: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative flex items-center gap-3 rounded-[18px] bg-ink-50 px-4 py-3">
      <div className="flex flex-1 flex-col">
        <span className="text-[11px] font-bold uppercase tracking-[.18em] text-ink-500/70">
          {label}
        </span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full appearance-none bg-transparent pr-6 text-[15px] font-semibold tracking-tight text-ink-900 outline-none"
        >
          <option value="">{anyLabel}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <ChevronDownIcon className="pointer-events-none absolute right-4 h-4 w-4 text-ink-500" />
    </label>
  );
}
