import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/guards";
import type { ProfileRow } from "@/types/database.types";

export type OnboardingStatus =
  | "needs_role_and_nid"
  | "nid_pending"
  | "nid_rejected"
  | "nid_approved";

export async function getOnboardingStatus(profile: ProfileRow): Promise<OnboardingStatus> {
  if (profile.nid_status === "approved") return "nid_approved";

  const supabase = await getSupabaseServerClient();
  const { data: latest } = await supabase
    .from("nid_documents")
    .select("status")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latest) return "needs_role_and_nid";
  if (latest.status === "rejected") return "nid_rejected";
  return "nid_pending";
}

export async function requireOnboarded(): Promise<ProfileRow> {
  const profile = await requireProfile();
  const status = await getOnboardingStatus(profile);

  if (status === "needs_role_and_nid") redirect("/onboarding/role");
  if (status === "nid_rejected") redirect("/onboarding/nid");
  return profile;
}
