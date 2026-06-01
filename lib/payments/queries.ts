import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { SubscriptionRow, TransactionRow } from "@/types/database.types";

export async function getActiveSubscription(
  userId: string,
): Promise<SubscriptionRow | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[getActiveSubscription]", error);
    return null;
  }
  return data;
}

export async function hasActivePremium(userId: string): Promise<boolean> {
  const sub = await getActiveSubscription(userId);
  return Boolean(sub && sub.tier === "premium");
}

export async function getMyTransactions(
  userId: string,
  limit = 10,
): Promise<TransactionRow[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getMyTransactions]", error);
    return [];
  }
  return data ?? [];
}
