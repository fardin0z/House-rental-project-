import { getTranslations } from "next-intl/server";
import { CheckIcon, PhoneCallIcon, ShieldCheckIcon, TruckIcon } from "lucide-react";
import { requireProfile } from "@/lib/auth/guards";
import { formatBdPhoneForDisplay } from "@/lib/auth/phone";
import { MovingForm } from "@/components/moving/moving-form";

export default async function MovingRequestPage() {
  const profile = await requireProfile();
  const t = await getTranslations("moving");
  const defaultPhone = formatBdPhoneForDisplay(profile.phone) || "";

  return (
    <main>
      <header className="mx-auto max-w-7xl px-6 pb-8 pt-10">
        <p className="font-display text-[24px] italic leading-none text-lime-600">
          {t("eyebrow")}
        </p>
        <h1 className="font-display mt-6 text-[48px] italic leading-[.88] tracking-tight text-ink-900 md:text-[72px]">
          {t("heading")}
        </h1>
        <p className="mt-7 max-w-[520px] text-[15px] font-medium leading-relaxed text-ink-500">
          {t("subtitle")}
        </p>
      </header>

      <section
        aria-label={t("heading")}
        className="mx-auto grid max-w-7xl gap-6 px-6 pb-12 lg:grid-cols-[1.4fr_1fr]"
      >
        <article className="rounded-[28px] bg-ink-50 p-5 md:p-7">
          <MovingForm defaultPhone={defaultPhone} />
        </article>

        <aside
          aria-labelledby="moving-info-title"
          className="space-y-4"
        >
          <div className="rounded-[24px] bg-ink-900 p-6 text-white">
            <h2
              id="moving-info-title"
              className="text-[11px] font-bold uppercase tracking-[.18em] text-white/40"
            >
              {t("infoTitle")}
            </h2>
            <ul className="mt-5 space-y-5 list-none ps-0">
              <InfoLine
                icon={<PhoneCallIcon className="h-4 w-4" />}
                title={t("info1Title")}
                body={t("info1Body")}
              />
              <InfoLine
                icon={<TruckIcon className="h-4 w-4" />}
                title={t("info2Title")}
                body={t("info2Body")}
              />
              <InfoLine
                icon={<ShieldCheckIcon className="h-4 w-4" />}
                title={t("info3Title")}
                body={t("info3Body")}
              />
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}

function InfoLine({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lime-400 text-ink-900">
        {icon}
      </span>
      <div>
        <h3 className="text-[14px] font-bold text-white">{title}</h3>
        <p className="mt-1 text-[13px] font-medium text-white/65">{body}</p>
      </div>
      <CheckIcon
        className="ml-auto hidden h-4 w-4 text-lime-400 md:block"
        aria-hidden
      />
    </li>
  );
}
