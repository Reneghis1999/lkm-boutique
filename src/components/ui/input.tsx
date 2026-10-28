import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[var(--lkm-blue)]/60 focus:bg-white/8 focus:ring-2 focus:ring-[var(--lkm-blue)]/25",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";
