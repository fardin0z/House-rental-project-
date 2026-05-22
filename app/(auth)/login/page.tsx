import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginAside } from "@/components/auth/aside-images";
import { getCurrentUserId } from "@/lib/auth/guards";

export default async function LoginPage() {
  const userId = await getCurrentUserId();
  if (userId) redirect("/");

  const t = await getTranslations("auth");
  const tLanding = await getTranslations("landing");
  const tCommon = await getTranslations("common");

  return (
    <AuthShell
      appName={tCommon("appName")}
      backHref="/"
      step={{ current: 1, total: 4, label: t("stepLogin") }}
      eyebrow="Welcome"
      heading={
        <>
          {t("loginTitle")}
          <br />
          <span className="text-ember">শুরু</span> করুন
        </>
      }
      subhead={t("loginSubtitle")}
      aside={
        <LoginAside
          tag={tLanding("availableNow")}
          caption={t("tagline")}
          meta={{ label: tLanding("stat1Label"), value: tLanding("stat1Value") }}
        />
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
