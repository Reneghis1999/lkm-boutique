"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PillLink } from "@/components/home/motion/pill-link";
import { RevealOnScroll, RevealTitle } from "@/components/home/motion/reveal";
import { cn } from "@/lib/utils";

type Group = {
  id: string;
  title: string;
  description: string;
  href: string;
  count: number;
  image?: string | null;
};

const palettes = [
  { card: "bg-[var(--lkm-blue)] text-white", muted: "text-white/70", panel: "bg-black/15", badge: "bg-white/15 text-white", pill: "light" as const },
  { card: "bg-[#04683a] text-white", muted: "text-white/70", panel: "bg-black/20", badge: "bg-white/15 text-white", pill: "yellow" as const },
  { card: "bg-[var(--lkm-yellow)] text-[#0b0b0f]", muted: "text-[#0b0b0f]/65", panel: "bg-black/10", badge: "bg-[#0b0b0f] text-white", pill: "dark" as const },
  { card: "bg-[var(--lkm-cream)] text-[#0b0b0f]", muted: "text-[#0b0b0f]/60", panel: "bg-black/[0.06]", badge: "bg-[var(--lkm-green)] text-white", pill: "dark" as const },
];

/** Univers du catalogue en grandes cartes qui s’empilent au défilement. */
export function StackedGroups({ groups }: { groups: Group[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const wrappers = gsap.utils.toArray<HTMLElement>(".stack-item");
      wrappers.forEach((wrapper, i) => {
        const next = wrappers[i + 1];
        if (!next) return;
        const card = wrapper.querySelector(".stack-card");
        gsap.fromTo(
          card,
          { scale: 1, filter: "brightness(1)" },
          {
            scale: 0.92,
            filter: "brightness(0.82)",
            ease: "none",
            scrollTrigger: {
              trigger: next,
              start: "top bottom",
              end: "top 20%",
              scrub: true,
            },
          },
        );
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="px-3 pb-10 sm:px-4 lg:px-5">
      <RevealOnScroll className="mx-auto mb-12 flex max-w-[1440px] flex-col gap-6 px-2 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span data-reveal className="inline-flex rounded-full bg-[var(--lkm-yellow)] px-3 py-1 text-xs font-semibold text-[#1a1400]">
            Catalogue
          </span>
          <RevealTitle
            lines={["Explorez", "par univers."]}
            className="mt-5 font-[family-name:var(--font-display)] text-5xl font-semibold leading-[0.98] tracking-[-0.035em] text-white sm:text-6xl lg:text-7xl"
          />
        </div>
        <p data-reveal className="max-w-sm text-white/55">
          Quatre portes d’entrée vers le stock réel de LKM Boutique à Lomé.
        </p>
      </RevealOnScroll>

      <div ref={ref} className="relative mx-auto max-w-[1440px]">
        {groups.map((group, i) => {
          const p = palettes[i % palettes.length];
          return (
            <div
              key={group.id}
              className="stack-item sticky mb-6 last:mb-0"
              style={{ top: `calc(5.5rem + ${i * 1.1}rem)` }}
            >
              <article
                className={cn(
                  "stack-card grid origin-top overflow-hidden rounded-[2rem] p-7 sm:p-10 lg:min-h-[68vh] lg:grid-cols-[1fr_1fr] lg:gap-10 lg:p-14",
                  p.card,
                )}
              >
                <div className="flex flex-col justify-between gap-8">
                  <div>
                    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold", p.badge)}>
                      {group.count} produits
                    </span>
                    <h3 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
                      {group.title}
                    </h3>
                    <p className={cn("mt-5 max-w-md text-base sm:text-lg", p.muted)}>
                      {group.description}
                    </p>
                  </div>
                  <div>
                    <PillLink href={group.href} variant={p.pill}>
                      {group.id === "repair" ? "Voir le service" : "Voir les produits"}
                    </PillLink>
                  </div>
                </div>
                <div className={cn("relative mt-8 aspect-[4/3] overflow-hidden rounded-[1.5rem] lg:mt-0 lg:aspect-auto", p.panel)}>
                  {group.image ? (
                    <Image
                      src={group.image}
                      alt={group.title}
                      fill
                      sizes="(max-width: 1024px) 90vw, 640px"
                      className="object-contain p-8 sm:p-12"
                    />
                  ) : null}
                </div>
              </article>
            </div>
          );
        })}
      </div>
    </section>
  );
}
