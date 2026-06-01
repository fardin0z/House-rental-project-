export const NID_BUCKET = "nid-documents";
export const LISTING_BUCKET = "listing-images";
export const CHAT_BUCKET = "chat-attachments";

export type NidImageType = "front" | "back" | "selfie";

export function chatAttachmentStoragePath(
  conversationId: string,
  userId: string,
  filename: string,
): string {
  const stamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const safeName = filename.replace(/[^\w.\-]+/g, "_").slice(0, 80);
  return `${conversationId}/${userId}/${stamp}_${random}_${safeName}`;
}

export function nidStoragePath(userId: string, type: NidImageType): string {
  const stamp = Date.now();
  return `${userId}/${type}_${stamp}.jpg`;
}

export function listingImageStoragePath(userId: string, listingId: string): string {
  const stamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `${userId}/${listingId}/${stamp}_${random}.jpg`;
}

export function publicStorageUrl(bucket: string, path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/${bucket}/${encodeURI(path)}`;
}

export type RenderImageOptions = {
  width?: number;
  height?: number;
  quality?: number;
  resize?: "cover" | "contain" | "fill";
};

export function renderImageUrl(
  bucket: string,
  path: string,
  options: RenderImageOptions = {},
): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const url = new URL(
    `${base}/storage/v1/render/image/public/${bucket}/${encodeURI(path)}`,
  );
  if (options.width) url.searchParams.set("width", String(options.width));
  if (options.height) url.searchParams.set("height", String(options.height));
  if (options.quality)
    url.searchParams.set("quality", String(options.quality));
  if (options.resize) url.searchParams.set("resize", options.resize);
  return url.toString();
}
