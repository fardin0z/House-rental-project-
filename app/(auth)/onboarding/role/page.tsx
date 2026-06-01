import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  BadgeCheckIcon,
  HomeIcon,
  MapPinIcon,
  ShieldCheckIcon,
  UserRoundCogIcon,
} from "lucide-react";
import { RolePicker } from "@/components/auth/role-picker";
import { AuthShell } from "@/components/auth/auth-shell";
import { requireProfile } from "@/lib/auth/guards";

export default async function OnboardingRolePage() {
  const profile = await requireProfile();

  if (profile.nid_status === "approved") redirect("/");

  const t = await getTranslations("auth");
  const tCommon = await getTranslations("common");

  return (
    <AuthShell
      appName={tCommon("appName")}
      appNameBn={tCommon("appNameBn")}
      heroBadge={{ text: "১০০% NID যাচাইকৃত প্ল্যাটফর্ম" }}
      heroHeading="আপনার ToletZoo অভিজ্ঞতা সেট করুন"
      heroSubhead="আপনি বাসা খুঁজছেন নাকি বাসা ভাড়া দিতে চান — এই তথ্য অনুযায়ী আমরা আপনার ড্যাশবোর্ড সাজাব।"
      heroStats={[
        {
          icon: <MapPinIcon className="h-5 w-5" />,
          value: "এলাকা",
          label: "পছন্দমতো বাসা",
        },
        {
          icon: <HomeIcon className="h-5 w-5" />,
          value: "লিস্টিং",
          label: "সহজে প্রকাশ করুন",
        },
        {
          icon: <BadgeCheckIcon className="h-5 w-5" />,
          value: "NID",
          label: "পরের ধাপে যাচাই",
        },
      ]}
      formPill={t("stepRole")}
      formHeading={t("roleSelectTitle")}
      formSubhead="পরবর্তীতে যেকোনো সময় আপনি ভূমিকা পরিবর্তন করতে পারবেন।"
      formIcon={<UserRoundCogIcon className="h-5 w-5" />}
      bottomCard={{
        eyebrow: "পরবর্তী ধাপ",
        heading: "NID যাচাই সম্পন্ন করে আপনার প্রোফাইল সক্রিয় করুন।",
        icon: <ShieldCheckIcon className="h-5 w-5" />,
      }}
    >
      <RolePicker initialRole={profile.role === "landlord" ? "landlord" : "tenant"} />
    </AuthShell>
  );
}
