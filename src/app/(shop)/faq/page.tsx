import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description:
    "Réparation, livraison à Lomé, facture et garantie, rachat de téléphones, suivi de réparation : les réponses de LKM Boutique (Djidjolé et Léo 2000).",
  alternates: { canonical: "/faq" },
};

const FAQ: { q: string; a: React.ReactNode; text: string }[] = [
  {
    q: "Combien de temps dure une réparation ?",
    text: "La plupart des réparations (écran, batterie, vitre) se font le jour même, si la pièce est en stock.",
    a: (
      <>
        La plupart des réparations (écran, batterie, vitre) se font le jour même,
        si la pièce est en stock. Faites votre{" "}
        <Link href="/reparation#devis" className="text-[var(--lkm-yellow)] hover:underline">
          devis en 1 minute
        </Link>{" "}
        pour voir le prix et la disponibilité.
      </>
    ),
  },
  {
    q: "Livrez-vous ?",
    text: "Oui, partout à Lomé. Les frais dépendent de la distance et vous sont annoncés sur WhatsApp.",
    a: "Oui, partout à Lomé. Les frais dépendent de la distance et vous sont annoncés sur WhatsApp.",
  },
  {
    q: "Est-ce que j’ai une facture et une garantie ?",
    text: "Oui, tout est livré avec garantie, et votre facture vous est remise après l’achat.",
    a: "Oui, tout est livré avec garantie, et votre facture vous est remise après l’achat.",
  },
  {
    q: "Quels téléphones reprenez-vous ?",
    text: "Ceux achetés chez LKM Boutique, ou ceux avec leur facture d’achat et leur boîte.",
    a: (
      <>
        Ceux achetés chez LKM Boutique, ou ceux avec leur facture d’achat et leur
        boîte.{" "}
        <Link href="/rachat" className="text-[var(--lkm-yellow)] hover:underline">
          Vendre ou échanger mon téléphone
        </Link>
      </>
    ),
  },
  {
    q: "Comment suivre ma réparation ?",
    text: "Sur la page « Suivi de réparation », avec votre numéro de ticket et votre téléphone.",
    a: (
      <>
        Sur la page{" "}
        <Link href="/suivi" className="text-[var(--lkm-yellow)] hover:underline">
          Suivi de réparation
        </Link>
        , avec votre numéro de ticket et votre téléphone.
      </>
    ),
  },
  {
    q: "Où êtes-vous ?",
    text: "À Djidjolé (90 00 25 91) et à Léo 2000, en face de la clinique (90 16 22 16). Horaires en bas de page.",
    a: (
      <>
        À Djidjolé (<a href="tel:+22890002591" className="hover:underline">90 00 25 91</a>)
        et à Léo 2000, en face de la clinique (
        <a href="tel:+22890162216" className="hover:underline">90 16 22 16</a>). Nos
        horaires sont en bas de page.
      </>
    ),
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.text },
    })),
  };

  return (
    <div className="pt-[5.5rem]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <span className="inline-flex rounded-full bg-[var(--lkm-yellow)] px-3 py-1 text-xs font-semibold text-[#1a1400]">
          Aide
        </span>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1] tracking-[-0.035em] text-white sm:text-6xl">
          Questions fréquentes
        </h1>
        <div className="mt-10 divide-y divide-white/10 rounded-[1.75rem] border border-white/10 bg-[var(--lkm-surface)]">
          {FAQ.map((f, i) => (
            <details key={f.q} className="group px-5 py-4 sm:px-6" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-white [&::-webkit-details-marker]:hidden">
                <span className="font-medium">{f.q}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-white/45 transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-white/65">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-8 text-sm text-white/45">
          Une autre question ?{" "}
          <Link href="/contact" className="text-[var(--lkm-yellow)] hover:underline">
            Contactez-nous
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
