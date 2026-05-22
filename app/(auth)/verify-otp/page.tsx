import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { OtpForm } from "@/components/auth/otp-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { OtpAside } from "@/components/auth/aside-images";
import { getCurrentUserId } from "@/lib/auth/guards";
import { isValidBdPhone } from "@/lib/auth/phone";
import { isDevOtpEnabled, peekDevOtp } from "@/lib/auth/dev-otp";

export default async function VerifyOtpPage(
  props: PageProps<"/verify-otp">,
) {
  const userId = await getCurrentUserId();
  if (userId) redirect("/");

  const searchParams = await props.searchParams;
  const phoneParam = Array.isArray(searchParams.phone)
    ? searchParams.phone[0]
    : searchParams.phone;

  if (!phoneParam || !isValidBdPhone(phoneParam)) {
    redirect("/login");
  }

  const devOtp = isDevOtpEnabled() ? peekDevOtp(phoneParam) : null;

  const t = await getTranslations("auth");
  const tLanding = await getTranslations("landing");
  const tCommon = await getTranslations("common");

  return (
    <AuthShell
      appName={tCommon("appName")}
      backHref="/login"
      step={{ current: 2, total: 4, label: t("stepVerify") }}
      eyebrow="Verify"
      heading={
        <>
          {t("otpTitle")}
        </>
      }
      subhead={t("otpSubtitle")}
      aside={
        <OtpAside
          tag={tLanding("availableNow")}
          caption={t("tagline")}
          meta={{ label: tLanding("stat3Label"), value: tLanding("stat3Value") }}
        />
      }
    >
      <OtpForm phone={phoneParam} devOtp={devOtp} />
    </AuthShell>
  );
}
