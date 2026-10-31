"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RevealOnScroll, RevealTitle } from "@/components/home/motion/reveal";

const steps = [
  {
    title: "Choisissez en ligne",
    text: "Parcourez le catalogue et les prix affichés en CFA.",
  },
  {
    title: "Écrivez-nous sur WhatsApp",
    text: "Votre panier part en un message : on confirme le prix et la disponibilité.",
  },
  {
    title: "Venez tester",
    text: "À Léo 2000, vous essayez votre matériel avant de repartir.",
  },
  {
    title: "Besoin d’une réparation ?",
    text: "Diagnostic, pièces et intervention à Djidjolé.",
  },
];

/** Étapes reliées par une ligne qui se remplit au défilement. */
export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: "top 75%", end: "bottom 60%", scrub: true },
      });
      tl.fromTo(".steps-line", { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);
      gsap.utils.toArray<HTMLElement>(".step-dot").forEach((dot, i, all) => {
        tl.fromTo(
          dot,
          { backgroundColor: "#1c1c22", color: "rgba(255,255,255,0.5)" },
          { backgroundColor: "#f5c518", color: "#0b0b0f", duration: 0.05 },
          i / Math.max(all.length - 1, 1) - 0.02,
        );
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <RevealOnScroll className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 sm:py-32">
      <span data-reveal className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
        Comment ça marche
      </span>
      <RevealTitle
        lines={["Du clic à la boutique,", "en quatre étapes."]}
        className="mt-5 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1] tracking-[-0.035em] text-white sm:text-6xl"
      />

      <div ref={ref} className="relative mt-16">
        <div className="absolute left-5 right-5 top-5 hidden h-[2px] bg-white/10 lg:block">
          <div className="steps-line h-full origin-left bg-[var(--lkm-yellow)]" />
        </div>
        <ol className="grid gap-4 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} data-reveal className="relative">
              <span className="step-dot relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--lkm-yellow)] font-[family-name:var(--font-display)] text-sm font-bold text-[#0b0b0f]">
                {i + 1}
              </span>
              <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-[var(--lkm-surface)] p-6">
                <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </RevealOnScroll>
  );
}
