"use server";

import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/guards";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  PREMIUM_AMOUNT_BDT,
  initiateAamarpayPayment,
  makeTransactionId,
} from "./aamarpay";

export type PaymentActionState = {
  error?: string;
};

export async function startPremiumCheckoutAction(
  _state: PaymentActionState,
  _formData: FormData,
): Promise<PaymentActionState> {
  const profile = await requireProfile();

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const tranId = makeTransactionId();

  const supabase = getSupabaseAdminClient();
  const { error: insertError } = await supabase.from("transactions").insert({
    user_id: profile.id,
    amount: PREMIUM_AMOUNT_BDT,
    currency: "BDT",
    aamarpay_transaction_id: tranId,
    status: "pending",
  });
  if (insertError) {
    console.error("[startPremiumCheckout]", insertError);
    return { error: "পেমেন্ট শুরু করা যায়নি। আবার চেষ্টা করুন।" };
  }

  const result = await initiateAamarpayPayment({
    tranId,
    amount: PREMIUM_AMOUNT_BDT,
    customerName: profile.name ?? "ToletZoo User",
    customerEmail: profile.email ?? "",
    customerPhone: profile.phone ?? "",
    successUrl: `${siteUrl}/api/aamarpay/success`,
    failUrl: `${siteUrl}/api/aamarpay/fail`,
    cancelUrl: `${siteUrl}/api/aamarpay/cancel`,
    description: "ToletZoo Premium — 30 days",
  });

  if (!result.ok) {
    console.error("[startPremiumCheckout] initiate failed:", result.error);
    await supabase
      .from("transactions")
      .update({ status: "failed", payload: { error: result.error } })
      .eq("aamarpay_transaction_id", tranId);
    const detail =
      process.env.NODE_ENV !== "production" ? ` (${result.error})` : "";
    return {
      error: `পেমেন্ট গেটওয়ে কাজ করছে না। একটু পর আবার চেষ্টা করুন।${detail}`,
    };
  }

  redirect(result.paymentUrl);
}
