"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon, LockIcon } from "lucide-react";

type Props = {
  label: string;
  name: string;
  placeholder?: string;
  autoComplete?: "current-password" | "new-password";
  required?: boolean;
  invalid?: boolean;
  showLabel?: string;
  hideLabel?: string;
};

export function PasswordField({
  label,
  name,
  placeholder = "••••••••",
  autoComplete = "current-password",
  required = true,
  invalid = false,
  showLabel = "পাসওয়ার্ড দেখান",
  hideLabel = "পাসওয়ার্ড লুকান",
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="input-card block rounded-[18px] bg-white p-4">
      <span className="block text-[12px] font-bold text-ink-500">{label}</span>
      <div className="mt-3 flex items-center gap-3">
        <LockIcon className="h-5 w-5 text-ink-500/40" />
        <input
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={invalid}
          required={required}
          className="w-full border-0 bg-transparent text-[17px] font-semibold tracking-tight text-ink-900 outline-none placeholder:text-ink-500/35"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
        >
          {visible ? (
            <EyeOffIcon className="h-4 w-4" />
          ) : (
            <EyeIcon className="h-4 w-4" />
          )}
        </button>
      </div>
    </label>
  );
}
