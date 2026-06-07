import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export function AdminPagination({
  page,
  pageSize,
  total,
  buildHref,
  labels,
}: {
  page: number;
  pageSize: number;
  total: number;
  buildHref: (page: number) => string;
  labels: {
    prev: string;
    next: string;
    range: string;
  };
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const baseBtn =
    "inline-flex h-9 items-center justify-center gap-1 rounded-full border border-ink-900/10 bg-white px-3 text-[12px] font-bold text-ink-900 transition hover:bg-ink-50";
  const disabledBtn =
    "inline-flex h-9 cursor-not-allowed items-center justify-center gap-1 rounded-full border border-ink-900/5 bg-white/60 px-3 text-[12px] font-bold text-ink-500/40";

  return (
    <nav className="flex items-center justify-between rounded-[18px] bg-white px-4 py-3">
      <p className="text-[12px] font-semibold text-ink-500">
        {labels.range
          .replace("{from}", String(from))
          .replace("{to}", String(to))
          .replace("{total}", String(total))}
      </p>
      <div className="flex items-center gap-2">
        {hasPrev ? (
          <Link href={buildHref(page - 1)} scroll={false} className={baseBtn}>
            <ChevronLeftIcon className="h-3.5 w-3.5" />
            {labels.prev}
          </Link>
        ) : (
          <span className={disabledBtn}>
            <ChevronLeftIcon className="h-3.5 w-3.5" />
            {labels.prev}
          </span>
        )}
        {hasNext ? (
          <Link href={buildHref(page + 1)} scroll={false} className={baseBtn}>
            {labels.next}
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <span className={disabledBtn}>
            {labels.next}
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </nav>
  );
}
