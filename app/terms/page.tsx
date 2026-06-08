import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContentPage } from "@/components/shared/content-page";

export const metadata: Metadata = {
  title: "শর্তাবলী",
  description:
    "ToletZoo ব্যবহারের শর্ত — বিজ্ঞাপন, যাচাই, পেমেন্ট ও দায়বদ্ধতা সম্পর্কিত নীতিমালা।",
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  const t = await getTranslations("terms");
  const sections = ["use", "listings", "verification", "payments", "liability"] as const;

  return (
    <ContentPage eyebrow="Terms" title={t("title")}>
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
