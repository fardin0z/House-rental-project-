import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  BadgeCheckIcon,
  HomeIcon,
  LogInIcon,
  UsersIcon,
} from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { getCurrentSession } from "@/lib/auth/guards";
import { redirectPathForRole } from "@/lib/auth/jwt-claims";

export default async function LoginPage() {
  const session = await getCurrentSession();
  if (session) redirect(redirectPathForRole(session.role));

  const t = await getTranslations("auth");
  const tCommon = await getTranslations("common");

  return (
    <AuthShell
      appName={tCommon("appName")}
      appNameBn={tCommon("appNameBn")}
      topAction={{ label: "ফিরে যান", href: "/" }}
      heroBadge={{ text: "১০০% NID যাচাইকৃত প্ল্যাটফর্ম" }}
      heroHeading="আপনার বাসা খোঁজার জায়গায় ফিরে আসুন"
      heroSubhead="যাচাইকৃত মালিক, সংরক্ষিত পছন্দের বাসা এবং সরাসরি যোগাযোগ — সবকিছু এক জায়গায়।"
      heroStats={[
        {
          icon: <HomeIcon className="h-5 w-5" />,
          value: "৫২০+",
          label: "সক্রিয় বাসা",
        },
        {
          icon: <UsersIcon className="h-5 w-5" />,
          value: "১.২k+",
          label: "সন্তুষ্ট ভাড়াটিয়া",
        },
        {
          icon: <BadgeCheckIcon className="h-5 w-5" />,
          value: "১০০%",
          label: "NID যাচাইকৃত",
        },
      ]}
      formPill="লগইন"
      formHeading={t("loginTitle")}
      formSubhead={t("loginSubtitle")}
      formIcon={<LogInIcon className="h-5 w-5" />}
      bottomCard={{
        eyebrow: "নিরাপদ লগইন",
        heading: "আপনার সংরক্ষিত বাসা ও যোগাযোগ এক জায়গায় দেখুন।",
      }}
    >
      <LoginForm />
    </AuthShell>
  );
}
