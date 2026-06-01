import { getTranslations } from "next-intl/server";
import {
  BadgeCheckIcon,
  MailIcon,
  ShieldCheckIcon,
  TimerResetIcon,
} from "lucide-react";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default async function ForgotPasswordPage() {
  const t = await getTranslations("auth");
  const tCommon = await getTranslations("common");

  return (
    <AuthShell
      appName={tCommon("appName")}
      appNameBn={tCommon("appNameBn")}
      topAction={{ label: "লগইনে ফিরে যান", href: "/login" }}
      heroBadge={{ text: "নিরাপদ পাসওয়ার্ড পুনরুদ্ধার" }}
      heroHeading="পাসওয়ার্ড ভুলে গেছেন? কোন সমস্যা নেই"
      heroSubhead="ইমেইলে রিসেট লিংক পাঠাব। কয়েক মিনিটের মধ্যেই আপনি নতুন পাসওয়ার্ড সেট করতে পারবেন।"
      heroStats={[
        {
          icon: <MailIcon className="h-5 w-5" />,
          value: "ইমেইল",
          label: "রিসেট লিংক",
        },
        {
          icon: <TimerResetIcon className="h-5 w-5" />,
          value: "দ্রুত",
          label: "পাসওয়ার্ড পুনরুদ্ধার",
        },
        {
          icon: <BadgeCheckIcon className="h-5 w-5" />,
          value: "নিরাপদ",
          label: "এনক্রিপ্টেড লিংক",
        },
      ]}
      formPill="পাসওয়ার্ড রিসেট"
      formHeading={t("forgotTitle")}
      formSubhead={t("forgotSubtitle")}
      formIcon={<MailIcon className="h-5 w-5" />}
      bottomCard={{
        eyebrow: "নিরাপত্তা",
        heading: "শুধু আপনার ইমেইলে রিসেট লিংক পাঠানো হবে।",
        icon: <ShieldCheckIcon className="h-5 w-5" />,
      }}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
