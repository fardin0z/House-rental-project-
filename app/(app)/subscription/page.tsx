import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/guards";

/**
 * Payment and premium subscriptions are hidden for now.
 * Existing database records are preserved until an explicit cleanup.
 */
export default async function SubscriptionPage() {
  await requireProfile();
  redirect("/properties");
}
