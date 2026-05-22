import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
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
          caption="নিরাপত্তার জন্য প্রতিটি পরিচয় ম্যানুয়ালি যাচাই করা হয়।"
          meta={{ label: tLanding("stat3Label"), value: tLanding("stat3Value") }}
        />
      }
    >
      <NidUploadForm userId={profile.id} />
    </AuthShell>
  );
}
