import { AppHeader } from "@/components/shared/app-header";

export async function ContentPage({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ink-50">
      <AppHeader />

      <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-6 md:py-16">
        <header>
          <span className="slash-label text-xl md:text-2xl">{eyebrow}</span>
          <h1 className="mt-3 font-display text-4xl italic leading-tight text-ink md:text-5xl">
            {title}
          </h1>
        </header>
        <article className="mt-8 flex flex-col gap-5 text-base leading-relaxed text-ink/80">
          {children}
        </article>
      </main>
    </div>
  );
}
