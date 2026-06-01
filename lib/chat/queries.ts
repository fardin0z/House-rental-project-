import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ConversationListItem,
  ConversationRow,
  MessageRow,
} from "./types";

export async function getMyConversations(
  userId: string,
): Promise<ConversationListItem[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
        *,
        listing:listings!conversations_listing_id_fkey(id, title, area_name, rent, images:listing_images(path, sort_order)),
        tenant:profiles!conversations_tenant_id_fkey(id, name, phone, email),
        landlord:profiles!conversations_landlord_id_fkey(id, name, phone, email)
      `,
    )
    .or(`tenant_id.eq.${userId},landlord_id.eq.${userId}`)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("[getMyConversations]", error);
    return [];
  }

  type CounterpartShape = {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
  };

  const rows = (data ?? []) as Array<
    ConversationRow & {
      listing: {
        id: string;
        title: string;
        area_name: string;
        rent: number;
        images: { path: string; sort_order: number }[];
      } | null;
      tenant: CounterpartShape | null;
      landlord: CounterpartShape | null;
    }
  >;

  const counts = await getUnreadCounts(userId, rows.map((r) => r.id));

  return rows.map((row) => {
    const isTenant = row.tenant_id === userId;
    const counterpart = isTenant ? row.landlord : row.tenant;
    const cover = row.listing?.images
      ?.slice()
      .sort((a, b) => a.sort_order - b.sort_order)[0];
    return {
      ...row,
      listing: {
        id: row.listing?.id ?? row.listing_id,
        title: row.listing?.title ?? "—",
        area_name: row.listing?.area_name ?? "",
        rent: row.listing?.rent ?? 0,
        cover_path: cover?.path ?? null,
      },
      counterpart: {
        id: counterpart?.id ?? "",
        name: counterpart?.name ?? null,
        phone: counterpart?.phone ?? null,
        email: counterpart?.email ?? null,
      },
      unread_count: counts.get(row.id) ?? 0,
    };
  });
}

async function getUnreadCounts(
  userId: string,
  conversationIds: string[],
): Promise<Map<string, number>> {
  if (conversationIds.length === 0) return new Map();
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("messages")
    .select("conversation_id")
    .in("conversation_id", conversationIds)
    .is("read_at", null)
    .neq("sender_id", userId);

  if (error) {
    console.error("[getUnreadCounts]", error);
    return new Map();
  }

  const map = new Map<string, number>();
  for (const row of (data ?? []) as { conversation_id: string }[]) {
    map.set(row.conversation_id, (map.get(row.conversation_id) ?? 0) + 1);
  }
  return map;
}

export type ConversationDetail = ConversationRow & {
  listing: {
    id: string;
    title: string;
    area_name: string;
    rent: number;
  };
  counterpart: {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
  };
};

export async function getConversationById(
  id: string,
  userId: string,
): Promise<ConversationDetail | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
        *,
        listing:listings!conversations_listing_id_fkey(id, title, area_name, rent),
        tenant:profiles!conversations_tenant_id_fkey(id, name, phone, email),
        landlord:profiles!conversations_landlord_id_fkey(id, name, phone, email)
      `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getConversationById]", error);
    return null;
  }
  if (!data) return null;

  type CounterpartShape = {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
  };

  const row = data as ConversationRow & {
    listing: {
      id: string;
      title: string;
      area_name: string;
      rent: number;
    } | null;
    tenant: CounterpartShape | null;
    landlord: CounterpartShape | null;
  };

  const isTenant = row.tenant_id === userId;
  const counterpart = isTenant ? row.landlord : row.tenant;

  return {
    ...row,
    listing: {
      id: row.listing?.id ?? row.listing_id,
      title: row.listing?.title ?? "—",
      area_name: row.listing?.area_name ?? "",
      rent: row.listing?.rent ?? 0,
    },
    counterpart: {
      id: counterpart?.id ?? "",
      name: counterpart?.name ?? null,
      phone: counterpart?.phone ?? null,
      email: counterpart?.email ?? null,
    },
  };
}

export type MessagesPage = {
  messages: MessageRow[];
  hasMore: boolean;
};

export async function getMessages(
  conversationId: string,
  options: { limit?: number; before?: string } = {},
): Promise<MessagesPage> {
  const limit = options.limit ?? 30;
  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit + 1);
  if (options.before) {
    query = query.lt("created_at", options.before);
  }
  const { data, error } = await query;

  if (error) {
    console.error("[getMessages]", error);
    return { messages: [], hasMore: false };
  }
  const rows = (data ?? []) as MessageRow[];
  const hasMore = rows.length > limit;
  const trimmed = hasMore ? rows.slice(0, limit) : rows;
  return { messages: trimmed.reverse(), hasMore };
}
