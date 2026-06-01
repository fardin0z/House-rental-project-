import Link from "next/link";
import { ArrowUpRightIcon, BedDoubleIcon, BathIcon, RulerIcon } from "lucide-react";
import { LISTING_BUCKET, publicStorageUrl } from "@/lib/storage/paths";
import type { ListingWithImages } from "@/lib/listings/queries";

type Labels = {
  pending: string;
  approved: string;
  rejected: string;
  draft: string;
  archived: string;
  rent: string;
  noImage: string;
  beds: string;
  baths: string;
  sqft: string;
  edit: string;
  view: string;
};

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-lime-50 text-lime-600",
  pending: "bg-[#FFF6E1] text-[#A07A1F]",
  draft: "bg-ink-100 text-ink-500",
  rejected: "bg-[#FFE4E4] text-[#A8362A]",
  archived: "bg-ink-900 text-white",
};

export function ListingCard({
  listing,
  labels,
  ownerView,
}: {
  listing: ListingWithImages;
  labels: Labels;
  ownerView: boolean;
}) {
  const cover = listing.images?.[0];
  const statusLabel =
    {
      draft: labels.draft,
      pending: labels.pending,
      approved: labels.approved,
      rejected: labels.rejected,
      archived: labels.archived,
    }[listing.status] ?? listing.status;

  const detailHref = ownerView
    ? `/listings/${listing.id}/edit`
    : `/listings/${listing.id}`;
  const ctaLabel = ownerView ? labels.edit : labels.view;

  return (
    <article className="card-hover overflow-hidden rounded-[24px] border border-ink-900/10 bg-white">
      <Link
        href={detailHref}
        className="relative block aspect-4/3 overflow-hidden bg-ink-100"
      >
        {cover ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={publicStorageUrl(LISTING_BUCKET, cover.path)}
            alt={listing.title || labels.noImage}
            className="absolute inset-0 size-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-500">
            {labels.noImage}
          </div>
        )}

        <span
          className={`absolute left-4 top-4 z-3 rounded-full px-4 py-2 text-[12px] font-bold ${
            STATUS_STYLES[listing.status] ?? STATUS_STYLES.draft
          }`}
        >
          {statusLabel}
        </span>

        <div className="ad-image-pocket">
          <span className="absolute bottom-2.5 right-2.5 z-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink-900 shadow-[0_8px_20px_rgba(0,0,0,.06)] max-md:h-12 max-md:w-12">
            <ArrowUpRightIcon className="h-5 w-5" />
          </span>
        </div>
      </Link>

      <div className="p-6">
        <h3 className="font-display text-[28px] italic leading-tight tracking-tight text-ink-900 line-clamp-2 md:text-[32px]">
          {listing.title || "—"}
        </h3>
        <p className="mt-2 text-[14px] font-medium text-ink-500">
          {listing.area_name || "—"}
          {listing.district ? `, ${listing.district}` : ""}
        </p>

        <div className="mt-6">
          <p className="font-space text-[11px] font-bold uppercase tracking-[.22em] text-ink-500/70">
            {labels.rent}
          </p>
          <p className="font-display mt-2 text-[30px] italic leading-none tracking-tight text-ink-900 md:text-[34px]">
            {listing.rent ? `৳ ${listing.rent.toLocaleString("bn-BD")}` : "—"}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-4 text-[13px] font-semibold text-ink-500">
          {listing.beds != null ? (
            <span className="inline-flex items-center gap-1">
              <BedDoubleIcon className="h-4 w-4" />
              {listing.beds}
            </span>
          ) : null}
          {listing.baths != null ? (
            <span className="inline-flex items-center gap-1">
              <BathIcon className="h-4 w-4" />
              {listing.baths}
            </span>
          ) : null}
          {listing.area_sqft != null ? (
            <span className="inline-flex items-center gap-1">
              <RulerIcon className="h-4 w-4" />
              {listing.area_sqft}
            </span>
          ) : null}
        </div>

        <Link
          href={detailHref}
          className="mt-6 inline-flex h-11 w-full items-center justify-between rounded-full border border-ink-900/10 bg-white px-5 text-[14px] font-bold text-ink-900 transition hover:bg-ink-50"
        >
          {ctaLabel}
          <ArrowUpRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
