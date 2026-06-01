import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  BadgeCheckIcon,
  HomeIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import { SignupForm } from "@/components/auth/signup-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { getCurrentUserId } from "@/lib/auth/guards";

export default async function SignupPage() {
  const userId = await getCurrentUserId();
  if (userId) redirect("/");

  const t = await getTranslations("auth");
  const tCommon = await getTranslations("common");

  return (
    <AuthShell
      appName={tCommon("appName")}
      appNameBn={tCommon("appNameBn")}
      topAction={{ label: "ফিরে যান", href: "/" }}
      heroBadge={{ text: "১০০% NID যাচাইকৃত প্ল্যাটফর্ম" }}
      heroHeading="নিরাপদে বাসা খোঁজা শুরু করুন"
      heroSubhead="যাচাইকৃত মালিক, স্বচ্ছ তথ্য এবং সহজ যোগাযোগ — সবকিছু এক জায়গায়।"
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
      formPill="নতুন সদস্য"
      formHeading={t("signupTitle")}
      formSubhead={t("signupSubtitle")}
      formIcon={<UserPlusIcon className="h-5 w-5" />}
      bottomCard={{
        eyebrow: "বিশ্বাসযোগ্য প্ল্যাটফর্ম",
        heading: "NID যাচাইকৃত মালিকের সাথে সরাসরি যোগাযোগ।",
      }}
    >
      <SignupForm />
    </AuthShell>
  );
}
