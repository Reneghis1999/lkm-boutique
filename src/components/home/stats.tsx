"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RevealOnScroll } from "@/components/home/motion/reveal";
import { cn } from "@/lib/utils";

export type Stat = { value: number; label: string };

const fmt = new Intl.NumberFormat("fr-FR");

/** Chiffres réels du catalogue qui « comptent » quand ils arrivent à l’écran. */
export function Stats({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".stat-value").forEach((el) => {
        const target = Number(el.dataset.value || 0);
        const counter = { v: 0 };
        el.textContent = "0";
        gsap.to(counter, {
          v: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => {
            el.textContent = fmt.format(Math.round(counter.v));
          },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <RevealOnScroll className="mx-auto max-w-[1440px] px-3 py-16 sm:px-4 lg:px-5">
      <div ref={ref} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            data-reveal
            className={cn(
              "flex min-h-[170px] flex-col justify-between rounded-[1.75rem] p-6 sm:min-h-[220px] sm:p-8",
              i === 0
                ? "bg-[var(--lkm-blue)] text-white"
                : "border border-white/10 bg-[var(--lkm-surface)] text-white",
            )}
          >
            <span
              className="stat-value font-[family-name:var(--font-display)] text-5xl font-semibold tracking-[-0.04em] sm:text-7xl"
              data-value={s.value}
            >
              {fmt.format(s.value)}
            </span>
            <span className={cn("text-sm", i === 0 ? "text-white/75" : "text-white/50")}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </RevealOnScroll>
  );
}
