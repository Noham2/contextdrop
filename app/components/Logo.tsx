import Link from "next/link";

interface LogoProps {
  href?: string;
  style?: React.CSSProperties;
  size?: number;
}

export function Logo({ href = "/", style, size = 24 }: LogoProps) {
  return (
    <Link
      href={href}
      className="logo"
      style={{
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        ...style,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        style={{ flexShrink: 0 }}
        aria-hidden="true"
      >
        <path
          d="M12 2 C12 2 4 10 4 15 C4 19.4 7.6 23 12 23 C16.4 23 20 19.4 20 15 C20 10 12 2 12 2Z"
          fill="#d4522a"
        />
      </svg>
      Context<span>Drop</span>
    </Link>
  );
}
