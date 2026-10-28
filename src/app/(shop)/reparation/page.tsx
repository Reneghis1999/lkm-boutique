import type { Metadata } from "next";
import Link from "next/link";
import {
  Laptop,
  MessageCircle,
  Search,
  Smartphone,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { repairServices } from "@/data/services";
import { shop } from "@/data/shop";
import { cn } from "@/lib/utils";

const serviceIcons: Record<string, LucideIcon> = {
  Search,
  Smartphone,
  Laptop,
  Wrench,
};

export const metadata: Metadata = {
  title: "Réparation",
  description:
    "Service professionnel de réparation informatique et mobile chez LKM Boutique — Djidjolé, Lomé.",
};

export default function RepairPage() {
  return (
    <div className="pt-20">
      <section className="relative overflow-hidden border-b border-white/6">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_30%_0%,rgba(0,168,89,0.22),transparent_55%),linear-gradient(180deg,#09090c,transparent)]" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--lkm-green)]">
            Service atelier
          </p>
          <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Réparation informatique & mobile
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/55">
            Diagnostic rapide, maintenance et interventions sur mesure pour PC
            et téléphones. Atelier & stock à Djidjolé — contactez-nous pour un
            devis.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${shop.whatsapp}?text=${encodeURIComponent("Bonjour LKM Boutique, j’aimerais un devis de réparation.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "whatsapp", size: "lg" }))}
            >
              <MessageCircle className="h-4 w-4" />
              Demander un devis WhatsApp
            </a>
            <Link
              href="/contact"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Voir les adresses
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {repairServices.map((service) => {
            const Icon = serviceIcons[service.icon] ?? Wrench;
            return (
            <article
              key={service.id}
              className="rounded-2xl border border-white/8 bg-[var(--lkm-surface)] p-6"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[var(--lkm-blue)]">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-white">
                {service.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                {service.description}
              </p>
            </article>
            );
          })}
        </div>

        <div className="mt-12 rounded-3xl border border-white/8 bg-gradient-to-br from-white/[0.04] to-transparent p-8 sm:p-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white">
            Comment ça se passe ?
          </h2>
          <ol className="mt-6 space-y-4 text-sm text-white/60">
            <li>
              <span className="mr-2 font-bold text-[var(--lkm-yellow)]">1.</span>
              Contactez-nous sur WhatsApp ou venez à Djidjolé avec votre appareil.
            </li>
            <li>
              <span className="mr-2 font-bold text-[var(--lkm-yellow)]">2.</span>
              Nous réalisons un diagnostic et vous proposons une intervention.
            </li>
            <li>
              <span className="mr-2 font-bold text-[var(--lkm-yellow)]">3.</span>
              Réparation avec pièces disponibles en magasin lorsque possible.
            </li>
          </ol>
          <p className="mt-6 text-sm text-white/40">
            Boutique Djidjolé — {shop.locations[1]?.address}. Tél.{" "}
            {shop.phones.join(" · ")}.
          </p>
        </div>
      </section>
    </div>
  );
}
