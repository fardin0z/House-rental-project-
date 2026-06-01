export type ConversationRow = {
  id: string;
  listing_id: string;
  tenant_id: string;
  landlord_id: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  created_at: string;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string | null;
  attachment_path: string | null;
  attachment_type: string | null;
  attachment_name: string | null;
  created_at: string;
  read_at: string | null;
};

export type ConversationListItem = ConversationRow & {
  listing: {
    id: string;
    title: string;
    area_name: string;
    rent: number;
    cover_path: string | null;
  };
  counterpart: {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
  };
  unread_count: number;
};
