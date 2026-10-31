"use client";

import { Wrench } from "lucide-react";
import { ParticleField } from "@/components/home/motion/particle-field";
import { PillLink } from "@/components/home/motion/pill-link";
import { RevealOnScroll, RevealTitle } from "@/components/home/motion/reveal";
import { REPAIR_LABOR, repairItems } from "@/data/repairs";
import { formatPrice } from "@/lib/format";
import { getWhatsAppUrl } from "@/lib/whatsapp";

const SPARKS = ["#7dffb6", "#ffffff", "#f5c518"];
const popular = repairItems.filter((item) => item.popular).slice(0, 6);

export function RepairCta() {
  return (
    <section className="px-3 py-10 sm:px-4 lg:px-5">
      <RevealOnScroll className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[2.5rem] bg-[#052a1c] px-7 py-16 sm:px-12 sm:py-20 lg:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_10%,rgba(0,168,89,0.45),transparent_55%)]" />
        <ParticleField className="absolute inset-0 h-full w-full opacity-70" colors={SPARKS} density={9000} />
        <div className="relative grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <span data-reveal className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/85">
              <Wrench className="h-3.5 w-3.5" /> Atelier · Djidjolé
            </span>
            <RevealTitle
              lines={["Réparation", "téléphone, PC", "& console."]}
              className="mt-6 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1] tracking-[-0.035em] text-white sm:text-6xl"
            />
            <p data-reveal className="mt-6 max-w-md text-base leading-relaxed text-white/65 sm:text-lg">
              Écran, batterie, caméra, connecteur de charge… Main d’œuvre{" "}
              <strong className="text-[var(--lkm-yellow)]">{formatPrice(REPAIR_LABOR)}</strong>{" "}
              + la pièce. Votre demande part directement sur WhatsApp.
            </p>
            <div data-reveal className="mt-8 flex flex-wrap gap-3">
              <PillLink href="/reparation#tarifs" variant="yellow">
                Voir tous les tarifs
              </PillLink>
              <PillLink
                href={getWhatsAppUrl("Bonjour LKM Boutique, j’aimerais un devis de réparation.")}
                external
                variant="whatsapp"
              >
                Devis sur WhatsApp
              </PillLink>
            </div>
          </div>

          <ul data-reveal className="grid gap-2 sm:grid-cols-2">
            {popular.map((item) => (
              <li
                key={item.id}
                className="rounded-[1.25rem] bg-white/[0.07] p-4 ring-1 ring-white/10 backdrop-blur"
              >
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
                  <span className="text-sm font-normal text-white/50">dès </span>
                  {formatPrice(item.partFrom ?? item.service)}
                </p>
                <p className="mt-0.5 text-xs text-[var(--lkm-yellow)]">
                  {item.service != null
                    ? "Forfait, main d’œuvre comprise"
                    : `+ ${formatPrice(REPAIR_LABOR)} de main d’œuvre`}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </RevealOnScroll>
    </section>
  );
}
