import { MessageCircleIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { requireProfile } from "@/lib/auth/guards";
import { getMyConversations } from "@/lib/chat/queries";
import { ConversationSidebar } from "@/components/chat/conversation-sidebar";

export default async function ChatIndexPage() {
  const profile = await requireProfile();
  const t = await getTranslations("chat");
  const conversations = await getMyConversations(profile.id);

  return (
    <div>
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 pb-12 pt-10 lg:grid-cols-[360px_1fr]">
        <ConversationSidebar
          conversations={conversations}
          inboxLabel={t("inbox")}
          countLabel={t("conversationCount", { count: conversations.length })}
          emptyLabel={t("emptyInbox")}
        />

        <section className="flex min-h-[600px] flex-col items-center justify-center rounded-[28px] bg-white p-10 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-lime-400/20 text-lime-600">
            <MessageCircleIcon className="h-7 w-7" />
          </span>
          <h2 className="font-display mt-6 text-[28px] italic leading-tight text-ink-900">
            {conversations.length > 0
              ? t("selectConversation")
              : t("noConversations")}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[14px] font-medium text-ink-500">
            {conversations.length > 0
              ? t("selectConversationBody")
              : t("noConversationsBody")}
          </p>
        </section>
      </section>
    </div>
  );
}
