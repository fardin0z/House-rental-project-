"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import {
  createUserAction,
  type CreateUserState,
} from "@/lib/admin/actions";

const initial: CreateUserState = {};

export function CreateUserForm({
  labels,
}: {
  labels: {
    nameLabel: string;
    emailLabel: string;
    phoneLabel: string;
    passwordLabel: string;
    roleLabel: string;
    roleTenant: string;
    roleLandlord: string;
    roleAdmin: string;
    submit: string;
    back: string;
    hint: string;
  };
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    createUserAction,
    initial,
  );

  useEffect(() => {
    if (state.ok && state.redirectTo) router.replace(state.redirectTo);
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4 rounded-[24px] bg-white p-6">
      <Field
        name="name"
        label={labels.nameLabel}
        required
        error={state.fieldErrors?.name}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          name="email"
          type="email"
          label={labels.emailLabel}
          error={state.fieldErrors?.email}
        />
        <Field
          name="phone"
          type="tel"
          label={labels.phoneLabel}
          placeholder="+8801..."
          error={state.fieldErrors?.phone}
        />
      </div>
      <Field
        name="password"
        type="password"
        label={labels.passwordLabel}
        required
        error={state.fieldErrors?.password}
      />

      <div>
        <label className="font-space text-[11px] font-bold uppercase tracking-[.16em] text-ink-500/70">
          {labels.roleLabel}
        </label>
        <select
          name="role"
          defaultValue="tenant"
          className="mt-2 h-11 w-full rounded-full border border-ink-900/10 bg-white px-4 text-[13px] font-semibold text-ink-900 outline-none transition focus:border-ink-900/40"
        >
          <option value="tenant">{labels.roleTenant}</option>
          <option value="landlord">{labels.roleLandlord}</option>
          <option value="admin">{labels.roleAdmin}</option>
        </select>
      </div>

      <p className="text-[12px] text-ink-500">{labels.hint}</p>

      {state.error ? (
        <p className="rounded-[12px] bg-red-50 px-4 py-3 text-[12px] font-semibold text-red-700">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col items-stretch gap-3 pt-2 md:flex-row md:items-center md:justify-between">
        <Link
          href="/admin/users"
          className="inline-flex h-11 w-fit items-center gap-2 rounded-full border border-ink-900/10 bg-white px-5 text-[13px] font-bold text-ink-900 transition hover:bg-ink-50"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {labels.back}
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center rounded-full bg-ink-900 px-6 text-[13px] font-bold text-white transition hover:bg-ink-700 disabled:opacity-60"
        >
          {labels.submit}
        </button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  required,
  error,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="font-space text-[11px] font-bold uppercase tracking-[.16em] text-ink-500/70"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        className="mt-2 h-11 w-full rounded-full border border-ink-900/10 bg-white px-4 text-[13px] text-ink-900 outline-none transition focus:border-ink-900/40"
      />
      {error ? (
        <p className="mt-1.5 text-[11px] font-semibold text-red-700">{error}</p>
      ) : null}
    </div>
  );
}
