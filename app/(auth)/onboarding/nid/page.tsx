import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowRightIcon } from "lucide-react";
import { NidUploadForm } from "@/components/auth/nid-upload-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { NidAside } from "@/components/auth/aside-images";
import { requireProfile } from "@/lib/auth/guards";

export default async function OnboardingNidPage() {
  const profile = await requireProfile();

  if (profile.nid_status === "approved") redirect("/");

  const t = await getTranslations("auth");
  const tLanding = await getTranslations("landing");
  const tCommon = await getTranslations("common");

  return (
    <AuthShell
      appName={tCommon("appName")}
      backHref="/onboarding/role"
      step={{ current: 4, total: 4, label: t("stepNid") }}
      eyebrow="Verify ID"
      heading={<>{t("nidTitle")}</>}
      subhead={t("nidSubtitle")}
      aside={
        <NidAside
          tag={tLanding("availableNow")}
          caption="যেকোনো বৈধ পরিচয়পত্র দিয়ে যাচাই করা যায়। যাচাই বাধ্যতামূলক নয়।"
          meta={{ label: tLanding("stat3Label"), value: tLanding("stat3Value") }}
        />
      }
    >
      <NidUploadForm userId={profile.id} />

      <div className="mt-6 flex flex-col items-center gap-2 border-t border-rule/60 pt-6 text-center">
        <p className="text-xs text-ink-soft">{t("skipHint")}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-ink underline-offset-4 hover:underline"
        >
          {t("skipForNow")}
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </AuthShell>
  );
}
