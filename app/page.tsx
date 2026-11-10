import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ArrowUpRightIcon,
  MailIcon,
  PhoneIcon,
} from "lucide-react";
import { getCurrentSession } from "@/lib/auth/guards";
import {
  getApprovedListings,
  type ListingWithImages,
} from "@/lib/listings/queries";
import { LISTING_BUCKET, publicStorageUrl } from "@/lib/storage/paths";
import { AppHeader } from "@/components/shared/app-header";
import { Logo } from "@/components/shared/logo";
import { HeroSearch } from "@/components/landing/hero-search";
import { NewUserGate } from "@/components/landing/new-user-gate";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2200&q=90&auto=format&fit=crop";

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
    return await getApprovedListings({ limit: 60 });
  } catch {
    return [];
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
}): string {
  const parts: string[] = [];
  if (listing.beds != null) parts.push(`${bn(listing.beds)} ${t.beds}`);
  if (listing.baths != null) parts.push(`${bn(listing.baths)} ${t.baths}`);
  return parts.join("  |  ");
}

export default async function HomePage() {
  const t = await getTranslations("landing");
  const tListings = await getTranslations("listings");
  const session = await getCurrentSession();
  const isAuthed = Boolean(session);
  const browseHref = "/properties";
  const featured = await loadFeatured();

  const specWords = {
    beds: tListings("beds"),
    baths: tListings("baths"),
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
        primaryCta={{
          label: t("ctaSecondary"),
          href: isAuthed ? "/listings/new" : "/signup?role=landlord",
        }}
        secondaryCta={{
          label: t("ctaPrimary"),
          href: browseHref,
        }}
      />

      <LandlordIntroSection
        title={t("helpTitle")}
        body={t("helpLeftBody")}
        badge={t("helpCenterBadge")}
        stepsTitle={t("helpRightTitle")}
        stepsBody={t("helpRightBody")}
        cta={t("ctaSecondary")}
        href={isAuthed ? "/listings/new" : "/signup?role=landlord"}
      />

      <LandlordSteps
        title={t("stepsTitle")}
        items={[
          { title: t("step1Title"), body: t("step1Body") },
          { title: t("step2Title"), body: t("step2Body") },
          { title: t("step3Title"), body: t("step3Body") },
        ]}
      />

      <CategoryStrip />

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

      <TrustSection
        title={t("trustTitle")}
        body={t("trustBody")}
        items={[t("trust1"), t("trust2"), t("trust3")]}
        cta={t("ctaSecondary")}
        href={isAuthed ? "/listings/new" : "/signup?role=landlord"}
      />

      <JoinSection
        line1={t("joinTitle1")}
        line2={t("joinTitle2")}
        href={isAuthed ? "/listings/new" : "/signup?role=landlord"}
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

function LandlordIntroSection({
  title,
  body,
  badge,
  stepsTitle,
  stepsBody,
  cta,
  href,
}: {
  title: string;
  body: string;
  badge: string;
  stepsTitle: string;
  stepsBody: string;
  cta: string;
  href: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-12 pt-24 md:pt-28">
      <div className="grid items-center gap-10 rounded-[24px] bg-[#f2f7ee] p-7 md:grid-cols-[1.05fr_.95fr] md:p-12">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-green-700">ToletZoo for landlords</p>
          <h2 className="mt-4 max-w-[560px] text-[32px] font-semibold leading-[1.08] tracking-tight md:text-[48px]">{renderLines(title)}</h2>
          <p className="mt-5 max-w-[500px] text-[15px] leading-relaxed text-black/65">{body}</p>
          <Link href={href} className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-greenx px-6 text-[14px] font-bold text-black transition hover:scale-[1.02]">
            {cta}<ArrowUpRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="relative min-h-[250px] overflow-hidden rounded-[20px] bg-[#151515] p-7 text-white md:min-h-[320px] md:p-10">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-greenx/20 blur-2xl" />
          <p className="relative whitespace-pre-line text-[28px] font-semibold leading-[1.08] tracking-tight md:text-[42px]">{badge}</p>
          <div className="absolute bottom-7 left-7 right-7 border-t border-white/15 pt-5 md:bottom-10 md:left-10 md:right-10">
            <h3 className="text-[17px] font-bold">{stepsTitle}</h3>
            <p className="mt-2 max-w-[360px] text-[13px] leading-relaxed text-white/65">{stepsBody}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandlordSteps({ title, items }: { title: string; items: { title: string; body: string }[] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24 pt-12">
      <h2 className="max-w-[520px] text-[30px] font-semibold leading-tight tracking-tight md:text-[42px]">{renderLines(title)}</h2>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {items.map((item, index) => (
          <article key={item.title} className="rounded-[20px] border border-black/10 p-6">
            <span className="text-[54px] font-bold leading-none text-black/15">০{index + 1}</span>
            <h3 className="mt-8 text-[19px] font-bold tracking-tight">{item.title}</h3>
            <p className="mt-3 text-[13px] leading-relaxed text-black/60">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function TrustSection({ title, body, items, cta, href }: { title: string; body: string; items: string[]; cta: string; href: string }) {
  return (
    <section className="mx-auto mt-8 max-w-7xl rounded-[24px] bg-[#111] px-7 py-14 text-white md:px-12 md:py-20">
      <div className="grid gap-10 md:grid-cols-[1.05fr_.95fr] md:items-end">
        <div>
          <h2 className="max-w-[540px] text-[30px] font-semibold leading-tight tracking-tight md:text-[44px]">{renderLines(title)}</h2>
          <p className="mt-5 max-w-[520px] text-[14px] leading-relaxed text-white/65">{body}</p>
          <Link href={href} className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-greenx px-6 text-[14px] font-bold text-black transition hover:scale-[1.02]">
            {cta}<ArrowUpRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-3">
          {items.map((item) => <div key={item} className="rounded-[16px] border border-white/15 px-5 py-4 text-[15px] font-semibold"><span className="mr-3 text-greenx">✓</span>{item}</div>)}
        </div>
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

function CategoryStrip() {
  const categories = [
    { label: "সব বিজ্ঞাপন", href: "/properties" },
    { label: "ফ্যামিলি", href: "/properties?type=family_flat" },
    { label: "ব্যাচেলর", href: "/properties?type=bachelor" },
    { label: "অফিস", href: "/properties?type=office" },
    { label: "সাবলেট", href: "/properties?type=sublet" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 md:px-6">
      <div className="scroll-soft flex gap-3 overflow-x-auto pb-2" aria-label="বিজ্ঞাপনের ধরন">
        {categories.map((category, index) => (
          <Link
            key={category.href}
            href={category.href}
            className={`shrink-0 rounded-full border px-6 py-3 text-[15px] font-bold transition ${
              index === 0
                ? "border-lime-500 bg-lime-400 text-ink-900"
                : "border-ink-100 bg-white text-ink-700 hover:border-lime-400"
            }`}
          >
            {category.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

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
