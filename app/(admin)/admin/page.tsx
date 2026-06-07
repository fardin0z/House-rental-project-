import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  UsersIcon,
  HomeIcon,
  CreditCardIcon,
  CrownIcon,
  ShieldCheckIcon,
  TruckIcon,
  ArrowUpRightIcon,
} from "lucide-react";
import { getDashboardStats } from "@/lib/admin/queries";

export default async function AdminDashboardPage() {
  const t = await getTranslations("admin");
  const stats = await getDashboardStats();

  const cards: Array<{
    label: string;
    value: string;
    sub?: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      label: t("statUsers"),
      value: stats.totalUsers.toLocaleString("bn-BD"),
      sub: t("statLandlordsSub", { count: stats.totalLandlords }),
      href: "/admin/users",
      icon: UsersIcon,
    },
    {
      label: t("statListings"),
      value: stats.activeListings.toLocaleString("bn-BD"),
      sub: t("statPendingSub", { count: stats.pendingListings }),
      href: "/admin/listings",
      icon: HomeIcon,
    },
    {
      label: t("statRevenue"),
      value: `৳ ${Math.round(stats.totalRevenue).toLocaleString("bn-BD")}`,
      sub: t("statRevenueSub"),
      href: "/admin/payments",
      icon: CreditCardIcon,
    },
    {
      label: t("statSubscriptions"),
      value: stats.activeSubscriptions.toLocaleString("bn-BD"),
      sub: t("statSubscriptionsSub"),
      href: "/admin/payments",
      icon: CrownIcon,
    },
  ];

  const queues: Array<{
    label: string;
    count: number;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    cta: string;
  }> = [
    {
      label: t("queueNid"),
      count: stats.pendingNidCount,
      href: "/admin/nid-approvals",
      icon: ShieldCheckIcon,
      cta: t("queueReview"),
    },
    {
      label: t("queueListings"),
      count: stats.pendingListings,
      href: "/admin/listings?status=pending",
      icon: HomeIcon,
      cta: t("queueReview"),
    },
    {
      label: t("queueMoving"),
      count: stats.pendingMovingCount,
      href: "/admin/moving-requests",
      icon: TruckIcon,
      cta: t("queueReview"),
    },
  ];

  return (
    <div className="space-y-5 md:space-y-8">
      <header>
        <p className="font-space text-[11px] font-bold uppercase tracking-[.18em] text-ink-500/70 md:text-[12px]">
          {t("dashboardEyebrow")}
        </p>
        <h1 className="font-display mt-2 text-[28px] italic leading-[.92] tracking-tight text-ink-900 sm:text-[36px] md:mt-4 md:text-[64px]">
          {t("dashboardTitle")}
        </h1>
        <p className="mt-2 max-w-[520px] text-[13px] font-medium leading-relaxed text-ink-500 md:mt-3 md:text-[14px]">
          {t("dashboardSubtitle")}
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group relative flex flex-col justify-between rounded-[18px] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_rgba(14,17,13,.25)] md:rounded-[24px] md:p-6"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-lime-400/20 text-lime-600 md:h-11 md:w-11">
                <card.icon className="h-4 w-4 md:h-5 md:w-5" />
              </span>
              <ArrowUpRightIcon className="h-3.5 w-3.5 text-ink-500/60 transition group-hover:text-ink-900 md:h-4 md:w-4" />
            </div>
            <div className="mt-4 md:mt-8">
              <p className="font-space text-[10px] font-bold uppercase tracking-[.16em] text-ink-500/70 md:text-[11px]">
                {card.label}
              </p>
              <p className="font-display mt-2 text-[26px] italic leading-none tracking-tight text-ink-900 sm:text-[32px] md:mt-3 md:text-[40px]">
                {card.value}
              </p>
              {card.sub ? (
                <p className="mt-2 text-[11px] font-semibold text-ink-500 md:mt-3 md:text-[12px]">
                  {card.sub}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </section>

      <section className="rounded-[20px] bg-white p-5 md:rounded-[28px] md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-space text-[11px] font-bold uppercase tracking-[.18em] text-ink-500/70 md:text-[12px]">
              {t("queueEyebrow")}
            </p>
            <h2 className="font-display mt-2 text-[22px] italic leading-tight text-ink-900 md:mt-3 md:text-[34px]">
              {t("queueTitle")}
            </h2>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:mt-6 md:grid-cols-3">
          {queues.map((q) => (
            <Link
              key={q.label}
              href={q.href}
              className="group flex items-center justify-between rounded-[16px] bg-ink-50 p-4 transition hover:bg-ink-100 md:rounded-[20px] md:p-5"
            >
              <div className="flex items-center gap-4">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink-900">
                  <q.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[13px] font-bold text-ink-900">
                    {q.label}
                  </p>
                  <p className="mt-0.5 text-[12px] font-semibold text-ink-500">
                    {t("queueCount", { count: q.count })}
                  </p>
                </div>
              </div>
              <span className="inline-flex h-9 items-center rounded-full bg-ink-900 px-4 text-[11px] font-bold text-white">
                {q.cta}
                <ArrowUpRightIcon className="ml-1.5 h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
