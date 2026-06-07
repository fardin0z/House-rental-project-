import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { NID_BUCKET } from "@/lib/storage/paths";
import type { ProfileRow } from "@/types/database.types";

export type DashboardStats = {
  totalUsers: number;
  totalLandlords: number;
  activeListings: number;
  pendingListings: number;
  activeSubscriptions: number;
  totalRevenue: number;
  pendingNidCount: number;
  pendingMovingCount: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = getSupabaseAdminClient();

  const [
    usersRes,
    landlordsRes,
    activeListingsRes,
    pendingListingsRes,
    activeSubsRes,
    revenueRes,
    pendingNidRes,
    pendingMovingRes,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "landlord"),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved"),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString()),
    supabase
      .from("transactions")
      .select("amount")
      .eq("status", "completed"),
    supabase
      .from("nid_documents")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("moving_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  const totalRevenue =
    revenueRes.data?.reduce(
      (sum, row) => sum + Number(row.amount ?? 0),
      0,
    ) ?? 0;

  return {
    totalUsers: usersRes.count ?? 0,
    totalLandlords: landlordsRes.count ?? 0,
    activeListings: activeListingsRes.count ?? 0,
    pendingListings: pendingListingsRes.count ?? 0,
    activeSubscriptions: activeSubsRes.count ?? 0,
    totalRevenue,
    pendingNidCount: pendingNidRes.count ?? 0,
    pendingMovingCount: pendingMovingRes.count ?? 0,
  };
}

const SIGNED_URL_TTL_SEC = 60 * 60;

export type PendingNidDoc = {
  id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected";
  document_type: string | null;
  created_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
  user: {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
    role: string;
  };
  signed: {
    front: string | null;
    back: string | null;
    selfie: string | null;
  };
};

export async function getNidDocs(
  status: "pending" | "approved" | "rejected" = "pending",
  limit = 50,
): Promise<PendingNidDoc[]> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("nid_documents")
    .select(
      "id, user_id, status, document_type, created_at, reviewed_at, rejection_reason, front_path, back_path, selfie_path, user:profiles!nid_documents_user_id_fkey(id, name, phone, email, role)",
    )
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getNidDocs]", error);
    return [];
  }

  const rows = (data ?? []) as Array<{
    id: string;
    user_id: string;
    status: "pending" | "approved" | "rejected";
    document_type: string | null;
    created_at: string;
    reviewed_at: string | null;
    rejection_reason: string | null;
    front_path: string;
    back_path: string;
    selfie_path: string;
    user: {
      id: string;
      name: string | null;
      phone: string | null;
      email: string | null;
      role: string;
    } | null;
  }>;

  const signed = await Promise.all(
    rows.map(async (row) => {
      const [front, back, selfie] = await Promise.all([
        signedUrl(supabase, row.front_path),
        signedUrl(supabase, row.back_path),
        signedUrl(supabase, row.selfie_path),
      ]);
      return { id: row.id, front, back, selfie };
    }),
  );
  const signedMap = new Map(signed.map((s) => [s.id, s]));

  return rows.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    status: row.status,
    document_type: row.document_type,
    created_at: row.created_at,
    reviewed_at: row.reviewed_at,
    rejection_reason: row.rejection_reason,
    user: {
      id: row.user?.id ?? row.user_id,
      name: row.user?.name ?? null,
      phone: row.user?.phone ?? null,
      email: row.user?.email ?? null,
      role: row.user?.role ?? "tenant",
    },
    signed: signedMap.get(row.id) ?? { front: null, back: null, selfie: null },
  }));
}

async function signedUrl(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  path: string,
): Promise<string | null> {
  const { data } = await supabase.storage
    .from(NID_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SEC);
  return data?.signedUrl ?? null;
}

export type AdminUser = ProfileRow & {
  premium_active: boolean;
  listings_count: number;
};

export type Paginated<T> = {
  rows: T[];
  total: number;
};

