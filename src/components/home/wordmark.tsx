"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const lkm = [
  { c: "L", color: "text-[var(--lkm-blue)]" },
  { c: "K", color: "text-[var(--lkm-green)]" },
  { c: "M", color: "text-[var(--lkm-yellow)]" },
];

/**
 * Grand logotype en bas de page. La taille suit la largeur disponible
 * (unités cqw) : jamais coupé, quel que soit l’écran.
 * Mobile : « LKM » / « Boutique » sur deux lignes ; tablette et + : une ligne.
 */
export function Wordmark() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".wm-letter", {
        yPercent: 130,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.05,
        scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} aria-hidden className="px-4 pb-4 pt-10 sm:px-6 lg:px-8">
      <div className="@container mx-auto max-w-[1440px]">
        <div className="flex flex-col items-center font-[family-name:var(--font-display)] font-semibold leading-[0.82] tracking-[-0.06em] text-[23cqw] sm:flex-row sm:items-end sm:justify-center sm:text-[15.6cqw]">
          <span className="flex overflow-hidden pb-[0.14em] pr-[0.04em]">
            {lkm.map((l) => (
              <span key={l.c} className={`wm-letter inline-block ${l.color}`}>
                {l.c}
              </span>
            ))}
          </span>
          <span className="-mt-[0.1em] flex overflow-hidden pb-[0.14em] pr-[0.04em] sm:mt-0 sm:ml-[0.12em]">
            {"Boutique".split("").map((c, i) => (
              <span key={i} className="wm-letter inline-block text-white">
                {c}
              </span>
            ))}
          </span>
        </div>
      </div>
    </section>
  );
}
