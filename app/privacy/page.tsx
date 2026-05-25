import { getTranslations } from "next-intl/server";
import { ContentPage } from "@/components/shared/content-page";

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");
  const sections = ["collect", "use", "share", "security", "contact"] as const;

  return (
    <ContentPage eyebrow="Privacy" title={t("title")}>
      <p>{t("intro")}</p>
      {sections.map((key) => (
        <section key={key} className="flex flex-col gap-2">
          <h2 className="font-display text-2xl italic text-ink">{t(`${key}.heading`)}</h2>
          <p>{t(`${key}.body`)}</p>
        </section>
      ))}
      <p className="text-sm text-ink-soft">{t("updated")}</p>
    </ContentPage>
  );
}
