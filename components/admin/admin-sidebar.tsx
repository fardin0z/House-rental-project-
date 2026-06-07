"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGridIcon,
  UsersIcon,
  ShieldCheckIcon,
  HomeIcon,
  CreditCardIcon,
  TruckIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";
import { signOutAction } from "@/lib/auth/actions";
import { BrandMark } from "@/components/shared/brand-mark";

const ICONS = {
  LayoutGridIcon,
  UsersIcon,
  ShieldCheckIcon,
  HomeIcon,
  CreditCardIcon,
  TruckIcon,
} as const;

type IconKey = keyof typeof ICONS;

type NavItem = {
  href: string;
  label: string;
  iconKey: IconKey;
  exact?: boolean;
};

export function AdminSidebar({
  navItems,
  brand,
  panelLabel,
  displayName,
  roleLabel,
  signOutLabel,
}: {
  navItems: NavItem[];
  brand: string;
  panelLabel: string;
  displayName: string;
  roleLabel: string;
  signOutLabel: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const initial = displayName.trim().charAt(0).toUpperCase();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="fixed left-4 top-4 z-30 grid size-11 place-items-center rounded-full bg-ink-900 text-white shadow-[0_10px_24px_-8px_rgba(14,17,13,.45)] lg:hidden"
      >
        <MenuIcon className="size-5" />
      </button>

      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <aside
        className={
          "fixed inset-y-4 left-4 z-50 flex w-72 flex-col rounded-[28px] bg-ink-900 p-5 text-white transition-transform duration-300 lg:sticky lg:top-6 lg:inset-auto lg:z-0 lg:h-[calc(100vh-3rem)] lg:w-64 lg:translate-x-0 " +
          (open ? "translate-x-0" : "-translate-x-[110%]")
        }
      >
        <div className="flex items-center justify-between pb-6 pl-2">
          <Link
            href="/admin"
            className="flex items-center gap-2.5"
            onClick={() => setOpen(false)}
          >
            <BrandMark className="h-9 w-9" />
            <span className="flex flex-col leading-none">
              <span className="text-[16px] font-bold tracking-tight">
                {brand}
              </span>
              <span className="mt-1 text-[10px] font-bold uppercase tracking-[.18em] text-lime-400">
                {panelLabel}
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-full bg-white/10 text-white lg:hidden"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const Icon = ICONS[item.iconKey];
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive
                    ? "flex items-center gap-3 rounded-full bg-lime-400 px-4 py-2.5 text-[13px] font-bold text-ink-900"
                    : "flex items-center gap-3 rounded-full px-4 py-2.5 text-[13px] font-semibold text-white/70 transition hover:bg-white/5 hover:text-white"
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-[18px] bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-lime-400 text-[13px] font-bold text-ink-900">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold">{displayName}</p>
              <p className="text-[11px] font-semibold text-white/55">
                {roleLabel}
              </p>
            </div>
          </div>
          <form action={signOutAction} className="mt-4">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[12px] font-bold text-white/85 transition hover:bg-white/10"
            >
              <LogOutIcon className="h-3.5 w-3.5" />
              {signOutLabel}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
