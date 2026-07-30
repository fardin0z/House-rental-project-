import Image from "next/image";
import Link from "next/link";
import logoSrc from "@/public/logo.png";

type LogoSize = "sm" | "md" | "lg";
type LogoVariant = "auto" | "dark";

const SIZE_PX: Record<LogoSize, number> = {
  sm: 96,
  md: 128,
  lg: 168,
};

export function Logo({
  href = "/",
  size = "md",
  variant = "auto",
  className = "",
  priority = false,
  ariaLabel = "ToletZoo",
}: {
  href?: string | null;
  size?: LogoSize;
  variant?: LogoVariant;
  className?: string;
  priority?: boolean;
  ariaLabel?: string;
}) {
  const width = SIZE_PX[size];
  const height = Math.round((width * 504) / 1296);

  const onDark = variant === "dark";
  const wrapperBase =
    "inline-flex items-center" +
    (onDark
      ? " rounded-2xl bg-white px-2.5 py-1.5"
      : "");

  const content = (
    <Image
      src={logoSrc}
      alt={ariaLabel}
      width={width}
      height={height}
      priority={priority}
      sizes={`(max-width: 900px) 104px, ${width}px`}
      className="h-auto w-full"
      style={{ maxWidth: width, maxHeight: height }}
    />
  );

  if (!href) {
    return (
      <span
        aria-label={ariaLabel}
        className={`${wrapperBase} ${className}`.trim()}
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={`${wrapperBase} ${className}`.trim()}
    >
      {content}
    </Link>
  );
}
