import Link from "next/link";
import Form from "next/form";
import { getTranslations } from "next-intl/server";
import {
  HomeIcon,
  SearchIcon,
  ImageIcon,
  ArrowUpRightIcon,
} from "lucide-react";
import {
  getAdminListings,
  type AdminListing,
} from "@/lib/admin/queries";
import {
  approveListingAction,
  rejectListingAction,
  archiveListingAction,
  deleteListingAction,
} from "@/lib/admin/actions";
import { LISTING_BUCKET, renderImageUrl } from "@/lib/storage/paths";
import { FilterChip } from "@/components/admin/filter-chip";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { ConfirmActionWithReason } from "@/components/admin/confirm-action-with-reason";
import { AdminPagination } from "@/components/admin/admin-pagination";

const STATUSES = [
  "draft",
  "pending",
  "approved",
  "rejected",
  "archived",
] as const;
type Status = (typeof STATUSES)[number];
const PAGE_SIZE = 25;

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const rawStatus = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const rawQ = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const rawPage = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const status: Status | null = STATUSES.includes(rawStatus as Status)
    ? (rawStatus as Status)
    : null;
  const q = rawQ?.trim() ?? "";
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);

  const t = await getTranslations("admin");
  const listings = await getAdminListings({
    status,
    search: q,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="font-space text-[12px] font-bold uppercase tracking-[.18em] text-ink-500/70">
          {t("listingsEyebrow")}
        </p>
        <h1 className="font-display mt-3 text-[36px] italic leading-tight tracking-tight text-ink-900 md:text-[48px]">
          {t("listingsTitle")}
        </h1>
      </header>

      <Form
        action="/admin/listings"
        scroll={false}
        className="flex flex-col gap-3 rounded-[20px] bg-white p-3 md:flex-row md:items-center"
      >
        <div className="relative flex flex-1 items-center">
          <SearchIcon className="absolute left-4 h-4 w-4 text-ink-500" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder={t("listingsSearchPlaceholder")}
            className="h-11 w-full rounded-full bg-ink-50 pl-10 pr-4 text-[13px] text-ink-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-ink-900/10"
          />
        </div>
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-full bg-ink-900 px-6 text-[13px] font-bold text-white"
        >
          {t("listingsSearch")}
        </button>
      </Form>

      <nav className="flex flex-wrap items-center gap-2">
        <FilterChip
          href={buildListingHref(null, q)}
          active={status === null}
          label={t("listingsStatusAll")}
          variant="white"
        />
        {STATUSES.map((s) => (
          <FilterChip
            key={s}
            href={buildListingHref(s, q)}
            active={status === s}
            label={t(`listingsStatusLabel.${s}`)}
            variant="white"
          />
        ))}
      </nav>

      {listings.rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[28px] bg-white p-16 text-center">
          <HomeIcon className="h-10 w-10 text-ink-500/50" />
          <h3 className="font-display mt-5 text-[24px] italic text-ink-900">
            {t("listingsEmptyTitle")}
          </h3>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {listings.rows.map((l) => (
              <ListingRow key={l.id} listing={l} t={t} />
            ))}
          </div>
          <AdminPagination
            page={page}
            pageSize={PAGE_SIZE}
            total={listings.total}
            buildHref={(p) => buildListingHref(status, q, p)}
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

function buildListingHref(
  value: Status | null,
  q: string,
  page = 1,
): string {
  const params = new URLSearchParams();
  if (value) params.set("status", value);
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  return params.toString() ? `?${params.toString()}` : "?";
}

type T = Awaited<ReturnType<typeof getTranslations<"admin">>>;

function ListingRow({ listing, t }: { listing: AdminListing; t: T }) {
  const ownerLabel =
    listing.owner.name || listing.owner.phone || listing.owner.email || "—";
  const created = new Date(listing.created_at).toLocaleDateString("bn-BD");

  return (
    <article className="rounded-[20px] bg-white p-4 md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Link
          href={`/admin/listings/${listing.id}`}
          className="relative h-24 w-32 shrink-0 overflow-hidden rounded-[14px] bg-ink-100"
        >
          {listing.cover_path ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={renderImageUrl(LISTING_BUCKET, listing.cover_path, {
                width: 320,
                quality: 78,
                resize: "cover",
              })}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-ink-500">
              <ImageIcon className="h-6 w-6" />
            </span>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[16px] font-bold text-ink-900">
              {listing.title || "—"}
            </h3>
            <StatusPill status={listing.status} t={t} />
          </div>
          <p className="mt-1 truncate text-[12px] font-semibold text-ink-500">
            {ownerLabel} · {listing.area_name || "—"} · ৳{" "}
            {listing.rent.toLocaleString("bn-BD")}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-ink-500/70">
            {created}
          </p>
          {listing.rejection_reason ? (
            <p className="mt-2 rounded-[10px] bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
              {t("listingsRejReason")}: {listing.rejection_reason}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-stretch">
          <Link
            href={`/admin/listings/${listing.id}`}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-ink-900 px-4 text-[11px] font-bold text-white transition hover:bg-ink-700"
          >
            {t("listingsManage")}
            <ArrowUpRightIcon className="h-3 w-3" />
          </Link>

          {listing.status === "pending" ? (
            <form action={approveListingAction}>
              <input type="hidden" name="id" value={listing.id} />
              <button
                type="submit"
                className="inline-flex h-9 w-full items-center justify-center rounded-full bg-lime-400 px-4 text-[11px] font-bold text-ink-900 transition hover:bg-lime-500"
              >
                {t("listingsApprove")}
              </button>
            </form>
          ) : null}

          {(listing.status === "pending" ||
            listing.status === "approved") ? (
            <ConfirmActionWithReason
              action={rejectListingAction}
              id={listing.id}
              triggerLabel={t("listingsReject")}
              title={t("listingsRejectTitle")}
              body={t("listingsRejectBody")}
              reasonLabel={t("listingsRejReason")}
              reasonPlaceholder={t("listingsRejPlaceholder")}
              confirmLabel={t("confirmYes")}
              cancelLabel={t("confirmCancel")}
              triggerClassName="inline-flex h-9 w-full items-center justify-center rounded-full border border-ink-900/10 bg-white px-4 text-[11px] font-bold text-ink-900 transition hover:bg-ink-50"
            />
          ) : null}

          {listing.status !== "archived" ? (
            <ConfirmActionButton
              action={archiveListingAction}
              id={listing.id}
              triggerLabel={t("listingsArchive")}
              title={t("confirmArchiveListingTitle")}
              body={t("confirmArchiveListingBody")}
              confirmLabel={t("confirmYes")}
              cancelLabel={t("confirmCancel")}
              variant="neutral"
              triggerClassName="inline-flex h-9 w-full items-center justify-center rounded-full border border-ink-900/10 bg-white px-4 text-[11px] font-bold text-ink-900 transition hover:bg-ink-50"
            />
          ) : null}

          <ConfirmActionButton
            action={deleteListingAction}
            id={listing.id}
            triggerLabel={t("listingsDelete")}
            title={t("confirmDeleteListingTitle")}
            body={t("confirmDeleteListingBody")}
            confirmLabel={t("confirmYes")}
            cancelLabel={t("confirmCancel")}
            triggerClassName="inline-flex h-9 w-full items-center justify-center rounded-full bg-red-100 px-4 text-[11px] font-bold text-red-700 transition hover:bg-red-200"
          />
        </div>
      </div>
    </article>
  );
}

function StatusPill({
  status,
  t,
}: {
  status: AdminListing["status"];
  t: T;
}) {
  const cls = {
    approved: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-700",
    archived: "bg-ink-100 text-ink-500",
    draft: "bg-ink-50 text-ink-500",
  }[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cls}`}
    >
      {t(`listingsStatusLabel.${status}`)}
    </span>
  );
}
