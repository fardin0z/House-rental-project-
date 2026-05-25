import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ListingImageRow, ListingRow } from "@/types/database.types";

export type ListingWithImages = ListingRow & { images: ListingImageRow[] };

function formatSupabaseError(
  context: string,
  error: { code?: string; message?: string; details?: string | null; hint?: string | null },
): Error {
  console.error(`[${context}]`, error);
  return new Error("তথ্য লোড করা যায়নি। একটু পর আবার চেষ্টা করুন।");
}

export async function getMyListings(userId: string): Promise<ListingWithImages[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*, images:listing_images(*)")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw formatSupabaseError("getMyListings", error);
  return (data ?? []) as ListingWithImages[];
}

export async function getApprovedListings(limit = 24): Promise<ListingWithImages[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*, images:listing_images(*)")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw formatSupabaseError("getApprovedListings", error);
  return (data ?? []) as ListingWithImages[];
}

export async function getListingById(id: string): Promise<ListingWithImages | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*, images:listing_images(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getListingById]", error);
    return null;
  }
  return data as ListingWithImages | null;
}
