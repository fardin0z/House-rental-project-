import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CreditCardIcon, DownloadIcon } from "lucide-react";
import {
  getAdminTransactions,
  type AdminTransaction,
} from "@/lib/admin/queries";
import { FilterChip } from "@/components/admin/filter-chip";
import { AdminPagination } from "@/components/admin/admin-pagination";

const STATUSES = ["pending", "completed", "failed", "cancelled"] as const;
type Status = (typeof STATUSES)[number];
const PAGE_SIZE = 25;

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const rawStatus = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const rawPage = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const status: Status | null = STATUSES.includes(rawStatus as Status)
    ? (rawStatus as Status)
    : null;
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);

  const t = await getTranslations("admin");
  const txns = await getAdminTransactions({
    status,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const completedTotal = txns.rows
    .filter((x) => x.status === "completed")
    .reduce((sum, x) => sum + x.amount, 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-space text-[12px] font-bold uppercase tracking-[.18em] text-ink-500/70">
            {t("paymentsEyebrow")}
          </p>
          <h1 className="font-display mt-3 text-[36px] italic leading-tight tracking-tight text-ink-900 md:text-[48px]">
            {t("paymentsTitle")}
          </h1>
        </div>

        <Link
          href={`/api/admin/transactions.csv${status ? `?status=${status}` : ""}`}
          className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-full bg-ink-900 px-5 text-[13px] font-bold text-white transition hover:bg-ink-700"
        >
          <DownloadIcon className="h-4 w-4" />
          {t("paymentsExport")}
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile
          label={t("paymentsStatRevenue")}
          value={`৳ ${Math.round(completedTotal).toLocaleString("bn-BD")}`}
        />
        <StatTile
          label={t("paymentsStatTotal")}
          value={txns.total.toLocaleString("bn-BD")}
        />
        <StatTile
          label={t("paymentsStatusLabel.completed")}
          value={txns.rows
            .filter((x) => x.status === "completed")
            .length.toLocaleString("bn-BD")}
        />
        <StatTile
          label={t("paymentsStatusLabel.pending")}
          value={txns.rows
            .filter((x) => x.status === "pending")
            .length.toLocaleString("bn-BD")}
        />
      </section>

      <nav className="flex flex-wrap items-center gap-2">
        <FilterChip
          href={buildPaymentsHref(null)}
          active={status === null}
          label={t("paymentsStatusAll")}
          variant="white"
        />
        {STATUSES.map((s) => (
          <FilterChip
            key={s}
            href={buildPaymentsHref(s)}
            active={status === s}
            label={t(`paymentsStatusLabel.${s}`)}
            variant="white"
          />
        ))}
      </nav>

      {txns.rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[28px] bg-white p-16 text-center">
          <CreditCardIcon className="h-10 w-10 text-ink-500/50" />
          <h3 className="font-display mt-5 text-[24px] italic text-ink-900">
            {t("paymentsEmptyTitle")}
          </h3>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-[24px] bg-white">
            <div className="hidden grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr] gap-4 border-b border-ink-900/5 px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-ink-500/70 md:grid">
              <span>{t("paymentsColUser")}</span>
              <span>{t("paymentsColAmount")}</span>
              <span>{t("paymentsColStatus")}</span>
              <span>{t("paymentsColTxnId")}</span>
              <span>{t("paymentsColDate")}</span>
            </div>
            <ul className="divide-y divide-ink-900/5">
              {txns.rows.map((tx) => (
                <TxnRow key={tx.id} tx={tx} t={t} />
              ))}
            </ul>
          </div>
          <AdminPagination
            page={page}
            pageSize={PAGE_SIZE}
            total={txns.total}
            buildHref={(p) => buildPaymentsHref(status, p)}
            labels={{
              prev: t("paginationPrev"),
              next: t("paginationNext"),
              range: t("paginationRange"),
            }}
          />
        </>
      )}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-white p-5">
      <p className="font-space text-[10px] font-bold uppercase tracking-[.16em] text-ink-500/70">
        {label}
      </p>
      <p className="font-display mt-3 text-[26px] italic leading-none tracking-tight text-ink-900">
        {value}
      </p>
    </div>
  );
}

function buildPaymentsHref(value: Status | null, page = 1): string {
  const params = new URLSearchParams();
  if (value) params.set("status", value);
  if (page > 1) params.set("page", String(page));
  return params.toString() ? `?${params.toString()}` : "?";
}

type T = Awaited<ReturnType<typeof getTranslations<"admin">>>;

function TxnRow({ tx, t }: { tx: AdminTransaction; t: T }) {
  const display = tx.user.name || tx.user.email || tx.user.phone || "—";
  const date = new Date(tx.created_at).toLocaleDateString("bn-BD");
  const txnId =
    tx.aamarpay_transaction_id ?? tx.provider_transaction_id ?? "—";

  return (
    <li className="grid grid-cols-1 gap-2 px-6 py-4 md:grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr] md:items-center md:gap-4">
      <div className="min-w-0">
        <p className="truncate text-[13px] font-bold text-ink-900">{display}</p>
        <p className="truncate text-[11px] font-semibold text-ink-500">
          {tx.user.phone ?? tx.user.email ?? ""}
        </p>
      </div>
      <span className="font-display text-[18px] italic leading-none text-ink-900">
        ৳ {tx.amount.toLocaleString("bn-BD")}
      </span>
      <TxnStatusPill status={tx.status} t={t} />
      <span className="truncate font-mono text-[11px] text-ink-500">
        {txnId}
      </span>
      <span className="text-[11px] font-semibold text-ink-500">{date}</span>
    </li>
  );
}

function TxnStatusPill({
  status,
  t,
}: {
  status: AdminTransaction["status"];
  t: T;
}) {
  const cls = {
    completed: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    failed: "bg-red-100 text-red-700",
    cancelled: "bg-ink-100 text-ink-500",
  }[status];
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cls}`}
    >
      {t(`paymentsStatusLabel.${status}`)}
    </span>
  );
}
