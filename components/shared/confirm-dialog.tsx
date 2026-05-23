"use client";

import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void | Promise<void>;
  variant?: "default" | "destructive";
  icon?: React.ReactNode;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  variant = "default",
  icon,
}: ConfirmDialogProps) {
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md gap-0 overflow-hidden rounded-[28px] border-rule/60 bg-paper p-0"
      >
        <div className="flex flex-col gap-3 p-6">
          {icon ? (
            <div
              className={cn(
                "grid size-12 place-items-center rounded-2xl",
                variant === "destructive"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-ember/15 text-ember",
              )}
            >
              {icon}
            </div>
          ) : null}
          <DialogTitle className="font-display text-2xl italic leading-tight text-ink">
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription className="text-sm leading-relaxed text-ink-soft">
              {description}
            </DialogDescription>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-rule/60 bg-canvas/60 p-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={pending}
            className="inline-flex items-center justify-center rounded-full border border-rule bg-paper px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={pending}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-paper transition-transform hover:scale-[1.02] disabled:opacity-60",
              variant === "destructive" ? "bg-destructive" : "bg-ink",
            )}
          >
            {pending ? <Loader2Icon className="size-4 animate-spin" /> : null}
            {confirmLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
