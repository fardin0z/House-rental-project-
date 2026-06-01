"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  CheckCheckIcon,
  CheckIcon,
  FileIcon,
  Loader2Icon,
  PaperclipIcon,
  SendIcon,
  XIcon,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  loadOlderMessagesAction,
  markConversationReadAction,
  sendMessageAction,
  type ChatActionState,
} from "@/lib/chat/actions";
import { uploadChatAttachment } from "@/lib/chat/upload";
import { CHAT_BUCKET, publicStorageUrl } from "@/lib/storage/paths";
import type { MessageRow } from "@/lib/chat/types";

const initial: ChatActionState = {};

type DisplayMessage = MessageRow & { isPending?: boolean };

type Pending = {
  file: File;
  uploading: boolean;
  uploaded?: { path: string; type: string; name: string };
  error?: string;
};

export function ChatThread({
  conversationId,
  selfId,
  initialMessages,
  initialHasMore,
  composerPlaceholder,
  sendLabel,
  todayLabel,
  loadOlderLabel,
}: {
  conversationId: string;
  selfId: string;
  initialMessages: MessageRow[];
  initialHasMore: boolean;
  composerPlaceholder: string;
  sendLabel: string;
  todayLabel: string;
  loadOlderLabel: string;
}) {
  const [messages, setMessages] = useState<DisplayMessage[]>(initialMessages);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [state, formAction, pending] = useActionState(sendMessageAction, initial);
  const [body, setBody] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState<Pending | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const didInitialScrollRef = useRef(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (!didInitialScrollRef.current) {
      el.scrollTop = el.scrollHeight;
      didInitialScrollRef.current = true;
      return;
    }
    const nearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 220;
    if (nearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length]);

  useEffect(() => {
    startTransition(() => {
      markConversationReadAction(conversationId).catch(() => undefined);
    });
  }, [conversationId, messages.length]);

  useEffect(() => {
    setMessages((prev) => {
      let next = prev;
      for (const m of initialMessages) {
        next = applyServerMessage(next, m, selfId);
      }
      const sorted = [...next].sort((a, b) =>
        a.created_at.localeCompare(b.created_at),
      );
      return sorted;
    });
  }, [initialMessages, selfId]);

  useEffect(() => {
    if (state.ok) {
      setBody("");
      setPendingAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      startTransition(() => router.refresh());
    }
  }, [state, router]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as MessageRow;
          setMessages((prev) => applyServerMessage(prev, newMsg, selfId));
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updated = payload.new as MessageRow;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)),
          );
        },
      )
      .subscribe((status) => {
        console.log(`[chat-thread] realtime status: ${status}`);
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, selfId]);

  const loadOlder = useCallback(async () => {
    if (loadingOlder || !hasMore) return;
    const first = messages.find((m) => !m.isPending);
    if (!first) return;
    setLoadingOlder(true);
    const el = scrollerRef.current;
    const prevHeight = el?.scrollHeight ?? 0;
    try {
      const result = await loadOlderMessagesAction(
        conversationId,
        first.created_at,
      );
      setMessages((prev) => [...result.messages, ...prev]);
      setHasMore(result.hasMore);
      requestAnimationFrame(() => {
        const next = scrollerRef.current;
        if (next) {
          next.scrollTop = next.scrollHeight - prevHeight;
        }
      });
    } catch (error) {
      console.error("[loadOlder]", error);
    } finally {
      setLoadingOlder(false);
    }
  }, [conversationId, hasMore, loadingOlder, messages]);

  const onFilePick = useCallback(
    async (file: File) => {
      setPendingAttachment({ file, uploading: true });
      try {
        const uploaded = await uploadChatAttachment(conversationId, selfId, file);
        setPendingAttachment({ file, uploading: false, uploaded });
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "ফাইল আপলোড ব্যর্থ";
        setPendingAttachment({ file, uploading: false, error: msg });
      }
    },
    [conversationId, selfId],
  );

  const clearAttachment = useCallback(() => {
    setPendingAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const canSubmit =
    !pending &&
    (body.trim().length > 0 ||
      (pendingAttachment?.uploaded != null && !pendingAttachment.uploading)) &&
    pendingAttachment?.uploading !== true;

  const submitOptimistic = (formData: FormData) => {
    const bodyText = ((formData.get("body") as string) ?? "").trim();
    const attachmentPath = (formData.get("attachmentPath") as string) || null;
    const attachmentType = (formData.get("attachmentType") as string) || null;
    const attachmentName = (formData.get("attachmentName") as string) || null;

    if (!bodyText && !attachmentPath) {
      formAction(formData);
      return;
    }

    const tempId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? `temp-${crypto.randomUUID()}`
        : `temp-${Math.random().toString(36).slice(2)}`;

    const optimistic: DisplayMessage = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: selfId,
      body: bodyText || null,
      attachment_path: attachmentPath,
      attachment_type: attachmentType,
      attachment_name: attachmentName,
      created_at: new Date().toISOString(),
      read_at: null,
      isPending: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    formAction(formData);
  };

  return (
    <>
      <div
        ref={scrollerRef}
        className="scroll-soft flex-1 space-y-5 overflow-auto px-5 py-6"
      >
        {hasMore ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={loadOlder}
              disabled={loadingOlder}
              className="inline-flex items-center gap-2 rounded-full bg-ink-50 px-4 py-2 text-[12px] font-bold text-ink-500 transition hover:bg-ink-100 disabled:opacity-60"
            >
              {loadingOlder ? (
                <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
              ) : null}
              {loadOlderLabel}
            </button>
          </div>
        ) : null}

        <div className="flex justify-center">
          <span className="rounded-full bg-ink-50 px-4 py-2 text-[11px] font-bold text-ink-500">
            {todayLabel}
          </span>
        </div>

        {messages.map((m) => (
          <MessageItem key={m.id} message={m} selfId={selfId} />
        ))}
      </div>

      <footer className="border-t border-ink-900/10 bg-white p-4 md:p-5">
        {pendingAttachment ? (
          <div className="mb-3 flex items-center gap-3 rounded-[18px] bg-ink-50 p-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[12px] bg-white text-ink-900">
              {pendingAttachment.uploading ? (
                <Loader2Icon className="h-5 w-5 animate-spin" />
              ) : pendingAttachment.uploaded ? (
                <FileIcon className="h-5 w-5" />
              ) : (
                <XIcon className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-ink-900">
                {pendingAttachment.file.name}
              </p>
              <p className="text-[11px] font-semibold text-ink-500">
                {pendingAttachment.error
                  ? pendingAttachment.error
                  : pendingAttachment.uploading
                    ? "আপলোড হচ্ছে..."
                    : "প্রস্তুত"}
              </p>
            </div>
            <button
              type="button"
              onClick={clearAttachment}
              aria-label="remove"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-ink-500 hover:text-ink-900"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        <form
          action={submitOptimistic}
          className="relative rounded-[24px] bg-ink-50 p-2 md:p-3"
        >
          <input type="hidden" name="conversationId" value={conversationId} />
          <input
            type="hidden"
            name="attachmentPath"
            value={pendingAttachment?.uploaded?.path ?? ""}
          />
          <input
            type="hidden"
            name="attachmentType"
            value={pendingAttachment?.uploaded?.type ?? ""}
          />
          <input
            type="hidden"
            name="attachmentName"
            value={pendingAttachment?.uploaded?.name ?? ""}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="attach"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-ink-900 hover:bg-ink-100"
            >
              <PaperclipIcon className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFilePick(file);
              }}
            />
            <input
              name="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={composerPlaceholder}
              maxLength={2000}
              autoComplete="off"
              className="h-12 min-w-0 flex-1 border-0 bg-transparent px-2 text-[15px] font-semibold text-ink-900 outline-none placeholder:text-ink-500/45"
            />
            <button
              type="submit"
              aria-label={sendLabel}
              disabled={!canSubmit}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-lime-400 text-ink-900 transition hover:bg-lime-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SendIcon className="h-5 w-5" />
            </button>
          </div>
        </form>
        {state.error ? (
          <p className="mt-2 text-[12px] font-semibold text-red-600">
            {state.error}
          </p>
        ) : null}
      </footer>
    </>
  );
}

function MessageItem({
  message,
  selfId,
}: {
  message: DisplayMessage;
  selfId: string;
}) {
  const mine = message.sender_id === selfId;
  const rowClass = mine
    ? "flex w-full justify-end"
    : "flex w-full justify-start";
  const bubbleClass = mine
    ? message.isPending
      ? "rounded-[22px] rounded-br-md bg-ink-900/55 px-4 py-3 text-white/85"
      : "rounded-[22px] rounded-br-md bg-ink-900 px-4 py-3 text-white"
    : "rounded-[22px] rounded-bl-md bg-ink-50 px-4 py-3 text-ink-900";

  return (
    <div className={rowClass}>
      <div className="max-w-[78%]">
        <div className={bubbleClass}>
          {message.attachment_path ? (
            <AttachmentPreview
              path={message.attachment_path}
              type={message.attachment_type ?? ""}
              name={message.attachment_name ?? "file"}
              mine={mine}
            />
          ) : null}
          {message.body ? (
            <p className="whitespace-pre-wrap break-words text-[15px] font-medium leading-relaxed">
              {message.body}
            </p>
          ) : null}
        </div>
        <div
          className={
            mine
              ? "mt-2 flex items-center justify-end gap-1.5 text-[11px] font-semibold text-ink-400"
              : "mt-2 text-[11px] font-semibold text-ink-400"
          }
        >
          {message.isPending ? (
            <>
              <Loader2Icon className="h-3.5 w-3.5 animate-spin text-ink-500" />
              <span>পাঠানো হচ্ছে...</span>
            </>
          ) : (
            <>
              <span>{formatTime(message.created_at)}</span>
              {mine ? (
                message.read_at ? (
                  <CheckCheckIcon className="h-3.5 w-3.5 text-lime-600" />
                ) : (
                  <CheckIcon className="h-3.5 w-3.5 text-ink-400" />
                )
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AttachmentPreview({
  path,
  type,
  name,
  mine,
}: {
  path: string;
  type: string;
  name: string;
  mine: boolean;
}) {
  const url = publicStorageUrl(CHAT_BUCKET, path);
  const isImage = type.startsWith("image/");
  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="mb-2 block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={name}
          className="max-h-[260px] w-full rounded-[14px] object-cover"
        />
      </a>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={
        mine
          ? "mb-2 flex items-center gap-3 rounded-[14px] bg-white/10 p-3 text-white hover:bg-white/15"
          : "mb-2 flex items-center gap-3 rounded-[14px] bg-white p-3 text-ink-900 hover:bg-ink-100"
      }
    >
      <span
        className={
          mine
            ? "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15"
            : "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink-50"
        }
      >
        <FileIcon className="h-4 w-4" />
      </span>
      <span className="truncate text-[13px] font-bold">{name}</span>
    </a>
  );
}

function applyServerMessage(
  prev: DisplayMessage[],
  newMsg: MessageRow,
  selfId: string,
): DisplayMessage[] {
  const existingIdx = prev.findIndex((m) => m.id === newMsg.id);
  if (existingIdx >= 0) {
    const next = [...prev];
    next[existingIdx] = { ...prev[existingIdx], ...newMsg };
    return next;
  }

  if (newMsg.sender_id === selfId) {
    const pendingIdx = prev.findIndex(
      (m) =>
        m.isPending &&
        (m.body ?? "") === (newMsg.body ?? "") &&
        (m.attachment_path ?? "") === (newMsg.attachment_path ?? ""),
    );
    if (pendingIdx >= 0) {
      const next = [...prev];
      next[pendingIdx] = { ...newMsg };
      return next;
    }
  }

  return [...prev, newMsg];
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("bn-BD", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
