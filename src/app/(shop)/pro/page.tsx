import type { Metadata } from "next";
import { ProAccess } from "@/components/pro/pro-access";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Espace réparateurs",
  description:
    "Réparateurs de Lomé : commandez vos pièces chez LKM Boutique à prix pro, avec livraison.",
  robots: { index: false },
};

export default function ProPage() {
  return (
    <div className="pt-[5.5rem]">
      <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <span className="inline-flex rounded-full bg-[var(--lkm-blue)] px-3 py-1 text-xs font-semibold text-white">
          Espace réparateurs
        </span>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1] tracking-[-0.035em] text-white sm:text-6xl">
          Vos pièces à prix pro.
        </h1>
        <p className="mt-4 max-w-xl text-white/55">
          Réparateurs de Lomé : entrez votre code pour voir les prix
          réparateur sur tout le site et commander sur WhatsApp, en retrait ou
          en livraison.
        </p>
        <div className="mt-10">
          <ProAccess />
        </div>
        <p className="mt-8 text-sm text-white/45">
          Pas encore de code ?{" "}
          <a
            href={getWhatsAppUrl(
              "Bonjour LKM Boutique, je suis réparateur et je souhaite un code pro.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--lkm-yellow)] underline underline-offset-4"
          >
            Demandez-le sur WhatsApp
          </a>
          .
        </p>
      </section>
    </div>
  );
}
