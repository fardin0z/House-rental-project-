import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/guards";
import { RoleSwitcher } from "@/components/shared/role-switcher";
import { MainMenu } from "@/components/shared/main-menu";
import { formatBdPhoneForDisplay } from "@/lib/auth/phone";

export async function AppHeader() {
  const profile = await getCurrentProfile();
  const tCommon = await getTranslations("common");
  const tHeader = await getTranslations("header");

  return (
    <header className="sticky top-0 z-40 border-b border-rule/60 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-330 items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-baseline gap-1.5">
            <span className="text-base font-semibold tracking-tight">
              {tCommon("appName")}
            </span>
            <span className="hidden text-xs text-ink-soft sm:inline">
              {tCommon("appNameBn")}
            </span>
          </Link>
          {profile ? (
            <nav className="hidden items-center gap-1 md:flex">
              <Link
                href="/listings"
                className="rounded-full px-3 py-1.5 text-sm font-medium text-ink/70 transition-colors hover:text-ink"
              >
                {tHeader("navListings")}
              </Link>
            </nav>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {profile ? (
            <>
              <RoleSwitcher
                role={profile.role}
                nidStatus={profile.nid_status}
                labels={{
                  tenant: tHeader("roleTenant"),
                  landlord: tHeader("roleLandlord"),
                  nidPending: tHeader("nidPending"),
                  nidRejected: tHeader("nidRejected"),
                }}
              />
              <div className="hidden h-8 w-px bg-rule sm:block" />
              <div className="hidden flex-col items-end leading-tight sm:flex">
                <span className="text-xs text-ink-soft">
                  {profile.name ||
                    formatBdPhoneForDisplay(profile.phone) ||
                    profile.email}
                </span>
              </div>
              <MainMenu isAuthed />
            </>
          ) : (
            <MainMenu isAuthed={false} />
          )}
        </div>
      </div>
    </header>
  );
}
