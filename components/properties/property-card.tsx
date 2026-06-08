import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { LISTING_BUCKET, publicStorageUrl } from "@/lib/storage/paths";
import type { PublicListing } from "@/lib/listings/public-queries";

export function PropertyCard({
  listing,
  active,
  verifiedLabel,
  bedsLabel,
  bathsLabel,
  sqftLabel,
}: {
  listing: PublicListing;
  active?: boolean;
  verifiedLabel: string;
  bedsLabel: string;
  bathsLabel: string;
  sqftLabel: string;
}) {
  const wrapperClass = active
    ? "block overflow-hidden rounded-[24px] bg-ink-900 p-3 text-white transition"
    : "block overflow-hidden rounded-[24px] bg-ink-50 p-3 text-ink-900 transition hover:bg-ink-100";

  const mutedText = active ? "text-white/55" : "text-ink-500";
  const pillBg = active ? "bg-white/12 text-white/72" : "bg-white text-ink-500";
  const ctaBg = active
    ? "bg-lime-400 text-ink-900"
    : "bg-white text-ink-900";

  const titleId = `listing-${listing.id}-title`;
  return (
    <article aria-labelledby={titleId}>
      <Link href={`/properties/${listing.id}`} className={wrapperClass}>
        <div className="flex gap-4">
          <figure className="relative m-0 h-32 w-36 shrink-0 overflow-hidden rounded-[18px] bg-ink-100">
            {listing.cover_path ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={publicStorageUrl(LISTING_BUCKET, listing.cover_path)}
                alt={`${listing.title} — ${
                  listing.district || listing.area_name
                }`}
                className="h-full w-full object-cover"
              />
            ) : null}
            <figcaption className="absolute left-2 top-2 rounded-full bg-lime-400 px-3 py-1 text-[10px] font-bold text-ink-900">
              {verifiedLabel}
            </figcaption>
          </figure>
          <div className="min-w-0 flex-1 py-1">
            <h3
              id={titleId}
              className="font-display truncate text-[28px] italic leading-none tracking-tight"
            >
              {listing.title}
            </h3>
            <p className={`mt-2 truncate text-[13px] font-medium ${mutedText}`}>
              {listing.district || listing.area_name}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2 list-none ps-0">
              {listing.beds != null ? (
                <li className={`rounded-full px-3 py-1 text-[11px] font-bold ${pillBg}`}>
                  {listing.beds} {bedsLabel}
                </li>
              ) : null}
              {listing.baths != null ? (
                <li className={`rounded-full px-3 py-1 text-[11px] font-bold ${pillBg}`}>
                  {listing.baths} {bathsLabel}
                </li>
              ) : null}
              {listing.area_sqft != null ? (
                <li className={`rounded-full px-3 py-1 text-[11px] font-bold ${pillBg}`}>
                  {listing.area_sqft} {sqftLabel}
                </li>
              ) : null}
            </ul>
            <p className="mt-4 flex items-center justify-between gap-2">
              <span className="font-display text-[28px] italic leading-none tracking-tight">
                {listing.rent
                  ? `৳ ${listing.rent.toLocaleString("bn-BD")}`
                  : "—"}
              </span>
              <span
                aria-hidden
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${ctaBg}`}
              >
                <ArrowUpRightIcon className="h-4 w-4" />
              </span>
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}
