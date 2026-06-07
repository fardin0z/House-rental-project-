import { getTranslations } from "next-intl/server";
import { CreateUserForm } from "@/components/admin/create-user-form";

export default async function NewUserPage() {
  const t = await getTranslations("admin");

  return (
    <div className="space-y-6">
      <header>
        <p className="font-space text-[12px] font-bold uppercase tracking-[.18em] text-ink-500/70">
          {t("usersEyebrow")}
        </p>
        <h1 className="font-display mt-3 text-[32px] italic leading-tight tracking-tight text-ink-900 md:text-[40px]">
          {t("usersCreateTitle")}
        </h1>
        <p className="mt-3 max-w-[520px] text-[13px] font-medium leading-relaxed text-ink-500">
          {t("usersCreateSubtitle")}
        </p>
      </header>

      <CreateUserForm
        labels={{
          nameLabel: t("usersCreateName"),
          emailLabel: t("usersCreateEmail"),
          phoneLabel: t("usersCreatePhone"),
          passwordLabel: t("usersCreatePassword"),
          roleLabel: t("usersCreateRole"),
          roleTenant: t("usersRoleTenant"),
          roleLandlord: t("usersRoleLandlord"),
          roleAdmin: t("usersRoleAdmin"),
          submit: t("usersCreateSubmit"),
          back: t("usersCreateBack"),
          hint: t("usersCreateHint"),
        }}
      />
    </div>
  );
}
