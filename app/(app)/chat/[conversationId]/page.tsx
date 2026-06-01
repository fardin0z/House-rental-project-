import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowUpRightIcon } from "lucide-react";
import { requireProfile } from "@/lib/auth/guards";
import { getConversationById, getMessages, getMyConversations } from "@/lib/chat/queries";
import { resolveCounterpartName } from "@/lib/chat/display";
import { ChatThread } from "@/components/chat/chat-thread";
import { ConversationSidebar } from "@/components/chat/conversation-sidebar";

export default async function ChatThreadPage(
  props: PageProps<"/chat/[conversationId]">,
) {
  const profile = await requireProfile();
  const { conversationId } = await props.params;

  const conversation = await getConversationById(conversationId, profile.id);
  if (!conversation) notFound();
  if (
    conversation.tenant_id !== profile.id &&
    conversation.landlord_id !== profile.id
  ) {
    notFound();
  }

  const [page, conversations] = await Promise.all([
    getMessages(conversationId, { limit: 30 }),
    getMyConversations(profile.id),
  ]);
  const t = await getTranslations("chat");
  const counterpartName = resolveCounterpartName(conversation.counterpart);
  const initial = counterpartName.trim().charAt(0) || "?";

  return (
    <div>
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 pb-12 pt-10 lg:grid-cols-[360px_1fr]">
        <ConversationSidebar
          conversations={conversations}
          activeId={conversationId}
          inboxLabel={t("inbox")}
          countLabel={t("conversationCount", { count: conversations.length })}
          emptyLabel={t("emptyInbox")}
        />

        <section className="flex h-[85vh] flex-col overflow-hidden rounded-[28px] bg-white">
          <header className="flex items-center border-b border-ink-900/10 p-5">
            <div className="flex items-center gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-lime-400 text-[15px] font-bold text-ink-900">
                {initial}
              </span>
              <div>
                <h2 className="text-[18px] font-bold tracking-tight text-ink-900">
                  {counterpartName}
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-[12px] font-semibold text-ink-500">
                  <span className="h-2 w-2 rounded-full bg-lime-400" />
                  {t("onlineNow")}
                </p>
              </div>
            </div>
          </header>

          <div className="mx-5 mt-5 rounded-[20px] bg-ink-50 p-3">
            <div className="flex items-center gap-4">
              <Link
                href={`/listings/${conversation.listing.id}`}
                className="relative block h-24 w-32 shrink-0 overflow-hidden rounded-[16px] bg-ink-100"
              >
                <span className="absolute bottom-3 right-3 z-6 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink-900 shadow-[0_8px_20px_rgba(0,0,0,.08)]">
                  <ArrowUpRightIcon className="h-4 w-4" />
                </span>
              </Link>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[.18em] text-ink-500/70">
                  {t("discussingListing")}
                </p>
                <h3 className="font-display mt-2 truncate text-[26px] italic leading-none text-ink-900">
                  {conversation.listing.title}
                </h3>
                <div className="mt-3 flex flex-wrap gap-3 text-[12px] font-semibold text-ink-500">
                  {conversation.listing.rent ? (
                    <span>
                      ৳ {conversation.listing.rent.toLocaleString("bn-BD")}
                    </span>
                  ) : null}
                  {conversation.listing.area_name ? (
                    <span>{conversation.listing.area_name}</span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <ChatThread
            conversationId={conversationId}
            selfId={profile.id}
            initialMessages={page.messages}
            initialHasMore={page.hasMore}
            composerPlaceholder={t("typeMessage")}
            sendLabel={t("send")}
            todayLabel={t("today")}
            loadOlderLabel={t("loadOlder")}
          />
        </section>
      </section>
    </div>
  );
}
