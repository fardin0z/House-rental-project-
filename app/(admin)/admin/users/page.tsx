import { getTranslations } from "next-intl/server";
import { UsersIcon, SearchIcon } from "lucide-react";
import { FilterChip } from "@/components/admin/filter-chip";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getUsers, type AdminUser } from "@/lib/admin/queries";
import {
  suspendUserAction,
  unsuspendUserAction,
  deleteUserAction,
} from "@/lib/admin/actions";

const ROLES = ["tenant", "landlord", "admin"] as const;
type RoleFilter = (typeof ROLES)[number];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const rawQ = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const rawRole = Array.isArray(sp.role) ? sp.role[0] : sp.role;
  const role: RoleFilter | null = ROLES.includes(rawRole as RoleFilter)
    ? (rawRole as RoleFilter)
    : null;
  const q = rawQ?.trim() ?? "";

  const [t, self, users] = await Promise.all([
    getTranslations("admin"),
    getCurrentProfile(),
    getUsers({ search: q, role }),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <p className="font-space text-[12px] font-bold uppercase tracking-[.18em] text-ink-500/70">
          {t("usersEyebrow")}
        </p>
        <h1 className="font-display mt-3 text-[36px] italic leading-tight tracking-tight text-ink-900 md:text-[48px]">
          {t("usersTitle")}
        </h1>
      </header>

      <form className="flex flex-col gap-3 rounded-[20px] bg-white p-3 md:flex-row md:items-center">
        <div className="relative flex flex-1 items-center">
          <SearchIcon className="absolute left-4 h-4 w-4 text-ink-500" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder={t("usersSearchPlaceholder")}
            className="h-11 w-full rounded-full bg-ink-50 pl-10 pr-4 text-[13px] text-ink-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-ink-900/10"
          />
        </div>
        <div className="flex items-center gap-1 rounded-full bg-ink-50 p-1">
          <FilterChip
            href={buildRoleHref(null, q)}
            active={role === null}
            label={t("usersRoleAll")}
          />
          <FilterChip
            href={buildRoleHref("tenant", q)}
            active={role === "tenant"}
            label={t("usersRoleTenant")}
          />
          <FilterChip
            href={buildRoleHref("landlord", q)}
            active={role === "landlord"}
            label={t("usersRoleLandlord")}
          />
          <FilterChip
            href={buildRoleHref("admin", q)}
            active={role === "admin"}
            label={t("usersRoleAdmin")}
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-full bg-ink-900 px-6 text-[13px] font-bold text-white"
        >
          {t("usersSearch")}
        </button>
      </form>

      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[28px] bg-white p-16 text-center">
          <UsersIcon className="h-10 w-10 text-ink-500/50" />
          <h3 className="font-display mt-5 text-[24px] italic text-ink-900">
            {t("usersEmptyTitle")}
          </h3>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[24px] bg-white">
          <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b border-ink-900/5 px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-ink-500/70 md:grid">
            <span>{t("usersColUser")}</span>
            <span>{t("usersColRole")}</span>
            <span>{t("usersColNid")}</span>
            <span>{t("usersColListings")}</span>
            <span>{t("usersColStatus")}</span>
            <span className="text-right">{t("usersColActions")}</span>
          </div>
          <ul className="divide-y divide-ink-900/5">
            {users.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                isSelf={u.id === self?.id}
                t={t}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function buildRoleHref(value: RoleFilter | null, q: string): string {
  const params = new URLSearchParams();
  if (value) params.set("role", value);
  if (q) params.set("q", q);
  return params.toString() ? `?${params.toString()}` : "?";
}

type T = Awaited<ReturnType<typeof getTranslations<"admin">>>;

function UserRow({
  user,
  isSelf,
  t,
}: {
  user: AdminUser;
  isSelf: boolean;
  t: T;
}) {
  const display = user.name || user.email || user.phone || "—";
  const initial = display.trim().charAt(0).toUpperCase();
  const suspended = user.suspended_at != null;

  return (
    <li className="grid grid-cols-1 gap-3 px-6 py-5 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] md:items-center md:gap-4">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-lime-400 text-[13px] font-bold text-ink-900">
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold text-ink-900">
            {display}
          </p>
          <p className="truncate text-[11px] font-semibold text-ink-500">
            {user.phone ?? user.email ?? ""}
          </p>
        </div>
      </div>
      <span className="inline-flex w-fit items-center rounded-full bg-ink-50 px-3 py-1 text-[11px] font-bold text-ink-900">
        {t(`usersRole${roleCap(user.role)}` as never)}
      </span>
      <span
        className={
          "inline-flex w-fit items-center rounded-full px-3 py-1 text-[11px] font-bold " +
          nidPillClass(user.nid_status)
        }
      >
        {t(`nidPill.${user.nid_status}`)}
      </span>
      <span className="text-[12px] font-semibold text-ink-500">
        {user.listings_count}{" "}
        {user.premium_active ? (
          <span className="ml-1 inline-flex items-center rounded-full bg-lime-400/20 px-2 py-0.5 text-[10px] font-bold text-lime-600">
            {t("usersPremiumBadge")}
          </span>
        ) : null}
      </span>
      <span
        className={
          "inline-flex w-fit items-center rounded-full px-3 py-1 text-[11px] font-bold " +
          (suspended
            ? "bg-red-100 text-red-700"
            : "bg-emerald-100 text-emerald-700")
        }
      >
        {suspended ? t("usersStatusSuspended") : t("usersStatusActive")}
      </span>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {isSelf ? (
          <span className="text-[11px] font-semibold text-ink-500/70">
            {t("usersSelf")}
          </span>
        ) : (
          <>
            <form action={suspended ? unsuspendUserAction : suspendUserAction}>
              <input type="hidden" name="id" value={user.id} />
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-full border border-ink-900/10 bg-white px-4 text-[11px] font-bold text-ink-900 transition hover:bg-ink-50"
              >
                {suspended ? t("usersUnsuspend") : t("usersSuspend")}
              </button>
            </form>
            <form action={deleteUserAction}>
              <input type="hidden" name="id" value={user.id} />
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-full bg-red-100 px-4 text-[11px] font-bold text-red-700 transition hover:bg-red-200"
              >
                {t("usersDelete")}
              </button>
            </form>
          </>
        )}
      </div>
    </li>
  );
}

function roleCap(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function nidPillClass(status: string): string {
  if (status === "approved") return "bg-emerald-100 text-emerald-700";
  if (status === "rejected") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}
