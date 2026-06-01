import Link from "next/link";
import { MessageCircleIcon } from "lucide-react";
import { resolveCounterpartName } from "@/lib/chat/display";
import type { ConversationListItem } from "@/lib/chat/types";

export function ConversationSidebar({
  conversations,
  activeId,
  inboxLabel,
  countLabel,
  emptyLabel,
}: {
  conversations: ConversationListItem[];
  activeId?: string;
  inboxLabel: string;
  countLabel: string;
  emptyLabel: string;
}) {
  return (
    <aside className="rounded-[28px] bg-white p-4 lg:sticky lg:top-6">
      <div className="flex items-center justify-between px-2 py-2">
        <div>
          <h2 className="text-[22px] font-bold tracking-tight text-ink-900">
            {inboxLabel}
          </h2>
          <p className="mt-1 text-[12px] font-semibold text-ink-500">
            {countLabel}
          </p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-lime-400 text-ink-900">
          <MessageCircleIcon className="h-5 w-5" />
        </span>
      </div>

      <div className="scroll-soft mt-4 max-h-[680px] space-y-3 overflow-auto pr-1">
        {conversations.length === 0 ? (
          <p className="px-3 py-6 text-[13px] font-medium text-ink-500">
            {emptyLabel}
          </p>
        ) : (
          conversations.map((c) => (
            <ConversationRow
              key={c.id}
              conversation={c}
              active={c.id === activeId}
            />
          ))
        )}
      </div>
    </aside>
  );
}

function ConversationRow({
  conversation,
  active,
}: {
  conversation: ConversationListItem;
  active: boolean;
}) {
  const name = resolveCounterpartName(conversation.counterpart);
  const initial = name.trim().charAt(0) || "?";
  const previewLine = conversation.last_message_preview ?? conversation.listing.title;

  return (
    <Link
      href={`/chat/${conversation.id}`}
      className={
        active
          ? "block w-full rounded-[22px] bg-ink-900 p-4 text-left text-white transition"
          : "block w-full rounded-[22px] bg-ink-50 p-4 text-left text-ink-900 transition hover:bg-ink-100"
      }
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <span
            className={
              active
                ? "inline-flex h-12 w-12 items-center justify-center rounded-full bg-lime-400 text-[15px] font-bold text-ink-900"
                : "inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-[15px] font-bold text-ink-900"
            }
          >
            {initial}
          </span>
          {conversation.unread_count > 0 ? (
            <span
              className={
                active
                  ? "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-ink-900 bg-lime-400"
                  : "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-ink-50 bg-lime-400"
              }
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-[15px] font-bold">{name}</h3>
            <span
              className={
                active
                  ? "shrink-0 text-[11px] font-semibold text-white/55"
                  : "shrink-0 text-[11px] font-semibold text-ink-500"
              }
            >
              {formatRelative(conversation.last_message_at)}
            </span>
          </div>
          <p
            className={
              active
                ? "mt-1 truncate text-[13px] font-medium text-white/65"
                : "mt-1 truncate text-[13px] font-medium text-ink-500"
            }
          >
            {previewLine}
          </p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span
              className={
                active
                  ? "truncate text-[11px] font-semibold text-white/55"
                  : "truncate text-[11px] font-semibold text-ink-500/80"
              }
            >
              {conversation.listing.title}
            </span>
            {conversation.unread_count > 0 ? (
              <span
                className={
                  active
                    ? "inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-lime-400 px-2 text-[11px] font-bold text-ink-900"
                    : "inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-ink-900 px-2 text-[11px] font-bold text-white"
                }
              >
                {conversation.unread_count}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatRelative(iso: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "now";
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  return new Date(iso).toLocaleDateString("bn-BD", {
    month: "short",
    day: "numeric",
  });
}
