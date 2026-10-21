"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  FileTextIcon,
  HomeIcon,
  LayoutListIcon,
  LifeBuoyIcon,
  LogInIcon,
  LogOutIcon,
  MapIcon,
  MenuIcon,
  MessageCircleIcon,
  ShieldIcon,
  TruckIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/lib/auth/actions";

export function MainMenu({
  isAuthed,
  role,
}: {
  isAuthed: boolean;
  role?: "tenant" | "landlord" | "admin" | null;
}) {
  const t = useTranslations("menu");
  const [, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={t("menu")}
            className="grid size-10 place-items-center rounded-full border border-ink/15 bg-paper/70 text-ink backdrop-blur-md transition-colors hover:bg-paper"
          />
        }
      >
        <MenuIcon className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-60 rounded-2xl border border-rule/60 bg-paper p-2"
      >
        <DropdownMenuItem
          render={<Link href="/" />}
          className="gap-2 rounded-xl px-3 py-2"
        >
          <HomeIcon className="size-4" />
          {t("home")}
        </DropdownMenuItem>

        {isAuthed ? (
          <>
            {role === "landlord" ? (
              <DropdownMenuItem
                render={<Link href="/listings" />}
                className="gap-2 rounded-xl px-3 py-2"
              >
                <LayoutListIcon className="size-4" />
                {t("listings")}
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem
              render={<Link href="/properties" />}
              className="gap-2 rounded-xl px-3 py-2"
            >
              <LayoutListIcon className="size-4" />
              {t("properties")}
            </DropdownMenuItem>
            <DropdownMenuItem
              render={<Link href="/map" />}
              className="gap-2 rounded-xl px-3 py-2"
            >
              <MapIcon className="size-4" />
              {t("map")}
            </DropdownMenuItem>
            <DropdownMenuItem
              render={<Link href="/chat" />}
              className="gap-2 rounded-xl px-3 py-2"
            >
              <MessageCircleIcon className="size-4" />
              {t("chat")}
            </DropdownMenuItem>
            <DropdownMenuItem
              render={<Link href="/moving" />}
              className="gap-2 rounded-xl px-3 py-2"
            >
              <TruckIcon className="size-4" />
              {t("moving")}
            </DropdownMenuItem>
          </>
        ) : null}

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem
          render={<Link href="/support" />}
          className="gap-2 rounded-xl px-3 py-2"
        >
          <LifeBuoyIcon className="size-4" />
          {t("support")}
        </DropdownMenuItem>
        <DropdownMenuItem
          render={<Link href="/privacy" />}
          className="gap-2 rounded-xl px-3 py-2"
        >
          <ShieldIcon className="size-4" />
          {t("privacy")}
        </DropdownMenuItem>
        <DropdownMenuItem
          render={<Link href="/terms" />}
          className="gap-2 rounded-xl px-3 py-2"
        >
          <FileTextIcon className="size-4" />
          {t("terms")}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1" />

        {isAuthed ? (
          <DropdownMenuItem
            variant="destructive"
            className="gap-2 rounded-xl px-3 py-2"
            onClick={() => startTransition(() => signOutAction())}
          >
            <LogOutIcon className="size-4" />
            {t("logout")}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            render={<Link href="/login" />}
            className="gap-2 rounded-xl px-3 py-2"
          >
            <LogInIcon className="size-4" />
            {t("login")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
