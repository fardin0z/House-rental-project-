import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowUpRightIcon, CheckIcon } from "lucide-react";

export default async function MovingSuccessPage() {
  const t = await getTranslations("moving");

  return (
    <div className="mx-auto max-w-3xl px-6 pb-16 pt-16">
      <div className="rounded-[28px] bg-ink-50 p-8 text-center md:p-12">
        <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-lime-400 text-ink-900">
          <CheckIcon className="h-8 w-8" strokeWidth={2.5} />
        </span>
        <h1 className="font-display mt-8 text-[40px] italic leading-[.92] tracking-tight text-ink-900 md:text-[56px]">
          {t("successTitle")}
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-[15px] font-medium leading-relaxed text-ink-500">
          {t("successBody")}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full border border-ink-900/10 bg-white px-6 text-[13px] font-bold text-ink-900 transition hover:bg-ink-100"
          >
            {t("successCtaHome")}
          </Link>
          <Link
            href="/moving"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink-900 px-6 text-[13px] font-bold text-white transition hover:bg-ink-700"
          >
            {t("successCtaAnother")}
            <ArrowUpRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
