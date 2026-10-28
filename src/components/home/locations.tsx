"use client";

import { motion } from "framer-motion";
import { ExternalLink, MapPin } from "lucide-react";
import { shop } from "@/data/shop";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const accents = {
  blue: "border-[var(--lkm-blue)]/30",
  green: "border-[var(--lkm-green)]/30",
  yellow: "border-[var(--lkm-yellow)]/30",
};

export function Locations() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 mx-auto max-w-2xl text-center md:mx-0 md:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
          Lomé
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-white sm:text-4xl">
          Nos boutiques
        </h2>
        <p className="mt-3 text-white/50">
          Consultez les prix en ligne, puis venez tester et acheter sur place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {shop.locations.map((loc, i) => (
          <motion.article
            key={loc.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "rounded-2xl border bg-[var(--lkm-surface)] p-6 text-center md:text-left",
              accents[loc.accent],
            )}
          >
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/70">
              <MapPin className="h-4 w-4" />
            </div>
            <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-white">
              {loc.name}
            </h3>
            <p className="mt-2 text-sm text-white/55">{loc.address}</p>
            <p className="mt-1 text-sm text-white/40">{loc.description}</p>
            <a
              href={loc.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "mt-6",
              )}
            >
              Itinéraire
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
