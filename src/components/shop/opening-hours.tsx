"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { hoursSummary, openingStatus } from "@/lib/opening-hours";
import { cn } from "@/lib/utils";

/** Badge « Ouvert maintenant » / « Fermé », calculé à l’heure de Lomé. */
export function OpeningStatus({ className }: { className?: string }) {
  const [status, setStatus] = useState<{ open: boolean; label: string } | null>(null);

  useEffect(() => {
    const update = () => setStatus(openingStatus(new Date()));
    const first = window.setTimeout(update, 0);
    const timer = window.setInterval(update, 60_000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, []);

  if (!status) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        status.open
          ? "bg-[var(--lkm-green)]/15 text-[#3ddc8a]"
          : "bg-amber-400/15 text-amber-300",
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status.open ? "bg-[#3ddc8a]" : "bg-amber-300",
        )}
      />
      {status.label}
    </span>
  );
}

/** Horaires (« Lun – Sam : 8h – 21h · Dim : 10h – 20h ») + badge ouvert / fermé. */
export function OpeningHours({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  const lines = hoursSummary();
  return (
    <span
      className={cn(
        "inline-flex flex-col gap-1.5 text-sm",
        tone === "dark" ? "text-white/60" : "text-[#0b0b0f]/70",
        className,
      )}
    >
      <span className="inline-flex items-start gap-2">
        <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          {lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </span>
      </span>
      <OpeningStatus
        className={cn("self-start", tone === "light" ? "bg-black/5 text-[#0b0b0f]" : undefined)}
      />
    </span>
  );
}
