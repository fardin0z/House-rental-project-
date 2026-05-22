"use client";

import imageCompression from "browser-image-compression";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { NID_BUCKET, nidStoragePath, type NidImageType } from "./paths";

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
  fileType: "image/jpeg",
} as const;

export async function compressAndUploadNidImage(
  file: File,
  userId: string,
  type: NidImageType,
): Promise<string> {
  const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
  const path = nidStoragePath(userId, type);

  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.storage
    .from(NID_BUCKET)
    .upload(path, compressed, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (error) {
    throw new Error(`আপলোড ব্যর্থ (${type}): ${error.message}`);
  }

  return path;
}
