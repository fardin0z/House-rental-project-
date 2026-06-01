"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { CHAT_BUCKET, chatAttachmentStoragePath } from "@/lib/storage/paths";

export type UploadedAttachment = {
  path: string;
  type: string;
  name: string;
};

const MAX_BYTES = 10 * 1024 * 1024;

export async function uploadChatAttachment(
  conversationId: string,
  userId: string,
  file: File,
): Promise<UploadedAttachment> {
  if (file.size > MAX_BYTES) {
    throw new Error("ফাইল ১০ MB এর বেশি হতে পারবে না");
  }
  const supabase = getSupabaseBrowserClient();
  const path = chatAttachmentStoragePath(conversationId, userId, file.name);
  const { error } = await supabase.storage
    .from(CHAT_BUCKET)
    .upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
      cacheControl: "31536000",
    });
  if (error) {
    console.error("[uploadChatAttachment]", error);
    throw new Error("ফাইল আপলোড ব্যর্থ");
  }
  return {
    path,
    type: file.type || "application/octet-stream",
    name: file.name,
  };
}
