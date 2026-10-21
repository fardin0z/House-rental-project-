import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeftIcon } from "lucide-react";
import { requireProfile } from "@/lib/auth/guards";
import { getListingById } from "@/lib/listings/queries";
import { ListingForm } from "@/components/listings/listing-form";
import { ListingImageUploader } from "@/components/listings/image-uploader";
import { ListingVideoUploader } from "@/components/listings/video-uploader";

const STATUS_PILL: Record<string, string> = {
  approved: "bg-lime-50 text-lime-600",
  pending: "bg-[#FFF6E1] text-[#A07A1F]",
  draft: "bg-ink-100 text-ink-500",
  rejected: "bg-[#FFE4E4] text-[#A8362A]",
  archived: "bg-ink-900 text-white",
};

export default async function EditListingPage(
  props: PageProps<"/listings/[id]/edit">,
) {
  const profile = await requireProfile();
  const { id } = await props.params;

  const listing = await getListingById(id);
  if (!listing) notFound();
  if (listing.owner_id !== profile.id) redirect("/listings");

  const t = await getTranslations("listings");
  const statusLabel = t(`statusLabel.${listing.status}`);

  return (
    <div className="pb-16">
      <section className="mx-auto max-w-7xl px-6 pt-8">
        <Link
          href="/listings"
          className="inline-flex items-center gap-2 text-[13px] font-bold text-ink-500 transition-colors hover:text-ink-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t("backToListings")}
        </Link>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-6">
        <div className="rounded-[24px] bg-white p-6 md:p-8">
          <span
            className={`inline-flex rounded-full px-4 py-2 text-[12px] font-bold ${
              STATUS_PILL[listing.status] ?? STATUS_PILL.draft
            }`}
          >
            {statusLabel}
          </span>
          <h1 className="font-display mt-6 max-w-[760px] text-[44px] italic leading-[.94] tracking-tight text-ink-900 md:text-[64px]">
            {listing.title || t("untitled")}
          </h1>
          {listing.area_name ? (
            <p className="mt-4 text-[15px] font-medium text-ink-500">
              {listing.area_name}
              {listing.district ? `, ${listing.district}` : ""}
            </p>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-6">
        <div className="rounded-[24px] bg-white p-6 md:p-8">
          <h2 className="font-display text-[28px] italic leading-tight tracking-tight text-ink-900 md:text-[32px]">
            {t("photosTitle")}
          </h2>
          <div className="mt-6">
            <ListingImageUploader
              listingId={listing.id}
              ownerId={listing.owner_id}
              initialImages={listing.images ?? []}
              labels={{
                add: t("images.add"),
                uploading: t("images.uploading"),
                delete: t("images.delete"),
                hint: t("images.hint"),
                limit: t("images.limit"),
              }}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-6">
        <div className="rounded-[24px] bg-white p-6 md:p-8">
          <h2 className="font-display text-[28px] italic leading-tight tracking-tight text-ink-900 md:text-[32px]">
            {t("videoTitle")}
          </h2>
          <div className="mt-6">
            <ListingVideoUploader
              listingId={listing.id}
              ownerId={listing.owner_id}
              initialPath={listing.video_path}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-6">
        <div className="rounded-[24px] bg-white p-6 md:p-8">
          <h2 className="font-display text-[28px] italic leading-tight tracking-tight text-ink-900 md:text-[32px]">
            {t("detailsTitle")}
          </h2>
          <div className="mt-6">
            <ListingForm
              listing={listing}
              imageCount={listing.images?.length ?? 0}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
