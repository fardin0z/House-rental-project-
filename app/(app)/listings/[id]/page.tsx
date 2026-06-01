import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeftIcon,
  BedDoubleIcon,
  BathIcon,
  MessageCircleIcon,
  RulerIcon,
  MapPinIcon,
} from "lucide-react";
import { requireProfile } from "@/lib/auth/guards";
import { getListingById } from "@/lib/listings/queries";
import { openConversationWithLandlord } from "@/lib/chat/actions";
import { hasActivePremium } from "@/lib/payments/queries";
import { LISTING_BUCKET, publicStorageUrl } from "@/lib/storage/paths";
import { PremiumLock } from "@/components/listings/premium-lock";

export default async function ListingDetailPage(
  props: PageProps<"/listings/[id]">,
) {
  const profile = await requireProfile();
  const { id } = await props.params;

  const listing = await getListingById(id);
  if (!listing) notFound();

  const isOwner = listing.owner_id === profile.id;
  if (!isOwner && listing.status !== "approved") {
    redirect("/listings");
  }

  const canViewPremium =
    isOwner ||
    profile.role === "admin" ||
    (await hasActivePremium(profile.id));

  const t = await getTranslations("listings");
  const tChat = await getTranslations("chat");
  const cover = listing.images?.[0];
  const otherImages = (listing.images ?? []).slice(1);
  const openConversation = openConversationWithLandlord.bind(null, listing.id);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 md:py-14">
      <Link
        href="/listings"
        className="inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeftIcon className="size-4" />
        {t("backToListings")}
      </Link>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-canvas-deep md:col-span-2 md:aspect-[16/10]">
          {cover ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={publicStorageUrl(LISTING_BUCKET, cover.path)}
              alt={listing.title}
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-ink-soft">
              {t("noImage")}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
          {otherImages.slice(0, 4).map((image) => (
            <div
              key={image.id}
              className="relative aspect-square overflow-hidden rounded-2xl bg-canvas-deep"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={publicStorageUrl(LISTING_BUCKET, image.path)}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-3">
        <div className="md:col-span-2">
          <span className="slash-label text-xl md:text-2xl">
            {t(`rentalType.${listing.rental_type}`)}
          </span>
          <h1 className="mt-3 font-display text-4xl italic leading-tight text-ink md:text-5xl">
            {listing.title}
          </h1>
          <p className="mt-3 inline-flex items-center gap-2 text-base text-ink-soft">
            <MapPinIcon className="size-4 text-ember" />
            {[listing.area_name, listing.district, listing.division]
              .filter(Boolean)
              .join(", ")}
          </p>

          <div className="mt-7 flex flex-wrap gap-4 text-sm text-ink-soft">
            {listing.beds != null ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-rule bg-paper px-4 py-2">
                <BedDoubleIcon className="size-4" />
                {listing.beds} {t("beds")}
              </span>
            ) : null}
            {listing.baths != null ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-rule bg-paper px-4 py-2">
                <BathIcon className="size-4" />
                {listing.baths} {t("baths")}
              </span>
            ) : null}
            {listing.area_sqft != null ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-rule bg-paper px-4 py-2">
                <RulerIcon className="size-4" />
                {listing.area_sqft} {t("sqft")}
              </span>
            ) : null}
          </div>

          {listing.video_path ? (
            <div className="mt-10">
              <h2 className="font-display text-2xl italic text-ink">
                {t("videoTitle")}
              </h2>
              <div className="mt-3 overflow-hidden rounded-[28px] border border-rule/60 bg-ink">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video
                  src={publicStorageUrl(LISTING_BUCKET, listing.video_path)}
                  controls
                  className="aspect-video w-full"
                />
              </div>
            </div>
          ) : null}

          {listing.description ? (
            <div className="mt-10">
              <h2 className="font-display text-2xl italic text-ink">
                {t("aboutTitle")}
              </h2>
              {canViewPremium ? (
                <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-ink/80">
                  {listing.description}
                </p>
              ) : (
                <div className="mt-3">
                  <PremiumLock label={t("lockDescription")} cta={t("unlockCta")} />
                </div>
              )}
            </div>
          ) : null}
        </div>

        <aside className="md:sticky md:top-24 md:self-start">
          <div className="rounded-[28px] border border-rule/60 bg-paper p-6">
            <span className="text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft">
              {t("rent")}
            </span>
            {canViewPremium ? (
              <>
                <div className="mt-1 font-display text-5xl italic leading-none text-ink">
                  ৳ {listing.rent ? listing.rent.toLocaleString("bn-BD") : "—"}
                </div>
                <div className="mt-1 text-xs text-ink-soft">{t("perMonth")}</div>
              </>
            ) : (
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-5xl italic leading-none text-ink/30 blur-[6px] select-none">
                  ৳ ০০,০০০
                </span>
              </div>
            )}

            {isOwner ? (
              <Link
                href={`/listings/${listing.id}/edit`}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-rule px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-ink"
              >
                {t("edit")}
              </Link>
            ) : (
              <form action={openConversation} className="mt-6">
                <button
                  type="submit"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink-900 px-4 text-[14px] font-bold text-white transition hover:bg-ink-700"
                >
                  <MessageCircleIcon className="h-4 w-4" />
                  {tChat("contactCta")}
                </button>
                {canViewPremium ? null : (
                  <div className="mt-4">
                    <PremiumLock label={t("lockRentContact")} cta={t("unlockCta")} />
                  </div>
                )}
              </form>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
