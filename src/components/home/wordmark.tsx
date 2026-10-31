"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const letters = [
  { c: "L", color: "text-[var(--lkm-blue)]" },
  { c: "K", color: "text-[var(--lkm-green)]" },
  { c: "M", color: "text-[var(--lkm-yellow)]" },
];

/** Grand logotype en bas de page, lettres qui montent à l’arrivée. */
export function Wordmark() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".wm-letter", {
        yPercent: 105,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.05,
        scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} aria-hidden className="overflow-hidden px-3 pb-6 pt-10 sm:px-5">
      <div className="mx-auto flex max-w-[1440px] items-end justify-center overflow-hidden font-[family-name:var(--font-display)] text-[18.5vw] font-semibold leading-[0.8] tracking-[-0.06em] lg:text-[15vw]">
        {letters.map((l) => (
          <span key={l.c} className={`wm-letter inline-block ${l.color}`}>
            {l.c}
          </span>
        ))}
        {"Boutique".split("").map((c, i) => (
          <span
            key={i}
            className={`wm-letter inline-block text-white ${i === 0 ? "ml-[0.12em]" : ""}`}
          >
            {c}
          </span>
        ))}
      </div>
    </section>
  );
}
