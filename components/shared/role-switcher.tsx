"use client";

import { useState, useTransition } from "react";
import { HomeIcon, KeyIcon, AlertTriangleIcon } from "lucide-react";
import { switchRoleAction } from "@/lib/auth/onboarding-actions";
import type { NidStatus, UserRole } from "@/types/database.types";
import { cn } from "@/lib/utils";
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
    if (target === "landlord" && nidStatus !== "approved") {
      toast.warning(nidStatus === "rejected" ? labels.nidRejected : labels.nidPending);
      return;
    }
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
    <div className="inline-flex items-center rounded-full border border-rule bg-canvas p-0.5">
      <button
        type="button"
        onClick={() => handleSwitch("tenant")}
        disabled={pending}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
          active === "tenant"
            ? "bg-ink text-paper"
            : "text-ink-soft hover:text-ink",
        )}
      >
        <HomeIcon className="size-3.5" />
        {labels.tenant}
      </button>
      <button
        type="button"
        onClick={() => handleSwitch("landlord")}
        disabled={pending}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
          active === "landlord"
            ? "bg-ink text-paper"
            : "text-ink-soft hover:text-ink",
          nidStatus !== "approved" && "opacity-70",
        )}
      >
        {nidStatus !== "approved" ? (
          <AlertTriangleIcon className="size-3.5 text-ember" />
        ) : (
          <KeyIcon className="size-3.5" />
        )}
        {labels.landlord}
      </button>
    </div>
  );
}
