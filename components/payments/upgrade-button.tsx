"use client";

import { useActionState } from "react";
import { ArrowUpRightIcon } from "lucide-react";
import {
  startPremiumCheckoutAction,
  type PaymentActionState,
} from "@/lib/payments/actions";

const initial: PaymentActionState = {};

export function UpgradeButton({ label }: { label: string }) {
  const [state, formAction, pending] = useActionState(
    startPremiumCheckoutAction,
    initial,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-lime-400 px-5 text-[14px] font-bold text-ink-900 transition hover:bg-lime-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "..." : label}
        <ArrowUpRightIcon className="h-4 w-4" strokeWidth={2.5} />
      </button>
      {state.error ? (
        <p className="text-[12px] font-semibold text-red-600">{state.error}</p>
      ) : null}
    </form>
  );
}
