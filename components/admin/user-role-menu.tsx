"use client";

import { useTransition } from "react";
import { ChevronDownIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setUserRoleAction } from "@/lib/admin/actions";

type Role = "tenant" | "landlord" | "admin";

export function UserRoleMenu({
  userId,
  role,
  disabled,
  labels,
}: {
  userId: string;
  role: Role;
  disabled?: boolean;
  labels: { tenant: string; landlord: string; admin: string };
}) {
  const [pending, startTransition] = useTransition();
  const roles: Role[] = ["tenant", "landlord", "admin"];

  const onPick = (next: Role) => {
    if (next === role) return;
    const fd = new FormData();
    fd.append("id", userId);
    fd.append("role", next);
    startTransition(() => setUserRoleAction(fd));
  };

  if (disabled) {
    return (
      <span className="inline-flex w-fit items-center rounded-full bg-ink-50 px-3 py-1 text-[11px] font-bold text-ink-900">
        {labels[role]}
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            disabled={pending}
            className="inline-flex w-fit items-center gap-1 rounded-full bg-ink-50 px-3 py-1 text-[11px] font-bold text-ink-900 transition hover:bg-ink-100 disabled:opacity-50"
          />
        }
      >
        {labels[role]}
        <ChevronDownIcon className="h-3 w-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="w-44 rounded-2xl border border-rule/60 bg-paper p-2"
      >
        {roles.map((r) => (
          <DropdownMenuItem
            key={r}
            onClick={() => onPick(r)}
            className={
              r === role
                ? "rounded-xl bg-ink-50 px-3 py-2 text-[12px] font-bold text-ink-900"
                : "rounded-xl px-3 py-2 text-[12px] font-semibold text-ink-500"
            }
          >
            {labels[r]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
