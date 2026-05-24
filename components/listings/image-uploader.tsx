"use client";

import {
  useCallback,
  useRef,
  useState,
  useTransition,
} from "react";
import { ImagePlusIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { compressAndUploadListingImage } from "@/lib/storage/listing-upload";
import {
  attachListingImageAction,
  removeListingImageAction,
} from "@/lib/listings/actions";
import { LISTING_BUCKET, publicStorageUrl } from "@/lib/storage/paths";
import type { ListingImageRow } from "@/types/database.types";

const MAX_IMAGES = 6;

type Labels = {
  add: string;
  uploading: string;
  delete: string;
  hint: string;
  limit: string;
};

export function ListingImageUploader({
  listingId,
  ownerId,
  initialImages,
  labels,
}: {
  listingId: string;
  ownerId: string;
  initialImages: ListingImageRow[];
  labels: Labels;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ListingImageRow[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [, startTransition] = useTransition();

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      if (images.length >= MAX_IMAGES) {
        toast.warning(labels.limit);
        return;
      }
      const slotsLeft = MAX_IMAGES - images.length;
      const list = Array.from(files).slice(0, slotsLeft);

      setUploading(true);
      for (const file of list) {
        try {
          const path = await compressAndUploadListingImage(file, ownerId, listingId);
          const { id } = await attachListingImageAction(
            listingId,
            path,
            images.length,
          );
          setImages((prev) => [
            ...prev,
            {
              id,
              listing_id: listingId,
              path,
              sort_order: prev.length,
              created_at: new Date().toISOString(),
            },
          ]);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "আপলোড ব্যর্থ");
        }
      }
      setUploading(false);
    },
    [images.length, listingId, ownerId, labels.limit],
  );

  function handleRemove(imageId: string) {
    startTransition(async () => {
      try {
        await removeListingImageAction(listingId, imageId);
        setImages((prev) => prev.filter((img) => img.id !== imageId));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "মুছতে সমস্যা");
      }
    });
  }

  const canAddMore = images.length < MAX_IMAGES && !uploading;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-rule/60 bg-canvas-deep"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={publicStorageUrl(LISTING_BUCKET, image.path)}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(image.id)}
              className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-paper/90 text-destructive opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
              aria-label={labels.delete}
            >
              <Trash2Icon className="size-4" />
            </button>
          </div>
        ))}

        {canAddMore ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-rule bg-paper text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            <ImagePlusIcon className="size-6" strokeWidth={1.5} />
            <span className="text-xs font-medium">{labels.add}</span>
          </button>
        ) : null}

        {uploading ? (
          <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl border border-rule bg-paper text-ink-soft">
            <Loader2Icon className="size-6 animate-spin" />
            <span className="text-xs font-medium">{labels.uploading}</span>
          </div>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <p className="text-xs text-ink-soft">
        {labels.hint} · {images.length}/{MAX_IMAGES}
      </p>
    </div>
  );
}
