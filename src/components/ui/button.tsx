import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lkm-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lkm-bg)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--lkm-blue)] text-white hover:bg-[#1a7fd9] shadow-[0_8px_30px_rgba(0,114,206,0.35)]",
        green:
          "bg-[var(--lkm-green)] text-white hover:bg-[#12b86a] shadow-[0_8px_30px_rgba(0,168,89,0.3)]",
        yellow:
          "bg-[var(--lkm-yellow)] text-[#1a1400] hover:bg-[#ffd84a] shadow-[0_8px_30px_rgba(245,197,24,0.3)]",
        outline:
          "border border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/25",
        ghost: "text-white/80 hover:bg-white/8 hover:text-white",
        whatsapp:
          "bg-[#25D366] text-[#052e14] hover:bg-[#2fe472] shadow-[0_8px_30px_rgba(37,211,102,0.35)]",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-3.5 text-xs",
        lg: "h-12 px-7 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
