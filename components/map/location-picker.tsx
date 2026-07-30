"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Map, { Marker, type MapRef } from "react-map-gl/mapbox";
import {
  CheckCircle2Icon,
  Loader2Icon,
  MapPinIcon,
  SearchIcon,
} from "lucide-react";
import {
  DHAKA_CENTER,
  MAP_STYLE,
  MAPBOX_TOKEN,
  hasMapboxToken,
} from "@/lib/map/config";
import { setListingLocationAction } from "@/lib/listings/actions";
import { MapboxTokenMissing } from "./missing-token";

type GeocodeFeature = {
  id: string;
  place_name: string;
  center: [number, number];
};

export function LocationPicker({
  listingId,
  initialLat,
  initialLng,
  labels,
}: {
  listingId: string;
  initialLat: number | null;
  initialLng: number | null;
  labels: {
    title: string;
    hint: string;
    searchPlaceholder: string;
    saveCta: string;
    saved: string;
    saving: string;
    saveError: string;
    noResults: string;
  };
}) {
  const [lat, setLat] = useState<number | null>(initialLat);
  const [lng, setLng] = useState<number | null>(initialLng);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeFeature[]>([]);
  const [searching, setSearching] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const mapRef = useRef<MapRef | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    searchDebounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const url = new URL(
          "https://api.mapbox.com/search/geocode/v6/forward",
        );
        url.searchParams.set("q", query.trim());
        url.searchParams.set("country", "bd");
        url.searchParams.set("limit", "10");
        url.searchParams.set(
          "types",
          "place,neighborhood,locality,address,street,postcode,district",
        );
        url.searchParams.set("proximity", "90.4125,23.8103");
        url.searchParams.set("language", "bn,en");
        url.searchParams.set("access_token", MAPBOX_TOKEN);
        const res = await fetch(url.toString());
        if (!res.ok) {
          setResults([]);
          return;
        }
        const data = (await res.json()) as {
          features?: Array<{
            id: string;
            properties: { full_address?: string; name?: string };
            geometry: { coordinates: [number, number] };
          }>;
        };
        const out: GeocodeFeature[] = (data.features ?? []).map((f) => ({
          id: f.id,
          place_name: f.properties.full_address ?? f.properties.name ?? "",
          center: f.geometry.coordinates,
        }));
        setResults(out);
      } catch (err) {
        console.error("[location-picker] geocode", err);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [query]);

  const flyTo = useCallback((nextLng: number, nextLat: number) => {
    setLng(nextLng);
    setLat(nextLat);
    const map = mapRef.current;
    if (map) {
      map.flyTo({ center: [nextLng, nextLat], zoom: 14, duration: 700 });
    }
  }, []);

  const pickResult = useCallback(
    (feature: GeocodeFeature) => {
      const [pickLng, pickLat] = feature.center;
      flyTo(pickLng, pickLat);
      setResults([]);
      setQuery("");
    },
    [flyTo],
  );

  const save = useCallback(() => {
    if (lat == null || lng == null) return;
    setError(null);
    startTransition(async () => {
      try {
        await setListingLocationAction(listingId, lat, lng);
        setSavedAt(Date.now());
      } catch (err) {
        const message =
          err instanceof Error ? err.message : labels.saveError;
        setError(message);
      }
    });
  }, [labels.saveError, lat, listingId, lng]);

  useEffect(() => {
    if (!savedAt) return;
    const id = setTimeout(() => setSavedAt(null), 2500);
    return () => clearTimeout(id);
  }, [savedAt]);

  if (!hasMapboxToken()) {
    return <MapboxTokenMissing heading={labels.title} />;
  }

  const center = {
    lng: lng ?? DHAKA_CENTER.lng,
    lat: lat ?? DHAKA_CENTER.lat,
  };
  const hasLocation = lat != null && lng != null;

  return (
    <div className="rounded-[20px] bg-white p-4">
      <div className="flex items-start gap-3">
        <MapPinIcon className="h-5 w-5 text-ink-500/40" />
        <div className="flex-1">
          <p className="text-[12px] font-bold text-ink-500">{labels.title}</p>
          <p className="mt-1 text-[12px] font-medium text-ink-500/70">
            {labels.hint}
          </p>
        </div>
      </div>

      <div className="relative mt-3">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500/50" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.searchPlaceholder}
          className="h-12 w-full rounded-full bg-ink-50 pl-11 pr-12 text-[14px] font-semibold text-ink-900 outline-none placeholder:text-ink-500/45"
        />
        {searching ? (
          <Loader2Icon className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink-500" />
        ) : null}
        {results.length > 0 ? (
          <ul className="absolute left-0 right-0 top-14 z-10 max-h-64 overflow-auto rounded-[18px] bg-white p-2 shadow-[0_18px_40px_-12px_rgba(0,0,0,.18)]">
            {results.map((feature) => (
              <li key={feature.id}>
                <button
                  type="button"
                  onClick={() => pickResult(feature)}
                  className="w-full rounded-[14px] px-3 py-2.5 text-left text-[13px] font-medium text-ink-900 hover:bg-ink-50"
                >
                  {feature.place_name}
                </button>
              </li>
            ))}
          </ul>
        ) : query.trim().length >= 2 && !searching ? (
          <p className="mt-2 text-[12px] font-semibold text-ink-500">
            {labels.noResults}
          </p>
        ) : null}
      </div>

      <div className="relative mt-4 h-[320px] overflow-hidden rounded-[16px] bg-ink-100">
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle={MAP_STYLE}
          initialViewState={{
            longitude: center.lng,
            latitude: center.lat,
            zoom: hasLocation ? 14 : 11,
          }}
          onClick={(e) => {
            flyTo(e.lngLat.lng, e.lngLat.lat);
          }}
          style={{ width: "100%", height: "100%" }}
        >
          {hasLocation ? (
            <Marker
              longitude={lng!}
              latitude={lat!}
              anchor="bottom"
              draggable
              onDragEnd={(e) => flyTo(e.lngLat.lng, e.lngLat.lat)}
            >
              <span className="grid h-8 w-8 -translate-y-1 place-items-center rounded-full bg-lime-400 text-ink-900 shadow-[0_8px_20px_rgba(14,17,13,.35)] ring-4 ring-ink-900">
                <MapPinIcon className="h-4 w-4" />
              </span>
            </Marker>
          ) : null}
        </Map>
      </div>

      <input type="hidden" name="lat" value={lat ?? ""} />
      <input type="hidden" name="lng" value={lng ?? ""} />

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="text-[12px] font-semibold text-ink-500">
          {hasLocation ? (
            <>
              {lat!.toFixed(5)}, {lng!.toFixed(5)}
            </>
          ) : null}
        </div>
        <button
          type="button"
          onClick={save}
          disabled={!hasLocation || pending}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-ink-900 px-4 text-[13px] font-bold text-white transition hover:bg-ink-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? (
            <>
              <Loader2Icon className="h-4 w-4 animate-spin" />
              {labels.saving}
            </>
          ) : savedAt ? (
            <>
              <CheckCircle2Icon className="h-4 w-4 text-lime-400" />
              {labels.saved}
            </>
          ) : (
            labels.saveCta
          )}
        </button>
      </div>
      {error ? (
        <p className="mt-2 text-[12px] font-semibold text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
