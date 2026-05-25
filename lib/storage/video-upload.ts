"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { LISTING_BUCKET } from "./paths";

export const MAX_VIDEO_DURATION_SECONDS = 62;
export const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024;

export class VideoValidationError extends Error {}

export async function uploadListingVideo(
  file: File,
  userId: string,
  listingId: string,
): Promise<string> {
  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    throw new VideoValidationError(
      "ভিডিওটি কম্প্রেস করার পরেও অনেক বড়। আরও ছোট বা কম সময়ের ভিডিও দিন।",
    );
  }

  const path = `${userId}/${listingId}/video_${Date.now()}.mp4`;
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.storage
    .from(LISTING_BUCKET)
    .upload(path, file, { contentType: "video/mp4", upsert: false });

  if (error) {
    console.error("[listingVideoUpload]", error);
    throw new VideoValidationError("ভিডিও আপলোড করা যায়নি। আবার চেষ্টা করুন।");
  }

  return path;
}
