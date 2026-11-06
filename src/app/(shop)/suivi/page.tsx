import type { Metadata } from "next";
import { RepairTracker } from "@/components/repair/repair-tracker";

export const metadata: Metadata = {
  title: "Suivi de réparation",
  description:
    "Suivez l’avancement de votre réparation chez LKM Boutique à Lomé avec votre numéro de ticket.",
};

export default function SuiviPage() {
  return (
    <div className="pt-[5.5rem]">
      <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <span className="inline-flex rounded-full bg-[var(--lkm-yellow)] px-3 py-1 text-xs font-semibold text-[#1a1400]">
          Réparation
        </span>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1] tracking-[-0.035em] text-white sm:text-6xl">
          Où en est ma réparation ?
        </h1>
        <p className="mt-4 max-w-xl text-white/55">
          Entrez le numéro de ticket donné en boutique et votre numéro de
          téléphone.
        </p>
        <div className="mt-10">
          <RepairTracker />
        </div>
      </section>
    </div>
  );
}
