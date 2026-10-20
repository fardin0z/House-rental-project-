import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ArrowUpRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MailIcon,
  PhoneIcon,
} from "lucide-react";
import { getCurrentSession } from "@/lib/auth/guards";
import {
  getApprovedListings,
  getLandingStats,
  type ListingWithImages,
} from "@/lib/listings/queries";
import { LISTING_BUCKET, publicStorageUrl } from "@/lib/storage/paths";
import { AppHeader } from "@/components/shared/app-header";
import { Logo } from "@/components/shared/logo";
import { HeroSearch } from "@/components/landing/hero-search";
import { NewUserGate } from "@/components/landing/new-user-gate";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2200&q=90&auto=format&fit=crop";
const HELP_IMAGE =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=90&auto=format&fit=crop";
const TESTIMONIAL_IMAGE =
  "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1800&q=90&auto=format&fit=crop";
const REVIEW_AVATAR_1 =
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=90&auto=format&fit=crop&crop=faces";
const REVIEW_AVATAR_2 =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=90&auto=format&fit=crop&crop=faces";

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=90&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=900&q=90&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=90&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1613553497126-a44624272024?w=900&q=90&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=900&q=90&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=900&q=90&auto=format&fit=crop",
];

async function loadFeatured(): Promise<ListingWithImages[]> {
  try {
    return await getApprovedListings({ limit: 6 });
  } catch {
    return [];
  }
}

async function loadStats(): Promise<{ activeListings: number; cities: number }> {
  try {
    return await getLandingStats();
  } catch {
    return { activeListings: 0, cities: 0 };
  }
}

const BN_FMT = new Intl.NumberFormat("bn-BD");

function bn(n: number | null | undefined): string {
  if (n == null) return "";
  return BN_FMT.format(n);
}

function buildSpec(listing: ListingWithImages, t: {
  beds: string;
  baths: string;
  sqft: string;
}): string {
  const parts: string[] = [];
  if (listing.beds != null) parts.push(`${bn(listing.beds)} ${t.beds}`);
  if (listing.baths != null) parts.push(`${bn(listing.baths)} ${t.baths}`);
  if (listing.area_sqft != null) parts.push(`${bn(listing.area_sqft)} ${t.sqft}`);
  return parts.join("  |  ");
}

