import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  BadgeCheckIcon,
  ClockIcon,
  ImageUpIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { NidUploadForm } from "@/components/auth/nid-upload-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { requireProfile } from "@/lib/auth/guards";

export default async function OnboardingNidPage() {
  const profile = await requireProfile();

  if (profile.nid_status === "approved") redirect("/");

  const t = await getTranslations("auth");
  const tCommon = await getTranslations("common");

  return (
    <AuthShell
      appName={tCommon("appName")}
      appNameBn={tCommon("appNameBn")}
      topAction={{ label: "আগের ধাপ", href: "/onboarding/role" }}
      heroBadge={{
        icon: <BadgeCheckIcon className="h-4 w-4" />,
        text: "চূড়ান্ত ধাপ",
      }}
      heroHeading="যাচাইকৃত প্রোফাইল বেশি বিশ্বাসযোগ্য"
      heroSubhead="পরিচয় যাচাই ঐচ্ছিক। এখন জমা দিলে অ্যাডমিন রিভিউ শেষে আপনার প্রোফাইলে যাচাইকৃত ব্যাজ দেখানো হবে।"
      heroStats={[
        {
          icon: <ShieldCheckIcon className="h-5 w-5" />,
          value: "বিশ্বাস",
          label: "ভাড়াটিয়া ও মালিকের কাছে",
        },
        {
          icon: <ImageUpIcon className="h-5 w-5" />,
          value: "৩ ছবি",
          label: "সামনে, পেছনে, সেলফি",
        },
        {
          icon: <ClockIcon className="h-5 w-5" />,
          value: "Pending",
          label: "অ্যাডমিন রিভিউ",
        },
      ]}
      formPill={t("stepNid")}
      formHeading={t("nidTitle")}
      formSubhead={t("nidSubtitle")}
      formIcon={<BadgeCheckIcon className="h-5 w-5" />}
    >
      <NidUploadForm userId={profile.id} />
    </AuthShell>
  );
}
