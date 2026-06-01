"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import Map, { Marker } from "react-map-gl/mapbox";
import { MapPinIcon } from "lucide-react";
import {
  DHAKA_CENTER,
  MAP_STYLE,
  MAPBOX_TOKEN,
  hasMapboxToken,
} from "@/lib/map/config";
import { MapboxTokenMissing } from "@/components/map/missing-token";

export function PropertyLocationMap({
  lat,
  lng,
  premium,
  approxLabel,
  exactLabel,
  missingHeading,
}: {
  lat: number | null;
  lng: number | null;
  premium: boolean;
  approxLabel: string;
  exactLabel: string;
  missingHeading: string;
}) {
  if (!hasMapboxToken()) {
    return <MapboxTokenMissing heading={missingHeading} />;
  }

  const hasCoords = lat != null && lng != null;
  const center = hasCoords
    ? { lat, lng }
    : { lat: DHAKA_CENTER.lat, lng: DHAKA_CENTER.lng };

  return (
    <div className="overflow-hidden rounded-[24px] bg-white p-3">
      <div className="relative h-[360px] overflow-hidden rounded-[18px] bg-ink-100">
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle={MAP_STYLE}
          initialViewState={{
            longitude: center.lng as number,
            latitude: center.lat as number,
            zoom: premium ? 15 : 12,
          }}
          style={{ width: "100%", height: "100%" }}
          interactive={false}
        >
          {hasCoords ? (
            <Marker
              longitude={lng as number}
              latitude={lat as number}
              anchor="bottom"
            >
              <span className="grid h-9 w-9 -translate-y-1 place-items-center rounded-full bg-lime-400 text-ink-900 shadow-[0_8px_20px_rgba(14,17,13,.35)] ring-4 ring-ink-900">
                <MapPinIcon className="h-4 w-4" />
              </span>
            </Marker>
          ) : null}
        </Map>

        <span className="absolute left-4 top-4 rounded-full bg-ink-900 px-4 py-2 text-[12px] font-bold text-white">
          {premium ? exactLabel : approxLabel}
        </span>
      </div>
    </div>
  );
}
