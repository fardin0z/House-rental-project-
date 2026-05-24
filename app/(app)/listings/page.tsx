import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PlusIcon, ArrowUpRightIcon, ShieldCheckIcon } from "lucide-react";
import { requireProfile } from "@/lib/auth/guards";
import {
  getApprovedListings,
  getMyListings,
} from "@/lib/listings/queries";
import { ListingCard } from "@/components/listings/listing-card";

export default async function ListingsIndexPage() {
  const profile = await requireProfile();
  const t = await getTranslations("listings");

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

  if (profile.role === "landlord") {
    const listings = await getMyListings(profile.id);
    const unverified = profile.nid_status !== "approved";

    return (
      <div className="mx-auto w-full max-w-[1320px] px-4 py-10 sm:px-6 md:py-14">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-3">
            <span className="slash-label text-xl md:text-2xl">{t("ownerLabel")}</span>
            <h1 className="font-display text-4xl italic leading-tight text-ink md:text-5xl">
              {t("myListingsTitle")}
            </h1>
            <p className="max-w-xl text-sm text-ink-soft">{t("myListingsSubtitle")}</p>
          </div>
          <Link
            href="/listings/new"
            className="group inline-flex items-center gap-2 self-start rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-transform hover:scale-[1.02] sm:self-end"
          >
            <PlusIcon className="size-4" />
            {t("newListing")}
            <span className="grid size-7 place-items-center rounded-full bg-ember transition-transform group-hover:rotate-12">
              <ArrowUpRightIcon className="size-3.5" />
            </span>
          </Link>
        </div>

        {unverified ? (
          <VerifyPrompt
            heading={t("verifyPromptHeading")}
            body={t("verifyPromptBody")}
            cta={t("verifyPromptCta")}
          />
        ) : null}

        {listings.length === 0 ? (
          <EmptyState heading={t("ownerEmpty")} body={t("ownerEmptyBody")} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                labels={labels}
                ownerView
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const listings = await getApprovedListings();
  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 py-10 sm:px-6 md:py-14">
      <div className="mb-10 flex flex-col gap-3">
        <span className="slash-label text-xl md:text-2xl">{t("browseLabel")}</span>
        <h1 className="font-display text-4xl italic leading-tight text-ink md:text-5xl">
          {t("browseTitle")}
        </h1>
        <p className="max-w-xl text-sm text-ink-soft">{t("browseSubtitle")}</p>
      </div>

      {listings.length === 0 ? (
        <EmptyState heading={t("browseEmpty")} body={t("browseEmptyBody")} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              labels={labels}
              ownerView={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ heading, body }: { heading: string; body: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-rule bg-paper/70 px-6 py-16 text-center">
      <div className="font-display text-3xl italic text-ink">{heading}</div>
      <p className="max-w-md text-sm text-ink-soft">{body}</p>
    </div>
  );
}

function VerifyPrompt({
  heading,
  body,
  cta,
}: {
  heading: string;
  body: string;
  cta: string;
}) {
  return (
    <div className="mb-8 flex items-start gap-4 rounded-3xl border border-rule/60 bg-paper p-5 md:p-6">
      <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-ember/15 text-ember">
        <ShieldCheckIcon className="size-6" />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <h3 className="font-display text-xl italic text-ink">{heading}</h3>
        <p className="text-sm text-ink-soft">{body}</p>
      </div>
      <Link
        href="/onboarding/nid"
        className="inline-flex items-center gap-2 self-start rounded-full border border-rule px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink"
      >
        {cta}
        <ArrowUpRightIcon className="size-3.5" />
      </Link>
    </div>
  );
}