export async function getUsers(options: {
  search?: string;
  role?: "tenant" | "landlord" | "admin" | null;
  id?: string;
  limit?: number;
  offset?: number;
}): Promise<Paginated<AdminUser>> {
  const supabase = getSupabaseAdminClient();
  const limit = options.limit ?? 25;
  const offset = options.offset ?? 0;

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (options.role) query = query.eq("role", options.role);
  if (options.id) query = query.eq("id", options.id);

  const search = options.search?.trim();
  if (search) {
    const escaped = search.replace(/[%_]/g, "\\$&");
    query = query.or(
      `name.ilike.%${escaped}%,phone.ilike.%${escaped}%,email.ilike.%${escaped}%`,
    );
  }

  const { data, error, count } = await query;
  if (error) {
    console.error("[getUsers]", error);
    return { rows: [], total: 0 };
  }

  const profiles = (data ?? []) as ProfileRow[];
  if (profiles.length === 0) return { rows: [], total: count ?? 0 };

  const ids = profiles.map((p) => p.id);
  const nowIso = new Date().toISOString();

  const [premiumRes, listingsRes] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("user_id")
      .in("user_id", ids)
      .eq("status", "active")
      .eq("tier", "premium")
      .gt("expires_at", nowIso),
    supabase
      .from("listings")
      .select("owner_id")
      .in("owner_id", ids),
  ]);

  const premiumIds = new Set(
    (premiumRes.data ?? []).map((r) => r.user_id as string),
  );
  const listingsMap = new Map<string, number>();
  for (const row of (listingsRes.data ?? []) as Array<{ owner_id: string }>) {
    listingsMap.set(row.owner_id, (listingsMap.get(row.owner_id) ?? 0) + 1);
  }

  return {
    rows: profiles.map((p) => ({
      ...p,
      premium_active: premiumIds.has(p.id),
      listings_count: listingsMap.get(p.id) ?? 0,
    })),
    total: count ?? profiles.length,
  };
}

export type AdminListing = {
  id: string;
  title: string;
  rent: number;
  rental_type: string;
  area_name: string;
  district: string | null;
  status: "draft" | "pending" | "approved" | "rejected" | "archived";
  rejection_reason: string | null;
  created_at: string;
  cover_path: string | null;
  owner: {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
  };
};

export async function getAdminListings(options: {
  status?: "draft" | "pending" | "approved" | "rejected" | "archived" | null;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Paginated<AdminListing>> {
  const supabase = getSupabaseAdminClient();
  const limit = options.limit ?? 25;
  const offset = options.offset ?? 0;

  let query = supabase
    .from("listings")
    .select(
      "id, title, rent, rental_type, area_name, district, status, rejection_reason, created_at, owner_id, owner:profiles!listings_owner_id_fkey(id, name, phone, email), images:listing_images(path, sort_order)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (options.status) query = query.eq("status", options.status);

  const search = options.search?.trim();
  if (search) {
    const escaped = search.replace(/[%_]/g, "\\$&");
    query = query.or(`title.ilike.%${escaped}%,area_name.ilike.%${escaped}%`);
  }

  const { data, error, count } = await query;
  if (error) {
    console.error("[getAdminListings]", error);
    return { rows: [], total: 0 };
  }

  const rows = (data ?? []) as Array<{
    id: string;
    title: string;
    rent: number;
    rental_type: string;
    area_name: string;
    district: string | null;
    status: AdminListing["status"];
    rejection_reason: string | null;
    created_at: string;
    owner_id: string;
    owner: {
      id: string;
      name: string | null;
      phone: string | null;
      email: string | null;
    } | null;
    images: { path: string; sort_order: number }[] | null;
  }>;

  return {
    rows: rows.map((row) => {
      const sorted = [...(row.images ?? [])].sort(
        (a, b) => a.sort_order - b.sort_order,
      );
      return {
        id: row.id,
        title: row.title,
        rent: row.rent,
        rental_type: row.rental_type,
        area_name: row.area_name,
        district: row.district,
        status: row.status,
        rejection_reason: row.rejection_reason,
        created_at: row.created_at,
        cover_path: sorted[0]?.path ?? null,
        owner: {
          id: row.owner?.id ?? row.owner_id,
          name: row.owner?.name ?? null,
          phone: row.owner?.phone ?? null,
          email: row.owner?.email ?? null,
        },
      };
    }),
    total: count ?? rows.length,
  };
}

export type AdminListingDetail = AdminListing & {
  description: string | null;
  beds: number | null;
  baths: number | null;
  area_sqft: number | null;
  division: string | null;
  lat: number | null;
  lng: number | null;
  video_path: string | null;
  updated_at: string;
  images: { id: string; path: string; sort_order: number }[];
};

export async function getAdminListingDetail(
  id: string,
): Promise<AdminListingDetail | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      "*, owner:profiles!listings_owner_id_fkey(id, name, phone, email), images:listing_images(id, path, sort_order)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getAdminListingDetail]", error);
    return null;
  }
  if (!data) return null;

  const row = data as {
    id: string;
    title: string;
    description: string | null;
    rental_type: string;
    rent: number;
    beds: number | null;
    baths: number | null;
    area_sqft: number | null;
    area_name: string;
    division: string | null;
    district: string | null;
    lat: number | null;
    lng: number | null;
    status: AdminListing["status"];
    rejection_reason: string | null;
    video_path: string | null;
    created_at: string;
    updated_at: string;
    owner_id: string;
    owner: {
      id: string;
      name: string | null;
      phone: string | null;
      email: string | null;
    } | null;
    images: { id: string; path: string; sort_order: number }[] | null;
  };

  const sortedImages = [...(row.images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    rent: row.rent,
    rental_type: row.rental_type,
    beds: row.beds,
    baths: row.baths,
    area_sqft: row.area_sqft,
    area_name: row.area_name,
    district: row.district,
    division: row.division,
    lat: row.lat,
    lng: row.lng,
    status: row.status,
    rejection_reason: row.rejection_reason,
    video_path: row.video_path,
    created_at: row.created_at,
    updated_at: row.updated_at,
    cover_path: sortedImages[0]?.path ?? null,
    images: sortedImages,
    owner: {
      id: row.owner?.id ?? row.owner_id,
      name: row.owner?.name ?? null,
      phone: row.owner?.phone ?? null,
      email: row.owner?.email ?? null,
    },
  };
}

export type AdminTransaction = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  aamarpay_transaction_id: string | null;
  provider_transaction_id: string | null;
  status: "pending" | "completed" | "failed" | "cancelled";
  created_at: string;
  user: {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
  };
};

