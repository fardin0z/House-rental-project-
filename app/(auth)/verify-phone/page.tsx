import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  BadgeCheckIcon,
  KeyRoundIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
} from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyPhonePanel } from "@/components/auth/verify-phone-panel";
import { normalizeBdPhone } from "@/lib/auth/phone";

export const metadata: Metadata = {
  title: "মোবাইল যাচাই",
  description: "SMS-এ পাঠানো OTP কোড দিয়ে আপনার মোবাইল নম্বর যাচাই করুন।",
  alternates: { canonical: "/verify-phone" },
  robots: { index: false, follow: false },
};

export default async function VerifyPhonePage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string; reason?: string }>;
}) {
  const { phone: rawPhone, reason } = await searchParams;
  const phone = rawPhone ? normalizeBdPhone(rawPhone) : "";
  const t = await getTranslations("auth");
  const tCommon = await getTranslations("common");

  return (
    <AuthShell
      appName={tCommon("appName")}
      appNameBn={tCommon("appNameBn")}
      topAction={{ label: "ফিরে যান", href: "/login" }}
      heroBadge={{ text: "১০০% NID যাচাইকৃত প্ল্যাটফর্ম" }}
      heroHeading="আপনার মোবাইল যাচাই করুন"
      heroSubhead="আপনার নম্বরে পাঠানো ৬ সংখ্যার কোডটি দিন। যাচাইকৃত অ্যাকাউন্ট বেশি বিশ্বাসযোগ্য।"
      heroStats={[
        {
          icon: <SmartphoneIcon className="h-5 w-5" />,
          value: "SMS",
          label: "আপনার নম্বরে পাঠানো",
        },
        {
          icon: <ShieldCheckIcon className="h-5 w-5" />,
          value: "৫ মিনিট",
          label: "কোডের মেয়াদ",
        },
        {
          icon: <BadgeCheckIcon className="h-5 w-5" />,
          value: "১ ক্লিক",
          label: "যাচাই সম্পন্ন",
        },
      ]}
      formPill="যাচাই বাকি"
      formHeading={t("verifyPhoneTitle")}
      formSubhead={t("verifyPhoneSubtitle")}
      formIcon={<KeyRoundIcon className="h-5 w-5" />}
      bottomCard={{
        eyebrow: "নিরাপদ অ্যাকাউন্ট",
        heading: "যাচাইকৃত মোবাইল নম্বরে ভুয়া অ্যাকাউন্ট ঠেকানো সহজ।",
        icon: <ShieldCheckIcon className="h-5 w-5" />,
      }}
    >
      <VerifyPhonePanel phone={phone} unverifiedNotice={reason === "unverified"} />
    </AuthShell>
  );
}
