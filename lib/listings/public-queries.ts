import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentSession } from "@/lib/auth/guards";
import { hasActivePremium } from "@/lib/payments/queries";
import { expandAreaQuery } from "./area-index";
import type {
  ListingImageRow,
  ListingRow,
  RentalType,
} from "@/types/database.types";

export type PublicListing = {
  id: string;
  title: string;
  rental_type: RentalType;
  rent: number | null;
  beds: number | null;
  baths: number | null;
  area_sqft: number | null;
  area_name: string;
  district: string | null;
  division: string | null;
  lat: number | null;
  lng: number | null;
  cover_path: string | null;
  is_premium_viewer: boolean;
  is_owner: boolean;
};

export type PublicListingDetail = PublicListing & {
  status: "draft" | "pending" | "approved" | "rejected" | "archived";
  description: string | null;
  video_path: string | null;
  images: ListingImageRow[];
  landlord: {
    id: string;
    name: string | null;
    phone: string | null;
  } | null;
};

export type PublicListingFilters = {
  area?: string;
  type?: RentalType;
  budget?: string;
  beds?: number;
  limit?: number;
};

function escape(value: string): string {
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

function roundCoord(coord: number | null, decimals = 2): number | null {
  if (coord == null) return null;
  const factor = 10 ** decimals;
  return Math.round(coord * factor) / factor;
}

async function viewerAccess(): Promise<{
  userId: string | null;
  premium: boolean;
  isAdmin: boolean;
}> {
  const session = await getCurrentSession();
  const userId = session?.userId ?? null;
  const isAdmin = session?.role === "admin";
  const premium = userId
    ? isAdmin || (await hasActivePremium(userId))
    : false;
  return { userId, premium, isAdmin };
}

export async function getPublicListings(
  filters: PublicListingFilters = {},
): Promise<PublicListing[]> {
  const { area, type, budget, beds, limit = 60 } = filters;
  const supabase = await getSupabaseServerClient();
  const { userId, premium } = await viewerAccess();

  let query = supabase
    .from("listings")
    .select("*, images:listing_images(path, sort_order)")
    .eq("status", "approved");

  if (area?.trim()) {
    const variants = expandAreaQuery(area).map((v) => escape(v));
    const clauses = variants.flatMap((v) => [
      `area_name.ilike.%${v}%`,
      `district.ilike.%${v}%`,
      `division.ilike.%${v}%`,
      `title.ilike.%${v}%`,
      `description.ilike.%${v}%`,
    ]);
    if (clauses.length > 0) query = query.or(clauses.join(","));
  }
  if (type) query = query.eq("rental_type", type);
  if (budget) {
    const { min, max } = parseBudget(budget);
    if (min !== null) query = query.gte("rent", min);
    if (max !== null) query = query.lte("rent", max);
  }
  if (beds && beds > 0) query = query.gte("beds", beds);

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getPublicListings]", error);
    return [];
  }

  type Row = ListingRow & {
    images: { path: string; sort_order: number }[];
  };
  return ((data ?? []) as Row[]).map((row) => {
    const cover = row.images
      ?.slice()
      .sort((a, b) => a.sort_order - b.sort_order)[0];
    const isOwner = userId !== null && row.owner_id === userId;
    const canSeeExact = premium || isOwner;
    return {
      id: row.id,
      title: row.title,
      rental_type: row.rental_type,
      rent: row.rent,
      beds: row.beds,
      baths: row.baths,
      area_sqft: row.area_sqft,
      area_name: row.area_name,
      district: row.district,
      division: row.division,
      lat: canSeeExact ? row.lat : roundCoord(row.lat),
      lng: canSeeExact ? row.lng : roundCoord(row.lng),
      cover_path: cover?.path ?? null,
      is_premium_viewer: canSeeExact,
      is_owner: isOwner,
    };
  });
}

export async function getPublicListingDetail(
  id: string,
): Promise<PublicListingDetail | null> {
  const supabase = await getSupabaseServerClient();
  const { userId, premium, isAdmin } = await viewerAccess();

  const { data, error } = await supabase
    .from("listings")
    .select("*, images:listing_images(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getPublicListingDetail]", error);
    return null;
  }
  if (!data) return null;

  const listing = data as ListingRow & { images: ListingImageRow[] };
  const isOwner = userId !== null && listing.owner_id === userId;

  if (listing.status !== "approved" && !isOwner && !isAdmin) {
    return null;
  }

  const canSeeExact = premium || isOwner;
  const sortedImages = (listing.images ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
  const cover = sortedImages[0];

  let landlord: PublicListingDetail["landlord"] = null;
  if (canSeeExact) {
    const admin = getSupabaseAdminClient();
    const { data: ownerProfile } = await admin
      .from("profiles")
      .select("id, name, phone")
      .eq("id", listing.owner_id)
      .maybeSingle();
    if (ownerProfile) {
      landlord = {
        id: ownerProfile.id,
        name: ownerProfile.name,
        phone: ownerProfile.phone,
      };
    }
  }

  return {
    id: listing.id,
    title: listing.title,
    rental_type: listing.rental_type,
    rent: listing.rent,
    beds: listing.beds,
    baths: listing.baths,
    area_sqft: listing.area_sqft,
    area_name: listing.area_name,
    district: listing.district,
    division: listing.division,
    lat: canSeeExact ? listing.lat : roundCoord(listing.lat),
    lng: canSeeExact ? listing.lng : roundCoord(listing.lng),
    cover_path: cover?.path ?? null,
    status: listing.status,
    description: canSeeExact ? listing.description : null,
    video_path: canSeeExact ? listing.video_path : null,
    images: sortedImages,
    landlord,
    is_premium_viewer: canSeeExact,
    is_owner: isOwner,
  };
}
