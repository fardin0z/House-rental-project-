import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ListingImageRow,
  ListingRow,
  RentalType,
} from "@/types/database.types";

export type ListingWithImages = ListingRow & { images: ListingImageRow[] };

export type ApprovedListingFilters = {
  limit?: number;
  area?: string;
  type?: RentalType;
  budget?: string;
};

function escapePgIlike(value: string): string {
  return value.replace(/[\\,()*%]/g, "");
}

function parseBudget(budget: string): { min: number | null; max: number | null } {
  const [minStr, maxStr] = budget.split("-");
  const min = Number.parseInt(minStr ?? "", 10);
  const max = Number.parseInt(maxStr ?? "", 10);
  return {
    min: Number.isFinite(min) && min > 0 ? min : null,
    max: Number.isFinite(max) ? max : null,
  };
}

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

export async function getApprovedListings(
  filters: ApprovedListingFilters = {},
): Promise<ListingWithImages[]> {
  const { limit = 24, area, type, budget } = filters;
  const supabase = await getSupabaseServerClient();

  let query = supabase
    .from("listings")
    .select("*, images:listing_images(*)")
    .eq("status", "approved");

  if (area?.trim()) {
    const safe = escapePgIlike(area.trim());
    query = query.or(
      `area_name.ilike.%${safe}%,district.ilike.%${safe}%,division.ilike.%${safe}%`,
    );
  }

  if (type) {
    query = query.eq("rental_type", type);
  }

  if (budget) {
    const { min, max } = parseBudget(budget);
    if (min !== null) query = query.gte("rent", min);
    if (max !== null) query = query.lte("rent", max);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw formatSupabaseError("getApprovedListings", error);
  return (data ?? []) as ListingWithImages[];
}

export type LandingStats = { activeListings: number; cities: number };

export async function getLandingStats(): Promise<LandingStats> {
  const supabase = await getSupabaseServerClient();
  const [countRes, citiesRes] = await Promise.all([
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved"),
    supabase
      .from("listings")
      .select("district")
      .eq("status", "approved"),
  ]);

  const activeListings = countRes.count ?? 0;
  const districts = new Set(
    (citiesRes.data ?? [])
      .map((r) => (r as { district: string | null }).district)
      .filter((d): d is string => Boolean(d)),
  );
  return { activeListings, cities: districts.size };
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
