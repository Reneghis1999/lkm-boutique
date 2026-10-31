"use client";

import { Wrench } from "lucide-react";
import { ParticleField } from "@/components/home/motion/particle-field";
import { PillLink } from "@/components/home/motion/pill-link";
import { RevealOnScroll, RevealTitle } from "@/components/home/motion/reveal";

const SPARKS = ["#7dffb6", "#ffffff", "#f5c518"];

export function RepairCta() {
  return (
    <section className="px-3 py-10 sm:px-4 lg:px-5">
      <RevealOnScroll className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[2.5rem] bg-[#052a1c] px-7 py-16 sm:px-12 sm:py-24 lg:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_10%,rgba(0,168,89,0.45),transparent_55%)]" />
        <ParticleField className="absolute inset-0 h-full w-full opacity-70" colors={SPARKS} density={9000} />
        <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <span data-reveal className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/85">
              <Wrench className="h-3.5 w-3.5" /> Djidjolé
            </span>
            <RevealTitle
              lines={["Réparation", "informatique & mobile."]}
              className="mt-6 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1] tracking-[-0.035em] text-white sm:text-6xl lg:text-7xl"
            />
          </div>
          <div data-reveal>
            <p className="text-base leading-relaxed text-white/65 sm:text-lg">
              Diagnostic rapide, pièces en stock et interventions sur mesure à
              Djidjolé. Contactez-nous sur WhatsApp pour un devis ou passez en
              boutique.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PillLink href="/reparation" variant="yellow">
                Découvrir le service
              </PillLink>
              <PillLink href="/contact" variant="outline">
                Nous contacter
              </PillLink>
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
