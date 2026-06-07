import { getTranslations } from "next-intl/server";
import { ShieldCheckIcon, ImageIcon, ExternalLinkIcon } from "lucide-react";
import { getNidDocs, type PendingNidDoc } from "@/lib/admin/queries";
import { approveNidAction, rejectNidAction } from "@/lib/admin/actions";
import { FilterChip } from "@/components/admin/filter-chip";

type StatusFilter = "pending" | "approved" | "rejected";

const ALLOWED: StatusFilter[] = ["pending", "approved", "rejected"];

export default async function NidApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const rawStatus = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const status: StatusFilter = ALLOWED.includes(rawStatus as StatusFilter)
    ? (rawStatus as StatusFilter)
    : "pending";

  const t = await getTranslations("admin");
  const docs = await getNidDocs(status, 100);

  return (
    <div className="space-y-6">
      <header>
        <p className="font-space text-[12px] font-bold uppercase tracking-[.18em] text-ink-500/70">
          {t("nidEyebrow")}
        </p>
        <h1 className="font-display mt-3 text-[36px] italic leading-tight tracking-tight text-ink-900 md:text-[48px]">
          {t("nidTitle")}
        </h1>
      </header>

      <nav className="inline-flex items-center gap-1 rounded-full bg-white p-1">
        {ALLOWED.map((s) => (
          <FilterChip
            key={s}
            href={`?status=${s}`}
            active={s === status}
            label={t(`nidTab.${s}`)}
          />
        ))}
      </nav>

      {docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[28px] bg-white p-16 text-center">
          <ShieldCheckIcon className="h-10 w-10 text-ink-500/50" />
          <h3 className="font-display mt-5 text-[26px] italic text-ink-900">
            {t("nidEmptyTitle")}
          </h3>
          <p className="mt-2 max-w-[400px] text-[13px] font-medium text-ink-500">
            {t("nidEmptyBody")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {docs.map((doc) => (
            <NidCard key={doc.id} doc={doc} status={status} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}

type T = Awaited<ReturnType<typeof getTranslations<"admin">>>;

function NidCard({
  doc,
  status,
  t,
}: {
  doc: PendingNidDoc;
  status: StatusFilter;
  t: T;
}) {
  const displayName = doc.user.name || doc.user.email || doc.user.phone || "—";
  const initial = displayName.trim().charAt(0).toUpperCase();
  const docType = doc.document_type
    ? t(`nidDocType.${doc.document_type as "nid" | "birth_certificate" | "passport" | "driving_licence" | "student_id" | "other"}`)
    : "—";

  return (
    <article className="rounded-[24px] bg-white p-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-lime-400 text-[15px] font-bold text-ink-900">
            {initial}
          </span>
          <div>
            <h3 className="text-[16px] font-bold text-ink-900">{displayName}</h3>
            <p className="mt-1 text-[12px] font-semibold text-ink-500">
              {doc.user.phone ?? doc.user.email ?? ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-ink-500">
          <span className="inline-flex items-center rounded-full bg-ink-50 px-3 py-1">
            {docType}
          </span>
          <span className="inline-flex items-center rounded-full bg-ink-50 px-3 py-1">
            {new Date(doc.created_at).toLocaleDateString("bn-BD")}
          </span>
        </div>
      </header>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <NidImage src={doc.signed.front} label={t("nidFront")} />
        <NidImage src={doc.signed.back} label={t("nidBack")} />
        <NidImage src={doc.signed.selfie} label={t("nidSelfie")} />
      </div>

      {doc.rejection_reason ? (
        <p className="mt-4 rounded-[14px] bg-ink-50 px-4 py-3 text-[12px] font-semibold text-ink-500">
          <span className="font-bold text-ink-900">{t("nidRejReason")}: </span>
          {doc.rejection_reason}
        </p>
      ) : null}

      {status === "pending" ? (
        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
          <form action={rejectNidAction} className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
            <input type="hidden" name="id" value={doc.id} />
            <input
              type="text"
              name="reason"
              maxLength={500}
              placeholder={t("nidRejPlaceholder")}
              className="flex-1 rounded-full border border-ink-900/10 bg-white px-4 py-2.5 text-[13px] text-ink-900 outline-none transition focus:border-ink-900/40"
            />
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-full border border-ink-900/15 bg-white px-5 text-[13px] font-bold text-ink-900 transition hover:bg-ink-50"
            >
              {t("nidReject")}
            </button>
          </form>
          <form action={approveNidAction}>
            <input type="hidden" name="id" value={doc.id} />
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-full bg-lime-400 px-6 text-[13px] font-bold text-ink-900 transition hover:bg-lime-500"
            >
              {t("nidApprove")}
            </button>
          </form>
        </div>
      ) : null}
    </article>
  );
}

function NidImage({ src, label }: { src: string | null; label: string }) {
  return (
    <div className="relative aspect-[3/2] overflow-hidden rounded-[16px] bg-ink-50">
      {src ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={label}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-900 backdrop-blur transition hover:bg-white"
            aria-label={label}
          >
            <ExternalLinkIcon className="h-3.5 w-3.5" />
          </a>
        </>
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-ink-500">
          <ImageIcon className="h-6 w-6" />
        </span>
      )}
      <span className="absolute bottom-2 left-2 rounded-full bg-ink-900/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
        {label}
      </span>
    </div>
  );
}
