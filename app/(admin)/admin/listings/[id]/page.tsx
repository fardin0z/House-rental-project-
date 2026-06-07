import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  BathIcon,
  BedDoubleIcon,
  CalendarDaysIcon,
  ImageIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  PlayCircleIcon,
  RulerIcon,
  UserIcon,
} from "lucide-react";
import {
  getAdminListingDetail,
  type AdminListingDetail,
} from "@/lib/admin/queries";
import {
  approveListingAction,
  rejectListingAction,
  archiveListingAction,
  deleteListingAction,
} from "@/lib/admin/actions";
import {
  LISTING_BUCKET,
  publicStorageUrl,
  renderImageUrl,
} from "@/lib/storage/paths";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { ConfirmActionWithReason } from "@/components/admin/confirm-action-with-reason";

export default async function AdminListingDetailPage(
  props: PageProps<"/admin/listings/[id]">,
) {
  const { id } = await props.params;
  const t = await getTranslations("admin");
  const listing = await getAdminListingDetail(id);
  if (!listing) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/listings"
        className="inline-flex items-center gap-2 text-[12px] font-bold text-ink-500 transition hover:text-ink-900"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {t("listingsBack")}
      </Link>

      <header className="flex flex-col gap-5 rounded-[24px] bg-white p-6 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={listing.status} t={t} />
            <span className="inline-flex items-center rounded-full bg-ink-50 px-3 py-1 text-[11px] font-bold text-ink-700">
              {t(
                `listingsRentalType.${listing.rental_type as "family_flat" | "bachelor" | "sublet" | "office" | "shop"}`,
              )}
            </span>
          </div>
          <h1 className="font-display mt-4 text-[32px] italic leading-[.95] tracking-tight text-ink-900 md:text-[44px]">
            {listing.title || "—"}
          </h1>
          <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-500">
            <MapPinIcon className="h-3.5 w-3.5 text-lime-600" />
            {[listing.area_name, listing.district, listing.division]
              .filter(Boolean)
              .join(" · ") || "—"}
          </p>
          {listing.rejection_reason ? (
            <div className="mt-5 rounded-[14px] bg-red-50 px-4 py-3 text-[12px] font-semibold text-red-700">
              <span className="font-bold">{t("listingsRejReason")}: </span>
              {listing.rejection_reason}
            </div>
          ) : null}
        </div>

        <div className="rounded-[20px] bg-ink-900 p-5 text-white md:min-w-[240px]">
          <p className="font-space text-[10px] font-bold uppercase tracking-[.16em] text-white/55">
            {t("listingsRentLabel")}
          </p>
          <p className="font-display mt-3 text-[36px] italic leading-none">
            ৳ {listing.rent.toLocaleString("bn-BD")}
          </p>
          {listing.status === "approved" ? (
            <Link
              href={`/properties/${listing.id}`}
              target="_blank"
              className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-lime-400 px-4 text-[12px] font-bold text-ink-900 transition hover:bg-lime-500"
            >
              {t("listingsViewPublic")}
              <ArrowUpRightIcon className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <Gallery
            images={listing.images}
            videoPath={listing.video_path}
            title={listing.title}
            t={t}
          />

          <article className="rounded-[24px] bg-white p-6">
            <p className="font-space text-[10px] font-bold uppercase tracking-[.16em] text-ink-500/70">
              {t("listingsDetailSpecs")}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat
                icon={<BedDoubleIcon className="h-4 w-4 text-lime-600" />}
                value={listing.beds != null ? String(listing.beds) : "—"}
                label={t("listingsBeds")}
              />
              <Stat
                icon={<BathIcon className="h-4 w-4 text-lime-600" />}
                value={listing.baths != null ? String(listing.baths) : "—"}
                label={t("listingsBaths")}
              />
              <Stat
                icon={<RulerIcon className="h-4 w-4 text-lime-600" />}
                value={
                  listing.area_sqft != null ? String(listing.area_sqft) : "—"
                }
                label={t("listingsSqft")}
              />
              <Stat
                icon={<CalendarDaysIcon className="h-4 w-4 text-lime-600" />}
                value={new Date(listing.created_at).toLocaleDateString(
                  "bn-BD",
                )}
                label={t("listingsCreated")}
              />
            </div>
          </article>

          <article className="rounded-[24px] bg-white p-6">
            <p className="font-space text-[10px] font-bold uppercase tracking-[.16em] text-ink-500/70">
              {t("listingsDetailDescription")}
            </p>
            {listing.description ? (
              <p className="mt-4 whitespace-pre-wrap text-[14px] font-medium leading-relaxed text-ink-700">
                {listing.description}
              </p>
            ) : (
              <p className="mt-4 text-[13px] text-ink-500">—</p>
            )}
          </article>

          {listing.lat != null && listing.lng != null ? (
            <article className="rounded-[24px] bg-white p-6">
              <p className="font-space text-[10px] font-bold uppercase tracking-[.16em] text-ink-500/70">
                {t("listingsDetailLocation")}
              </p>
              <p className="mt-4 font-mono text-[12px] text-ink-500">
                {listing.lat.toFixed(5)}, {listing.lng.toFixed(5)}
              </p>
              <a
                href={`https://www.google.com/maps?q=${listing.lat},${listing.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-ink-50 px-4 text-[11px] font-bold text-ink-900 transition hover:bg-ink-100"
              >
                {t("listingsOpenInMaps")}
                <ArrowUpRightIcon className="h-3 w-3" />
              </a>
            </article>
          ) : null}
        </div>

        <aside className="space-y-4">
          <article className="rounded-[24px] bg-white p-6">
            <p className="font-space text-[10px] font-bold uppercase tracking-[.16em] text-ink-500/70">
              {t("listingsDetailOwner")}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-lime-400 text-[14px] font-bold text-ink-900">
                {(listing.owner.name ?? "?").trim().charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold text-ink-900">
                  {listing.owner.name ?? "—"}
                </p>
                <p className="truncate text-[11px] font-semibold text-ink-500">
                  {t("listingsOwnerRole")}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-[12px] font-semibold text-ink-500">
              {listing.owner.phone ? (
                <a
                  href={`tel:${listing.owner.phone}`}
                  className="flex items-center gap-2 hover:text-ink-900"
                >
                  <PhoneIcon className="h-3.5 w-3.5" />
                  {listing.owner.phone}
                </a>
              ) : null}
              {listing.owner.email ? (
                <a
                  href={`mailto:${listing.owner.email}`}
                  className="flex items-center gap-2 hover:text-ink-900"
                >
                  <MailIcon className="h-3.5 w-3.5" />
                  {listing.owner.email}
                </a>
              ) : null}
              <Link
                href={`/admin/users?id=${encodeURIComponent(listing.owner.id)}`}
                className="inline-flex items-center gap-1.5 text-ink-900"
              >
                <UserIcon className="h-3.5 w-3.5" />
                {t("listingsViewOwner")}
                <ArrowUpRightIcon className="h-3 w-3" />
              </Link>
            </div>
          </article>

          <article className="rounded-[24px] bg-white p-6">
            <p className="font-space text-[10px] font-bold uppercase tracking-[.16em] text-ink-500/70">
              {t("listingsDetailActions")}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {listing.status === "pending" ? (
                <form action={approveListingAction}>
                  <input type="hidden" name="id" value={listing.id} />
                  <button
                    type="submit"
                    className="inline-flex h-10 w-full items-center justify-center rounded-full bg-lime-400 px-4 text-[12px] font-bold text-ink-900 transition hover:bg-lime-500"
                  >
                    {t("listingsApprove")}
                  </button>
                </form>
              ) : null}

              {listing.status === "pending" || listing.status === "approved" ? (
                <ConfirmActionWithReason
                  action={rejectListingAction}
                  id={listing.id}
                  triggerLabel={t("listingsReject")}
                  title={t("listingsRejectTitle")}
                  body={t("listingsRejectBody")}
                  reasonLabel={t("listingsRejReason")}
                  reasonPlaceholder={t("listingsRejPlaceholder")}
                  confirmLabel={t("confirmYes")}
                  cancelLabel={t("confirmCancel")}
                  triggerClassName="inline-flex h-10 w-full items-center justify-center rounded-full border border-ink-900/10 bg-white px-4 text-[12px] font-bold text-ink-900 transition hover:bg-ink-50"
                />
              ) : null}

              {listing.status !== "archived" ? (
                <ConfirmActionButton
                  action={archiveListingAction}
                  id={listing.id}
                  triggerLabel={t("listingsArchive")}
                  title={t("confirmArchiveListingTitle")}
                  body={t("confirmArchiveListingBody")}
                  confirmLabel={t("confirmYes")}
                  cancelLabel={t("confirmCancel")}
                  variant="neutral"
                  triggerClassName="inline-flex h-10 w-full items-center justify-center rounded-full border border-ink-900/10 bg-white px-4 text-[12px] font-bold text-ink-900 transition hover:bg-ink-50"
                />
              ) : null}

              <ConfirmActionButton
                action={deleteListingAction}
                id={listing.id}
                triggerLabel={t("listingsDelete")}
                title={t("confirmDeleteListingTitle")}
                body={t("confirmDeleteListingBody")}
                confirmLabel={t("confirmYes")}
                cancelLabel={t("confirmCancel")}
                triggerClassName="inline-flex h-10 w-full items-center justify-center rounded-full bg-red-100 px-4 text-[12px] font-bold text-red-700 transition hover:bg-red-200"
              />
            </div>
          </article>
        </aside>
      </section>
    </div>
  );
}

type T = Awaited<ReturnType<typeof getTranslations<"admin">>>;

function StatusPill({
  status,
  t,
}: {
  status: AdminListingDetail["status"];
  t: T;
}) {
  const cls = {
    approved: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-700",
    archived: "bg-ink-100 text-ink-500",
    draft: "bg-ink-50 text-ink-500",
  }[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${cls}`}
    >
      {t(`listingsStatusLabel.${status}`)}
    </span>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-[14px] bg-ink-50 p-4">
      {icon}
      <p className="font-display mt-3 text-[22px] italic leading-none text-ink-900">
        {value}
      </p>
      <p className="mt-1.5 text-[11px] font-semibold text-ink-500">{label}</p>
    </div>
  );
}

function Gallery({
  images,
  videoPath,
  title,
  t,
}: {
  images: AdminListingDetail["images"];
  videoPath: string | null;
  title: string;
  t: T;
}) {
  if (images.length === 0 && !videoPath) {
    return (
      <div className="flex aspect-[2/1] items-center justify-center rounded-[24px] bg-ink-100">
        <ImageIcon className="h-10 w-10 text-ink-500/50" />
      </div>
    );
  }

  const cover = images[0];
  const rest = images.slice(1, 5);

  return (
    <div className="space-y-3">
      {cover ? (
        <div className="relative aspect-[2/1] overflow-hidden rounded-[24px] bg-ink-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={renderImageUrl(LISTING_BUCKET, cover.path, {
              width: 1600,
              quality: 82,
              resize: "cover",
            })}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-ink-900/85 px-3 py-1 text-[10px] font-bold text-white">
            {t("listingsPhotoCount", { count: images.length })}
          </span>
        </div>
      ) : null}

      {rest.length > 0 ? (
        <div className="grid grid-cols-4 gap-2">
          {rest.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square overflow-hidden rounded-[12px] bg-ink-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={renderImageUrl(LISTING_BUCKET, img.path, {
                  width: 400,
                  quality: 75,
                  resize: "cover",
                })}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}

      {videoPath ? (
        <div className="relative aspect-[16/9] overflow-hidden rounded-[16px] bg-ink-900">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={publicStorageUrl(LISTING_BUCKET, videoPath)}
            controls
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full bg-ink-900 object-contain"
          />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-ink-900/85 px-3 py-1 text-[10px] font-bold text-white">
            <PlayCircleIcon className="h-3 w-3 text-lime-400" />
            {t("listingsVideoBadge")}
          </span>
        </div>
      ) : null}
    </div>
  );
}
