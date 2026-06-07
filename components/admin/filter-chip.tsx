import Link from "next/link";

export function FilterChip({
  href,
  label,
  active,
  variant = "ghost",
}: {
  href: string;
  label: string;
  active: boolean;
  variant?: "ghost" | "white";
}) {
  if (active) {
    return (
      <Link
        href={href}
        scroll={false}
        className="rounded-full bg-ink-900 px-3.5 py-1.5 text-[12px] font-bold text-white"
      >
        {label}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      scroll={false}
      className={
        variant === "white"
          ? "rounded-full bg-white px-3.5 py-1.5 text-[12px] font-semibold text-ink-500 transition hover:text-ink-900"
          : "rounded-full px-3.5 py-1.5 text-[12px] font-semibold text-ink-500 transition hover:text-ink-900"
      }
    >
      {label}
    </Link>
  );
}
