import type { Metadata } from "next";
import { AtSign, ExternalLink, MapPin, MessageCircle, Phone } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { shop } from "@/data/shop";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez LKM Boutique à Lomé — WhatsApp, Instagram, TikTok et adresses Léo 2000 & Djidjolé.",
};

export default function ContactPage() {
  return (
    <div className="pt-20">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
          Contact
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold text-white sm:text-5xl">
          Parlons de votre besoin
        </h1>
        <p className="mt-4 max-w-2xl text-white/50">
          Commandes, devis réparation ou questions stock — le plus rapide reste
          WhatsApp.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href={`https://wa.me/${shop.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "whatsapp", size: "lg" }))}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp {shop.phones[0]}
          </a>
          <a
            href={shop.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            <AtSign className="h-4 w-4" />
            Instagram
          </a>
          <a
            href={shop.social.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            TikTok
          </a>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {shop.locations.map((loc) => (
            <article
              key={loc.id}
              className="rounded-2xl border border-white/8 bg-[var(--lkm-surface)] p-6"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/70">
                <MapPin className="h-4 w-4" />
              </div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-white">
                {loc.name}
              </h2>
              <p className="mt-2 text-sm text-white/55">{loc.address}</p>
              <p className="mt-1 text-sm text-white/40">{loc.description}</p>
              {loc.phone && (
                <a
                  href={`tel:${loc.phone.replace(/\s/g, "")}`}
                  className="mt-4 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {loc.phone}
                </a>
              )}
              <div className="mt-5">
                <a
                  href={loc.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  Itinéraire Google Maps
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-white/8 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold text-white">Téléphones</h2>
          <ul className="mt-4 space-y-2">
            {shop.phones.map((phone) => (
              <li key={phone}>
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 text-white/70 hover:text-white"
                >
                  <Phone className="h-4 w-4" />
                  {phone}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-white/35">
            Horaires non publiés sur le site de référence — confirmez
            l’ouverture sur WhatsApp avant votre visite.
          </p>
        </div>
      </div>
    </div>
  );
}
