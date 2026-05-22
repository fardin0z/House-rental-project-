import Link from "next/link";
import { ArrowUpRightIcon, BedDoubleIcon, BathIcon, RulerIcon } from "lucide-react";
import { LISTING_BUCKET, publicStorageUrl } from "@/lib/storage/paths";
import type { ListingWithImages } from "@/lib/listings/queries";
import { cn } from "@/lib/utils";

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

  return (
    <article className="group flex flex-col overflow-hidden rounded-[28px] border border-rule/60 bg-paper transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_oklch(0.30_0.04_60/0.35)]">
      <Link
        href={ownerView ? `/listings/${listing.id}/edit` : `/listings/${listing.id}`}
        className="relative block aspect-[4/3] overflow-hidden bg-canvas-deep"
      >
        {cover ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={publicStorageUrl(LISTING_BUCKET, cover.path)}
            alt={listing.title || labels.noImage}
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-soft">
            {labels.noImage}
          </div>
        )}
        <div className="absolute left-3 top-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.7rem] font-medium backdrop-blur",
              listing.status === "approved" && "bg-emerald-100/90 text-emerald-700",
              listing.status === "pending" && "bg-ember/95 text-paper",
              listing.status === "rejected" && "bg-destructive/90 text-paper",
              listing.status === "draft" && "bg-paper/95 text-ink-soft",
              listing.status === "archived" && "bg-ink/85 text-paper",
            )}
          >
            {statusLabel}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-2xl italic leading-tight text-ink line-clamp-2">
            {listing.title || "—"}
          </h3>
        </div>

        <div className="text-sm text-ink-soft">
          {listing.area_name || "—"}
          {listing.district ? `, ${listing.district}` : ""}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div className="flex flex-col">
            <span className="text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft">
              {labels.rent}
            </span>
            <span className="font-display text-2xl italic text-ink">
              {listing.rent ? `৳ ${listing.rent.toLocaleString("bn-BD")}` : "—"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-ink-soft">
            {listing.beds != null ? (
              <span className="inline-flex items-center gap-1">
                <BedDoubleIcon className="size-3.5" />
                {listing.beds}
              </span>
            ) : null}
            {listing.baths != null ? (
              <span className="inline-flex items-center gap-1">
                <BathIcon className="size-3.5" />
                {listing.baths}
              </span>
            ) : null}
            {listing.area_sqft != null ? (
              <span className="inline-flex items-center gap-1">
                <RulerIcon className="size-3.5" />
                {listing.area_sqft}
              </span>
            ) : null}
          </div>
        </div>

        <Link
          href={ownerView ? `/listings/${listing.id}/edit` : `/listings/${listing.id}`}
          className="group/cta mt-3 inline-flex items-center justify-between rounded-full border border-rule px-4 py-2 text-xs font-medium text-ink transition-colors hover:border-ink"
        >
          <span>{ownerView ? labels.edit : labels.view}</span>
          <ArrowUpRightIcon className="size-3.5 transition-transform group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
        </Link>
      </div>
    </article>
  );
}
