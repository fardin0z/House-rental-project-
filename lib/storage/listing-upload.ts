"use client";

import imageCompression from "browser-image-compression";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { LISTING_BUCKET, listingImageStoragePath } from "./paths";

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.8,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: "image/jpeg",
} as const;

export async function compressAndUploadListingImage(
  file: File,
  userId: string,
  listingId: string,
): Promise<string> {
  const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
  const path = listingImageStoragePath(userId, listingId);

  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.storage
    .from(LISTING_BUCKET)
    .upload(path, compressed, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (error) {
    throw new Error(`ছবি আপলোডে সমস্যা: ${error.message}`);
  }

  return path;
}
