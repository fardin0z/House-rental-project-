"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import Link from "next/link";
import { useMemo, useState } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import { ArrowUpRightIcon, BedDoubleIcon, BathIcon } from "lucide-react";
import {
  DHAKA_CENTER,
  MAP_STYLE,
  MAPBOX_TOKEN,
  hasMapboxToken,
} from "@/lib/map/config";
import { LISTING_BUCKET, publicStorageUrl } from "@/lib/storage/paths";
import { MapboxTokenMissing } from "./missing-token";

export type MapListing = {
  id: string;
  title: string;
  area_name: string | null;
  rent: number | null;
  beds: number | null;
  baths: number | null;
  lat: number;
  lng: number;
  cover_path: string | null;
};

export function ListingsMap({
  listings,
  labels,
}: {
  listings: MapListing[];
  labels: {
    viewListing: string;
    noLocations: string;
    missingToken: string;
  };
}) {
  const [active, setActive] = useState<string | null>(null);

  const center = useMemo(() => {
    if (listings.length === 0) return DHAKA_CENTER;
    const sumLat = listings.reduce((s, l) => s + l.lat, 0);
    const sumLng = listings.reduce((s, l) => s + l.lng, 0);
    return {
      lat: sumLat / listings.length,
      lng: sumLng / listings.length,
    };
  }, [listings]);

  if (!hasMapboxToken()) {
    return <MapboxTokenMissing heading={labels.missingToken} />;
  }

  const activeListing = listings.find((l) => l.id === active) ?? null;

  return (
    <div className="relative h-[calc(100vh-180px)] min-h-[480px] overflow-hidden rounded-[20px] bg-ink-100">
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={MAP_STYLE}
        initialViewState={{
          longitude: center.lng,
          latitude: center.lat,
          zoom: listings.length > 0 ? 11 : 10,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {listings.map((l) => (
          <Marker
            key={l.id}
            longitude={l.lng}
            latitude={l.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setActive(l.id);
            }}
          >
            <span className="grid h-9 w-9 -translate-y-1 cursor-pointer place-items-center rounded-full bg-lime-400 text-[10px] font-bold text-ink-900 shadow-[0_8px_20px_rgba(14,17,13,.35)] ring-4 ring-ink-900 transition hover:scale-110">
              {l.rent ? formatRentChip(l.rent) : "—"}
            </span>
          </Marker>
        ))}

        {activeListing ? (
          <Popup
            anchor="top"
            longitude={activeListing.lng}
            latitude={activeListing.lat}
            onClose={() => setActive(null)}
            closeOnClick={false}
            maxWidth="320px"
            offset={20}
          >
            <ListingPopupCard
              listing={activeListing}
              viewLabel={labels.viewListing}
            />
          </Popup>
        ) : null}
      </Map>

      {listings.length === 0 ? (
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
    return `${rounded.toLocaleString("bn-BD")}k`;
  }
  return rent.toLocaleString("bn-BD");
}

function ListingPopupCard({
  listing,
  viewLabel,
}: {
  listing: MapListing;
  viewLabel: string;
}) {
  return (
    <article className="overflow-hidden rounded-[14px] bg-white">
      {listing.cover_path ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={publicStorageUrl(LISTING_BUCKET, listing.cover_path)}
          alt={listing.title}
          className="aspect-4/3 w-full object-cover"
        />
      ) : (
        <div className="aspect-4/3 w-full bg-ink-100" />
      )}
      <div className="p-3">
        <h3 className="line-clamp-1 text-[14px] font-bold text-ink-900">
          {listing.title}
        </h3>
        {listing.area_name ? (
          <p className="mt-0.5 line-clamp-1 text-[12px] font-medium text-ink-500">
            {listing.area_name}
          </p>
        ) : null}
        <div className="mt-2 flex items-center justify-between">
          <p className="font-display text-[18px] italic leading-none tracking-tight text-ink-900">
            {listing.rent
              ? `৳ ${listing.rent.toLocaleString("bn-BD")}`
              : "—"}
          </p>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-ink-500">
            {listing.beds != null ? (
              <span className="inline-flex items-center gap-0.5">
                <BedDoubleIcon className="h-3 w-3" />
                {listing.beds}
              </span>
            ) : null}
            {listing.baths != null ? (
              <span className="inline-flex items-center gap-0.5">
                <BathIcon className="h-3 w-3" />
                {listing.baths}
              </span>
            ) : null}
          </div>
        </div>
        <Link
          href={`/listings/${listing.id}`}
          className="mt-3 inline-flex h-9 w-full items-center justify-between rounded-full bg-ink-900 px-4 text-[12px] font-bold text-white hover:bg-ink-700"
        >
          {viewLabel}
          <ArrowUpRightIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
