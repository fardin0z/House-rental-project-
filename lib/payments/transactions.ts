import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { PREMIUM_DAYS, searchTransaction } from "./aamarpay";

export type ProcessOutcome =
  | { kind: "already" }
  | { kind: "completed"; userId: string }
  | { kind: "failed"; reason: string }
  | { kind: "cancelled" }
  | { kind: "not_found" };

export async function markTransactionSuccessful(
  tranId: string,
  payload: Record<string, unknown> | null = null,
  options: { verify?: boolean } = {},
): Promise<ProcessOutcome> {
  const verify = options.verify !== false;
  const supabase = getSupabaseAdminClient();

  const { data: transaction } = await supabase
    .from("transactions")
    .select("id, user_id, amount, status")
    .eq("aamarpay_transaction_id", tranId)
    .maybeSingle();

  if (!transaction) return { kind: "not_found" };
  if (transaction.status === "completed") return { kind: "already" };

  let verifiedAmount: string | null = null;
  let verifiedPayload: Record<string, unknown> | null = payload;

  if (verify) {
    const result = await searchTransaction(tranId);
    if (!result.ok) {
      return { kind: "failed", reason: result.error };
    }
    if (!result.verified) {
      await supabase
        .from("transactions")
        .update({
          status: "failed",
          payload: { callback: payload, search: result.raw },
        })
        .eq("id", transaction.id);
      return {
        kind: "failed",
        reason: `Search rejected: status_code=${result.statusCode}`,
      };
    }
    verifiedAmount = result.amount;
    verifiedPayload = { callback: payload, search: result.raw };

    const expected = Number(transaction.amount);
    const reported = Number(result.amount);
    if (Number.isFinite(expected) && Number.isFinite(reported) && reported < expected) {
      await supabase
        .from("transactions")
        .update({
          status: "failed",
          payload: { callback: payload, search: result.raw, mismatch: true },
        })
        .eq("id", transaction.id);
      return { kind: "failed", reason: "Amount mismatch" };
    }
  }

  const providerTxn =
    (payload as Record<string, string> | null)?.pg_txnid ??
    (payload as Record<string, string> | null)?.bank_tran_id ??
    null;

  await supabase
    .from("transactions")
    .update({
      status: "completed",
      provider_transaction_id: providerTxn,
      payload: verifiedPayload,
    })
    .eq("id", transaction.id);

  await activateOrExtendSubscription(transaction.user_id);

  void verifiedAmount;
  return { kind: "completed", userId: transaction.user_id };
}

export async function markTransactionFailed(
  tranId: string,
  payload: Record<string, unknown> | null,
): Promise<ProcessOutcome> {
  const supabase = getSupabaseAdminClient();
  const { data: transaction } = await supabase
    .from("transactions")
    .select("id, status")
    .eq("aamarpay_transaction_id", tranId)
    .maybeSingle();
  if (!transaction) return { kind: "not_found" };
  if (transaction.status === "failed") return { kind: "already" };
  await supabase
    .from("transactions")
    .update({ status: "failed", payload })
    .eq("id", transaction.id);
  return { kind: "failed", reason: "callback_fail" };
}

export async function markTransactionCancelled(
  tranId: string,
  payload: Record<string, unknown> | null,
): Promise<ProcessOutcome> {
  const supabase = getSupabaseAdminClient();
  const { data: transaction } = await supabase
    .from("transactions")
    .select("id, status")
    .eq("aamarpay_transaction_id", tranId)
    .maybeSingle();
  if (!transaction) return { kind: "not_found" };
  if (transaction.status === "cancelled") return { kind: "already" };
  await supabase
    .from("transactions")
    .update({ status: "cancelled", payload })
    .eq("id", transaction.id);
  return { kind: "cancelled" };
}

async function activateOrExtendSubscription(userId: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const startedAt = new Date();

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id, expires_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .gt("expires_at", startedAt.toISOString())
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    const base = new Date(existing.expires_at);
    base.setDate(base.getDate() + PREMIUM_DAYS);
    await supabase
      .from("subscriptions")
      .update({ expires_at: base.toISOString() })
      .eq("id", existing.id);
    return;
  }

  const expiresAt = new Date(startedAt);
  expiresAt.setDate(expiresAt.getDate() + PREMIUM_DAYS);
  await supabase.from("subscriptions").insert({
    user_id: userId,
    tier: "premium",
    status: "active",
    started_at: startedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    source: "aamarpay",
  });
}
