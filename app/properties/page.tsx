import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SlidersHorizontalIcon, ArrowUpRightIcon } from "lucide-react";
import { SITE_NAME, getSiteUrl } from "@/lib/seo/site";
import {
  getPublicListings,
  type PublicListing,
} from "@/lib/listings/public-queries";
import { PropertyCard } from "@/components/properties/property-card";
import { PropertiesSearch } from "@/components/properties/properties-search";
import { getCurrentSession } from "@/lib/auth/guards";
import type { RentalType } from "@/types/database.types";

const ALLOWED_TYPES: RentalType[] = [
  "family_flat",
  "bachelor",
  "sublet",
  "office",
  "shop",
];

function asString(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export const metadata: Metadata = {
  title: "বাসা ভাড়া খুঁজুন · ম্যাপ ভিউ",
  description:
    "ঢাকা ও বাংলাদেশে যাচাইকৃত মালিকের কাছ থেকে সরাসরি বাসা ভাড়া। এলাকা, বাজেট ও বেডরুম অনুযায়ী ফিল্টার করে ম্যাপে দেখুন।",
  alternates: { canonical: "/properties" },
  openGraph: {
    type: "website",
    url: `${getSiteUrl()}/properties`,
    title: `বাসা ভাড়া খুঁজুন · ${SITE_NAME}`,
    description:
      "Browse verified rental homes across Bangladesh with map view and filters.",
    images: ["/og-image.png"],
  },
};

function asInt(value: string | string[] | undefined): number | undefined {
  const s = asString(value);
  if (!s) return undefined;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : undefined;
}

export default async function PropertiesSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const t = await getTranslations("properties");
  const sp = await searchParams;
  const areaParam = asString(sp.area);
  const typeRaw = asString(sp.type);
  const typeParam = ALLOWED_TYPES.find((x) => x === typeRaw);
  const budgetParam = asString(sp.budget);
  const bedsParam = asInt(sp.beds);
  const hasFilters = Boolean(
    areaParam || typeParam || budgetParam || bedsParam,
  );

  const [listings, session] = await Promise.all([
    getPublicListings({
      area: areaParam,
      type: typeParam,
      budget: budgetParam,
      beds: bedsParam,
      limit: 60,
    }),
    getCurrentSession(),
  ]);
  const isLandlord = session?.role === "landlord";

  return (
    <main>
      <header className="mx-auto max-w-7xl px-6 pb-6 pt-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-sans text-[18px] font-semibold leading-tight text-lime-600">
              {isLandlord ? t("landlordEyebrow") : t("eyebrow")}
            </p>
            <h1 className="font-sans mt-3 text-[36px] font-bold leading-tight tracking-tight text-ink-900 md:text-[48px]">
              {isLandlord ? t("landlordHeading") : t("heading")}
            </h1>
            <p className="mt-6 max-w-[520px] text-[15px] font-medium leading-relaxed text-ink-500">
              {isLandlord ? t("landlordSubtitle") : t("subtitle")}
            </p>
          </div>
          {isLandlord ? (
            <Link
              href="/listings/new"
              className="inline-flex h-12 w-fit items-center gap-2 rounded-full bg-ink-900 px-6 text-[14px] font-bold text-white transition hover:bg-ink-700"
            >
              {t("landlordCta")}
              <ArrowUpRightIcon className="h-4 w-4" />
            </Link>
          ) : null}
        </div>

        <div className="mt-8">
          <PropertiesSearch />
        </div>
      </header>

      <section
        aria-labelledby="properties-results-title"
        className="mx-auto max-w-7xl px-6 pb-10"
      >
        <SidebarList
          listings={listings}
          hasFilters={hasFilters}
          labels={{
            availableTitle: t("availableTitle"),
            availableCount: t("availableCount", { count: listings.length }),
            verified: t("verified"),
            beds: t("beds"),
            baths: t("baths"),
            sqft: t("sqft"),
            noResultsTitle: t("noResultsTitle"),
            noResultsBody: t("noResultsBody"),
          }}
        />

      </section>
    </main>
  );
}

function SidebarList({
  listings,
  hasFilters,
  labels,
}: {
  listings: PublicListing[];
  hasFilters: boolean;
  labels: {
    availableTitle: string;
    availableCount: string;
    verified: string;
    beds: string;
    baths: string;
    sqft: string;
    noResultsTitle: string;
    noResultsBody: string;
  };
}) {
  return (
    <aside
      aria-labelledby="properties-results-title"
      className="rounded-[30px] bg-white p-4"
    >
      <header className="flex items-center justify-between px-2 py-2">
        <div>
          <h2
            id="properties-results-title"
            className="text-[22px] font-bold tracking-tight text-ink-900"
          >
            {labels.availableTitle}
          </h2>
          <p className="mt-1 text-[12px] font-semibold text-ink-500">
            {labels.availableCount}
          </p>
        </div>
        <button
          type="button"
          aria-label="filters"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink-50 text-ink-900"
        >
          <SlidersHorizontalIcon className="h-4 w-4" />
        </button>
      </header>

      {listings.length === 0 ? (
        <div className="mt-4 rounded-[20px] bg-ink-50 p-6 text-center">
          <p className="text-[15px] font-bold text-ink-900">
            {labels.noResultsTitle}
          </p>
          <p className="mt-2 text-[13px] font-medium text-ink-500">
            {hasFilters ? labels.noResultsBody : labels.noResultsBody}
          </p>
        </div>
      ) : (
        <ul className="mt-4 grid list-none grid-cols-1 gap-4 ps-0 sm:grid-cols-2">
          {listings.map((l, i) => (
            <li key={l.id}>
              <PropertyCard
                listing={l}
                active={i === 0}
                verifiedLabel={labels.verified}
                bedsLabel={labels.beds}
                bathsLabel={labels.baths}
                sqftLabel={labels.sqft}
              />
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
