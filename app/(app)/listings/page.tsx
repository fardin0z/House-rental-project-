import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowUpRightIcon, PlusIcon, ShieldCheckIcon } from "lucide-react";
import { requireProfile } from "@/lib/auth/guards";
import { getMyListings } from "@/lib/listings/queries";
import { ListingCard } from "@/components/listings/listing-card";

export default async function ListingsIndexPage() {
  const profile = await requireProfile();
  const t = await getTranslations("listings");

  if (profile.role !== "landlord") {
    redirect("/properties");
  }

  const labels = {
    pending: t("statusPending"),
    approved: t("statusApproved"),
    rejected: t("statusRejected"),
    draft: t("statusDraft"),
    archived: t("statusArchived"),
    rent: t("rent"),
    noImage: t("noImage"),
    beds: t("beds"),
    baths: t("baths"),
    sqft: t("sqft"),
    edit: t("edit"),
    view: t("view"),
  };

  const listings = await getMyListings(profile.id);
  const unverified = profile.nid_status !== "approved";

  return (
    <div>
      <section className="mx-auto max-w-7xl px-6 pb-8 pt-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-[24px] italic leading-none text-lime-600">
              {t("ownerLabel")}
            </p>
            <h1 className="font-display mt-6 text-[56px] italic leading-[.88] tracking-tight text-ink-900 md:text-[88px]">
              {t("myListingsTitle")}
            </h1>
            <p className="mt-7 max-w-[420px] text-[15px] font-medium leading-relaxed text-ink-500">
              {t("myListingsSubtitle")}
            </p>
          </div>

          <Link
            href="/listings/new"
            className="inline-flex h-14 w-fit items-center justify-center rounded-full bg-ink-900 pl-6 pr-2 text-[15px] font-bold text-white transition hover:bg-ink-700"
          >
            <PlusIcon className="mr-3 h-5 w-5" />
            {t("newListing")}
            <span className="ml-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-lime-400 text-ink-900">
              <ArrowUpRightIcon className="h-5 w-5" />
            </span>
          </Link>
        </div>
      </section>

      {unverified ? (
        <section className="mx-auto max-w-7xl px-6">
          <div className="verify-strip rounded-[28px] border border-ink-900/10 p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-5">
                <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-lime-400/20 text-lime-600">
                  <ShieldCheckIcon className="h-7 w-7" />
                </span>
                <div>
                  <h2 className="font-display text-[26px] italic leading-none text-ink-900 md:text-[30px]">
                    {t("verifyPromptHeading")}
                  </h2>
                  <p className="mt-3 max-w-[640px] text-[14px] font-medium leading-relaxed text-ink-500 md:text-[15px]">
                    {t("verifyPromptBody")}
                  </p>
                </div>
              </div>
              <Link
                href="/onboarding/nid"
                className="inline-flex h-11 w-fit items-center justify-center rounded-full border border-ink-900/10 bg-white px-6 text-[14px] font-bold text-ink-900 transition hover:bg-ink-50"
              >
                {t("verifyPromptCta")}
                <ArrowUpRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-6 py-10">
        {listings.length === 0 ? (
          <EmptyState
            heading={t("ownerEmpty")}
            body={t("ownerEmptyBody")}
            ctaHref="/listings/new"
            ctaLabel={t("newListing")}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                labels={labels}
                ownerView
              />
            ))}
            <Link
              href="/listings/new"
              className="hidden min-h-[520px] flex-col items-center justify-center rounded-[24px] border border-dashed border-ink-900/15 bg-white/55 p-6 text-center transition hover:bg-white xl:flex"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-lime-400 text-ink-900">
                <PlusIcon className="h-7 w-7" />
              </span>
              <span className="mt-5 block text-[18px] font-bold text-ink-900">
                {t("newListing")}
              </span>
              <span className="mt-2 block text-[13px] font-medium text-ink-500">
                {t("ownerEmptyBody")}
              </span>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyState({
  heading,
  body,
  ctaHref,
  ctaLabel,
}: {
  heading: string;
  body: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-[24px] border border-ink-900/10 bg-white px-6 py-10 md:items-center md:px-10 md:py-16 md:text-center">
      <h3 className="font-display text-[28px] italic leading-tight text-ink-900 md:text-[36px]">
        {heading}
      </h3>
      <p className="max-w-[480px] text-[14px] font-medium leading-relaxed text-ink-500">
        {body}
      </p>
      {ctaHref && ctaLabel ? (
        <Link
          href={ctaHref}
          className="mt-2 inline-flex h-11 items-center gap-2 rounded-full bg-ink-900 px-5 text-[13px] font-bold text-white transition hover:bg-ink-700"
        >
          <PlusIcon className="h-4 w-4" />
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
