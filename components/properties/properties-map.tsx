"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import Link from "next/link";
import { useMemo, useState } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import {
  ArrowUpRightIcon,
  BathIcon,
  BedDoubleIcon,
  MapPinIcon,
  RulerIcon,
  ShieldCheckIcon,
} from "lucide-react";
import {
  DHAKA_CENTER,
  MAP_STYLE,
  MAPBOX_TOKEN,
  hasMapboxToken,
} from "@/lib/map/config";
import { LISTING_BUCKET, publicStorageUrl } from "@/lib/storage/paths";
import { MapboxTokenMissing } from "@/components/map/missing-token";
import type { PublicListing } from "@/lib/listings/public-queries";

export function PropertiesMap({
  listings,
  labels,
}: {
  listings: PublicListing[];
  labels: {
    verifiedLabel: string;
    viewListing: string;
    noLocations: string;
    missingToken: string;
  };
}) {
  const [active, setActive] = useState<string | null>(null);

  const center = useMemo(() => {
    const withCoords = listings.filter((l) => l.lat != null && l.lng != null);
    if (withCoords.length === 0) return DHAKA_CENTER;
    const sumLat = withCoords.reduce((s, l) => s + (l.lat as number), 0);
    const sumLng = withCoords.reduce((s, l) => s + (l.lng as number), 0);
    return {
      lat: sumLat / withCoords.length,
      lng: sumLng / withCoords.length,
    };
  }, [listings]);

  if (!hasMapboxToken()) {
    return <MapboxTokenMissing heading={labels.missingToken} />;
  }

  const positioned = listings.filter((l) => l.lat != null && l.lng != null);
  const activeListing = positioned.find((l) => l.id === active) ?? null;

  return (
    <div className="relative h-[820px] overflow-hidden rounded-[28px] bg-white p-3">
      <div className="relative h-full overflow-hidden rounded-[24px] bg-ink-100">
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle={MAP_STYLE}
          initialViewState={{
            longitude: center.lng,
            latitude: center.lat,
            zoom: positioned.length > 0 ? 11 : 10,
          }}
          style={{ width: "100%", height: "100%" }}
        >
          <NavigationControl position="top-right" showCompass={false} />

          {positioned.map((l) => {
            const isActive = l.id === active;
            return (
              <Marker
                key={l.id}
                longitude={l.lng as number}
                latitude={l.lat as number}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setActive(l.id);
                }}
              >
                <span
                  className={
                    isActive
                      ? "grid h-10 cursor-pointer -translate-y-1 place-items-center rounded-full bg-lime-400 px-3 text-[12px] font-bold text-ink-900 shadow-[0_12px_28px_rgba(0,0,0,.18)] ring-2 ring-ink-900"
                      : "grid h-9 cursor-pointer -translate-y-1 place-items-center rounded-full bg-ink-900 px-3 text-[12px] font-bold text-white shadow-[0_12px_28px_rgba(0,0,0,.25)] transition hover:bg-ink-700"
                  }
                >
                  {l.rent ? formatRentChip(l.rent) : "—"}
                </span>
              </Marker>
            );
          })}

          {activeListing ? (
            <Popup
              anchor="top"
              longitude={activeListing.lng as number}
              latitude={activeListing.lat as number}
              onClose={() => setActive(null)}
              closeOnClick={false}
              maxWidth="280px"
              offset={20}
            >
              <PopupCard
                listing={activeListing}
                viewLabel={labels.viewListing}
                verifiedLabel={labels.verifiedLabel}
              />
            </Popup>
          ) : null}
        </Map>
      </div>

      {positioned.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="rounded-full bg-white px-5 py-2 text-[13px] font-bold text-ink-500 shadow-[0_8px_20px_rgba(0,0,0,.1)]">
            {labels.noLocations}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function formatRentChip(rent: number): string {
  if (rent >= 1000) {
    const k = rent / 1000;
    const rounded = k >= 10 ? Math.round(k) : Math.round(k * 10) / 10;
    return `৳${rounded.toLocaleString("bn-BD")}k`;
  }
  return `৳${rent.toLocaleString("bn-BD")}`;
}

function PopupCard({
  listing,
  viewLabel,
  verifiedLabel,
}: {
  listing: PublicListing;
  viewLabel: string;
  verifiedLabel: string;
}) {
  const area = listing.district || listing.area_name;
  return (
    <article className="w-[260px] overflow-hidden rounded-[16px] bg-white">
      <div className="relative">
        {listing.cover_path ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={publicStorageUrl(LISTING_BUCKET, listing.cover_path)}
            alt={listing.title}
            className="aspect-16/10 w-full object-cover"
          />
        ) : (
          <div className="aspect-16/10 w-full bg-ink-100" />
        )}
        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-lime-400 px-2.5 py-1 text-[10px] font-bold text-ink-900">
          <ShieldCheckIcon className="h-3 w-3" strokeWidth={2.5} />
          {verifiedLabel}
        </span>
      </div>

      <div className="p-3">
        <h3 className="line-clamp-1 text-[14px] font-bold tracking-tight text-ink-900">
          {listing.title}
        </h3>
        {area ? (
          <p className="mt-1 inline-flex items-center gap-1 text-[11.5px] font-medium text-ink-500">
            <MapPinIcon className="h-3 w-3 text-ink-500/60" />
            <span className="line-clamp-1">{area}</span>
          </p>
        ) : null}

        {(listing.beds != null ||
          listing.baths != null ||
          listing.area_sqft != null) && (
          <div className="mt-2.5 flex items-center gap-3 text-[11px] font-semibold text-ink-500">
            {listing.beds != null ? (
              <span className="inline-flex items-center gap-1">
                <BedDoubleIcon className="h-3.5 w-3.5" />
                {listing.beds}
              </span>
            ) : null}
            {listing.baths != null ? (
              <span className="inline-flex items-center gap-1">
                <BathIcon className="h-3.5 w-3.5" />
                {listing.baths}
              </span>
            ) : null}
            {listing.area_sqft != null ? (
              <span className="inline-flex items-center gap-1">
                <RulerIcon className="h-3.5 w-3.5" />
                {listing.area_sqft}
              </span>
            ) : null}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-ink-100 pt-3">
          <div className="leading-none">
            <p className="text-[15px] font-bold tracking-tight text-ink-900">
              {listing.rent
                ? `৳ ${listing.rent.toLocaleString("bn-BD")}`
                : "—"}
            </p>
          </div>
          <Link
            href={`/properties/${listing.id}`}
            className="inline-flex h-8 items-center gap-1 rounded-full bg-ink-900 px-3.5 text-[11.5px] font-bold text-white transition hover:bg-ink-700"
          >
            {viewLabel}
            <ArrowUpRightIcon className="h-3 w-3" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </article>
  );
}
