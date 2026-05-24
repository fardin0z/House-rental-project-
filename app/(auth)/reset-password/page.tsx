import { getTranslations } from "next-intl/server";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { OtpAside } from "@/components/auth/aside-images";

export default async function ResetPasswordPage() {
  const t = await getTranslations("auth");
  const tLanding = await getTranslations("landing");
  const tCommon = await getTranslations("common");

  return (
    <AuthShell
      appName={tCommon("appName")}
      eyebrow="New password"
      heading={<>{t("resetTitle")}</>}
      subhead={t("resetSubtitle")}
      aside={
        <OtpAside
          tag={tLanding("availableNow")}
          caption={t("tagline")}
          meta={{ label: tLanding("stat3Label"), value: tLanding("stat3Value") }}
        />
      }
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
