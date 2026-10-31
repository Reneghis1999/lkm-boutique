"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MessageCircle, Store, Tag } from "lucide-react";
import { LiveOrderCard } from "@/components/home/live-order-card";
import { ParticleField } from "@/components/home/motion/particle-field";
import { PillLink } from "@/components/home/motion/pill-link";

const trust = [
  { icon: Tag, label: "Prix en CFA" },
  { icon: Store, label: "2 boutiques à Lomé" },
  { icon: MessageCircle, label: "Commande WhatsApp" },
];

const titleLines = [
  "Consoles,",
  "phones &",
  <span key="r" className="relative inline-block">
    <span
      aria-hidden
      className="hero-mark absolute inset-x-[-0.06em] bottom-[0.1em] -z-10 h-[0.42em] origin-left rounded-sm bg-[var(--lkm-yellow)]"
    />
    réparation
  </span>,
  "à Lomé.",
];

export function Hero({
  liveProduct,
}: {
  liveProduct: { name: string; price: number | null } | null;
}) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      root.querySelectorAll<HTMLElement>(".hero-line").forEach((el) => {
        el.style.transform = "none";
      });
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.fromTo(
        ".hero-visual",
        { clipPath: "inset(12% 10% 12% 10% round 2rem)", scale: 1.04 },
        { clipPath: "inset(0% 0% 0% 0% round 2rem)", scale: 1, duration: 1.4 },
        0,
      )
        .from(".hero-badge", { y: 16, opacity: 0, duration: 0.7 }, 0.1)
        .fromTo(
          ".hero-line",
          { yPercent: 110, y: 0 },
          { yPercent: 0, duration: 1.1, stagger: 0.09 },
          0.15,
        )
        .fromTo(
          ".hero-mark",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.9, ease: "power3.inOut" },
          0.75,
        )
        .from(".hero-fade", { y: 22, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.55)
        .from(".hero-live", { y: 40, opacity: 0, duration: 1 }, 0.8);

      // Flottement léger du visuel
      gsap.to(".hero-float", {
        y: -12,
        duration: 3.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Au défilement : la carte de droite se resserre et le visuel remonte
      gsap.to(".hero-float-wrap", {
        yPercent: -10,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero-cards", {
        scale: 0.96,
        opacity: 0.6,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative px-3 pb-4 pt-[5.5rem] sm:px-4 lg:px-5">
      <noscript>
        <style>{`.hero-line{transform:none!important}`}</style>
      </noscript>
      <div className="hero-cards mx-auto grid max-w-[1440px] origin-top gap-3 lg:h-[calc(100svh-6.5rem)] lg:min-h-[620px] lg:grid-cols-[1.02fr_0.98fr]">
        {/* Carte texte */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-[var(--lkm-cream)] p-7 text-[#0b0b0f] sm:p-10 lg:p-12">
          <div>
            <span className="hero-badge inline-flex items-center gap-2 rounded-full bg-[#0b0b0f] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
              <span className="font-[family-name:var(--font-display)] text-xs normal-case tracking-tight">
                <span className="text-[#4fb0ff]">L</span>
                <span className="text-[#3ddc8a]">K</span>
                <span className="text-[var(--lkm-yellow)]">M</span>
              </span>
              Tech & Gaming · Lomé
            </span>

            <h1 className="relative z-0 mt-7 font-[family-name:var(--font-display)] text-[2.9rem] font-semibold leading-[0.98] tracking-[-0.035em] sm:text-[4rem] lg:text-[4.4rem] xl:text-[5.1rem]">
              {titleLines.map((line, i) => (
                <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
                  <span
                    className="hero-line block"
                    style={{ transform: "translateY(110%)" }}
                  >
                    {line}
                  </span>
                </span>
              ))}
            </h1>

            <p className="hero-fade mt-6 max-w-md text-base leading-relaxed text-[#0b0b0f]/60 sm:text-lg">
              Parcourez les prix en ligne, réservez sur WhatsApp, puis venez
              tester à Léo 2000 ou réparer à Djidjolé.
            </p>
          </div>

          <div className="mt-10">
            <div className="hero-fade flex flex-wrap gap-3">
              <PillLink href="/boutique" variant="dark">
                Voir les prix
              </PillLink>
              <PillLink href="/reparation" variant="yellow">
                Réparation
              </PillLink>
            </div>
            <ul className="hero-fade mt-8 flex flex-wrap gap-x-6 gap-y-2">
              {trust.map((item) => (
                <li
                  key={item.label}
                  className="inline-flex items-center gap-2 text-sm text-[#0b0b0f]/55"
                >
                  <item.icon className="h-4 w-4 text-[var(--lkm-blue)]" strokeWidth={1.75} />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Carte visuelle */}
        <div className="hero-visual relative min-h-[460px] overflow-hidden rounded-[2rem] bg-[#052a1c] sm:min-h-[560px] lg:min-h-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(0,168,89,0.35),transparent_55%),radial-gradient(ellipse_at_85%_90%,rgba(0,114,206,0.35),transparent_50%)]" />
          <ParticleField className="absolute inset-0 h-full w-full" />
          <div className="hero-float-wrap absolute inset-x-6 bottom-36 top-6 sm:bottom-40 lg:inset-x-10">
            <div className="hero-float relative h-full w-full">
              <Image
                src="/hero-collage.png"
                alt="Smartphones, PC, PlayStation, Xbox et jeux — LKM Boutique"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 640px"
                className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]"
              />
            </div>
          </div>
          <LiveOrderCard
            product={liveProduct}
            className="hero-live absolute bottom-4 left-4 right-4 sm:left-auto sm:w-[330px]"
          />
        </div>
      </div>
    </section>
  );
}
