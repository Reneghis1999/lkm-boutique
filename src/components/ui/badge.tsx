import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
  {
    variants: {
      variant: {
        default: "bg-white/10 text-white/80",
        blue: "bg-[var(--lkm-blue)]/20 text-[#7ec4ff]",
        green: "bg-[var(--lkm-green)]/20 text-[#6dffb0]",
        yellow: "bg-[var(--lkm-yellow)]/20 text-[#ffe28a]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
