export function BrandMark({
  className = "h-8 w-8",
}: {
  className?: string;
}) {
  return (
    <span className={`inline-block ${className}`} aria-hidden>
      <svg
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <rect width="512" height="512" rx="112" fill="#1F1812" />
        <text
          x="256"
          y="350"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontStyle="italic"
          fontWeight="400"
          fontSize="300"
          textAnchor="middle"
          fill="#F2EDE3"
        >
          T
        </text>
        <circle cx="346" cy="380" r="22" fill="#E89D4F" />
      </svg>
    </span>
  );
}
