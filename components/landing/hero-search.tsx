"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ChevronDownIcon, SearchIcon } from "lucide-react";

export function HeroSearch({
  labels,
  values,
  typeOptions,
  priceOptions,
}: {
  labels: { location: string; type: string; price: string };
  values: { location: string; type: string; price: string };
  typeOptions: { value: string; label: string }[];
  priceOptions: { value: string; label: string }[];
}) {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set("area", location.trim());
    if (type) params.set("type", type);
    if (price) params.set("budget", price);
    const qs = params.toString();
    router.push(qs ? `/properties?${qs}` : "/properties");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="absolute bottom-3.5 left-3.5 right-3.5 grid h-[74px] grid-cols-[1fr_1fr_1fr_auto] items-center rounded-[17px] bg-[#020402] py-0 pl-[22px] pr-3.5 text-white max-[900px]:relative max-[900px]:inset-auto max-[900px]:h-auto max-[900px]:grid-cols-1 max-[900px]:gap-[18px] max-[900px]:p-[22px]"
    >
      <label className="flex h-11 min-w-0 flex-col justify-center pr-[22px] max-[900px]:p-0">
        <span className="flex items-center justify-between text-[13px] font-bold leading-none tracking-tight text-white/95">
          {labels.location}
          <ChevronDownIcon className="h-3.5 w-3.5" />
        </span>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={values.location}
          className="mt-2.5 w-full whitespace-nowrap bg-transparent text-[12px] leading-none text-white/90 placeholder:text-white/40 focus:outline-none"
        />
      </label>

      <label className="relative flex h-11 min-w-0 flex-col justify-center border-l border-white/10 pl-[22px] pr-[22px] max-[900px]:border-l-0 max-[900px]:p-0">
        <span className="flex items-center justify-between text-[13px] font-bold leading-none tracking-tight text-white/95">
          {labels.type}
          <ChevronDownIcon className="h-3.5 w-3.5" />
        </span>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mt-2.5 w-full cursor-pointer appearance-none bg-transparent text-[12px] leading-none text-white/90 focus:outline-none"
        >
          <option value="" className="bg-[#020402]">
            {values.type}
          </option>
          {typeOptions.map((o) => (
            <option key={o.value} value={o.value} className="bg-[#020402]">
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="relative flex h-11 min-w-0 flex-col justify-center border-l border-white/10 pl-[22px] pr-[22px] max-[900px]:border-l-0 max-[900px]:p-0">
        <span className="flex items-center justify-between text-[13px] font-bold leading-none tracking-tight text-white/95">
          {labels.price}
          <ChevronDownIcon className="h-3.5 w-3.5" />
        </span>
        <select
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="mt-2.5 w-full cursor-pointer appearance-none bg-transparent text-[12px] leading-none text-white/90 focus:outline-none"
        >
          <option value="" className="bg-[#020402]">
            {values.price}
          </option>
          {priceOptions.map((o) => (
            <option key={o.value} value={o.value} className="bg-[#020402]">
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        aria-label={labels.location}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full border-0 bg-greenx text-black transition-transform hover:scale-[1.04]"
      >
        <SearchIcon className="h-6 w-6" strokeWidth={2.5} />
      </button>
    </form>
  );
}
