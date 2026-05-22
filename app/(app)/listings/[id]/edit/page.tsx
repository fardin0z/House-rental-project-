import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeftIcon } from "lucide-react";
import { requireProfile } from "@/lib/auth/guards";
import { getListingById } from "@/lib/listings/queries";
import { ListingForm } from "@/components/listings/listing-form";
import { ListingImageUploader } from "@/components/listings/image-uploader";

export default async function EditListingPage(
  props: PageProps<"/listings/[id]/edit">,
) {
  const profile = await requireProfile();
  const { id } = await props.params;

  const listing = await getListingById(id);
  if (!listing) notFound();
  if (listing.owner_id !== profile.id) redirect("/listings");

  const t = await getTranslations("listings");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 md:py-14">
      <Link
        href="/listings"
        className="inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeftIcon className="size-4" />
        {t("backToListings")}
      </Link>

      <div className="mt-6 flex flex-col gap-3">
        <span className="slash-label text-xl md:text-2xl">
          {t(`statusLabel.${listing.status}`)}
        </span>
        <h1 className="font-display text-4xl italic leading-tight text-ink md:text-5xl">
          {listing.title || t("untitled")}
        </h1>
      </div>

      <section className="mt-10 flex flex-col gap-5">
        <h2 className="font-display text-2xl italic text-ink">{t("photosTitle")}</h2>
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
      </section>

      <section className="mt-10">
        <h2 className="mb-5 font-display text-2xl italic text-ink">{t("detailsTitle")}</h2>
        <ListingForm listing={listing} imageCount={listing.images?.length ?? 0} />
      </section>
    </div>
  );
}