export async function getAdminTransactions(options: {
  status?: "pending" | "completed" | "failed" | "cancelled" | null;
  limit?: number;
  offset?: number;
}): Promise<Paginated<AdminTransaction>> {
  const supabase = getSupabaseAdminClient();
  const limit = options.limit ?? 25;
  const offset = options.offset ?? 0;

  let query = supabase
    .from("transactions")
    .select(
      "id, user_id, amount, currency, aamarpay_transaction_id, provider_transaction_id, status, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (options.status) query = query.eq("status", options.status);

  const { data, error, count } = await query;
  if (error) {
    console.error("[getAdminTransactions]", error);
    return { rows: [], total: 0 };
  }

  const rows = (data ?? []) as Array<{
    id: string;
    user_id: string;
    amount: number;
    currency: string;
    aamarpay_transaction_id: string | null;
    provider_transaction_id: string | null;
    status: AdminTransaction["status"];
    created_at: string;
  }>;

  if (rows.length === 0) return { rows: [], total: count ?? 0 };

  const ids = Array.from(new Set(rows.map((r) => r.user_id)));
  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, name, phone, email")
    .in("id", ids);

  const userMap = new Map(
    ((profilesData ?? []) as Array<{
      id: string;
      name: string | null;
      phone: string | null;
      email: string | null;
    }>).map((u) => [u.id, u]),
  );

  return {
    rows: rows.map((row) => ({
      ...row,
      amount: Number(row.amount),
      user: {
        id: row.user_id,
        name: userMap.get(row.user_id)?.name ?? null,
        phone: userMap.get(row.user_id)?.phone ?? null,
        email: userMap.get(row.user_id)?.email ?? null,
      },
    })),
    total: count ?? rows.length,
  };
}

export type AdminMovingRequest = {
  id: string;
  user_id: string | null;
  name: string;
  phone: string;
  from_area: string;
  to_area: string;
  flat_details: string | null;
  requested_date: string | null;
  status: "pending" | "confirmed" | "completed";
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function getAdminMovingRequests(options: {
  status?: "pending" | "confirmed" | "completed" | null;
  limit?: number;
  offset?: number;
}): Promise<Paginated<AdminMovingRequest>> {
  const supabase = getSupabaseAdminClient();
  const limit = options.limit ?? 25;
  const offset = options.offset ?? 0;

  let query = supabase
    .from("moving_requests")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (options.status) query = query.eq("status", options.status);

  const { data, error, count } = await query;
  if (error) {
    console.error("[getAdminMovingRequests]", error);
    return { rows: [], total: 0 };
  }

  return { rows: (data ?? []) as AdminMovingRequest[], total: count ?? 0 };
}
