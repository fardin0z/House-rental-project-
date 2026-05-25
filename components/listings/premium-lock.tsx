import Link from "next/link";
import { ArrowUpRightIcon, LockIcon } from "lucide-react";

export function PremiumLock({
  label,
  cta,
  compact,
}: {
  label: string;
  cta: string;
  compact?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-ember/30 bg-ember-soft/30 p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-paper text-ember">
          <LockIcon className="size-5" />
        </span>
        <p className="flex-1 text-sm leading-relaxed text-clay">{label}</p>
      </div>
      {!compact ? (
        <Link
          href="/subscription"
          className="group mt-4 inline-flex w-full items-center justify-between gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-transform hover:scale-[1.01]"
        >
          <span>{cta}</span>
          <span className="grid size-7 place-items-center rounded-full bg-ember transition-transform group-hover:rotate-12">
            <ArrowUpRightIcon className="size-3.5" />
          </span>
        </Link>
      ) : null}
    </div>
  );
}
