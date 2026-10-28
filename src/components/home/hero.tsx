"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowRight, MessageCircle, Store, Tag, Wrench } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const trust = [
  { icon: Tag, label: "Prix en CFA" },
  { icon: Store, label: "2 boutiques à Lomé" },
  { icon: MessageCircle, label: "Commande WhatsApp" },
];

export function Hero() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        ".hero-kicker",
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55 },
      )
        .fromTo(
          ".hero-title",
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75 },
          "-=0.28",
        )
        .fromTo(
          ".hero-sub",
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55 },
          "-=0.35",
        )
        .fromTo(
          ".hero-cta",
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          "-=0.28",
        )
        .fromTo(
          ".hero-trust",
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45 },
          "-=0.25",
        )
        .fromTo(
          ".hero-visual",
          { y: 32, opacity: 0, scale: 0.96 },
          { y: 0, opacity: 1, scale: 1, duration: 0.9 },
          "-=0.75",
        );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative isolate overflow-hidden pt-24 pb-14 sm:pb-16 lg:min-h-[92svh] lg:pb-20"
    >
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_15%_0%,rgba(0,114,206,0.3),transparent_50%),radial-gradient(ellipse_at_90%_10%,rgba(245,197,24,0.12),transparent_40%),radial-gradient(ellipse_at_70%_90%,rgba(0,168,89,0.12),transparent_45%),linear-gradient(180deg,#07070a_0%,#0c0c10_55%,#09090c_100%)]" />
      <div
        className="absolute inset-0 -z-10 opacity-[0.28]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
          backgroundSize: "180px",
        }}
      />

      <div className="hero-orb pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-[var(--lkm-blue)]/25 blur-[90px]" />
      <div className="hero-orb pointer-events-none absolute right-0 top-32 h-80 w-80 rounded-full bg-[var(--lkm-yellow)]/12 blur-[100px]" />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:pt-6">
        <div className="mx-auto max-w-xl text-center lg:mx-0 lg:max-w-none lg:text-left">
          <p className="hero-kicker inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
            <span className="font-[family-name:var(--font-display)] normal-case tracking-tight">
              <span className="text-[var(--lkm-blue)]">L</span>
              <span className="text-[var(--lkm-green)]">K</span>
              <span className="text-[var(--lkm-yellow)]">M</span>
            </span>
            Tech & Gaming · Lomé
          </p>

          <h1 className="hero-title mt-5 font-[family-name:var(--font-display)] text-[2rem] font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.35rem]">
            Consoles, phones &{" "}
            <span className="text-[var(--lkm-yellow)]">réparation</span> à Lomé
          </h1>

          <p className="hero-sub mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/55 sm:text-lg lg:mx-0">
            Parcourez les prix en ligne, réservez sur WhatsApp, puis venez
            tester à Léo 2000 ou réparer à Djidjolé.
          </p>

          <div className="hero-cta mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/boutique"
              className={cn(buttonVariants({ size: "lg" }), "min-w-[180px]")}
            >
              Voir les prix
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/reparation"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "min-w-[180px]",
              )}
            >
              <Wrench className="h-4 w-4" />
              Réparation
            </Link>
          </div>

          <ul className="hero-trust mt-9 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-2 lg:items-start lg:justify-start">
            {trust.map((item) => (
              <li
                key={item.label}
                className="inline-flex items-center gap-2 text-sm text-white/50"
              >
                <item.icon
                  className="h-4 w-4 text-[var(--lkm-blue)]"
                  strokeWidth={1.75}
                />
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-visual relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="relative aspect-square w-full">
            <Image
              src="/hero-collage.png"
              alt="Smartphones, PC, PlayStation, Xbox et jeux — LKM Boutique"
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 520px"
              className="object-contain object-center drop-shadow-[0_25px_50px_rgba(0,0,0,0.45)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
