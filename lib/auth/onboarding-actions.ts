"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireUserId } from "@/lib/auth/guards";
import { setRoleInput, submitNidInput } from "./onboarding-schema";
import type { ActionState } from "./actions";

export async function setRoleAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();

  const parsed = setRoleInput.safeParse({
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: "ভূমিকা নির্বাচন করুন" };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", userId);

  if (error) {
    return { error: "ভূমিকা সংরক্ষণে সমস্যা হয়েছে" };
  }

  redirect("/onboarding/nid");
}

export async function submitNidAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();

  const parsed = submitNidInput.safeParse({
    frontPath: formData.get("frontPath"),
    backPath: formData.get("backPath"),
    selfiePath: formData.get("selfiePath"),
  });

  if (!parsed.success) {
    return { fieldErrors: flatten(parsed.error) };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("nid_documents").insert({
    user_id: userId,
    front_path: parsed.data.frontPath,
    back_path: parsed.data.backPath,
    selfie_path: parsed.data.selfiePath,
  });

  if (error) {
    return { error: "জমা দেওয়া যায়নি। আবার চেষ্টা করুন।" };
  }

  redirect("/");
}

export async function switchRoleAction(role: "tenant" | "landlord") {
  const userId = await requireUserId();
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) {
    throw new Error(`ভূমিকা পরিবর্তনে সমস্যা: ${error.message}`);
  }

  revalidatePath("/", "layout");
}

function flatten(error: import("zod").ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (path && !out[path]) out[path] = issue.message;
  }
  return out;
}
