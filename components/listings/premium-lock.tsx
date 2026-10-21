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
    <div className="rounded-[18px] border border-ink-900/10 bg-ink-50 p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime-400/20 text-lime-600">
          <LockIcon className="h-5 w-5" />
        </span>
        <p className="flex-1 text-[13px] font-medium leading-relaxed text-ink-500">
          {label}
        </p>
      </div>
      {!compact ? (
        <Link
          href="/login"
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink-900 px-5 text-[13px] font-bold text-white transition hover:bg-ink-700"
        >
          {cta}
          <ArrowUpRightIcon className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

