import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function ContentPage({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  const tCommon = await getTranslations("common");

  return (
    <div className="min-h-screen">
      <header className="border-b border-rule/60">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-5 sm:px-6">
          <Link href="/" className="flex items-baseline gap-1.5">
            <span className="text-base font-semibold tracking-tight">
              {tCommon("appName")}
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink"
          >
            <ArrowLeftIcon className="size-4" />
            {tCommon("back")}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-6 md:py-16">
        <span className="slash-label text-xl md:text-2xl">{eyebrow}</span>
        <h1 className="mt-3 font-display text-4xl italic leading-tight text-ink md:text-5xl">
          {title}
        </h1>
        <div className="mt-8 flex flex-col gap-5 text-base leading-relaxed text-ink/80">
          {children}
        </div>
      </main>
    </div>
  );
}
