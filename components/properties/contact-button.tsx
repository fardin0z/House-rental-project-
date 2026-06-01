"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageCircleIcon } from "lucide-react";
import { openConversationWithLandlord } from "@/lib/chat/actions";

export function ContactLandlordButton({
  listingId,
  label,
  isAuthed,
  loginLabel,
}: {
  listingId: string;
  label: string;
  isAuthed: boolean;
  loginLabel: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function go() {
    if (!isAuthed) {
      router.push(`/login?next=${encodeURIComponent(`/properties/${listingId}`)}`);
      return;
    }
    startTransition(async () => {
      try {
        await openConversationWithLandlord(listingId);
      } catch (err) {
        console.error("[contact landlord]", err);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={go}
      disabled={pending}
      className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-lime-400 text-[15px] font-bold text-ink-900 transition hover:bg-lime-500 disabled:opacity-60"
    >
      {isAuthed ? label : loginLabel}
      <MessageCircleIcon className="h-5 w-5" />
    </button>
  );
}
