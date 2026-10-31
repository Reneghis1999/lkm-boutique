"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Fait apparaître (glissé vers le haut + fondu) les éléments `[data-reveal]`
 * et les titres `[data-reveal-title]` (lignes qui montent derrière un cache)
 * quand ils entrent à l’écran.
 */
export function RevealOnScroll({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set("[data-reveal]", { opacity: 0 });
      gsap.utils.toArray<HTMLElement>("[data-reveal-title] .line-inner").forEach(
        (line) => {
          gsap.from(line, {
            yPercent: 110,
            duration: 1.05,
            ease: "expo.out",
            scrollTrigger: { trigger: line, start: "top 90%", once: true },
          });
        },
      );
      ScrollTrigger.batch("[data-reveal]", {
        start: "top 88%",
        once: true,
        onEnter: (els) =>
          gsap.fromTo(
            els,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.9,
              ease: "power3.out",
              stagger: 0.08,
              overwrite: true,
            },
          ),
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Titre découpé en lignes qui montent une à une (utiliser dans RevealOnScroll). */
export function RevealTitle({
  lines,
  className,
  as: Tag = "h2",
}: {
  lines: React.ReactNode[];
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <Tag data-reveal-title className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
          <span className="line-inner block">{line}</span>
        </span>
      ))}
    </Tag>
  );
}
