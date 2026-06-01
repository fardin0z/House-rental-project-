import Link from "next/link";
import { ArrowLeftIcon, ShieldCheckIcon } from "lucide-react";
import { BrandMark } from "@/components/shared/brand-mark";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=2200&q=90&auto=format&fit=crop";

type Stat = {
  icon: React.ReactNode;
  value: string;
  label: string;
};

type AuthShellProps = {
  appName: string;
  appNameBn: string;
  topAction?: { label: string; href: string };
  heroBadge: { icon?: React.ReactNode; text: string };
  heroHeading: string;
  heroSubhead: string;
  heroStats: [Stat, Stat, Stat];
  formPill?: string;
  formHeading: string;
  formSubhead: string;
  formIcon?: React.ReactNode;
  children: React.ReactNode;
  bottomCard?: { eyebrow: string; heading: string; icon?: React.ReactNode };
};

export function AuthShell({
  appName,
  appNameBn,
  topAction,
  heroBadge,
  heroHeading,
  heroSubhead,
  heroStats,
  formPill,
  formHeading,
  formSubhead,
  formIcon,
  children,
  bottomCard,
}: AuthShellProps) {
  const [statA, statB, statC] = heroStats;
  return (
    <main className="min-h-screen bg-white p-3 text-ink-900 md:p-6">
      <div className="grid min-h-[calc(100vh-24px)] grid-cols-1 gap-3 md:min-h-[calc(100vh-48px)] md:grid-cols-2 md:gap-4 lg:grid-cols-[1.05fr_1fr]">
        <section className="relative flex min-h-[480px] flex-col overflow-hidden rounded-[22px] bg-ink-900 md:min-h-0">
          <img
            src={HERO_IMAGE}
            alt=""
            className="absolute inset-0 h-full w-full object-cover brightness-[.78] saturate-[.82]"
          />
          <div className="auth-overlay absolute inset-0 z-[1]" />

          <header className="relative z-10 flex items-start px-6 pt-6 md:px-8 md:pt-8">
            <Link href="/" className="flex items-center gap-2.5">
              <BrandMark className="h-9 w-9" />
              <span>
                <span className="font-space block text-[20px] font-semibold leading-none tracking-tight text-white">
                  {appName}
                </span>
                <span className="mt-1 block text-[12px] font-semibold text-white/60">
                  {appNameBn}
                </span>
              </span>
            </Link>
          </header>

          <div className="relative z-[3] flex-1" />

          <section className="relative z-[3] px-6 pb-8 md:px-10 md:pb-12">
            <p className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-[12px] font-bold text-white backdrop-blur">
              <span className="text-lime-400">
                {heroBadge.icon ?? <ShieldCheckIcon className="h-4 w-4" />}
              </span>
              {heroBadge.text}
            </p>

            <h1 className="max-w-[440px] text-[28px] font-semibold leading-[1.05] tracking-tight text-white md:text-[34px] lg:text-[40px]">
              {heroHeading}
            </h1>

            <p className="mt-4 max-w-[420px] text-[14px] font-medium leading-relaxed text-white/80 md:text-[15px]">
              {heroSubhead}
            </p>

            <div className="mt-7 grid max-w-[460px] grid-cols-3 gap-2.5">
              <HeroStatCard stat={statA} />
              <HeroStatCard stat={statB} />
              <HeroStatCardHighlight stat={statC} />
            </div>
          </section>
        </section>

        <section className="relative flex flex-col rounded-[22px] bg-ink-50 p-5 md:p-8">
          {topAction ? (
            <div className="flex justify-end">
              <Link
                href={topAction.href}
                className="inline-flex h-10 items-center justify-center rounded-full bg-white px-4 text-[13px] font-semibold text-ink-700 transition hover:bg-white/70 md:px-5"
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                {topAction.label}
              </Link>
            </div>
          ) : null}

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                {formPill ? (
                  <p className="mb-4 w-fit rounded-full bg-white px-4 py-2 text-[11px] font-bold text-ink-500">
                    {formPill}
                  </p>
                ) : null}
                <h2 className="text-[32px] font-semibold leading-none tracking-tight text-ink-900 md:text-[40px]">
                  {formHeading}
                </h2>
                <p className="mt-4 text-[15px] font-medium leading-relaxed text-ink-500">
                  {formSubhead}
                </p>
              </div>

              {formIcon ? (
                <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-lime-400 text-ink-900 md:inline-flex">
                  {formIcon}
                </span>
              ) : null}
            </div>

            <div className="mt-7">{children}</div>
          </div>

          {bottomCard ? (
            <div className="rounded-[20px] bg-ink-900 p-5 text-white">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime-400 text-ink-900">
                  {bottomCard.icon ?? <ShieldCheckIcon className="h-5 w-5" />}
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[.12em] text-white/40">
                    {bottomCard.eyebrow}
                  </p>
                  <h3 className="mt-2 text-[19px] font-semibold leading-tight tracking-tight">
                    {bottomCard.heading}
                  </h3>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function HeroStatCard({ stat }: { stat: Stat }) {
  return (
    <div className="rounded-[16px] bg-white/12 p-3 text-white backdrop-blur">
      <span className="text-lime-400">{stat.icon}</span>
      <p className="font-space mt-4 text-[20px] font-semibold leading-none text-white">
        {stat.value}
      </p>
      <p className="mt-2 text-[10px] font-semibold leading-tight text-white/55">
        {stat.label}
      </p>
    </div>
  );
}

function HeroStatCardHighlight({ stat }: { stat: Stat }) {
  return (
    <div className="relative overflow-hidden rounded-[16px] bg-ink-900 p-3 text-white">
      <span className="text-lime-400">{stat.icon}</span>
      <p className="font-space mt-4 text-[20px] font-semibold leading-none text-white">
        {stat.value}
      </p>
      <p className="mt-2 text-[10px] font-semibold leading-tight text-white/55">
        {stat.label}
      </p>
      <div className="trust-pocket">
        <span className="absolute bottom-2 right-2 z-[6] inline-flex h-10 w-10 items-center justify-center rounded-full bg-lime-400 text-ink-900">
          <ShieldCheckIcon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}
