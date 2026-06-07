import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { roleFromClaims } from "@/lib/auth/jwt-claims";
import type { ProfileRow, UserRole } from "@/types/database.types";

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return null;
  return data.claims.sub;
}

export async function getCurrentSession(): Promise<{
  userId: string;
  role: UserRole | null;
} | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  return {
    userId: data.claims.sub,
    role: roleFromClaims(data.claims as Record<string, unknown>),
  };
}

export async function getCurrentProfile(): Promise<ProfileRow | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  return data;
}

export async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  return userId;
}

export async function requireProfile(): Promise<ProfileRow> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}

export async function requireRole(role: UserRole): Promise<ProfileRow> {
  const profile = await requireProfile();
  if (profile.role !== role) redirect("/");
  return profile;
}

export async function requireApprovedNid(): Promise<ProfileRow> {
  const profile = await requireProfile();
  if (profile.nid_status !== "approved") redirect("/onboarding/nid");
  return profile;
}

export async function requirePremium(): Promise<ProfileRow> {
  const profile = await requireProfile();
  const { hasActivePremium } = await import("@/lib/payments/queries");
  const premium = await hasActivePremium(profile.id);
  if (!premium && profile.role !== "admin") redirect("/subscription");
  return profile;
}
