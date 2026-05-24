"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowUpRightIcon,
  CheckCircle2Icon,
  DownloadIcon,
  PartyPopperIcon,
  Loader2Icon,
  SmartphoneIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useInstallPrompt } from "@/components/pwa/use-install-prompt";
import { markWelcomeSeenAction } from "@/lib/auth/welcome-actions";

export function WelcomeModal({ userName }: { userName: string | null }) {
  const t = useTranslations("welcome");
  const [open, setOpen] = useState(true);
  const [pending, startTransition] = useTransition();
  const { status, prompt } = useInstallPrompt();

  function dismiss() {
    startTransition(async () => {
      await markWelcomeSeenAction();
      setOpen(false);
    });
  }

  async function handleInstall() {
    const outcome = await prompt();
    if (outcome === "accepted") {
      startTransition(async () => {
        await markWelcomeSeenAction();
        setOpen(false);
      });
    }
  }

  const displayName = userName?.trim() ? userName.trim() : t("guest");

  return (
    <Dialog open={open} onOpenChange={(next) => !next && dismiss()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-lg gap-0 overflow-hidden rounded-[32px] border-rule/60 bg-paper p-0"
      >
        <div className="relative flex flex-col gap-4 bg-linear-to-br from-ember-soft/70 via-canvas to-canvas-deep/40 px-7 pt-10 pb-8">
          <div className="absolute right-6 top-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper/80 px-3 py-1 text-xs font-medium text-ink/80 backdrop-blur">
              <PartyPopperIcon className="size-3.5 text-ember" />
              {t("tag")}
            </span>
          </div>

          <div className="grid size-14 place-items-center rounded-2xl bg-ink text-paper">
            <span className="font-display text-3xl italic leading-none">T</span>
          </div>

          <DialogTitle className="font-display text-3xl italic leading-tight text-ink md:text-4xl">
            {t("greeting", { name: displayName })}
          </DialogTitle>

          <p className="text-sm leading-relaxed text-ink-soft">{t("body")}</p>
        </div>

        <div className="flex flex-col gap-5 px-7 py-6">
          <div className="flex items-start gap-3 rounded-2xl border border-rule/60 bg-canvas px-4 py-3">
            <SmartphoneIcon className="mt-0.5 size-4 shrink-0 text-clay" />
            <p className="text-xs leading-relaxed text-ink-soft">
              <span className="font-display italic text-ink">{t("tipLabel")}</span>{" "}
              {t("tipBody")}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {status === "available" ? (
              <button
                type="button"
                onClick={handleInstall}
                disabled={pending}
                className="group inline-flex items-center justify-between rounded-full bg-ink px-5 py-3.5 text-sm font-medium text-paper transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-2">
                  <DownloadIcon className="size-4" />
                  {t("install")}
                </span>
                <span className="grid size-8 place-items-center rounded-full bg-ember text-paper transition-transform group-hover:rotate-12">
                  <ArrowUpRightIcon className="size-4" />
                </span>
              </button>
            ) : status === "installed" ? (
              <div className="flex items-center gap-2 rounded-full border border-emerald-300/50 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2Icon className="size-4" />
                {t("installed")}
              </div>
            ) : (
              <div className="rounded-2xl border border-rule/60 bg-canvas px-4 py-3 text-xs text-ink-soft">
                {t("manualHint")}
              </div>
            )}

            <button
              type="button"
              onClick={dismiss}
              disabled={pending}
              className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink disabled:opacity-60"
            >
              {pending ? <Loader2Icon className="size-4 animate-spin" /> : null}
              {t("later")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
