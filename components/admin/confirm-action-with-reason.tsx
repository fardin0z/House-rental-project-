"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmAction = (formData: FormData) => Promise<void>;

export function ConfirmActionWithReason({
  action,
  id,
  triggerLabel,
  title,
  body,
  reasonLabel,
  reasonPlaceholder,
  confirmLabel,
  cancelLabel,
  triggerClassName,
}: {
  action: ConfirmAction;
  id: string;
  triggerLabel: string;
  title: string;
  body: string;
  reasonLabel: string;
  reasonPlaceholder: string;
  confirmLabel: string;
  cancelLabel: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();

  const onConfirm = () => {
    const fd = new FormData();
    fd.append("id", id);
    if (reason.trim()) fd.append("reason", reason.trim());
    startTransition(async () => {
      await action(fd);
      setOpen(false);
      setReason("");
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={pending}
        className={
          triggerClassName ??
          "inline-flex h-9 items-center justify-center rounded-full border border-ink-900/10 bg-white px-4 text-[11px] font-bold text-ink-900 transition hover:bg-ink-50"
        }
      >
        {triggerLabel}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{body}</DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <label className="font-space text-[10px] font-bold uppercase tracking-[.16em] text-ink-500/70">
              {reasonLabel}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder={reasonPlaceholder}
              className="mt-2 w-full rounded-[14px] border border-ink-900/10 bg-white px-3 py-2 text-[13px] text-ink-900 outline-none transition focus:border-ink-900/40"
            />
          </div>

          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
              className="inline-flex h-10 items-center justify-center rounded-full border border-ink-900/10 bg-white px-5 text-[13px] font-bold text-ink-900 transition hover:bg-ink-50"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={pending}
              className="inline-flex h-10 items-center justify-center rounded-full bg-ink-900 px-5 text-[13px] font-bold text-white transition hover:bg-ink-700 disabled:opacity-60"
            >
              {pending ? "..." : confirmLabel}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
