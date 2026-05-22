import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

type AuthShellProps = {
  step?: { current: number; total: number; label: string };
  eyebrow?: string;
  heading: React.ReactNode;
  subhead?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
  backHref?: string;
  appName: string;
};

export function AuthShell({
  step,
  eyebrow,
  heading,
  subhead,
  children,
  aside,
  backHref,
  appName,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen">
      <header className="absolute inset-x-0 top-0 z-50">
        <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between px-4 pt-5 sm:px-6 md:pt-7">
          <Link href="/" className="flex items-baseline gap-1">
            <span className="font-display text-2xl italic leading-none">/</span>
            <span className="text-lg font-semibold tracking-tight">{appName}</span>
          </Link>
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper/70 px-4 py-2 text-sm font-medium text-ink backdrop-blur-md transition-colors hover:bg-paper"
            >
              <ArrowLeftIcon className="size-4" />
              <span>পেছনে</span>
            </Link>
          ) : null}
        </div>
      </header>

      <div className="grid min-h-screen md:grid-cols-[1fr_1.05fr] lg:grid-cols-[1fr_1.15fr]">
        <div className="flex flex-col justify-center px-5 pt-28 pb-16 sm:px-10 md:px-16 md:pt-32 lg:px-20">
          <div className="mx-auto flex w-full max-w-md flex-col gap-7">
            {step ? <StepRail step={step} /> : null}

            <div className="flex flex-col gap-3">
              {eyebrow ? (
                <span className="slash-label text-xl md:text-2xl">{eyebrow}</span>
              ) : null}
              <h1 className="font-display text-4xl italic leading-[1.05] tracking-tight text-ink md:text-5xl">
                {heading}
              </h1>
              {subhead ? (
                <p className="text-sm text-ink-soft md:text-base">{subhead}</p>
              ) : null}
            </div>

            {children}
          </div>
        </div>

        <div className="relative hidden p-3 md:block md:p-4">
          <div className="editorial-card sticky top-4 h-[calc(100vh-2rem)] overflow-hidden">
            {aside}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepRail({ step }: { step: { current: number; total: number; label: string } }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: step.total }).map((_, index) => (
          <span
            key={index}
            className={
              index < step.current
                ? "h-1.5 w-8 rounded-full bg-ember transition-all"
                : "h-1.5 w-4 rounded-full bg-rule transition-all"
            }
          />
        ))}
      </div>
      <span className="text-xs uppercase tracking-[0.18em] text-ink-soft">
        {step.label}
      </span>
    </div>
  );
}
