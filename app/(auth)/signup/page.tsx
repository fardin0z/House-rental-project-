import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SignupForm } from "@/components/auth/signup-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginAside } from "@/components/auth/aside-images";
import { getCurrentUserId } from "@/lib/auth/guards";

export default async function SignupPage() {
  const userId = await getCurrentUserId();
  if (userId) redirect("/");

  const t = await getTranslations("auth");
  const tLanding = await getTranslations("landing");
  const tCommon = await getTranslations("common");

  return (
    <AuthShell
      appName={tCommon("appName")}
      backHref="/"
      eyebrow="Sign up"
      heading={
        <>
          {t("signupTitle")}
        </>
      }
      subhead={t("signupSubtitle")}
      aside={
        <LoginAside
          tag={tLanding("availableNow")}
          caption={t("tagline")}
          meta={{ label: tLanding("stat1Label"), value: tLanding("stat1Value") }}
        />
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
