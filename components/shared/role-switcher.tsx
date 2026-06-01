"use client";

import { useState, useTransition } from "react";
import { HomeIcon, KeyIcon, AlertTriangleIcon } from "lucide-react";
import { switchRoleAction } from "@/lib/auth/onboarding-actions";
import type { NidStatus, UserRole } from "@/types/database.types";
import { toast } from "sonner";

type Labels = {
  tenant: string;
  landlord: string;
  nidPending: string;
  nidRejected: string;
};

export function RoleSwitcher({
  role,
  nidStatus,
  labels,
}: {
  role: UserRole;
  nidStatus: NidStatus;
  labels: Labels;
}) {
  const [active, setActive] = useState<UserRole>(role);
  const [pending, startTransition] = useTransition();

  if (role === "admin") return null;

  function handleSwitch(target: "tenant" | "landlord") {
    if (target === active) return;
    setActive(target);
    startTransition(async () => {
      try {
        await switchRoleAction(target);
      } catch (error) {
        setActive(active);
        toast.error(error instanceof Error ? error.message : "সমস্যা হয়েছে");
      }
    });
  }

  return (
    <div className="inline-flex items-center rounded-full bg-white p-1">
      <button
        type="button"
        onClick={() => handleSwitch("tenant")}
        disabled={pending}
        className={
          active === "tenant"
            ? "inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-1.5 text-[12px] font-bold text-white transition"
            : "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold text-ink-500 transition hover:text-ink-900"
        }
      >
        <HomeIcon className="h-3.5 w-3.5" />
        {labels.tenant}
      </button>
      <button
        type="button"
        onClick={() => handleSwitch("landlord")}
        disabled={pending}
        className={
          active === "landlord"
            ? "inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-1.5 text-[12px] font-bold text-white transition"
            : "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold text-ink-500 transition hover:text-ink-900"
        }
      >
        {nidStatus !== "approved" ? (
          <AlertTriangleIcon className="h-3.5 w-3.5 text-lime-600" />
        ) : (
          <KeyIcon className="h-3.5 w-3.5" />
        )}
        {labels.landlord}
      </button>
    </div>
  );
}
