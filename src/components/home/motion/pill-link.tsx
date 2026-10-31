import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "dark" | "yellow" | "light" | "blue" | "outline";

const styles: Record<Variant, { pill: string; dot: string }> = {
  dark: {
    pill: "bg-[#0b0b0f] text-white hover:bg-black",
    dot: "bg-[var(--lkm-yellow)] text-[#0b0b0f]",
  },
  yellow: {
    pill: "bg-[var(--lkm-yellow)] text-[#1a1400] hover:bg-[#ffd84a]",
    dot: "bg-[#0b0b0f] text-white",
  },
  light: {
    pill: "bg-white text-[#0b0b0f] hover:bg-[#f3efe6]",
    dot: "bg-[var(--lkm-blue)] text-white",
  },
  blue: {
    pill: "bg-[var(--lkm-blue)] text-white hover:bg-[#1a7fd9]",
    dot: "bg-white text-[var(--lkm-blue)]",
  },
  outline: {
    pill: "border border-white/20 bg-white/5 text-white hover:bg-white/10",
    dot: "bg-white/12 text-white",
  },
};

/** Bouton « pilule » avec flèche dans un rond (la flèche glisse au survol). */
export function PillLink({
  href,
  children,
  variant = "dark",
  external = false,
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  external?: boolean;
  className?: string;
}) {
  const s = styles[variant];
  const classes = cn(
    "group inline-flex items-center gap-3 rounded-full py-1.5 pl-5 pr-1.5 text-sm font-semibold transition-colors duration-300 sm:text-[0.95rem]",
    s.pill,
    className,
  );
  const content = (
    <>
      <span>{children}</span>
      <span
        className={cn(
          "relative inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full",
          s.dot,
        )}
      >
        <ArrowUpRight
          className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-5 group-hover:-translate-y-5"
          strokeWidth={2.25}
        />
        <ArrowUpRight
          className="absolute h-4 w-4 -translate-x-5 translate-y-5 transition-transform duration-300 ease-out group-hover:translate-x-0 group-hover:translate-y-0"
          strokeWidth={2.25}
        />
      </span>
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
