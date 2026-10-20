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
