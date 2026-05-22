"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireUserId } from "@/lib/auth/guards";

export async function markWelcomeSeenAction() {
  const userId = await requireUserId();
  const supabase = await getSupabaseServerClient();

  await supabase
    .from("profiles")
    .update({ welcome_seen_at: new Date().toISOString() })
    .eq("id", userId);

  revalidatePath("/");
}
