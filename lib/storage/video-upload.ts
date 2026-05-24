"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { LISTING_BUCKET } from "./paths";

const MAX_DURATION_SECONDS = 62;
const MAX_SIZE_BYTES = 45 * 1024 * 1024;

export class VideoValidationError extends Error {}

function readDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new VideoValidationError("ভিডিও পড়া যায়নি"));
    };
    video.src = url;
  });
}

export async function uploadListingVideo(
  file: File,
  userId: string,
  listingId: string,
): Promise<string> {
  if (!file.type.startsWith("video/")) {
    throw new VideoValidationError("শুধু ভিডিও ফাইল আপলোড করা যাবে");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new VideoValidationError("ভিডিও ফাইল অনেক বড় (সর্বোচ্চ ৪৫ MB)");
  }

  const duration = await readDuration(file);
  if (duration > MAX_DURATION_SECONDS) {
    throw new VideoValidationError("ভিডিও ১ মিনিটের বেশি হতে পারবে না");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
  const path = `${userId}/${listingId}/video_${Date.now()}.${ext}`;

  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.storage
    .from(LISTING_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    throw new VideoValidationError(`আপলোডে সমস্যা: ${error.message}`);
  }

  return path;
}
