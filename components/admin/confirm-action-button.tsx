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

export function ConfirmActionButton({
  action,
  id,
  triggerLabel,
  title,
  body,
  confirmLabel,
  cancelLabel,
  variant = "destructive",
  triggerClassName,
}: {
  action: ConfirmAction;
  id: string;
  triggerLabel: string;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  variant?: "destructive" | "neutral";
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onConfirm = () => {
    const fd = new FormData();
    fd.append("id", id);
    startTransition(async () => {
      await action(fd);
      setOpen(false);
    });
  };

  const triggerCls =
    triggerClassName ??
    (variant === "destructive"
      ? "inline-flex h-9 items-center justify-center rounded-full bg-red-100 px-4 text-[11px] font-bold text-red-700 transition hover:bg-red-200"
      : "inline-flex h-9 items-center justify-center rounded-full border border-ink-900/10 bg-white px-4 text-[11px] font-bold text-ink-900 transition hover:bg-ink-50");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={pending}
        className={triggerCls}
      >
        {triggerLabel}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{body}</DialogDescription>
          </DialogHeader>
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
              className={
                variant === "destructive"
                  ? "inline-flex h-10 items-center justify-center rounded-full bg-red-600 px-5 text-[13px] font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                  : "inline-flex h-10 items-center justify-center rounded-full bg-ink-900 px-5 text-[13px] font-bold text-white transition hover:bg-ink-700 disabled:opacity-60"
              }
            >
              {pending ? "..." : confirmLabel}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
