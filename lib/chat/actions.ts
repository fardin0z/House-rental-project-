"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireUserId } from "@/lib/auth/guards";
import { sendMessageInput } from "./schema";

export type ChatActionState = {
  error?: string;
  ok?: boolean;
};

export async function openConversationWithLandlord(listingId: string) {
  const tenantId = await requireUserId();
  const supabase = await getSupabaseServerClient();

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, owner_id, status")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError || !listing) {
    redirect(`/listings/${listingId}`);
  }
  if (listing.owner_id === tenantId) {
    redirect(`/listings/${listingId}`);
  }
  if (listing.status !== "approved") {
    redirect(`/listings/${listingId}`);
  }

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("listing_id", listingId)
    .eq("tenant_id", tenantId)
    .eq("landlord_id", listing.owner_id)
    .maybeSingle();

  if (existing) {
    redirect(`/chat/${existing.id}`);
  }

  const { data: created, error: createError } = await supabase
    .from("conversations")
    .insert({
      listing_id: listingId,
      tenant_id: tenantId,
      landlord_id: listing.owner_id,
    })
    .select("id")
    .single();

  if (createError || !created) {
    console.error("[openConversation]", createError);
    redirect(`/listings/${listingId}`);
  }

  revalidatePath("/chat");
  redirect(`/chat/${created.id}`);
}

export async function sendMessageAction(
  _state: ChatActionState,
  formData: FormData,
): Promise<ChatActionState> {
  const userId = await requireUserId();
  const parsed = sendMessageInput.safeParse({
    conversationId: formData.get("conversationId"),
    body: formData.get("body"),
    attachmentPath: formData.get("attachmentPath"),
    attachmentType: formData.get("attachmentType"),
    attachmentName: formData.get("attachmentName"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "মেসেজ পাঠানো গেল না" };
  }

  const supabase = await getSupabaseServerClient();
  const body = parsed.data.body?.trim() ?? "";
  const { error } = await supabase.from("messages").insert({
    conversation_id: parsed.data.conversationId,
    sender_id: userId,
    body: body.length > 0 ? body : null,
    attachment_path: parsed.data.attachmentPath ?? null,
    attachment_type: parsed.data.attachmentType ?? null,
    attachment_name: parsed.data.attachmentName ?? null,
  });

  if (error) {
    console.error("[sendMessage]", error);
    return { error: "মেসেজ পাঠানো গেল না। আবার চেষ্টা করুন।" };
  }

  revalidatePath(`/chat/${parsed.data.conversationId}`);
  revalidatePath("/chat");
  return { ok: true };
}

export async function loadOlderMessagesAction(
  conversationId: string,
  beforeIso: string,
): Promise<{
  messages: import("./types").MessageRow[];
  hasMore: boolean;
}> {
  await requireUserId();
  const { getMessages } = await import("./queries");
  const page = await getMessages(conversationId, { before: beforeIso, limit: 30 });
  return { messages: page.messages, hasMore: page.hasMore };
}

export async function markConversationReadAction(conversationId: string) {
  const userId = await requireUserId();
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .is("read_at", null)
    .neq("sender_id", userId);
  if (error) {
    console.error("[markConversationRead]", error);
  }
  revalidatePath("/chat");
}
