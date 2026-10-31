import type { Metadata } from "next";
import { Clock, MapPin, Wrench } from "lucide-react";
import { ParticleField } from "@/components/home/motion/particle-field";
import { PillLink } from "@/components/home/motion/pill-link";
import { RepairCatalog } from "@/components/repair/repair-catalog";
import { shop } from "@/data/shop";
import { getRepairs } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Réparation téléphone, PC & console",
  description:
    "Changement d’écran, batterie, caméra, connecteur de charge, PC et consoles à Lomé. Prix indicatifs en CFA, main d’œuvre 2 000 CFA, devis sur WhatsApp.",
};

const steps = [
  {
    title: "Choisissez la réparation",
    text: "Repérez votre panne et son prix indicatif ci-dessous.",
  },
  {
    title: "Écrivez-nous sur WhatsApp",
    text: "Le message part tout prêt : on vous confirme le prix exact et le délai.",
  },
  {
    title: "Passez à Djidjolé",
    text: "On répare votre appareil avec les pièces en stock dès que possible.",
  },
];

export default async function RepairPage() {
  const repairShop = shop.locations[1] ?? shop.locations[0];
  const repairs = await getRepairs();

  return (
    <div className="pt-[5.5rem]">
      {/* En-tête */}
      <section className="px-3 sm:px-4 lg:px-5">
        <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[2rem] bg-[#052a1c] px-7 py-14 sm:px-12 sm:py-20 lg:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_10%,rgba(0,168,89,0.45),transparent_55%)]" />
          <ParticleField
            className="absolute inset-0 h-full w-full opacity-60"
            colors={["#7dffb6", "#ffffff", "#f5c518"]}
            density={9000}
          />
          <div className="relative grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/85">
                <Wrench className="h-3.5 w-3.5" /> Atelier réparation · Djidjolé
              </span>
              <h1 className="mt-6 font-[family-name:var(--font-display)] text-[2.6rem] font-semibold leading-[1] tracking-[-0.035em] text-white sm:text-6xl lg:text-7xl">
                Réparation téléphone,
                <br />
                PC & console.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
                Écran, batterie, caméra, charge, clavier, HDMI… Consultez nos
                prix indicatifs et envoyez votre demande sur WhatsApp en un
                clic.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <PillLink href="#tarifs" variant="yellow">
                  Voir les tarifs
                </PillLink>
                <PillLink
                  href={getWhatsAppUrl(
                    "Bonjour LKM Boutique, j’aimerais un devis de réparation.",
                  )}
                  external
                  variant="whatsapp"
                >
                  Devis sur WhatsApp
                </PillLink>
              </div>
            </div>
            <div className="rounded-[1.5rem] bg-white/95 p-6 text-[#0b0b0f]">
              <p className="text-sm text-[#0b0b0f]/55">Main d’œuvre</p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-5xl font-semibold tracking-[-0.03em]">
                {formatPrice(repairs.labor)}
              </p>
              <p className="mt-2 text-sm text-[#0b0b0f]/55">
                + le prix de la pièce, selon votre modèle.
              </p>
              <ul className="mt-5 space-y-2 border-t border-black/10 pt-4 text-sm text-[#0b0b0f]/70">
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--lkm-green)]" />
                  {repairShop?.name} — {repairShop?.address}
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--lkm-green)]" />
                  Prix exact et délai confirmés sur WhatsApp
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section id="tarifs" className="mx-auto max-w-[1440px] scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20">
        <span className="inline-flex rounded-full bg-[var(--lkm-yellow)] px-3 py-1 text-xs font-semibold text-[#1a1400]">
          Tarifs
        </span>
        <h2 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1] tracking-[-0.035em] text-white sm:text-6xl">
          Quelle est la panne ?
        </h2>
        <p className="mt-4 max-w-2xl text-white/55">
          Choisissez votre appareil, puis la réparation : le bouton WhatsApp
          envoie votre demande avec le prix affiché.
        </p>
        <div className="mt-10">
          <RepairCatalog items={repairs.items} labor={repairs.labor} />
        </div>
      </section>

      {/* Déroulé */}
      <section className="mx-auto max-w-[1440px] px-5 pb-20 sm:px-8">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
          Comment ça se passe ?
        </h2>
        <ol className="mt-10 grid gap-3 md:grid-cols-3">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="rounded-[1.5rem] border border-white/10 bg-[var(--lkm-surface)] p-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--lkm-yellow)] font-[family-name:var(--font-display)] text-sm font-bold text-[#0b0b0f]">
                {i + 1}
              </span>
              <h3 className="mt-5 font-[family-name:var(--font-display)] text-xl font-semibold text-white">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{s.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-sm text-white/45">
          {repairShop?.name} — {repairShop?.address}. Tél. {shop.phones.join(" · ")}.
        </p>
      </section>
    </div>
  );
}
