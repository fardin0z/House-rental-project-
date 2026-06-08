import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  BathIcon,
  BedDoubleIcon,
  CalendarDaysIcon,
  LockIcon,
  LockKeyholeIcon,
  RulerIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { getCurrentUserId } from "@/lib/auth/guards";
import { getPublicListingDetail } from "@/lib/listings/public-queries";
import { PropertyMediaCarousel } from "@/components/properties/property-media-carousel";
import { PropertyLocationMap } from "@/components/properties/property-location-map";
import { ContactLandlordButton } from "@/components/properties/contact-button";
import { PremiumLock } from "@/components/listings/premium-lock";
import { LISTING_BUCKET, publicStorageUrl } from "@/lib/storage/paths";
import { SITE_NAME, getSiteUrl } from "@/lib/seo/site";

export async function generateMetadata(
  props: PageProps<"/properties/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const listing = await getPublicListingDetail(id);
  if (!listing) {
    return { title: "Not found", robots: { index: false, follow: false } };
  }

  const titleParts = [
    listing.title,
    [listing.district, listing.area_name].filter(Boolean).join(", "),
  ].filter(Boolean);
  const title = titleParts.join(" · ") || SITE_NAME;

  const rentLine = listing.rent
    ? `৳ ${listing.rent.toLocaleString("bn-BD")} · `
    : "";
  const description = (
    listing.description?.replace(/\s+/g, " ").trim().slice(0, 155) ||
    `${rentLine}${[listing.area_name, listing.district]
      .filter(Boolean)
      .join(", ")} — ${SITE_NAME}`
  ).slice(0, 160);

  const ogImage = listing.cover_path
    ? publicStorageUrl(LISTING_BUCKET, listing.cover_path)
    : "/og-image.png";

  const canonicalPath = `/properties/${id}`;
  const indexable = listing.status === "approved";

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "website",
      url: `${getSiteUrl()}${canonicalPath}`,
      title,
      description,
      images: [{ url: ogImage, alt: listing.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

export default async function PropertyDetailPage(
  props: PageProps<"/properties/[id]">,
) {
  const { id } = await props.params;
  const t = await getTranslations("properties");
  const tListings = await getTranslations("listings");

  const listing = await getPublicListingDetail(id);
  if (!listing) notFound();

  const jsonLd = buildListingJsonLd(id, listing);

  const userId = await getCurrentUserId();
  const isAuthed = userId !== null;

  return (
    <main>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <nav
        aria-label={t("backToSearch")}
        className="mx-auto max-w-7xl px-6 pb-2 pt-6"
      >
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 text-[13px] font-bold text-ink-500 transition-colors hover:text-ink-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t("backToSearch")}
        </Link>
      </nav>

      <section
        aria-label={t("photoCount", { count: listing.images.length })}
        className="mx-auto max-w-7xl px-6 pb-8 pt-4"
      >
        <PropertyMediaCarousel
          images={listing.images}
          videoPath={listing.video_path}
          title={listing.title}
          district={listing.district ?? listing.area_name}
          rentalTypeLabel={tListings(`rentalType.${listing.rental_type}`)}
          verifiedLabel={t("verified")}
          photoCountLabel={t("photoCount", { count: listing.images.length })}
          videoLabel={t("videoLabel")}
          rent={listing.rent}
          rentLabel={t("rentLabel")}
        />
      </section>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 pb-12 lg:grid-cols-[1fr_380px]">
        <article className="space-y-6">
          <section
            aria-labelledby="overview-heading"
            className="rounded-[28px] bg-white p-6 md:p-8"
          >
            <p className="font-space text-[12px] font-bold uppercase tracking-[.18em] text-ink-500/70">
              {t("overviewEyebrow")}
            </p>
            <h2
              id="overview-heading"
              className="font-display mt-4 text-[36px] italic leading-none text-ink-900 md:text-[44px]"
            >
              {t("overviewTitle")}
            </h2>

            <ul className="mt-8 grid grid-cols-2 gap-3 list-none ps-0 md:grid-cols-4">
              <StatTile
                icon={<BedDoubleIcon className="h-5 w-5 text-lime-600" />}
                value={listing.beds != null ? String(listing.beds) : "—"}
                label={t("bedrooms")}
              />
              <StatTile
                icon={<BathIcon className="h-5 w-5 text-lime-600" />}
                value={listing.baths != null ? String(listing.baths) : "—"}
                label={t("bathrooms")}
              />
              <StatTile
                icon={<RulerIcon className="h-5 w-5 text-lime-600" />}
                value={
                  listing.area_sqft != null ? String(listing.area_sqft) : "—"
                }
                label={t("sqftLabel")}
              />
              <StatTile
                icon={<CalendarDaysIcon className="h-5 w-5 text-lime-600" />}
                value={t("available")}
                label={t("availableLabel")}
              />
            </ul>
          </section>

          <DescriptionSection
            description={listing.description}
            premium={listing.is_premium_viewer}
            t={t}
          />

          <section aria-labelledby="location-heading">
            <h2
              id="location-heading"
              className="font-space mb-3 ml-2 text-[12px] font-bold uppercase tracking-[.18em] text-ink-500/70"
            >
              {t("locationTitle")}
            </h2>
            <PropertyLocationMap
              lat={listing.lat}
              lng={listing.lng}
              premium={listing.is_premium_viewer}
              approxLabel={t("approxLocation")}
              exactLabel={t("exactLocation")}
              missingHeading={t("missingMapToken")}
            />
            {!listing.is_premium_viewer ? (
              <p className="mt-3 ml-2 text-[12px] font-semibold text-ink-500">
                {t("approxNote")}
              </p>
            ) : null}
          </section>
        </article>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-[28px] bg-white p-6">
            <p className="font-space text-[12px] font-bold uppercase tracking-[.18em] text-ink-500/70">
              {t("rentLabel")}
            </p>
            <p className="font-display mt-4 text-[44px] italic leading-none tracking-tight text-ink-900 md:text-[54px]">
              ৳ {listing.rent ? listing.rent.toLocaleString("bn-BD") : "—"}
            </p>
            <p className="mt-3 text-[13px] font-semibold text-ink-500">
              {t("rentSuffix")}
            </p>

            <div className="mt-6">
              <ContactLandlordButton
                listingId={listing.id}
                isAuthed={isAuthed}
                label={t("messageLandlord")}
                loginLabel={t("loginToMessage")}
              />
            </div>

            {!listing.is_premium_viewer ? (
              <div className="mt-4">
                <PremiumLock
                  label={tListings("lockRentContact")}
                  cta={tListings("unlockCta")}
                />
              </div>
            ) : null}
          </section>

          {listing.landlord && listing.is_premium_viewer ? (
            <section className="rounded-[28px] bg-ink-900 p-6 text-white">
              <p className="font-space text-[12px] font-bold uppercase tracking-[.18em] text-white/35">
                {t("ownerLabel")}
              </p>
              <div className="mt-6 flex items-center gap-4">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-lime-400 text-[16px] font-bold text-ink-900">
                  {(listing.landlord.name ?? "?").trim().charAt(0)}
                </span>
                <div>
                  <h3 className="text-[18px] font-bold tracking-tight">
                    {listing.landlord.name ?? "—"}
                  </h3>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/55">
                    <ShieldCheckIcon className="h-3.5 w-3.5 text-lime-400" />
                    {t("ownerVerified")}
                  </p>
                </div>
              </div>
              <div className="mt-6 rounded-[18px] bg-white/10 p-4">
                <p className="text-[13px] font-medium leading-relaxed text-white/65">
                  {t("ownerNote")}
                </p>
              </div>
            </section>
          ) : null}

          <section className="rounded-[28px] bg-white p-6">
            <p className="font-space text-[12px] font-bold uppercase tracking-[.18em] text-ink-500/70">
              {t("safetyTitle")}
            </p>
            <p className="mt-4 text-[14px] font-medium leading-relaxed text-ink-500">
              {t("safetyBody")}
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}

function StatTile({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <li className="rounded-[22px] bg-ink-50 p-5">
      {icon}
      <p className="font-display mt-5 text-[30px] italic leading-none tracking-tight md:text-[34px]">
        <span className="sr-only">{label}: </span>
        {value}
      </p>
      <p className="mt-2 text-[12px] font-bold text-ink-500" aria-hidden>
        {label}
      </p>
    </li>
  );
}

function DescriptionSection({
  description,
  premium,
  t,
}: {
  description: string | null;
  premium: boolean;
  t: Awaited<ReturnType<typeof getTranslations<"properties">>>;
}) {
  if (premium) {
    return (
      <section className="rounded-[28px] bg-white p-6 md:p-8">
        <p className="font-space text-[12px] font-bold uppercase tracking-[.18em] text-ink-500/70">
          {t("premiumEyebrow")}
        </p>
        <h2 className="font-display mt-4 text-[36px] italic leading-none text-ink-900 md:text-[44px]">
          {t("descriptionTitle")}
        </h2>
        {description ? (
          <p className="mt-6 whitespace-pre-wrap text-[15px] font-medium leading-relaxed text-ink-500">
            {description}
          </p>
        ) : (
          <p className="mt-6 text-[14px] font-medium text-ink-500/70">—</p>
        )}
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[28px] bg-white p-6 md:p-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="font-space text-[12px] font-bold uppercase tracking-[.18em] text-ink-500/70">
            {t("premiumEyebrow")}
          </p>
          <h2 className="font-display mt-4 text-[36px] italic leading-none text-ink-900 md:text-[44px]">
            {t("descriptionTitle")}
          </h2>
        </div>
        <span className="inline-flex h-10 items-center rounded-full bg-ink-900 px-4 text-[12px] font-bold text-white">
          <LockIcon className="mr-2 h-4 w-4 text-lime-400" />
          {t("lockedBadge")}
        </span>
      </div>

      <div className="relative mt-6 max-h-[180px] overflow-hidden">
        <div
          className="text-[15px] font-medium leading-relaxed text-ink-500"
          style={{
            maskImage:
              "linear-gradient(to bottom, #000 0%, #000 40%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, #000 0%, #000 40%, transparent 100%)",
          }}
        >
          <p>
            ▓▓▓▓▓ ▓▓▓▓▓▓▓▓▓ ▓▓▓ ▓▓▓▓▓▓▓ ▓▓▓▓▓ ▓▓▓▓▓▓ ▓▓▓▓ ▓▓▓▓▓▓▓▓
            ▓▓▓▓▓ ▓▓▓▓▓▓ ▓▓▓▓▓▓ ▓▓▓ ▓▓▓▓ ▓▓▓▓ ▓▓▓ ▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓
            ▓▓▓▓▓▓ ▓▓▓▓ ▓▓▓▓▓ ▓▓▓▓▓ ▓▓▓ ▓▓▓▓ ▓▓▓▓▓.
          </p>
          <p className="mt-3">
            ▓▓▓▓▓ ▓▓▓ ▓▓▓▓▓▓ ▓▓▓▓▓▓▓ ▓▓▓▓ ▓▓▓▓▓ ▓▓▓▓▓ ▓▓▓▓ ▓▓▓▓ ▓▓▓▓▓ ▓▓▓▓▓▓.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-[24px] bg-ink-900 p-5 text-white md:flex md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-lime-400 text-ink-900">
            <LockKeyholeIcon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-[18px] font-bold tracking-tight">
              {t("lockedTitle")}
            </h3>
            <p className="mt-2 text-[13px] font-medium leading-relaxed text-white/55">
              {t("lockedBody")}
            </p>
          </div>
        </div>
        <Link
          href="/subscription"
          className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-lime-400 px-6 text-[14px] font-bold text-ink-900 md:mt-0 md:w-auto"
        >
          {t("lockedCta")}
          <ArrowUpRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

type ListingForLd = Awaited<ReturnType<typeof getPublicListingDetail>>;

function buildListingJsonLd(
  id: string,
  listing: NonNullable<ListingForLd>,
): Record<string, unknown> | null {
  if (listing.status !== "approved") return null;

  const url = `${getSiteUrl()}/properties/${id}`;
  const photos = listing.images
    .slice(0, 8)
    .map((img) => publicStorageUrl(LISTING_BUCKET, img.path));

  const offers = listing.rent
    ? {
        "@type": "Offer",
        price: listing.rent,
        priceCurrency: "BDT",
        availability: "https://schema.org/InStock",
        url,
      }
    : undefined;

  const address = {
    "@type": "PostalAddress",
    addressLocality: listing.area_name,
    addressRegion: listing.district ?? undefined,
    addressCountry: "BD",
  };

  return {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: listing.title,
    description: listing.description ?? undefined,
    url,
    image: photos.length > 0 ? photos : undefined,
    address,
    numberOfRooms: listing.beds ?? undefined,
    numberOfBathroomsTotal: listing.baths ?? undefined,
    floorSize: listing.area_sqft
      ? {
          "@type": "QuantitativeValue",
          value: listing.area_sqft,
          unitCode: "FTK",
        }
      : undefined,
    geo:
      listing.is_premium_viewer && listing.lat != null && listing.lng != null
        ? {
            "@type": "GeoCoordinates",
            latitude: listing.lat,
            longitude: listing.lng,
          }
        : undefined,
    offers,
  };
}
