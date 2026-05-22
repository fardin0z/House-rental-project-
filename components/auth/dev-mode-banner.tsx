import { TerminalIcon } from "lucide-react";

export function DevModeBanner({ message }: { message: string }) {
  if (process.env.NODE_ENV === "production") return null;
  if (process.env.DEV_BYPASS_OTP !== "true") return null;

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-ember/30 bg-ember-soft/40 px-4 py-3">
      <TerminalIcon className="mt-0.5 size-4 shrink-0 text-clay" />
      <p className="text-xs leading-relaxed text-clay">
        <span className="font-display italic">Dev mode</span> · {message}
      </p>
    </div>
  );
}
