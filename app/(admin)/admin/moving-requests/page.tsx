import { getTranslations } from "next-intl/server";
import { TruckIcon, PhoneIcon, MapPinIcon, CalendarIcon } from "lucide-react";
import { FilterChip } from "@/components/admin/filter-chip";
import {
  getAdminMovingRequests,
  type AdminMovingRequest,
} from "@/lib/admin/queries";
import {
  updateMovingStatusAction,
  updateMovingNotesAction,
  deleteMovingRequestAction,
} from "@/lib/admin/actions";

const STATUSES = ["pending", "confirmed", "completed"] as const;
type Status = (typeof STATUSES)[number];

export default async function AdminMovingRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const rawStatus = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const status: Status | null = STATUSES.includes(rawStatus as Status)
    ? (rawStatus as Status)
    : null;

  const t = await getTranslations("admin");
  const requests = await getAdminMovingRequests({ status, limit: 200 });

  const counts = {
    pending: requests.filter((r) => r.status === "pending").length,
    confirmed: requests.filter((r) => r.status === "confirmed").length,
    completed: requests.filter((r) => r.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="font-space text-[12px] font-bold uppercase tracking-[.18em] text-ink-500/70">
          {t("movingEyebrow")}
        </p>
        <h1 className="font-display mt-3 text-[36px] italic leading-tight tracking-tight text-ink-900 md:text-[48px]">
          {t("movingTitle")}
        </h1>
      </header>

      <section className="grid grid-cols-3 gap-3">
        <StatTile
          label={t("movingStatusLabel.pending")}
          value={counts.pending}
        />
        <StatTile
          label={t("movingStatusLabel.confirmed")}
          value={counts.confirmed}
        />
        <StatTile
          label={t("movingStatusLabel.completed")}
          value={counts.completed}
        />
      </section>

      <nav className="flex flex-wrap items-center gap-2">
        <FilterChip
          href={buildMovingHref(null)}
          active={status === null}
          label={t("movingStatusAll")}
          variant="white"
        />
        {STATUSES.map((s) => (
          <FilterChip
            key={s}
            href={buildMovingHref(s)}
            active={status === s}
            label={t(`movingStatusLabel.${s}`)}
            variant="white"
          />
        ))}
      </nav>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[28px] bg-white p-16 text-center">
          <TruckIcon className="h-10 w-10 text-ink-500/50" />
          <h3 className="font-display mt-5 text-[24px] italic text-ink-900">
            {t("movingEmptyTitle")}
          </h3>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <MovingCard key={req.id} req={req} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[18px] bg-white p-5">
      <p className="font-space text-[10px] font-bold uppercase tracking-[.16em] text-ink-500/70">
        {label}
      </p>
      <p className="font-display mt-3 text-[28px] italic leading-none tracking-tight text-ink-900">
        {value.toLocaleString("bn-BD")}
      </p>
    </div>
  );
}

function buildMovingHref(value: Status | null): string {
  const params = new URLSearchParams();
  if (value) params.set("status", value);
  return params.toString() ? `?${params.toString()}` : "?";
}

type T = Awaited<ReturnType<typeof getTranslations<"admin">>>;

function MovingCard({ req, t }: { req: AdminMovingRequest; t: T }) {
  const created = new Date(req.created_at).toLocaleDateString("bn-BD");
  const requestedDate = req.requested_date
    ? new Date(req.requested_date).toLocaleDateString("bn-BD")
    : "—";

  return (
    <article className="rounded-[24px] bg-white p-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-5">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-[18px] font-bold text-ink-900">
                {req.name}
              </h3>
              <p className="mt-1 inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-500">
                <PhoneIcon className="h-3.5 w-3.5" />
                {req.phone}
              </p>
            </div>
            <MovingStatusPill status={req.status} t={t} />
          </header>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field
              icon={<MapPinIcon className="h-4 w-4 text-lime-600" />}
              label={t("movingFromLabel")}
              value={req.from_area}
            />
            <Field
              icon={<MapPinIcon className="h-4 w-4 text-lime-600" />}
              label={t("movingToLabel")}
              value={req.to_area}
            />
            <Field
              icon={<CalendarIcon className="h-4 w-4 text-lime-600" />}
              label={t("movingDateLabel")}
              value={requestedDate}
            />
            <Field
              icon={<TruckIcon className="h-4 w-4 text-lime-600" />}
              label={t("movingFlatLabel")}
              value={req.flat_details || "—"}
            />
          </div>

          <p className="text-[11px] font-semibold text-ink-500/70">
            {t("movingSubmittedLabel")}: {created}
          </p>
        </div>

        <aside className="rounded-[20px] bg-ink-50 p-5 lg:w-[340px]">
          <p className="font-space text-[10px] font-bold uppercase tracking-[.16em] text-ink-500/70">
            {t("movingActionLabel")}
          </p>

          <form
            action={updateMovingStatusAction}
            className="mt-3 flex items-center gap-1 rounded-full bg-white p-1"
          >
            <input type="hidden" name="id" value={req.id} />
            {STATUSES.map((s) => (
              <button
                key={s}
                type="submit"
                name="status"
                value={s}
                className={
                  req.status === s
                    ? "flex-1 rounded-full bg-ink-900 px-3 py-1.5 text-[11px] font-bold text-white"
                    : "flex-1 rounded-full px-3 py-1.5 text-[11px] font-semibold text-ink-500 transition hover:text-ink-900"
                }
              >
                {t(`movingStatusLabel.${s}`)}
              </button>
            ))}
          </form>

          <form action={updateMovingNotesAction} className="mt-5 space-y-2">
            <input type="hidden" name="id" value={req.id} />
            <p className="font-space text-[10px] font-bold uppercase tracking-[.16em] text-ink-500/70">
              {t("movingNotesLabel")}
            </p>
            <textarea
              name="notes"
              defaultValue={req.internal_notes ?? ""}
              maxLength={2000}
              rows={4}
              placeholder={t("movingNotesPlaceholder")}
              className="w-full rounded-[14px] border border-ink-900/10 bg-white px-3 py-2 text-[12px] text-ink-900 outline-none transition focus:border-ink-900/40"
            />
            <button
              type="submit"
              className="inline-flex h-9 w-full items-center justify-center rounded-full bg-ink-900 px-4 text-[11px] font-bold text-white transition hover:bg-ink-700"
            >
              {t("movingNotesSave")}
            </button>
          </form>

          <form action={deleteMovingRequestAction} className="mt-3">
            <input type="hidden" name="id" value={req.id} />
            <button
              type="submit"
              className="inline-flex h-9 w-full items-center justify-center rounded-full bg-red-100 px-4 text-[11px] font-bold text-red-700 transition hover:bg-red-200"
            >
              {t("movingDelete")}
            </button>
          </form>
        </aside>
      </div>
    </article>
  );
}

function Field({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[14px] bg-ink-50 p-4">
      <div className="flex items-center gap-2">
        {icon}
        <p className="font-space text-[10px] font-bold uppercase tracking-[.16em] text-ink-500/70">
          {label}
        </p>
      </div>
      <p className="mt-2 text-[14px] font-semibold text-ink-900">{value}</p>
    </div>
  );
}

function MovingStatusPill({
  status,
  t,
}: {
  status: AdminMovingRequest["status"];
  t: T;
}) {
  const cls = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-blue-100 text-blue-700",
    completed: "bg-emerald-100 text-emerald-700",
  }[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${cls}`}
    >
      {t(`movingStatusLabel.${status}`)}
    </span>
  );
}
