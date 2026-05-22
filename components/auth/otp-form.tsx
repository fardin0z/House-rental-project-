"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRightIcon, RefreshCwIcon } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { sendOtpAction, verifyOtpAction, type ActionState } from "@/lib/auth/actions";
import { formatBdPhoneForDisplay } from "@/lib/auth/phone";
import { DevModeBanner } from "@/components/auth/dev-mode-banner";

const initial: ActionState = {};
const RESEND_COOLDOWN_SECONDS = 60;

export function OtpForm({
  phone,
  devOtp,
}: {
  phone: string;
  devOtp?: string | null;
}) {
  const t = useTranslations("auth");
  const [code, setCode] = useState("");
  const [verifyState, verifyAction, verifying] = useActionState(verifyOtpAction, initial);
  const [resendPending, startResend] = useTransition();
  const [resendError, setResendError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function handleResend() {
    setResendError(null);
    startResend(async () => {
      const formData = new FormData();
      formData.set("phone", phone);
      const result = await sendOtpAction(initial, formData);
      if (result?.error) setResendError(result.error);
      else setCooldown(RESEND_COOLDOWN_SECONDS);
    });
  }

  return (
    <form action={verifyAction} className="flex flex-col gap-6">
      <input type="hidden" name="phone" value={phone} />
      <input type="hidden" name="token" value={code} />

      {devOtp ? (
        <button
          type="button"
          onClick={() => setCode(devOtp)}
          className="flex items-center justify-between gap-3 rounded-2xl border border-ember/40 bg-ember-soft/40 px-4 py-3 text-left transition-colors hover:bg-ember-soft/60"
        >
          <span className="flex flex-col">
            <span className="text-[0.7rem] uppercase tracking-[0.18em] text-clay">
              Dev OTP
            </span>
            <span className="font-display text-2xl italic tracking-[0.3em] text-ink">
              {devOtp}
            </span>
          </span>
          <span className="rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-paper">
            অটো-ফিল
          </span>
        </button>
      ) : (
        <DevModeBanner message="সার্ভার টার্মিনাল থেকে ৬ ডিজিটের OTP কপি করে এখানে বসান।" />
      )}

      <div className="flex items-center gap-2 rounded-2xl border border-rule bg-paper px-4 py-3">
        <span className="text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft">
          {t("phoneLabel")}
        </span>
        <span className="ml-auto font-display text-lg italic text-ink">
          {formatBdPhoneForDisplay(phone)}
        </span>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-3xl border border-rule bg-paper px-4 py-8">
        <span className="text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft">
          {t("otpLabel")}
        </span>
        <InputOTP
          maxLength={6}
          value={code}
          onChange={setCode}
          autoFocus
          aria-invalid={Boolean(verifyState.fieldErrors?.token || verifyState.error)}
        >
          <InputOTPGroup className="gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className="size-12 rounded-xl border-l border-rule bg-canvas font-display text-2xl italic first:rounded-xl last:rounded-xl"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
        {verifyState.fieldErrors?.token ? (
          <p className="text-sm text-destructive">{verifyState.fieldErrors.token}</p>
        ) : null}
        {verifyState.error ? (
          <p className="text-sm text-destructive">{verifyState.error}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={verifying || code.length !== 6}
        className="group inline-flex items-center justify-between rounded-full bg-ink px-6 py-4 text-base font-medium text-paper transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span>{verifying ? "..." : t("verifyOtp")}</span>
        <span className="grid size-9 place-items-center rounded-full bg-ember text-paper transition-transform group-hover:rotate-12">
          <ArrowUpRightIcon className="size-4" />
        </span>
      </button>

      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-soft">
          {cooldown > 0 ? `${cooldown}s` : ""}
        </span>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendPending || cooldown > 0}
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-medium text-ink underline-offset-4 hover:underline disabled:text-ink-soft disabled:no-underline"
        >
          <RefreshCwIcon
            className={`size-3.5 ${resendPending ? "animate-spin" : ""}`}
          />
          {t("resendOtp")}
        </button>
      </div>
      {resendError ? (
        <p className="text-sm text-destructive">{resendError}</p>
      ) : null}
    </form>
  );
}
