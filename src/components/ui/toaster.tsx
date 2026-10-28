"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useToast } from "@/store/toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const toasts = useToast((s) => s.toasts);
  const dismiss = useToast((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className={cn(
              "pointer-events-auto flex max-w-sm items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-xl",
              toast.tone === "success"
                ? "border-[var(--lkm-green)]/30 bg-[#0d1a12]/95 text-white"
                : "border-white/10 bg-[#121216]/95 text-white",
            )}
            role="status"
            onClick={() => dismiss(toast.id)}
          >
            {toast.tone === "success" && (
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lkm-green)]/20 text-[#6dffb0]">
                <Check className="h-3.5 w-3.5" />
              </span>
            )}
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