export default async function HomePage() {
  const t = await getTranslations("landing");
  const tCommon = await getTranslations("common");
  const tListings = await getTranslations("listings");
  const session = await getCurrentSession();
  const isAuthed = Boolean(session);
  const browseHref = "/properties";
  const [featured, liveStats] = await Promise.all([loadFeatured(), loadStats()]);

  const specWords = {
    beds: tListings("beds"),
    baths: tListings("baths"),
    sqft: tListings("sqft"),
  };

  const navLinks = [
    { label: t("navRent"), href: "/properties", active: true },
    { label: t("navAreas"), href: "#featured", active: false },
    { label: t("navHow"), href: "#help", active: false },
    { label: t("navWhy"), href: "#why", active: false },
    { label: t("navContact"), href: "/support", active: false },
  ];

  const typeOptions = [
    { value: "family_flat", label: "ফ্যামিলি ফ্ল্যাট" },
    { value: "bachelor", label: "ব্যাচেলর" },
    { value: "sublet", label: "সাবলেট" },
    { value: "office", label: "অফিস" },
    { value: "shop", label: "দোকান" },
  ];

  const priceOptions = [
    { value: "0-10000", label: "১০,০০০ এর নিচে" },
    { value: "10000-20000", label: "১০,০০০ — ২০,০০০" },
    { value: "20000-40000", label: "২০,০০০ — ৪০,০০০" },
    { value: "40000-", label: "৪০,০০০+" },
  ];

  const stats = [
    {
      value: liveStats.activeListings > 0 ? bn(liveStats.activeListings) : t("stat1Value"),
      label: t("stat1Label"),
    },
    { value: t("stat2Value"), label: t("stat2Label") },
    {
      value: liveStats.cities > 0 ? bn(liveStats.cities) : t("stat3Value"),
      label: t("stat3Label"),
    },
    { value: t("stat4Value"), label: t("stat4Label") },
  ];

  const featuredCards: FeaturedCard[] = featured.map((l, i) => ({
    listing: l,
    image: l.images?.[0]
      ? publicStorageUrl(LISTING_BUCKET, l.images[0].path)
      : SAMPLE_IMAGES[i % SAMPLE_IMAGES.length],
    accent: i === 1,
    spec: buildSpec(l, specWords),
  }));

  return (
    <>
      {!isAuthed ? <NewUserGate /> : null}
      <main className="w-full bg-white text-[#161616]">
      <Hero
        navLinks={navLinks}
        title={t("heroTitle")}
        subhead={t("heroSubhead")}
        searchLabels={{
          location: t("searchLocationLabel"),
          type: t("searchTypeLabel"),
          price: t("searchPriceLabel"),
        }}
        searchValues={{
          location: t("searchLocationValue"),
          type: t("searchTypeValue"),
          price: t("searchPriceValue"),
        }}
        typeOptions={typeOptions}
        priceOptions={priceOptions}
        primaryCta={{ label: t("ctaPrimary"), href: browseHref }}
        secondaryCta={{
          label: t("ctaSecondary"),
          href: isAuthed ? "/listings/new" : "/signup",
        }}
      />

      <HelpSection
        title={t("helpTitle")}
        verifiedValue={t("verifiedBadgeValue")}
        verifiedLabel={t("verifiedBadgeLabel")}
        leftTitle={t("helpLeftTitle")}
        leftBody={t("helpLeftBody")}
        centerBadge={t("helpCenterBadge")}
        rightTitle={t("helpRightTitle")}
        rightBody={t("helpRightBody")}
      />

      <StatsRow stats={stats} />

      <FeaturedSection
        title={t("featuredTitle")}
        subtitle={t("featuredSubtitle")}
        cta={t("featuredCta")}
        ctaHref={browseHref}
        badge={t("featuredBadge")}
        priceLabel={t("featuredPriceLabel")}
        emptyTitle={t("featuredEmptyTitle")}
        emptyBody={t("featuredEmptyBody")}
        emptyCta={t("featuredEmptyCta")}
        emptyCtaHref={isAuthed ? "/listings/new" : "/signup"}
        cards={featuredCards}
      />

      <Testimonials
        title={t("reviewsTitle")}
        subtitle={t("reviewsSubtitle")}
        t1={{
          title: t("review1Title"),
          body: t("review1Body"),
          name: t("review1Name"),
          role: t("review1Role"),
          avatar: REVIEW_AVATAR_1,
        }}
        t2={{
          title: t("review2Title"),
          body: t("review2Body"),
          name: t("review2Name"),
          role: t("review2Role"),
          avatar: REVIEW_AVATAR_2,
        }}
      />

      <JoinSection
        line1={t("joinTitle1")}
        line2={t("joinTitle2")}
        href={browseHref}
      />

      <SiteFooter
        brand={t("footerBrand")}
        tagline={t("footerNote")}
        linksTitle={t("footerLinksTitle")}
        legalTitle={t("footerLegalTitle")}
        contactTitle={t("footerContact")}
        emailLabel={t("footerEmailLabel")}
        phoneLabel={t("footerPhoneLabel")}
        copyright={t("footerCopyright")}
        labels={{
          properties: t("footerLinkProperties"),
          support: t("footerLinkSupport"),
          privacy: t("footerLinkPrivacy"),
          terms: t("footerLinkTerms"),
        }}
      />
    </main>
    </>
  );
}

