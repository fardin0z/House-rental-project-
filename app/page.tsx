import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ArrowUpRightIcon,
  CheckIcon,
  MapPinIcon,
  ShieldCheckIcon,
  StarIcon,
} from "lucide-react";
import { getCurrentUserId } from "@/lib/auth/guards";
import { MainMenu } from "@/components/shared/main-menu";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80&auto=format&fit=crop";
const COLLAGE_A =
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&q=80&auto=format&fit=crop";
const COLLAGE_B =
  "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=900&q=80&auto=format&fit=crop";
const COLLAGE_C =
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&q=80&auto=format&fit=crop";
const COLLAGE_D =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=80&auto=format&fit=crop";

export default async function HomePage() {
  const t = await getTranslations("landing");
  const tCommon = await getTranslations("common");
  const userId = await getCurrentUserId();
  const isAuthed = Boolean(userId);

  const areas = [
    t("areaDhaka"),
    t("areaChittagong"),
    t("areaSylhet"),
    t("areaRajshahi"),
  ];

  const stats = [
    { value: t("stat1Value"), label: t("stat1Label") },
    { value: t("stat2Value"), label: t("stat2Label") },
    { value: t("stat3Value"), label: t("stat3Label") },
    { value: t("stat4Value"), label: t("stat4Label") },
  ];

  const features = [
    { title: t("feature1Title"), body: t("feature1Body"), icon: ShieldCheckIcon },
    { title: t("feature2Title"), body: t("feature2Body"), icon: MapPinIcon },
    { title: t("feature3Title"), body: t("feature3Body"), icon: StarIcon },
  ];

  return (
    <main className="relative isolate min-h-screen overflow-hidden">
      <SiteNav
        appName={tCommon("appName")}
        cta={isAuthed ? "বিজ্ঞাপন দেখুন" : t("ctaLogin")}
        href={isAuthed ? "/listings" : "/login"}
        isAuthed={isAuthed}
      />

      <section className="relative mx-auto w-full max-w-330 px-4 pt-28 pb-16 sm:px-6 md:pt-32 md:pb-24">
        <Hero
          available={t("availableNow")}
          line1={t("displayLine1")}
          line2={t("displayLine2")}
          line3={t("displayLine3")}
          subhead={t("subhead")}
          areas={areas}
          fromLabel={t("searchFromLabel")}
          typeLabel={t("searchTypeLabel")}
          budgetLabel={t("searchBudgetLabel")}
          typePlaceholder={t("searchTypePlaceholder")}
          budgetPlaceholder={t("searchBudgetPlaceholder")}
          ctaPrimary={isAuthed ? "বিজ্ঞাপন দেখুন" : t("ctaPrimary")}
          ctaHref={isAuthed ? "/listings" : "/login"}
          navOverview={t("navOverview")}
          navAreas={t("navAreas")}
          navHow={t("navHow")}
          navPricing={t("navPricing")}
        />
      </section>

      <section className="relative mx-auto w-full max-w-330 px-4 pb-24 sm:px-6 md:pb-32">
        <AboutCollage
          label={t("aboutLabel")}
          headline={t("aboutHeadline")}
          body={t("aboutBody")}
          feature1={t("aboutFeature1")}
          feature2={t("aboutFeature2")}
          feature3={t("aboutFeature3")}
          reviewBadge={t("reviewBadge")}
          reviewBadgeCount={t("reviewBadgeCount")}
          galleryCta={t("galleryCta")}
          tagPropertyName={t("tagPropertyName")}
          tagFeature1={t("tagFeature1")}
          tagFeature2={t("tagFeature2")}
        />
      </section>

      <section className="relative mx-auto w-full max-w-330 px-4 pb-24 sm:px-6 md:pb-32">
        <StatsRow label={t("statsLabel")} stats={stats} />
      </section>

      <section className="relative mx-auto w-full max-w-330 px-4 pb-24 sm:px-6 md:pb-32">
        <FeatureList features={features} />
      </section>

      <Footer
        appName={tCommon("appName")}
        note={t("footerNote")}
        city={t("footerCity")}
      />
    </main>
  );
}

