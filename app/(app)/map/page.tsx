import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeftIcon } from "lucide-react";
import { requireProfile } from "@/lib/auth/guards";
import { getApprovedListings } from "@/lib/listings/queries";
import { ListingsMap, type MapListing } from "@/components/map/listings-map";
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

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireProfile();
  const t = await getTranslations("map");
  const tListings = await getTranslations("listings");
  const sp = await searchParams;
  const areaParam = asString(sp.area);
  const typeParamRaw = asString(sp.type);
  const typeParam = ALLOWED_TYPES.find((tt) => tt === typeParamRaw);
  const budgetParam = asString(sp.budget);

  const listings = await getApprovedListings({
    area: areaParam,
    type: typeParam,
    budget: budgetParam,
    limit: 200,
  });

  const mapListings: MapListing[] = listings
    .filter((l) => l.lat != null && l.lng != null)
    .map((l) => {
      const cover = l.images?.[0];
      return {
        id: l.id,
        title: l.title,
        area_name: l.area_name,
        rent: l.rent,
        beds: l.beds,
        baths: l.baths,
        lat: l.lat as number,
        lng: l.lng as number,
        cover_path: cover ? cover.path : null,
      };
    });

  return (
    <main>
      <nav
        aria-label={tListings("backToListings")}
        className="mx-auto max-w-7xl px-6 pb-4 pt-8"
      >
        <Link
          href="/listings"
          className="inline-flex items-center gap-2 text-[13px] font-bold text-ink-500 transition-colors hover:text-ink-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {tListings("backToListings")}
        </Link>
      </nav>

      <header className="mx-auto max-w-7xl px-6 pb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-[20px] italic leading-none text-lime-600">
              {t("eyebrow")}
            </p>
            <h1 className="font-display mt-4 text-[40px] italic leading-[.9] tracking-tight text-ink-900 md:text-[56px]">
              {t("heading")}
            </h1>
          </div>
          <p className="text-[13px] font-semibold text-ink-500">
            {t("count", { count: mapListings.length })}
          </p>
        </div>
      </header>

      <section
        aria-label={t("heading")}
        className="mx-auto max-w-7xl px-6 pb-12"
      >
        <ListingsMap
          listings={mapListings}
          labels={{
            viewListing: t("viewListing"),
            noLocations: t("noLocations"),
            missingToken: t("missingTokenHeading"),
          }}
        />
      </section>
    </main>
  );
}
