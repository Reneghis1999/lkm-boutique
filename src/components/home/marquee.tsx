"use client";

import { Fragment, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

const rowA = ["PlayStation", "iPhone", "MacBook", "Samsung", "Xbox", "Switch"];
const rowB = ["Réparation", "Manettes", "Power banks", "Jeux vidéo", "Accessoires", "Pièces"];
const dots = ["bg-[var(--lkm-blue)]", "bg-[var(--lkm-green)]", "bg-[var(--lkm-yellow)]"];

function Row({ words, outline }: { words: string[]; outline?: boolean }) {
  const items = [...words, ...words];
  return (
    <div className="marquee-track flex w-max items-center whitespace-nowrap">
      {[0, 1].map((copy) => (
        <div key={copy} className="flex items-center" aria-hidden={copy === 1}>
          {items.map((w, i) => (
            <Fragment key={`${copy}-${i}`}>
              <span
                className={cn(
                  "px-6 font-[family-name:var(--font-display)] text-[13vw] font-semibold leading-none tracking-[-0.04em] sm:text-[9vw] lg:text-[7.5vw]",
                  outline
                    ? "text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.35)]"
                    : "text-white",
                )}
              >
                {w}
              </span>
              <span
                className={cn("h-4 w-4 shrink-0 rounded-full sm:h-6 sm:w-6", dots[i % dots.length])}
              />
            </Fragment>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Deux bandeaux de gros mots qui défilent en sens inverse ; accélèrent au scroll. */
export function Marquee() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const [a, b] = gsap.utils.toArray<HTMLElement>(".marquee-track");
      const ta = gsap.to(a, { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
      const tb = gsap.fromTo(
        b,
        { xPercent: -50 },
        { xPercent: 0, duration: 40, ease: "none", repeat: -1 },
      );
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 300, 5);
          gsap.to([ta, tb], { timeScale: boost, duration: 0.2, overwrite: true });
          gsap.to([ta, tb], { timeScale: 1, duration: 1.2, delay: 0.2 });
        },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} aria-label="Nos univers" className="overflow-hidden py-14 sm:py-20">
      <Row words={rowA} />
      <div className="mt-2 sm:mt-4">
        <Row words={rowB} outline />
      </div>
    </section>
  );
}
