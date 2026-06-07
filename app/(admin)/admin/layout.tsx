import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/auth/guards";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole("admin");
  const t = await getTranslations("admin");

  const navItems = [
    {
      href: "/admin",
      label: t("navDashboard"),
      iconKey: "LayoutGridIcon" as const,
      exact: true,
    },
    {
      href: "/admin/users",
      label: t("navUsers"),
      iconKey: "UsersIcon" as const,
    },
    {
      href: "/admin/nid-approvals",
      label: t("navNid"),
      iconKey: "ShieldCheckIcon" as const,
    },
    {
      href: "/admin/listings",
      label: t("navListings"),
      iconKey: "HomeIcon" as const,
    },
    {
      href: "/admin/payments",
      label: t("navPayments"),
      iconKey: "CreditCardIcon" as const,
    },
    {
      href: "/admin/moving-requests",
      label: t("navMoving"),
      iconKey: "TruckIcon" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="flex gap-6 px-4 py-4 md:px-6 md:py-6 lg:gap-8">
        <AdminSidebar
          navItems={navItems}
          brand={t("brand")}
          panelLabel={t("panelLabel")}
          displayName={profile.name ?? profile.email ?? "Admin"}
          roleLabel={t("roleAdmin")}
          signOutLabel={t("signOut")}
        />
        <main className="min-w-0 flex-1 pt-16 lg:pt-0">{children}</main>
      </div>
    </div>
  );
}
