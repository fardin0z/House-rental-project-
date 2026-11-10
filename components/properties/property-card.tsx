import Link from "next/link";
import { ArrowUpRightIcon, MapPinIcon, PhoneCallIcon } from "lucide-react";
import { LISTING_BUCKET, publicStorageUrl } from "@/lib/storage/paths";
import type { PublicListing } from "@/lib/listings/public-queries";
import { formatBdPhoneForDisplay } from "@/lib/auth/phone";

export function PropertyCard({
  listing,
  verifiedLabel,
  bedsLabel,
  bathsLabel,
  callLabel,
}: {
  listing: PublicListing;
  verifiedLabel: string;
  bedsLabel: string;
  bathsLabel: string;
  callLabel: string;
}) {
  const titleId = `listing-${listing.id}-title`;
  const location = [listing.area_name, listing.district]
    .filter(Boolean)
    .join(", ");
  const description = listing.description?.trim();

  return (
    <article aria-labelledby={titleId} className="h-full overflow-hidden rounded-[22px] border border-ink-100 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(15,23,42,0.12)]">
      <Link
        href={`/properties/${listing.id}`}
        className="group block h-full"
      >
        <figure className="relative m-0 aspect-[1.45/1] overflow-hidden bg-ink-100">
            {listing.cover_path ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={publicStorageUrl(LISTING_BUCKET, listing.cover_path)}
                alt={`${listing.title} — ${
                  listing.district || listing.area_name
                }`}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-semibold text-ink-400">
                ছবি নেই
              </div>
            )}
            <figcaption className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold text-ink-900 shadow-sm">
              {verifiedLabel}
            </figcaption>
          </figure>
      </Link>
      {listing.contact_phone ? (
        <a
          href={`tel:${listing.contact_phone}`}
          aria-label={`${callLabel}: ${formatBdPhoneForDisplay(listing.contact_phone)}`}
          className="flex items-center justify-center gap-2 border-b border-ink-100 bg-lime-50 px-4 py-3 text-[13px] font-bold text-ink-900 transition hover:bg-lime-100"
        >
          <PhoneCallIcon className="h-4 w-4 text-lime-700" />
          <span>{callLabel}</span>
          <span className="font-medium text-ink-600">{formatBdPhoneForDisplay(listing.contact_phone)}</span>
        </a>
      ) : null}
      <Link href={`/properties/${listing.id}`} className="group block h-full">
          <div className="p-4 sm:p-5">
            <h3 id={titleId} className="line-clamp-2 text-[18px] font-bold leading-tight tracking-tight text-ink-900 sm:text-[20px]">
              {listing.title}
            </h3>
            {location ? (
              <p className="mt-2 flex items-center gap-1 text-[13px] font-semibold text-ink-500">
                <MapPinIcon className="h-4 w-4 shrink-0 text-lime-600" />
                <span className="truncate">{location}</span>
              </p>
            ) : null}
            {description ? (
              <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-ink-500">
                {description}
              </p>
            ) : null}
            <ul className="mt-4 flex list-none flex-wrap gap-2 ps-0">
              {listing.beds != null ? (
                <li className="rounded-full bg-ink-50 px-3 py-1 text-[11px] font-bold text-ink-600">
                  {listing.beds} {bedsLabel}
                </li>
              ) : null}
              {listing.baths != null ? (
                <li className="rounded-full bg-ink-50 px-3 py-1 text-[11px] font-bold text-ink-600">
                  {listing.baths} {bathsLabel}
                </li>
              ) : null}
            </ul>
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-ink-100 pt-4">
              <span className="text-[19px] font-bold leading-tight tracking-tight text-ink-900">
                {listing.rent
                  ? `৳ ${listing.rent.toLocaleString("en-BD")}`
                  : "—"}
              </span>
              <span aria-hidden className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-lime-400 text-ink-900 transition group-hover:bg-ink-900 group-hover:text-white">
                <ArrowUpRightIcon className="h-4 w-4" />
              </span>
            </div>
          </div>
      </Link>
    </article>
  );
}
