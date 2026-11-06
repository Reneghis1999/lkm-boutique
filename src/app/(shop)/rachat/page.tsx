import type { Metadata } from "next";
import { TradeInForm } from "@/components/rachat/trade-in-form";

export const metadata: Metadata = {
  title: "Vendre ou échanger mon téléphone",
  description:
    "Vendez ou échangez votre iPhone ou Samsung chez LKM Boutique à Lomé (Djidjolé et Léo 2000). Décrivez votre téléphone, recevez notre prix sur WhatsApp.",
  alternates: { canonical: "/rachat" },
};

export default function RachatPage() {
  return (
    <div className="pt-[5.5rem]">
      <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <span className="inline-flex rounded-full bg-[var(--lkm-yellow)] px-3 py-1 text-xs font-semibold text-[#1a1400]">
          Rachat &amp; échange
        </span>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1] tracking-[-0.035em] text-white sm:text-6xl">
          Vendez ou échangez votre téléphone
        </h1>
        <p className="mt-4 max-w-xl text-white/55">
          Décrivez votre téléphone en 1 minute. On vous répond sur WhatsApp avec
          notre prix, puis vous passez à Djidjolé ou à Léo 2000.
        </p>
        <div className="mt-8 rounded-2xl border border-[var(--lkm-yellow)]/40 bg-[var(--lkm-yellow)]/10 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--lkm-yellow)]">
            Conditions
          </h2>
          <p className="mt-2 text-white/80">
            Nous reprenons uniquement les téléphones{" "}
            <strong className="text-white">achetés chez LKM Boutique</strong>, ou
            les téléphones avec leur{" "}
            <strong className="text-white">facture d’achat et leur boîte</strong>.
          </p>
        </div>
        <div className="mt-8">
          <TradeInForm />
        </div>
      </section>
    </div>
  );
}