async function Hero(props: {
  navLinks: { label: string; href: string; active: boolean }[];
  title: string;
  subhead: string;
  searchLabels: { location: string; type: string; price: string };
  searchValues: { location: string; type: string; price: string };
  typeOptions: { value: string; label: string }[];
  priceOptions: { value: string; label: string }[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}) {
  return (
    <section className="relative mx-6 mt-6 h-[680px] overflow-hidden rounded-[18px] bg-[#111] max-[900px]:mx-3 max-[900px]:mt-3 max-[900px]:h-[900px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="absolute inset-0 h-full w-full object-cover saturate-[.78] brightness-[.86]"
        src={HERO_IMAGE}
        alt=""
      />
      <div className="hero-overlay absolute inset-0 z-[1]" />

      <AppHeader variant="floating" navLinks={props.navLinks} />

      <div className="absolute bottom-[125px] left-[34px] right-[34px] z-[4] grid grid-cols-[1.35fr_.92fr] items-end gap-9 max-[900px]:bottom-[420px] max-[900px]:left-5 max-[900px]:right-5 max-[900px]:grid-cols-1 max-[900px]:gap-4">
        <h1 className="m-0 text-[clamp(44px,5.8vw,86px)] font-bold leading-[1.02] tracking-tight text-white/95 max-[900px]:text-[38px] max-[900px]:leading-[1.05]">
          {props.title}
        </h1>
        <div>
          <p className="mb-5 max-w-[460px] text-[18px] font-medium leading-[1.35] text-white/90 max-[900px]:text-[16px]">
            {props.subhead}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={props.primaryCta.href}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-greenx px-6 text-[14px] font-bold text-black transition hover:scale-[1.03]"
            >
              {props.primaryCta.label}
              <ArrowUpRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href={props.secondaryCta.href}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 text-[14px] font-bold text-white backdrop-blur-xl transition hover:bg-white/20"
            >
              {props.secondaryCta.label}
              <ArrowUpRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="search-pocket">
        <HeroSearch
          labels={props.searchLabels}
          values={props.searchValues}
          typeOptions={props.typeOptions}
          priceOptions={props.priceOptions}
        />
      </div>
    </section>
  );
}

function HelpSection({
  title,
  verifiedValue,
  verifiedLabel,
  leftTitle,
  leftBody,
  centerBadge,
  rightTitle,
  rightBody,
}: {
  title: string;
  verifiedValue: string;
  verifiedLabel: string;
  leftTitle: string;
  leftBody: string;
  centerBadge: string;
  rightTitle: string;
  rightBody: string;
}) {
  return (
    <section id="help" className="mx-auto max-w-7xl px-6 pb-16 pt-24 md:pt-28">
      <h2 className="mx-auto max-w-[520px] text-center text-[28px] font-semibold leading-[1.15] tracking-tight md:text-[38px]">
        {renderLines(title)}
      </h2>

      <div className="mt-12 grid grid-cols-1 items-center gap-10 md:grid-cols-[1fr_1.05fr_1fr]">
        <div>
          <div className="mx-auto flex h-[126px] w-[140px] flex-col items-center justify-center rounded-xl border border-black/10 md:mx-0">
            <div className="text-[36px] font-bold leading-none tracking-tight text-greenx">
              {verifiedValue}
              <span className="align-top text-[18px]">%</span>
            </div>
            <p className="mt-2 whitespace-pre-line text-center text-[11px] leading-tight text-black/60">
              {verifiedLabel}
            </p>
          </div>
          <h3 className="mt-20 text-[20px] font-semibold leading-tight tracking-tight md:mt-28">
            {renderLines(leftTitle)}
          </h3>
          <p className="mt-2 max-w-[230px] text-[13px] leading-relaxed text-black/60">
            {leftBody}
          </p>
        </div>

        <div className="img-zoom relative aspect-[4/5] overflow-hidden rounded-[20px] bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HELP_IMAGE}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute bottom-[-1px] right-[-1px] h-[124px] w-[124px] rounded-tl-[18px] bg-greenx p-4 text-black">
            <p className="whitespace-pre-line text-[12px] font-semibold leading-[1.15] tracking-tight">
              {centerBadge}
            </p>
            <span className="absolute bottom-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-black">
              <ArrowUpRightIcon className="h-4 w-4" />
            </span>
          </div>
        </div>

        <div className="md:pl-8">
          <h3 className="text-[20px] font-semibold leading-tight tracking-tight">
            {renderLines(rightTitle)}
          </h3>
          <p className="mt-2 max-w-[240px] text-[13px] leading-relaxed text-black/60">
            {rightBody}
          </p>
        </div>
      </div>
    </section>
  );
}

function StatsRow({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((s, i) => (
          <div key={`${s.label}-${i}`} className="relative">
            <span className="text-[64px] font-bold leading-none tracking-tight text-[#cfcfcf] md:text-[78px] tabular-nums">
              {s.value}
            </span>
            <span className="align-top text-2xl font-bold text-greenx">+</span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black px-3 py-1 text-[10px] font-medium text-white">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

type FeaturedCard = {
  listing: ListingWithImages;
  image: string;
  accent: boolean;
  spec: string;
};

function FeaturedSection({
  title,
  subtitle,
  cta,
  ctaHref,
  badge,
  priceLabel,
  emptyTitle,
  emptyBody,
  emptyCta,
  emptyCtaHref,
  cards,
}: {
  title: string;
  subtitle: string;
  cta: string;
  ctaHref: string;
  badge: string;
  priceLabel: string;
  emptyTitle: string;
  emptyBody: string;
  emptyCta: string;
  emptyCtaHref: string;
  cards: FeaturedCard[];
}) {
  const hasCards = cards.length > 0;
  return (
    <section
      id="featured"
      className="mx-auto max-w-7xl rounded-[14px] bg-panel px-5 py-10 md:px-7 md:py-12"
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-[28px] font-semibold leading-tight tracking-tight md:text-[36px]">
            {title}
          </h2>
          <p className="mt-3 max-w-[500px] text-[13px] leading-relaxed text-black/55">
            {subtitle}
          </p>
        </div>
        {hasCards ? (
          <Link
            href={ctaHref}
            className="inline-flex h-9 w-fit items-center rounded-full bg-greenx px-5 text-[12px] font-bold text-black md:mt-6"
          >
            {cta}
          </Link>
        ) : null}
      </div>

      {hasCards ? (
        <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c, i) => (
            <FeaturedItem
              key={i}
              card={c}
              badge={badge}
              priceLabel={priceLabel}
            />
          ))}
        </div>
      ) : (
        <FeaturedEmpty
          title={emptyTitle}
          body={emptyBody}
          cta={emptyCta}
          ctaHref={emptyCtaHref}
        />
      )}
    </section>
  );
}

function FeaturedEmpty({
  title,
  body,
  cta,
  ctaHref,
}: {
  title: string;
  body: string;
  cta: string;
  ctaHref: string;
}) {
  return (
    <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-black/10 bg-white px-6 py-10 md:items-center md:px-10 md:py-16 md:text-center">
      <h3 className="text-[20px] font-semibold tracking-tight md:text-[24px]">
        {title}
      </h3>
      <p className="max-w-[480px] text-[13px] leading-relaxed text-black/55">
        {body}
      </p>
      <Link
        href={ctaHref}
        className="mt-2 inline-flex h-10 items-center gap-2 rounded-full bg-greenx px-5 text-[12px] font-bold text-black"
      >
        {cta}
        <ArrowUpRightIcon className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function FeaturedItem({
  card,
  badge,
  priceLabel,
}: {
  card: FeaturedCard;
  badge: string;
  priceLabel: string;
}) {
  const spec = card.spec;
  const title = card.listing.title ?? "—";
  const body = card.listing.area_name ?? "";
  const price = card.listing.rent
    ? new Intl.NumberFormat("bn-BD").format(card.listing.rent)
    : "";
  const href = `/properties/${card.listing.id}`;

  return (
    <article>
      <Link href={href} className="block">
        <div className="img-zoom relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src={card.image}
            alt={title}
          />
          <span className="absolute left-3 top-3 z-[3] rounded-full bg-white px-3 py-1 text-[10px] font-bold text-black">
            {badge}
          </span>
          <div className="arrow-pocket">
            <span className={`arrow-btn ${card.accent ? "active" : ""}`}>
              <ArrowUpRightIcon className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
      <p className="mt-4 text-[11px] text-black/45">{spec}</p>
      <h3 className="mt-2 text-[18px] font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-[12.5px] leading-relaxed text-black/60">{body}</p>
      <p className="mt-3 text-[12.5px]">
        <b>{priceLabel}:</b> ৳ {price}
      </p>
    </article>
  );
}

function Testimonials({
  title,
  subtitle,
  t1,
  t2,
}: {
  title: string;
  subtitle: string;
  t1: {
    title: string;
    body: string;
    name: string;
    role: string;
    avatar: string;
  };
  t2: {
    title: string;
    body: string;
    name: string;
    role: string;
    avatar: string;
  };
}) {
  return (
    <section
      id="why"
      className="relative mx-auto mt-16 min-h-[570px] max-w-7xl overflow-hidden rounded-[18px] bg-[#111]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={TESTIMONIAL_IMAGE}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 z-[1] bg-black/55" />

      <div className="side-pocket left">
        <button
          type="button"
          aria-label="prev"
          className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-greenx text-black"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="side-pocket right">
        <button
          type="button"
          aria-label="next"
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-greenx text-black"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="relative z-10 px-8 py-16 md:py-20">
        <h2 className="text-center text-[28px] font-semibold leading-tight tracking-tight text-white md:text-[38px]">
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-[520px] text-center text-[13px] leading-relaxed text-white/75">
          {subtitle}
        </p>

        <div className="mx-auto mt-12 grid max-w-[840px] grid-cols-1 gap-5 md:grid-cols-2">
          <ReviewCard data={t1} />
          <ReviewCard data={t2} />
        </div>
      </div>
    </section>
  );
}

function ReviewCard({
  data,
}: {
  data: { title: string; body: string; name: string; role: string; avatar: string };
}) {
  return (
    <figure className="rounded-[12px] bg-white p-7">
      <h3 className="text-[15px] font-bold tracking-tight">{data.title}</h3>
      <p className="mt-3 text-[13px] leading-relaxed text-black/65">{data.body}</p>
      <figcaption className="mt-7 flex items-center justify-between border-t border-black/5 pt-5">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.avatar}
            className="h-12 w-12 rounded-md object-cover"
            alt=""
          />
          <div>
            <div className="text-[12.5px] font-bold">{data.name}</div>
            <div className="text-[11px] text-black/55">{data.role}</div>
          </div>
        </div>
        <div className="text-[70px] leading-none text-black/5">”</div>
      </figcaption>
    </figure>
  );
}

function JoinSection({
  line1,
  line2,
  href,
}: {
  line1: string;
  line2: string;
  href: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:py-28">
      <div className="flex items-start justify-between gap-8">
        <h2 className="text-[56px] font-bold leading-[0.95] tracking-tight text-[#303236] md:text-[128px]">
          {line1}
          <br />
          {line2}
        </h2>
        <Link
          href={href}
          aria-label={`${line1} ${line2}`}
          className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[10px] bg-greenx text-black transition-transform hover:scale-[1.03] md:h-28 md:w-28"
        >
          <ArrowUpRightIcon className="h-12 w-12" strokeWidth={2.25} />
        </Link>
      </div>
    </section>
  );
}

function SiteFooter({
  brand,
  tagline,
  linksTitle,
  legalTitle,
  contactTitle,
  emailLabel,
  phoneLabel,
  copyright,
  labels,
}: {
  brand: string;
  tagline: string;
  linksTitle: string;
  legalTitle: string;
  contactTitle: string;
  emailLabel: string;
  phoneLabel: string;
  copyright: string;
  labels: {
    properties: string;
    support: string;
    privacy: string;
    terms: string;
  };
}) {
  return (
    <footer className="mx-auto mb-6 max-w-7xl rounded-[14px] bg-[#101010] px-6 py-10 text-white md:mb-8 md:px-10 md:py-12">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
        <div>
          <Logo size="md" variant="dark" ariaLabel={brand} />
          <p className="mt-4 max-w-[320px] text-[12px] leading-relaxed text-white/55">
            {tagline}
          </p>
        </div>

        <div>
          <h4 className="text-[12px] font-semibold">{linksTitle}</h4>
          <ul className="mt-5 space-y-3 text-[12px] text-white/60">
            <li>
              <Link href="/properties" className="transition hover:text-white">
                {labels.properties}
              </Link>
            </li>
            <li>
              <Link href="/support" className="transition hover:text-white">
                {labels.support}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[12px] font-semibold">{legalTitle}</h4>
          <ul className="mt-5 space-y-3 text-[12px] text-white/60">
            <li>
              <Link href="/privacy" className="transition hover:text-white">
                {labels.privacy}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="transition hover:text-white">
                {labels.terms}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[12px] font-semibold">{contactTitle}</h4>
          <ul className="mt-5 space-y-4 text-[12px] text-white/70">
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-greenx text-black">
                <MailIcon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-[10px] uppercase tracking-wider text-white/40">
                  {emailLabel}
                </span>
                hi@toletzoo.com
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-greenx text-black">
                <PhoneIcon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-[10px] uppercase tracking-wider text-white/40">
                  {phoneLabel}
                </span>
                +45 91 69 88 47
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-10 border-t border-white/10 pt-6 text-[11px] text-white/50 md:mt-12 md:pt-7">
        {copyright}
      </div>
    </footer>
  );
}

function renderLines(text: string) {
  return text.split("\n").map((line, i, arr) => (
    <span key={i}>
      {line}
      {i < arr.length - 1 ? <br /> : null}
    </span>
  ));
}
