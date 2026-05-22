import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { RolePicker } from "@/components/auth/role-picker";
import { AuthShell } from "@/components/auth/auth-shell";
import { RoleAside } from "@/components/auth/aside-images";
import { requireProfile } from "@/lib/auth/guards";

export default async function OnboardingRolePage() {
  const profile = await requireProfile();

  if (profile.nid_status === "approved") redirect("/");

  const t = await getTranslations("auth");
  const tLanding = await getTranslations("landing");
  const tCommon = await getTranslations("common");

  return (
    <AuthShell
      appName={tCommon("appName")}
      step={{ current: 3, total: 4, label: t("stepRole") }}
      eyebrow="Role"
      heading={<>{t("roleSelectTitle")}</>}
      subhead="পরবর্তীতে যেকোনো সময় আপনি ভূমিকা পরিবর্তন করতে পারবেন।"
      aside={
        <RoleAside
          tag={tLanding("availableNow")}
          caption="যাচাইকৃত মালিক, সরাসরি যোগাযোগ।"
          meta={{ label: tLanding("stat2Label"), value: tLanding("stat2Value") }}
        />
      }
    >
      <RolePicker initialRole={profile.role === "landlord" ? "landlord" : "tenant"} />
    </AuthShell>
  );
}
