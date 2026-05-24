"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Loader2Icon, Trash2Icon, VideoIcon } from "lucide-react";
import { toast } from "sonner";
import { uploadListingVideo } from "@/lib/storage/video-upload";
import {
  attachListingVideoAction,
  removeListingVideoAction,
} from "@/lib/listings/actions";
import { LISTING_BUCKET, publicStorageUrl } from "@/lib/storage/paths";

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
  const [uploading, setUploading] = useState(false);
  const [, startTransition] = useTransition();

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const newPath = await uploadListingVideo(file, ownerId, listingId);
      await attachListingVideoAction(listingId, newPath);
      setPath(newPath);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "আপলোড ব্যর্থ");
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    startTransition(async () => {
      try {
        await removeListingVideoAction(listingId);
        setPath(null);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "মুছতে সমস্যা");
      }
    });
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
        disabled={uploading}
        className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-rule bg-paper text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:opacity-60 sm:aspect-[2/1]"
      >
        {uploading ? (
          <Loader2Icon className="size-7 animate-spin" />
        ) : (
          <VideoIcon className="size-7" strokeWidth={1.5} />
        )}
        <span className="text-sm font-medium">
          {uploading ? t("video.uploading") : t("video.add")}
        </span>
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
