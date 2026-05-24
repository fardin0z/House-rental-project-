import { getTranslations } from "next-intl/server";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { OtpAside } from "@/components/auth/aside-images";

export default async function ForgotPasswordPage() {
  const t = await getTranslations("auth");
  const tLanding = await getTranslations("landing");
  const tCommon = await getTranslations("common");

  return (
    <AuthShell
      appName={tCommon("appName")}
      backHref="/login"
      eyebrow="Reset"
      heading={<>{t("forgotTitle")}</>}
      subhead={t("forgotSubtitle")}
      aside={
        <OtpAside
          tag={tLanding("availableNow")}
          caption={t("tagline")}
          meta={{ label: tLanding("stat3Label"), value: tLanding("stat3Value") }}
        />
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
