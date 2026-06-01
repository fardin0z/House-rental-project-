import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CheckIcon } from "lucide-react";
import { requireProfile } from "@/lib/auth/guards";
import { getActiveSubscription } from "@/lib/payments/queries";
import { UpgradeButton } from "@/components/payments/upgrade-button";

const SUCCESS_KEYS = {
  success: {
    title: "successTitle",
    body: "successBody",
  },
  fail: {
    title: "failTitle",
    body: "failBody",
  },
  cancel: {
    title: "cancelTitle",
    body: "cancelBody",
  },
} as const;

type CallbackStatus = keyof typeof SUCCESS_KEYS;

function asString(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const profile = await requireProfile();
  const t = await getTranslations("subscription");
  const sp = await searchParams;
  const status = asString(sp.status) as CallbackStatus | undefined;
  const banner = status && SUCCESS_KEYS[status] ? SUCCESS_KEYS[status] : null;
  const subscription = await getActiveSubscription(profile.id);
  const isPremium = Boolean(subscription && subscription.tier === "premium");

  return (
    <div>
      <section className="mx-auto max-w-5xl px-6 pb-8 pt-10">
        <p className="font-display text-[22px] italic leading-none text-lime-600">
          {t("eyebrow")}
        </p>
        <h1 className="font-display mt-6 text-[48px] italic leading-[.88] tracking-tight text-ink-900 md:text-[72px]">
          {t("title")}
        </h1>
        <p className="mt-7 max-w-[480px] text-[15px] font-medium leading-relaxed text-ink-500">
          {t("subtitle")}
        </p>
      </section>

      {banner ? (
        <section className="mx-auto max-w-5xl px-6 pb-6">
          <div
            className={
              status === "success"
                ? "rounded-[20px] border border-lime-400/30 bg-lime-50 p-5 md:p-6"
                : status === "fail"
                  ? "rounded-[20px] border border-red-200 bg-red-50 p-5 md:p-6"
                  : "rounded-[20px] border border-ink-900/10 bg-white p-5 md:p-6"
            }
          >
            <h2 className="text-[18px] font-bold text-ink-900 md:text-[20px]">
              {t(banner.title)}
            </h2>
            <p className="mt-2 text-[14px] font-medium text-ink-500">
              {t(banner.body)}
            </p>
            {status === "success" ? (
              <Link
                href="/listings"
                className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-ink-900 px-5 text-[13px] font-bold text-white hover:bg-ink-700"
              >
                {t("browseListings")}
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-16 md:grid-cols-2">
        <PlanCard
          title={t("free")}
          tagline={t("freeTagline")}
          price={t("freePrice")}
          priceLabel={t("freePriceLabel")}
          features={[
            t("freeFeature1"),
            t("freeFeature2"),
            t("freeFeature3"),
          ]}
          isCurrent={!isPremium}
          currentLabel={t("currentPlan")}
        />
        <PlanCard
          title={t("premium")}
          tagline={t("premiumTagline")}
          price={t("premiumPrice")}
          priceLabel={t("premiumPriceLabel")}
          features={[
            t("premiumFeature1"),
            t("premiumFeature2"),
            t("premiumFeature3"),
            t("premiumFeature4"),
          ]}
          isCurrent={isPremium}
          currentLabel={t("currentPlan")}
          dark
          footer={
            isPremium && subscription ? (
              <p className="rounded-[14px] bg-white/10 px-4 py-3 text-center text-[12px] font-semibold text-white/80">
                {t("activeUntil", {
                  date: new Intl.DateTimeFormat("bn-BD", {
                    dateStyle: "medium",
                  }).format(new Date(subscription.expires_at)),
                })}
              </p>
            ) : (
              <UpgradeButton label={t("upgradeCta")} />
            )
          }
        />
      </section>
    </div>
  );
}

function PlanCard({
  title,
  tagline,
  price,
  priceLabel,
  features,
  isCurrent,
  currentLabel,
  dark,
  footer,
}: {
  title: string;
  tagline: string;
  price: string;
  priceLabel: string;
  features: string[];
  isCurrent: boolean;
  currentLabel: string;
  dark?: boolean;
  footer?: React.ReactNode;
}) {
  return (
    <article
      className={
        dark
          ? "flex flex-col gap-6 rounded-[24px] bg-ink-900 p-6 text-white md:p-8"
          : "flex flex-col gap-6 rounded-[24px] border border-ink-900/10 bg-white p-6 md:p-8"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            className={
              dark
                ? "text-[24px] font-bold tracking-tight"
                : "text-[24px] font-bold tracking-tight text-ink-900"
            }
          >
            {title}
          </h2>
          <p
            className={
              dark ? "mt-1 text-[13px] text-white/65" : "mt-1 text-[13px] text-ink-500"
            }
          >
            {tagline}
          </p>
        </div>
        {isCurrent ? (
          <span
            className={
              dark
                ? "inline-flex rounded-full bg-lime-400 px-3 py-1 text-[11px] font-bold text-ink-900"
                : "inline-flex rounded-full bg-lime-50 px-3 py-1 text-[11px] font-bold text-lime-600"
            }
          >
            {currentLabel}
          </span>
        ) : null}
      </div>

      <div className="flex items-baseline gap-2">
        <span
          className={
            dark
              ? "font-display text-[44px] italic leading-none tracking-tight"
              : "font-display text-[44px] italic leading-none tracking-tight text-ink-900"
          }
        >
          {price}
        </span>
        <span
          className={
            dark
              ? "text-[12px] font-bold uppercase tracking-[.18em] text-white/50"
              : "text-[12px] font-bold uppercase tracking-[.18em] text-ink-500"
          }
        >
          {priceLabel}
        </span>
      </div>

      <ul className="flex flex-col gap-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span
              className={
                dark
                  ? "mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime-400 text-ink-900"
                  : "mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime-50 text-lime-600"
              }
            >
              <CheckIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
            <span
              className={
                dark
                  ? "text-[14px] font-medium text-white/85"
                  : "text-[14px] font-medium text-ink-900"
              }
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {footer ? <div className="mt-auto">{footer}</div> : null}
    </article>
  );
}