function SiteNav({
  appName,
  cta,
  href,
  isAuthed,
}: {
  appName: string;
  cta: string;
  href: string;
  isAuthed: boolean;
}) {
  return (
    <nav className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex w-full max-w-330 items-center justify-between px-4 pt-5 sm:px-6 md:pt-7">
        <Link href="/" className="group flex items-baseline gap-1.5">
          <span className="text-lg font-semibold tracking-tight">{appName}</span>
          <span className="hidden text-sm text-ink-soft sm:inline">বাসা ভাড়া</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={href}
            className="group inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper/70 px-5 py-2.5 text-sm font-medium text-ink backdrop-blur-md transition-all hover:bg-ink hover:text-paper"
          >
            {cta}
            <ArrowUpRightIcon className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <MainMenu isAuthed={isAuthed} />
        </div>
      </div>
    </nav>
  );
}

function Hero(props: {
  available: string;
  line1: string;
  line2: string;
  line3: string;
  subhead: string;
  areas: string[];
  fromLabel: string;
  typeLabel: string;
  budgetLabel: string;
  typePlaceholder: string;
  budgetPlaceholder: string;
  ctaPrimary: string;
  ctaHref: string;
  navOverview: string;
  navAreas: string;
  navHow: string;
  navPricing: string;
}) {
  const navItems = [props.navOverview, props.navAreas, props.navHow, props.navPricing];

  return (
    <div className="relative">
      <div className="absolute -top-6 right-4 z-30 hidden translate-y-0 rounded-full border border-ink/10 bg-paper/85 p-1.5 shadow-[0_12px_40px_-12px_oklch(0.30_0.04_60/0.30)] backdrop-blur-md md:right-12 md:flex">
        {navItems.map((item, index) => (
          <button
            key={item}
            type="button"
            className={
              index === 0
                ? "rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper"
                : "rounded-full px-4 py-2 text-xs font-medium text-ink/70 transition-colors hover:text-ink"
            }
          >
            {item}
          </button>
        ))}
      </div>

      <div className="editorial-card relative overflow-hidden">
        <div className="relative aspect-4/3 sm:aspect-16/10 md:aspect-video lg:aspect-2/1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMAGE}
            alt=""
            className="absolute inset-0 size-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-linear-to-tr from-ink/75 via-ink/30 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-ink/40" />

          <div className="absolute left-6 top-6 z-10 sm:left-8 sm:top-8 md:left-10 md:top-10">
            <span className="glass-pill">
              <span className="relative flex size-2 items-center justify-center">
                <span className="absolute size-2 animate-ping rounded-full bg-emerald-400/60" />
                <span className="relative size-1.5 rounded-full bg-emerald-400" />
              </span>
              {props.available}
            </span>
          </div>

          <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 sm:p-8 md:p-10 lg:p-14">
            <div />

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2 sm:gap-4">
                <h1 className="font-display text-[2.75rem] leading-[0.95] text-paper sm:text-6xl md:text-7xl lg:text-[6.5rem]">
                  <span className="block italic">{props.line1}</span>
                  <span className="block translate-x-4 italic text-ember sm:translate-x-8 md:translate-x-12">
                    {props.line2}
                  </span>
                  <span className="block italic">{props.line3}</span>
                </h1>
                <p className="max-w-md text-sm text-paper/85 sm:text-base md:max-w-lg">
                  {props.subhead}
                </p>
              </div>
            </div>
          </div>

          <div className="absolute right-6 top-20 z-10 flex flex-col items-end gap-2 sm:right-8 sm:top-24 md:right-10 md:top-32">
            {props.areas.map((area, index) => (
              <span
                key={area}
                className="glass-pill"
                style={{ transform: `translateX(${index * -8}px)` }}
              >
                <MapPinIcon className="size-3" />
                {area}
              </span>
            ))}
          </div>
        </div>

        <div className="relative flex flex-col gap-4 border-t border-rule/60 p-4 sm:p-5 md:flex-row md:items-end md:gap-0 md:p-6">
          <SearchField
            label={props.fromLabel}
            value={props.areas[0]}
            className="md:flex-1 md:border-r md:border-rule/60 md:pr-6"
          />
          <SearchField
            label={props.typeLabel}
            value={props.typePlaceholder}
            className="md:flex-1 md:border-r md:border-rule/60 md:px-6"
          />
          <SearchField
            label={props.budgetLabel}
            value={props.budgetPlaceholder}
            className="md:flex-1 md:px-6"
          />

          <Link
            href={props.ctaHref}
            className="group ml-auto mt-2 inline-flex items-center gap-2 self-end rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-paper transition-transform hover:scale-[1.02] md:ml-4 md:mt-0"
          >
            {props.ctaPrimary}
            <span className="grid size-7 place-items-center rounded-full bg-ember text-paper transition-transform group-hover:rotate-12">
              <ArrowUpRightIcon className="size-3.5" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function SearchField({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 px-2 py-1 ${className ?? ""}`}>
      <span className="text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft">
        {label}
      </span>
      <span className="text-sm font-medium text-ink">{value}</span>
    </div>
  );
}

function AboutCollage(props: {
  label: string;
  headline: string;
  body: string;
  feature1: string;
  feature2: string;
  feature3: string;
  reviewBadge: string;
  reviewBadgeCount: string;
  galleryCta: string;
  tagPropertyName: string;
  tagFeature1: string;
  tagFeature2: string;
}) {
  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-14">
      <div className="flex flex-col gap-6 md:col-span-5 md:pt-8">
        <span className="slash-label text-2xl md:text-3xl">{props.label}</span>
        <h2 className="font-display text-4xl italic leading-[1.05] tracking-tight text-ink md:text-5xl">
          {props.headline}
        </h2>
        <p className="max-w-md text-base text-ink-soft">{props.body}</p>

        <ul className="mt-2 flex flex-col gap-3 text-sm text-ink">
          {[props.feature1, props.feature2, props.feature3].map((line) => (
            <li key={line} className="flex items-start gap-3">
              <span className="mt-1.5 grid size-5 place-items-center rounded-full bg-ember/15 text-ember">
                <CheckIcon className="size-3.5" strokeWidth={2.5} />
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative md:col-span-7">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <CollageTile
              src={COLLAGE_A}
              aspect="aspect-[4/5]"
              className="rounded-[28px]"
            >
              <span className="glass-pill absolute left-3 top-3">
                <ShieldCheckIcon className="size-3" />
                {props.tagFeature1}
              </span>
              <div className="absolute bottom-3 left-3 right-3 rounded-2xl bg-paper/90 p-3 backdrop-blur-md">
                <p className="text-xs text-ink-soft">
                  <span className="italic text-ember">"</span>
                  {props.tagPropertyName}
                </p>
              </div>
            </CollageTile>

            <CollageTile
              src={COLLAGE_D}
              aspect="aspect-4/3"
              className="rounded-[28px]"
            >
              <Link
                href="/login"
                className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-paper px-4 py-2 text-xs font-medium text-ink shadow-sm transition-colors hover:bg-ink hover:text-paper"
              >
                {props.galleryCta}
                <ArrowUpRightIcon className="size-3" />
              </Link>
            </CollageTile>
          </div>

          <div className="flex flex-col gap-3 pt-8 sm:gap-4 sm:pt-12">
            <CollageTile
              src={COLLAGE_B}
              aspect="aspect-4/3"
              className="rounded-[28px]"
            >
              <button
                type="button"
                className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-xs font-medium text-ink shadow-sm"
              >
                <StarIcon className="size-3 fill-ember text-ember" />
                {props.reviewBadge}
                <ArrowUpRightIcon className="size-3" />
              </button>
            </CollageTile>

            <CollageTile
              src={COLLAGE_C}
              aspect="aspect-[4/5]"
              className="rounded-[28px]"
            >
              <span className="glass-pill absolute left-3 top-3">
                <CheckIcon className="size-3" />
                {props.tagFeature2}
              </span>
              <div className="absolute bottom-3 left-3 right-3 flex justify-end">
                <SatisfiedAvatars count={props.reviewBadgeCount} label={props.reviewBadge} />
              </div>
            </CollageTile>
          </div>
        </div>
      </div>
    </div>
  );
}

function CollageTile({
  src,
  aspect,
  className,
  children,
}: {
  src: string;
  aspect: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`relative overflow-hidden ${aspect} ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="absolute inset-0 size-full object-cover transition-transform duration-700 hover:scale-[1.04]"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-linear-to-t from-ink/35 via-transparent to-transparent" />
      {children}
    </div>
  );
}

function SatisfiedAvatars({ count, label }: { count: string; label: string }) {
  const initials = ["আ", "ম", "ত", "র"];
  const tints = ["bg-ember", "bg-clay", "bg-ink", "bg-ember-soft"];

  return (
    <div className="flex items-center gap-2 rounded-full bg-paper/95 p-1 pr-3 backdrop-blur-sm shadow-sm">
      <div className="flex -space-x-2">
        {initials.map((char, index) => (
          <span
            key={char}
            className={`grid size-7 place-items-center rounded-full border-2 border-paper text-[0.7rem] font-semibold text-paper ${tints[index] ?? "bg-ink"}`}
          >
            {char}
          </span>
        ))}
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-[0.65rem] text-ink-soft">{label}</span>
        <span className="font-display italic text-sm text-ink">{count}</span>
      </div>
    </div>
  );
}

function StatsRow({
  label,
  stats,
}: {
  label: string;
  stats: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <div className="mb-8 flex items-end justify-between gap-4">
        <span className="slash-label text-2xl md:text-3xl">{label}</span>
        <div className="hidden h-px flex-1 bg-rule md:block" />
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-12">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`flex flex-col gap-2 ${
              index < stats.length - 1 ? "md:border-r md:border-rule md:pr-12" : ""
            }`}
          >
            <span className="font-display text-6xl italic leading-none text-ink md:text-7xl">
              {stat.value}
            </span>
            <span className="text-sm text-ink-soft">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureList({
  features,
}: {
  features: { title: string; body: string; icon: typeof CheckIcon }[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="group relative flex flex-col gap-4 overflow-hidden rounded-[28px] border border-rule/60 bg-paper p-7 transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_oklch(0.30_0.04_60/0.35)]"
        >
          <div className="flex size-12 items-center justify-center rounded-2xl bg-ember/15 text-ember">
            <feature.icon className="size-6" />
          </div>
          <h3 className="font-display text-2xl italic leading-tight text-ink">
            {feature.title}
          </h3>
          <p className="text-sm text-ink-soft">{feature.body}</p>
          <div className="absolute -right-8 -top-8 size-32 rounded-full bg-ember-soft/40 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      ))}
    </div>
  );
}

function Footer({
  appName,
  note,
  city,
}: {
  appName: string;
  note: string;
  city: string;
}) {
  return (
    <footer className="relative border-t border-rule/60">
      <div className="mx-auto flex w-full max-w-330 flex-col items-start justify-between gap-6 px-4 py-12 sm:flex-row sm:items-end sm:px-6 md:px-8 md:py-16">
        <div className="flex flex-col gap-3">
          <span className="text-2xl font-semibold tracking-tight text-ink">
            {appName}
          </span>
          <span className="text-sm text-ink-soft">{note}</span>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <span className="text-xs uppercase tracking-[0.2em] text-ink-soft">
            © {new Date().getFullYear()}
          </span>
          <span className="text-sm text-ink">{city}</span>
        </div>
      </div>
    </footer>
  );
}
