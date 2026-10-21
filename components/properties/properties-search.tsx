"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ChevronDownIcon,
  MapPinIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";

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

const BEDS_VALUES = ["1", "2", "3", "4"] as const;

export function PropertiesSearch() {
  const t = useTranslations("properties");
  const tListings = useTranslations("listings");
  const params = useSearchParams();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [area, setArea] = useState(params.get("area") ?? "");
  const [type, setType] = useState(params.get("type") ?? "");
  const [budget, setBudget] = useState(params.get("budget") ?? "");
  const [beds, setBeds] = useState(params.get("beds") ?? "");

  useEffect(() => {
    setArea(params.get("area") ?? "");
    setType(params.get("type") ?? "");
    setBudget(params.get("budget") ?? "");
    setBeds(params.get("beds") ?? "");
  }, [params]);

  function commit(next: {
    area?: string;
    type?: string;
    budget?: string;
    beds?: string;
  }) {
    const sp = new URLSearchParams(params.toString());
    const apply = (key: string, value: string | undefined) => {
      if (value && value.trim()) sp.set(key, value.trim());
      else sp.delete(key);
    };
    apply("area", next.area ?? area);
    apply("type", next.type ?? type);
    apply("budget", next.budget ?? budget);
    apply("beds", next.beds ?? beds);
    const qs = sp.toString();
    startTransition(() => {
      router.push(qs ? `/properties?${qs}` : "/properties");
    });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    commit({});
  }

  function clearAll() {
    setArea("");
    setType("");
    setBudget("");
    setBeds("");
    startTransition(() => router.push("/properties"));
  }

  const anyActive = Boolean(area || type || budget || beds);

  return (
    <div className="rounded-[26px] bg-white p-3">
      <div className="scroll-soft mb-3 flex gap-2 overflow-x-auto px-1 pb-1">
        <CategoryChip
          active={!type}
          label="সব"
          onClick={() => {
            setType("");
            commit({ type: "" });
          }}
        />
        {TYPE_VALUES.map((value) => (
          <CategoryChip
            key={value}
            active={type === value}
            label={tListings(`rentalType.${value}`)}
            onClick={() => {
              setType(value);
              commit({ type: value });
            }}
          />
        ))}
      </div>
      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]"
      >
        <Cell label={t("locationLabel")}>
          <MapPinIcon className="h-5 w-5 text-ink-500/45" />
          <input
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder={t("locationPlaceholder")}
            className="w-full border-0 bg-transparent text-[15px] font-bold text-ink-900 outline-none placeholder:text-ink-500/40"
          />
        </Cell>

        <CellSelect
          label={t("typeLabel")}
          value={type}
          anyLabel={t("filterAny")}
          options={TYPE_VALUES.map((v) => ({
            value: v,
            label: tListings(`rentalType.${v}`),
          }))}
          onChange={(v) => {
            setType(v);
            commit({ type: v });
          }}
        />

        <CellSelect
          label={t("rentRangeLabel")}
          value={budget}
          anyLabel={t("filterAny")}
          options={BUDGET_VALUES.map((b) => ({
            value: b.value,
            label: tListings(b.key),
          }))}
          onChange={(v) => {
            setBudget(v);
            commit({ budget: v });
          }}
        />

        <CellSelect
          label={t("bedsLabel")}
          value={beds}
          anyLabel={t("filterAny")}
          options={BEDS_VALUES.map((b) => ({
            value: b,
            label: `${b}+`,
          }))}
          onChange={(v) => {
            setBeds(v);
            commit({ beds: v });
          }}
        />

        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-[72px] items-center justify-center gap-2 rounded-[22px] bg-lime-400 px-7 text-[15px] font-bold text-ink-900 transition hover:bg-lime-500 disabled:opacity-60"
        >
          {t("searchCta")}
          <SearchIcon className="h-5 w-5" />
        </button>
      </form>

      {anyActive ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 rounded-full bg-lime-50 px-4 py-2 text-[12px] font-bold text-lime-600 transition hover:bg-lime-100"
          >
            <XIcon className="h-3.5 w-3.5" />
            {t("clearFilters")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function CategoryChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-5 py-3 text-[14px] font-bold transition ${
        active
          ? "border-lime-500 bg-lime-400 text-ink-900"
          : "border-ink-100 bg-white text-ink-700 hover:border-lime-400"
      }`}
    >
      {label}
    </button>
  );
}

function Cell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="rounded-[22px] bg-ink-50 px-5 py-4">
      <span className="block text-[11px] font-bold uppercase tracking-[.16em] text-ink-500/70">
        {label}
      </span>
      <div className="mt-3 flex items-center gap-3">{children}</div>
    </label>
  );
}

function CellSelect({
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
    <label className="relative rounded-[22px] bg-ink-50 px-5 py-4">
      <span className="block text-[11px] font-bold uppercase tracking-[.16em] text-ink-500/70">
        {label}
      </span>
      <div className="mt-3 flex items-center gap-3">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none border-0 bg-transparent pr-6 text-[15px] font-bold text-ink-900 outline-none"
        >
          <option value="">{anyLabel}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-5 h-4 w-4 text-ink-500" />
      </div>
    </label>
  );
}
