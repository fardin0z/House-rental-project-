import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  BadgeCheckIcon,
  MailCheckIcon,
  MailIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyEmailPanel } from "@/components/auth/verify-email-panel";

export const metadata: Metadata = {
  title: "ইমেইল যাচাই",
  description: "আপনার ইমেইলে পাঠানো যাচাইকরণ লিংকে ক্লিক করে অ্যাকাউন্ট সক্রিয় করুন।",
  alternates: { canonical: "/verify-email" },
  robots: { index: false, follow: false },
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const t = await getTranslations("auth");
  const tCommon = await getTranslations("common");

  return (
    <AuthShell
      appName={tCommon("appName")}
      appNameBn={tCommon("appNameBn")}
      topAction={{ label: "ফিরে যান", href: "/login" }}
      heroBadge={{ text: "১০০% NID যাচাইকৃত প্ল্যাটফর্ম" }}
      heroHeading="আপনার ইমেইল যাচাই করুন"
      heroSubhead="আমরা আপনাকে একটি লিংক পাঠিয়েছি। লিংকে ক্লিক করলে আপনার অ্যাকাউন্ট সক্রিয় হবে এবং আপনি লগইন করতে পারবেন।"
      heroStats={[
        {
          icon: <MailIcon className="h-5 w-5" />,
          value: "লিংক",
          label: "আপনার ইমেইলে পাঠানো",
        },
        {
          icon: <ShieldCheckIcon className="h-5 w-5" />,
          value: "নিরাপদ",
          label: "যাচাইকৃত ইমেইল",
        },
        {
          icon: <BadgeCheckIcon className="h-5 w-5" />,
          value: "১ ক্লিক",
          label: "অ্যাকাউন্ট সক্রিয়",
        },
      ]}
      formPill="যাচাই বাকি"
      formHeading={t("verifyEmailTitle")}
      formSubhead={t("verifyEmailSubtitle")}
      formIcon={<MailCheckIcon className="h-5 w-5" />}
      bottomCard={{
        eyebrow: "নিরাপদ অ্যাকাউন্ট",
        heading: "যাচাইকৃত ইমেইলে ভুয়া অ্যাকাউন্ট ঠেকানো সহজ।",
        icon: <ShieldCheckIcon className="h-5 w-5" />,
      }}
    >
      <VerifyEmailPanel email={email ?? ""} />
    </AuthShell>
  );
}
