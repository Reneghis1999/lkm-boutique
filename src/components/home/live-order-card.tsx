"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, MessageCircle, Store, Tag, Wrench } from "lucide-react";
import { shop } from "@/data/shop";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type Step = { icon: typeof Check; title: string; detail: string };

/**
 * Petite carte « en direct » : les étapes d’une commande se cochent une à une,
 * puis l’animation recommence.
 */
export function LiveOrderCard({
  product,
  className,
}: {
  product: { name: string; price: number | null } | null;
  className?: string;
}) {
  const steps: Step[] = [
    {
      icon: MessageCircle,
      title: "Commande reçue sur WhatsApp",
      detail: product?.name ?? "PlayStation 5 · 1 manette",
    },
    {
      icon: Tag,
      title: "Prix confirmé",
      detail: product?.price ? formatPrice(product.price) : "Prix affiché en CFA",
    },
    {
      icon: Store,
      title: "Réservé en boutique",
      detail: shop.locations[0]?.name ?? "Boutique Léo 2000",
    },
    {
      icon: Wrench,
      title: "Prêt à tester sur place",
      detail: "Vous essayez avant de repartir",
    },
  ];

  // index de l’étape en cours ; steps.length = tout est validé
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = window.setTimeout(() => setActive(steps.length), 0);
      return () => window.clearTimeout(id);
    }
    const id = window.setInterval(() => {
      setActive((a) => (a >= steps.length + 2 ? 0 : a + 1));
    }, 1300);
    return () => window.clearInterval(id);
  }, [steps.length]);

  return (
    <div
      className={cn(
        "rounded-2xl bg-white/95 p-3 text-[#0b0b0f] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] backdrop-blur",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between px-1 text-[11px] font-medium text-[#0b0b0f]/50">
        <span>Exemple</span>
        <span className="inline-flex items-center gap-1.5 text-[var(--lkm-green)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--lkm-green)] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--lkm-green)]" />
          </span>
          en direct
        </span>
      </div>
      <ul className="space-y-1">
        {steps.map((step, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <li
              key={step.title}
              className={cn(
                "flex items-center gap-3 rounded-xl px-2.5 py-2 transition-all duration-500",
                current && "bg-[var(--lkm-blue)]/10",
                !done && !current && "opacity-40",
              )}
            >
              <step.icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  done || current ? "text-[var(--lkm-blue)]" : "text-[#0b0b0f]/40",
                )}
                strokeWidth={2}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-semibold leading-tight">
                  {step.title}
                </p>
                <p className="truncate text-[11px] leading-tight text-[#0b0b0f]/50">
                  {step.detail}
                </p>
              </div>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                {done ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--lkm-green)] text-white">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                ) : current ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--lkm-blue)]" />
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
