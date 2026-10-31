"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { shop } from "@/data/shop";
import { cn } from "@/lib/utils";

/** Heure décimale actuelle dans le fuseau de la boutique (Lomé). */
function shopHour(now: Date) {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: shop.hours.timeZone,
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h + m / 60;
}

/** Badge « Ouvert maintenant » / « Fermé », calculé à l’heure de Lomé. */
export function OpeningStatus({ className }: { className?: string }) {
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const update = () => {
      const h = shopHour(new Date());
      setOpen(h >= shop.hours.opens && h < shop.hours.closes);
    };
    const first = window.setTimeout(update, 0);
    const timer = window.setInterval(update, 60_000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, []);

  if (open === null) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        open
          ? "bg-[var(--lkm-green)]/15 text-[#3ddc8a]"
          : "bg-amber-400/15 text-amber-300",
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          open ? "bg-[#3ddc8a]" : "bg-amber-300",
        )}
      />
      {open
        ? `Ouvert maintenant · ferme à ${shop.hours.closes}h`
        : `Fermé · ouvre à ${shop.hours.opens}h`}
    </span>
  );
}

/** Ligne « Horaires : 8h – 21h » + badge ouvert / fermé. */
export function OpeningHours({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm",
        tone === "dark" ? "text-white/60" : "text-[#0b0b0f]/70",
        className,
      )}
    >
      <span className="inline-flex items-center gap-2">
        <Clock className="h-3.5 w-3.5 shrink-0" />
        Ouvert de {shop.hours.opens}h à {shop.hours.closes}h
      </span>
      <OpeningStatus
        className={tone === "light" ? "bg-black/5 text-[#0b0b0f]" : undefined}
      />
    </span>
  );
}
