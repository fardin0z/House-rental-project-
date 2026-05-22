export const NID_BUCKET = "nid-documents";
export const LISTING_BUCKET = "listing-images";

export type NidImageType = "front" | "back" | "selfie";

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
