import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  BadgeCheckIcon,
  CheckCircle2Icon,
  MailCheckIcon,
  MailIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyEmailPanel } from "@/components/auth/verify-email-panel";

export const metadata: Metadata = {
  title: "ইমেইল যাচাই",
  description: "আপনার ইমেইলে পাঠানো যাচাইকরণ লিংকে ক্লিক করে অ্যাকাউন্ট সক্রিয় করুন।",
  alternates: { canonical: "/verify-email" },
  robots: { index: false, follow: false },
};

type Status = "pending" | "verified" | "error";

function parseStatus(value: string | undefined): Status {
  if (value === "verified" || value === "error") return value;
  return "pending";
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; status?: string; reason?: string }>;
}) {
  const { email, status: statusRaw, reason } = await searchParams;
  const status = parseStatus(statusRaw);
  const t = await getTranslations("auth");
  const tCommon = await getTranslations("common");

  const chrome = getChrome(status, t);

  return (
    <AuthShell
      appName={tCommon("appName")}
      appNameBn={tCommon("appNameBn")}
      topAction={{ label: "ফিরে যান", href: "/login" }}
      heroBadge={{ text: "১০০% NID যাচাইকৃত প্ল্যাটফর্ম" }}
      heroHeading={chrome.heroHeading}
      heroSubhead={chrome.heroSubhead}
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
      formPill={chrome.pill}
      formHeading={chrome.formHeading}
      formSubhead={chrome.formSubhead}
      formIcon={chrome.icon}
      bottomCard={{
        eyebrow: "নিরাপদ অ্যাকাউন্ট",
        heading: "যাচাইকৃত ইমেইলে ভুয়া অ্যাকাউন্ট ঠেকানো সহজ।",
        icon: <ShieldCheckIcon className="h-5 w-5" />,
      }}
    >
      <VerifyEmailPanel
        email={email ?? ""}
        status={status}
        reason={reason ?? ""}
      />
    </AuthShell>
  );
}

function getChrome(
  status: Status,
  t: Awaited<ReturnType<typeof getTranslations<"auth">>>,
) {
  if (status === "verified") {
    return {
      heroHeading: "ইমেইল সফলভাবে যাচাই হয়েছে",
      heroSubhead:
        "স্বাগতম! আপনার অ্যাকাউন্ট এখন সক্রিয়। এবার লগইন করে ToletZoo ব্যবহার শুরু করুন।",
      pill: "যাচাই সম্পন্ন",
      formHeading: t("verifyEmailSuccessTitle"),
      formSubhead: t("verifyEmailSuccessBody"),
      icon: <CheckCircle2Icon className="h-5 w-5" />,
    };
  }
  if (status === "error") {
    return {
      heroHeading: "যাচাই লিংক অকার্যকর",
      heroSubhead:
        "লিংকটি মেয়াদোত্তীর্ণ বা ইতিমধ্যে ব্যবহৃত। নতুন যাচাই লিংক নিন এবং আবার চেষ্টা করুন।",
      pill: "সমস্যা হয়েছে",
      formHeading: t("verifyEmailErrorTitle"),
      formSubhead: t("verifyEmailErrorBody"),
      icon: <XCircleIcon className="h-5 w-5" />,
    };
  }
  return {
    heroHeading: "আপনার ইমেইল যাচাই করুন",
    heroSubhead:
      "আমরা আপনাকে একটি লিংক পাঠিয়েছি। লিংকে ক্লিক করলে আপনার অ্যাকাউন্ট সক্রিয় হবে এবং আপনি লগইন করতে পারবেন।",
    pill: "যাচাই বাকি",
    formHeading: t("verifyEmailTitle"),
    formSubhead: t("verifyEmailSubtitle"),
    icon: <MailCheckIcon className="h-5 w-5" />,
  };
}
