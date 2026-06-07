import { getTranslations } from "next-intl/server";
import { MailIcon, PhoneIcon, MessageCircleIcon } from "lucide-react";
import { ContentPage } from "@/components/shared/content-page";

export default async function SupportPage() {
  const t = await getTranslations("support");

  return (
    <ContentPage eyebrow="Support" title={t("title")}>
      <p>{t("intro")}</p>

      <div className="flex flex-col gap-3">
        <a
          href="mailto:support@toletzoo.com"
          className="flex items-center gap-3 rounded-2xl border border-rule/60 bg-paper p-4 transition-colors hover:border-ink"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-ember/15 text-ember">
            <MailIcon className="size-5" />
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-medium text-ink">{t("emailLabel")}</span>
            <span className="text-sm text-ink-soft">support@toletzoo.com</span>
          </span>
        </a>

        <a
          href="tel:+8801700000000"
          className="flex items-center gap-3 rounded-2xl border border-rule/60 bg-paper p-4 transition-colors hover:border-ink"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-ember/15 text-ember">
            <PhoneIcon className="size-5" />
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-medium text-ink">{t("phoneLabel")}</span>
            <span className="text-sm text-ink-soft">+880 1700-000000</span>
          </span>
        </a>

        <a
          href="https://wa.me/8801700000000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-2xl border border-rule/60 bg-paper p-4 transition-colors hover:border-ink"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
            <MessageCircleIcon className="size-5" />
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-medium text-ink">
              {t("whatsappLabel")}
            </span>
            <span className="text-sm text-ink-soft">+880 1700-000000</span>
          </span>
        </a>

        <div className="flex items-center gap-3 rounded-2xl border border-rule/60 bg-paper p-4">
          <span className="grid size-10 place-items-center rounded-xl bg-ember/15 text-ember">
            <MessageCircleIcon className="size-5" />
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-medium text-ink">{t("hoursLabel")}</span>
            <span className="text-sm text-ink-soft">{t("hours")}</span>
          </span>
        </div>
      </div>

      <p className="text-sm text-ink-soft">{t("note")}</p>
    </ContentPage>
  );
}
