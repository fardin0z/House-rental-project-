import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SlidersHorizontalIcon, ArrowUpRightIcon } from "lucide-react";
import {
  getPublicListings,
  type PublicListing,
} from "@/lib/listings/public-queries";
import { PropertyCard } from "@/components/properties/property-card";
import { PropertiesMap } from "@/components/properties/properties-map";
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
    <div>
      <section className="mx-auto max-w-7xl px-6 pb-6 pt-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-display text-[22px] italic leading-none text-lime-600">
              {isLandlord ? t("landlordEyebrow") : t("eyebrow")}
            </p>
            <h1 className="font-display mt-6 text-[48px] italic leading-[.9] tracking-tight text-ink-900 md:text-[72px]">
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
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 pb-10 lg:grid-cols-[420px_1fr]">
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

        <PropertiesMap
          listings={listings}
          labels={{
            verifiedLabel: t("verified"),
            viewListing: t("viewListing"),
            noLocations: t("noLocations"),
            missingToken: t("missingMapToken"),
          }}
        />
      </section>
    </div>
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
    <aside className="rounded-[30px] bg-white p-4">
      <div className="flex items-center justify-between px-2 py-2">
        <div>
          <h2 className="text-[22px] font-bold tracking-tight text-ink-900">
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
      </div>

      <div className="scroll-soft mt-4 max-h-[760px] space-y-3 overflow-auto pr-1">
        {listings.length === 0 ? (
          <div className="rounded-[20px] bg-ink-50 p-6 text-center">
            <p className="text-[15px] font-bold text-ink-900">
              {labels.noResultsTitle}
            </p>
            <p className="mt-2 text-[13px] font-medium text-ink-500">
              {hasFilters ? labels.noResultsBody : labels.noResultsBody}
            </p>
          </div>
        ) : (
          listings.map((l, i) => (
            <PropertyCard
              key={l.id}
              listing={l}
              active={i === 0}
              verifiedLabel={labels.verified}
              bedsLabel={labels.beds}
              bathsLabel={labels.baths}
              sqftLabel={labels.sqft}
            />
          ))
        )}
      </div>
    </aside>
  );
}
