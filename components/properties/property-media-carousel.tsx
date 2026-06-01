"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageIcon,
  PlayCircleIcon,
  PlayIcon,
} from "lucide-react";
import {
  LISTING_BUCKET,
  publicStorageUrl,
  renderImageUrl,
} from "@/lib/storage/paths";
import type { ListingImageRow } from "@/types/database.types";

type Slide =
  | { kind: "image"; path: string; key: string }
  | { kind: "video"; path: string; key: string };

const SWIPE_THRESHOLD = 60;
const AUTO_ADVANCE_MS = 5000;

export function PropertyMediaCarousel({
  images,
  videoPath,
  title,
  district,
  rentalTypeLabel,
  verifiedLabel,
  photoCountLabel,
  videoLabel,
  rent,
  rentLabel,
}: {
  images: ListingImageRow[];
  videoPath: string | null;
  title: string;
  district: string;
  rentalTypeLabel: string;
  verifiedLabel: string;
  photoCountLabel: string;
  videoLabel: string;
  rent: number | null;
  rentLabel: string;
}) {
  const slides = useMemo<Slide[]>(() => {
    const out: Slide[] = images.map((img) => ({
      kind: "image",
      path: img.path,
      key: img.id,
    }));
    if (videoPath) {
      out.push({ kind: "video", path: videoPath, key: `video-${videoPath}` });
    }
    return out;
  }, [images, videoPath]);

  const total = slides.length;
  const [index, setIndex] = useState(0);
  const safeIndex = total > 0 ? Math.min(index, total - 1) : 0;
  const stripRef = useRef<HTMLDivElement>(null);
  const swipeStartRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (next: number) => {
      if (total === 0) return;
      const wrapped = ((next % total) + total) % total;
      setIndex(wrapped);
    },
    [total],
  );
  const next = useCallback(() => goTo(safeIndex + 1), [goTo, safeIndex]);
  const prev = useCallback(() => goTo(safeIndex - 1), [goTo, safeIndex]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  useEffect(() => {
    if (total <= 1) return;
    const active = slides[safeIndex];
    if (!active || active.kind === "video" || paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => ((i + 1) % total + total) % total);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [paused, safeIndex, slides, total]);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const child = strip.children[safeIndex] as HTMLElement | undefined;
    child?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [safeIndex]);

  if (total === 0) {
    return (
      <div className="flex aspect-2/1 max-h-[560px] items-center justify-center rounded-[32px] bg-ink-100 text-ink-500">
        <ImageIcon className="h-8 w-8" />
      </div>
    );
  }

  const counterCurrent = String(safeIndex + 1).padStart(2, "0");
  const counterTotal = String(total).padStart(2, "0");
  const showPocket = rent != null;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        setPaused(true);
        swipeStartRef.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = swipeStartRef.current;
        if (start != null) {
          const end = e.changedTouches[0]?.clientX ?? start;
          const delta = end - start;
          if (Math.abs(delta) > SWIPE_THRESHOLD) {
            if (delta < 0) next();
            else prev();
          }
          swipeStartRef.current = null;
        }
        setPaused(false);
      }}
      className="relative aspect-2/1 max-h-[600px] w-full overflow-hidden rounded-[34px] bg-ink-900 shadow-[0_28px_60px_-20px_rgba(14,17,13,.35)]"
    >
      {slides.map((slide, i) => {
        const isActive = i === safeIndex;
        return (
          <div
            key={slide.key}
            aria-hidden={!isActive}
            className={
              isActive
                ? "absolute inset-0 z-[2] opacity-100 scale-100 transition-all duration-700 ease-[cubic-bezier(0.22,0.72,0,1)]"
                : "absolute inset-0 z-[1] opacity-0 scale-105 transition-all duration-700 ease-[cubic-bezier(0.22,0.72,0,1)]"
            }
          >
            {slide.kind === "image" ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={renderImageUrl(LISTING_BUCKET, slide.path, {
                  width: 1600,
                  quality: 85,
                  resize: "cover",
                })}
                alt={i === 0 ? title : ""}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              /* eslint-disable-next-line jsx-a11y/media-has-caption */
              <video
                src={publicStorageUrl(LISTING_BUCKET, slide.path)}
                controls={isActive}
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full bg-ink-900 object-contain"
              />
            )}
          </div>
        );
      })}

      <div className="pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(to_top,rgba(0,0,0,.82),rgba(0,0,0,.18)_55%,rgba(0,0,0,.24)),linear-gradient(to_right,rgba(0,0,0,.26),transparent_48%,rgba(0,0,0,.22))]" />

      <div className="absolute left-5 right-5 top-5 z-[20] flex flex-wrap items-center justify-between gap-3 md:left-6 md:right-6 md:top-6">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-400 px-3.5 py-1.5 text-[11.5px] font-bold tracking-tight text-ink-900 shadow-[0_6px_18px_rgba(164,232,97,.5)]">
            <span className="h-1.5 w-1.5 rounded-full bg-ink-900" />
            {verifiedLabel}
          </span>
          <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11.5px] font-bold text-white backdrop-blur-xl">
            {rentalTypeLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-baseline gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 backdrop-blur-xl">
            <span className="font-display text-[13.5px] font-bold text-white tabular-nums">
              {counterCurrent}
            </span>
            <span className="text-[11px] font-semibold text-white/55">/</span>
            <span className="font-display text-[11px] font-semibold text-white/65 tabular-nums">
              {counterTotal}
            </span>
          </span>
        </div>
      </div>

      {total > 1 ? (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="previous"
            className="group absolute left-4 top-1/2 z-[20] hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-white/20 active:scale-95 md:inline-flex"
          >
            <ChevronLeftIcon className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-0.5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="next"
            className="group absolute right-4 top-1/2 z-[20] hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-white/20 active:scale-95 md:inline-flex"
          >
            <ChevronRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>
        </>
      ) : null}

      {safeIndex === 0 ? (
        <div className="absolute bottom-[150px] left-5 right-5 z-[20] max-w-[850px] md:left-8 md:right-8">
          <p className="font-display text-[22px] italic leading-none text-lime-300 md:text-[28px]">
            {district}
          </p>
          <h1 className="font-display mt-4 text-[40px] italic leading-[.9] tracking-tight text-white drop-shadow-[0_8px_22px_rgba(0,0,0,.45)] md:text-[72px]">
            {title}
          </h1>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11.5px] font-bold text-white backdrop-blur-xl">
              <ImageIcon className="mr-2 h-3.5 w-3.5 text-lime-300" />
              {photoCountLabel}
            </span>
            {videoPath ? (
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11.5px] font-bold text-white backdrop-blur-xl">
                <PlayCircleIcon className="mr-2 h-3.5 w-3.5 text-lime-300" />
                {videoLabel}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      {showPocket ? (
        <div className="price-pocket">
          <div className="absolute bottom-3 right-3 z-[31] flex h-[78px] items-center rounded-full bg-ink-900 pl-6 pr-3 text-white shadow-2xl">
            <div className="min-w-[120px]">
              <p className="font-space text-[10px] font-bold uppercase tracking-[.18em] text-white/40">
                {rentLabel}
              </p>
              <p className="font-display text-[28px] italic leading-none tracking-tight">
                ৳ {rent!.toLocaleString("bn-BD")}
              </p>
            </div>
            <span className="ml-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-lime-400 text-ink-900">
              <ArrowUpRightIcon className="h-5 w-5" />
            </span>
          </div>
        </div>
      ) : null}

      {total > 1 ? (
        <div
          className={
            showPocket
              ? "absolute bottom-5 left-5 z-[20] max-w-[calc(100%-2.5rem)] md:max-w-[calc(100%-20rem)]"
              : "absolute bottom-5 left-5 z-[20] max-w-[calc(100%-2.5rem)]"
          }
        >
          <div
            ref={stripRef}
            className="flex w-fit gap-2.5 overflow-x-auto rounded-[20px] border border-white/25 bg-white/10 p-2.5 backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {slides.map((slide, i) => {
              const isActive = i === safeIndex;
              return (
                <button
                  key={slide.key}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`slide ${i + 1}`}
                  className={
                    isActive
                      ? "relative h-16 w-24 shrink-0 overflow-hidden rounded-[12px] outline-2 outline-offset-2 outline-lime-400 transition-all duration-300"
                      : "relative h-16 w-24 shrink-0 overflow-hidden rounded-[12px] opacity-65 transition-all duration-300 hover:scale-105 hover:opacity-100"
                  }
                >
                  {slide.kind === "image" ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={renderImageUrl(LISTING_BUCKET, slide.path, {
                        width: 240,
                        quality: 75,
                        resize: "cover",
                      })}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-ink-900 text-white">
                      <PlayIcon className="h-5 w-5 text-lime-400" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
