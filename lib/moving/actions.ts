"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth/guards";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { parseIdentifier } from "@/lib/auth/identifier";
import { submitMovingInput } from "./schema";

export type MovingActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitMovingRequestAction(
  _state: MovingActionState,
  formData: FormData,
): Promise<MovingActionState> {
  const parsed = submitMovingInput.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    fromArea: formData.get("fromArea"),
    toArea: formData.get("toArea"),
    flatDetails: formData.get("flatDetails") ?? null,
    requestedDate: formData.get("requestedDate") ?? null,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  const parsedPhone = parseIdentifier(parsed.data.phone);
  const phone =
    parsedPhone?.kind === "phone" ? parsedPhone.phone : parsed.data.phone;

  const userId = await getCurrentUserId();
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase.from("moving_requests").insert({
    user_id: userId,
    name: parsed.data.name,
    phone,
    from_area: parsed.data.fromArea,
    to_area: parsed.data.toArea,
    flat_details: parsed.data.flatDetails ?? null,
    requested_date: parsed.data.requestedDate ?? null,
    status: "pending",
  });

  if (error) {
    console.error("[submitMovingRequest]", error);
    return {
      error: "অনুরোধ জমা দেওয়া যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।",
    };
  }

  revalidatePath("/moving");
  redirect("/moving/success");
}
