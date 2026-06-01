import { getTranslations } from "next-intl/server";
import {
  BadgeCheckIcon,
  KeyRoundIcon,
  LockKeyholeIcon,
  ShieldCheckIcon,
  TimerResetIcon,
} from "lucide-react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default async function ResetPasswordPage() {
  const t = await getTranslations("auth");
  const tCommon = await getTranslations("common");

  return (
    <AuthShell
      appName={tCommon("appName")}
      appNameBn={tCommon("appNameBn")}
      topAction={{ label: "লগইনে ফিরে যান", href: "/login" }}
      heroBadge={{ text: "নিরাপদ পাসওয়ার্ড আপডেট" }}
      heroHeading="আপনার অ্যাকাউন্ট আবার নিরাপদ করুন"
      heroSubhead="নতুন পাসওয়ার্ড সেট করার পর আপনি সরাসরি ToletZoo ব্যবহার করতে পারবেন।"
      heroStats={[
        {
          icon: <LockKeyholeIcon className="h-5 w-5" />,
          value: "নিরাপদ",
          label: "রিকভারি সেশন",
        },
        {
          icon: <TimerResetIcon className="h-5 w-5" />,
          value: "দ্রুত",
          label: "পাসওয়ার্ড আপডেট",
        },
        {
          icon: <BadgeCheckIcon className="h-5 w-5" />,
          value: "ভেরিফাইড",
          label: "ToletZoo অ্যাক্সেস",
        },
      ]}
      formPill="পাসওয়ার্ড রিসেট"
      formHeading={t("resetTitle")}
      formSubhead={t("resetSubtitle")}
      formIcon={<KeyRoundIcon className="h-5 w-5" />}
      bottomCard={{
        eyebrow: "নিরাপত্তা টিপস",
        heading: "সহজে অনুমান করা যায় এমন পাসওয়ার্ড ব্যবহার করবেন না।",
        icon: <ShieldCheckIcon className="h-5 w-5" />,
      }}
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
