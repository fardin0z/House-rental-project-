import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, BellIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/guards";
import { redirectPathForRole } from "@/lib/auth/jwt-claims";
import { MainMenu } from "@/components/shared/main-menu";
import { Logo } from "@/components/shared/logo";
import { formatBdPhoneForDisplay } from "@/lib/auth/phone";

type NavLink = { label: string; href: string; active?: boolean };

type AppHeaderProps = {
  variant?: "sticky" | "floating" | "minimal";
  navLinks?: NavLink[];
  cta?: { label: string; href: string };
  backHref?: string;
};

export async function AppHeader({
  variant = "sticky",
  navLinks,
  cta,
  backHref,
}: AppHeaderProps = {}) {
  const profile = await getCurrentProfile();
  const tCommon = await getTranslations("common");
  const tHeader = await getTranslations("header");
  const tLanding = await getTranslations("landing");
  const isAuthed = Boolean(profile);

  if (variant === "minimal") {
    return (
      <header className="border-b border-rule/60">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-5 sm:px-6">
          <Logo size="sm" ariaLabel={tCommon("appName")} />
          <Link
            href={backHref ?? "/"}
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink"
          >
            <ArrowLeftIcon className="size-4" />
            {tCommon("back")}
          </Link>
        </div>
      </header>
    );
  }

  if (variant === "floating") {
    const resolvedCta =
      cta ??
      (!isAuthed
        ? { label: tLanding("ctaLogin"), href: "/login" }
        : profile?.role === "admin"
          ? { label: tLanding("adminCta"), href: "/admin" }
          : {
              label: tLanding("featuredCta"),
              href: redirectPathForRole(profile?.role ?? null),
            });
    return (
      <header className="relative z-10 flex items-start justify-between gap-3 px-8 pt-7 max-[900px]:px-4 max-[900px]:pt-4">
        <Logo
          size="md"
          variant="dark"
          priority
          ariaLabel={tCommon("appName")}
          className="max-[900px]:max-w-[104px]"
        />

        {navLinks && navLinks.length > 0 ? (
          <nav className="absolute left-1/2 top-5 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/20 bg-white/40 px-1.5 py-1.5 backdrop-blur-[18px] max-[900px]:hidden">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className={
                  l.active
                    ? "rounded-full bg-white px-4 py-2 text-[13px] font-bold text-black"
                    : "rounded-full px-4 py-2 text-[13px] font-semibold text-white/85 transition-colors hover:text-white"
                }
              >
                {l.label}
              </Link>
            ))}
          </nav>
        ) : null}

        <div className="flex shrink-0 items-center gap-2 max-[900px]:gap-1.5">
          <Link
            href={resolvedCta.href}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-greenx px-6 text-[14px] font-bold text-black transition-transform hover:scale-[1.03] max-[900px]:h-10 max-[900px]:px-4 max-[900px]:text-[12px]"
          >
            {resolvedCta.label}
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
          <div className="hidden max-[900px]:block">
            <MainMenu isAuthed={isAuthed} role={profile?.role ?? null} />
          </div>
        </div>
      </header>
    );
  }

  const resolvedNav: NavLink[] =
    navLinks && navLinks.length > 0
      ? navLinks
      : profile
        ? profile.role === "landlord"
          ? [
              { label: tHeader("navListings"), href: "/listings" },
              { label: tHeader("navProperties"), href: "/properties" },
              { label: tHeader("navMap"), href: "/map" },
              { label: tHeader("navChat"), href: "/chat" },
            ]
          : [
              { label: tHeader("navProperties"), href: "/properties" },
              { label: tHeader("navMap"), href: "/map" },
              { label: tHeader("navChat"), href: "/chat" },
            ]
        : [];
  const displayName =
    profile?.name ||
    formatBdPhoneForDisplay(profile?.phone ?? null) ||
    profile?.email ||
    "";
  const initial = displayName ? displayName.trim().charAt(0) : "";

  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-6">
      <Logo size="md" ariaLabel={tCommon("appName")} />

      {resolvedNav.length > 0 ? (
        <nav className="hidden items-center gap-1 rounded-full bg-white p-1 shadow-[0_1px_0_rgba(0,0,0,0.05)] md:flex">
          {resolvedNav.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className={
                l.active
                  ? "rounded-full bg-ink-900 px-4 py-2 text-[13px] font-bold text-white"
                  : "rounded-full px-4 py-2 text-[13px] font-semibold text-ink-500 transition-colors hover:text-ink-900"
              }
            >
              {l.label}
            </Link>
          ))}
        </nav>
      ) : null}

      <div className="flex items-center gap-3">
        {profile ? (
          <>
            <button
              type="button"
              aria-label="Notifications"
              className="hidden h-11 w-11 items-center justify-center rounded-full bg-white text-ink-900 transition hover:bg-ink-100 md:inline-flex"
            >
              <BellIcon className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3 rounded-full bg-white py-1 pl-1 pr-4">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-lime-400 text-[14px] font-bold text-ink-900">
                {initial}
              </span>
              <span className="hidden text-[13px] font-bold text-ink-900 md:inline">
                {displayName}
              </span>
            </div>
            <MainMenu isAuthed role={profile.role} />
          </>
        ) : (
          <MainMenu isAuthed={false} />
        )}
      </div>
    </header>
  );
}
