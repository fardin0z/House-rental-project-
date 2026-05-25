"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  AlertTriangleIcon,
  Loader2Icon,
  RotateCcwIcon,
  Trash2Icon,
  VideoIcon,
  WandSparklesIcon,
} from "lucide-react";
import { toast } from "sonner";
import { compressVideo, readVideoDuration } from "@/lib/storage/video-compress";
import {
  uploadListingVideo,
  MAX_VIDEO_DURATION_SECONDS,
} from "@/lib/storage/video-upload";
import {
  attachListingVideoAction,
  removeListingVideoAction,
} from "@/lib/listings/actions";
import { LISTING_BUCKET, publicStorageUrl } from "@/lib/storage/paths";

type Stage = "idle" | "checking" | "compressing" | "uploading";

export function ListingVideoUploader({
  listingId,
  ownerId,
  initialPath,
}: {
  listingId: string;
  ownerId: string;
  initialPath: string | null;
}) {
  const t = useTranslations("listings");
  const inputRef = useRef<HTMLInputElement>(null);
  const [path, setPath] = useState<string | null>(initialPath);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const busy = stage !== "idle";

  async function handleFile(file: File) {
    setError(null);
    try {
      setStage("checking");
      const duration = await readVideoDuration(file);
      if (duration > MAX_VIDEO_DURATION_SECONDS) {
        setError(t("video.guideError"));
        setStage("idle");
        return;
      }

      setStage("compressing");
      const compressed = await compressVideo(file);

      setStage("uploading");
      const newPath = await uploadListingVideo(compressed, ownerId, listingId);
      await attachListingVideoAction(listingId, newPath);
      setPath(newPath);
    } catch (err) {
      console.error("[videoUploader]", err);
      setError(t("video.guideError"));
    } finally {
      setStage("idle");
    }
  }

  function handleRemove() {
    startTransition(async () => {
      try {
        await removeListingVideoAction(listingId);
        setPath(null);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "মুছতে সমস্যা");
      }
    });
  }

  if (busy) {
    const label =
      stage === "compressing"
        ? t("video.compressing")
        : stage === "uploading"
          ? t("video.uploading")
          : t("video.checking");

    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-ember/30 bg-ember-soft/30 p-8">
        <div className="flex items-center gap-2 text-clay">
          {stage === "compressing" ? (
            <WandSparklesIcon className="size-5 shrink-0" />
          ) : (
            <Loader2Icon className="size-5 shrink-0 animate-spin" />
          )}
        </div>

        <p className="max-w-md text-center text-sm leading-relaxed text-clay">
          {label}
        </p>

        {stage === "compressing" ? (
          <div className="w-full max-w-xs">
            <div className="h-2 overflow-hidden rounded-full bg-paper">
              <div className="progress-indeterminate h-full rounded-full bg-ember" />
            </div>
          </div>
        ) : null}

        <p className="text-center text-xs text-ink-soft">{t("video.compressNote")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive">
            <AlertTriangleIcon className="size-5" />
          </span>
          <div className="flex flex-col gap-1.5">
            <h3 className="font-display text-lg italic text-ink">
              {t("video.guideTitle")}
            </h3>
            <p className="text-sm leading-relaxed text-ink/80">{error}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setError(null);
            inputRef.current?.click();
          }}
          className="inline-flex items-center gap-2 self-start rounded-full border border-rule bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink"
        >
          <RotateCcwIcon className="size-4" />
          {t("video.tryAgain")}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleFile(file);
            event.target.value = "";
          }}
        />
      </div>
    );
  }

  if (path) {
    return (
      <div className="flex flex-col gap-3">
        <div className="relative overflow-hidden rounded-2xl border border-rule/60 bg-ink">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={publicStorageUrl(LISTING_BUCKET, path)}
            controls
            className="aspect-video w-full object-cover"
          />
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <Trash2Icon className="size-4" />
          {t("video.remove")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-rule bg-paper text-ink-soft transition-colors hover:border-ink hover:text-ink sm:aspect-[2/1]"
      >
        <VideoIcon className="size-7" strokeWidth={1.5} />
        <span className="text-sm font-medium">{t("video.add")}</span>
      </button>
      <p className="text-xs text-ink-soft">{t("video.hint")}</p>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleFile(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}
