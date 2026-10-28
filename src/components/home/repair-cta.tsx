"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Wrench } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RepairCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl border border-[var(--lkm-green)]/25 bg-gradient-to-br from-[var(--lkm-green)]/20 via-[var(--lkm-surface)] to-[#0a0a0c] p-8 sm:p-12"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[var(--lkm-green)]/20 blur-3xl" />
        <div className="relative mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--lkm-green)]/20 text-[#6dffb0]">
            <Wrench className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white sm:text-4xl">
            Réparation informatique & mobile
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/55">
            Diagnostic rapide, pièces en stock et interventions sur mesure à
            Djidjolé. Contactez-nous sur WhatsApp pour un devis ou passez en
            boutique.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/reparation"
              className={cn(buttonVariants({ variant: "green", size: "lg" }))}
            >
              Découvrir le service
            </Link>
            <Link
              href="/contact"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
