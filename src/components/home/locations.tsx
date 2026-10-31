"use client";

import { MapPin } from "lucide-react";
import { OpeningHours } from "@/components/shop/opening-hours";
import { shop } from "@/data/shop";
import { PillLink } from "@/components/home/motion/pill-link";
import { RevealOnScroll, RevealTitle } from "@/components/home/motion/reveal";
import { cn } from "@/lib/utils";

const accents = {
  blue: "bg-[var(--lkm-blue)]",
  green: "bg-[var(--lkm-green)]",
  yellow: "bg-[var(--lkm-yellow)]",
};

export function Locations() {
  return (
    <RevealOnScroll className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8">
      <span data-reveal className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
        Lomé
      </span>
      <RevealTitle
        lines={["Nos boutiques."]}
        className="mt-5 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1] tracking-[-0.035em] text-white sm:text-6xl"
      />
      <p data-reveal className="mt-4 max-w-xl text-white/55">
        Consultez les prix en ligne, puis venez tester et acheter sur place.
      </p>

      <div className="mt-12 grid gap-3 md:grid-cols-2">
        {shop.locations.map((loc) => (
          <article
            key={loc.id}
            data-reveal
            className="flex flex-col justify-between gap-10 rounded-[1.75rem] border border-white/10 bg-[var(--lkm-surface)] p-7 sm:p-9"
          >
            <div>
              <span
                className={cn(
                  "inline-flex h-11 w-11 items-center justify-center rounded-full text-[#0b0b0f]",
                  accents[loc.accent],
                )}
              >
                <MapPin className="h-5 w-5" />
              </span>
              <h3 className="mt-6 font-[family-name:var(--font-display)] text-2xl font-semibold text-white sm:text-3xl">
                {loc.name}
              </h3>
              <p className="mt-2 text-white/60">{loc.address}</p>
              <p className="mt-1 text-sm text-white/40">{loc.description}</p>
              <OpeningHours className="mt-4" />
            </div>
            <div>
              <PillLink href={loc.mapsUrl} external variant="light">
                Itinéraire
              </PillLink>
            </div>
          </article>
        ))}
      </div>
    </RevealOnScroll>
  );
}
