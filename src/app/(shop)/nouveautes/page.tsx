import type { Metadata } from "next";
import { ProductCard, ProductGrid } from "@/components/products/product-card";
import { PillLink } from "@/components/home/motion/pill-link";
import { getNewArrivals } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Nouveautés",
  description:
    "Les derniers arrivages chez LKM Boutique à Lomé : jeux, consoles, téléphones, PC et accessoires.",
};

export default async function NouveautesPage() {
  const arrivals = await getNewArrivals(24);

  return (
    <div className="pt-[5.5rem]">
      <section className="px-3 sm:px-4 lg:px-5">
        <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[2rem] bg-[var(--lkm-cream)] px-7 py-14 text-[#0b0b0f] sm:px-12 sm:py-20 lg:px-16">
          <span className="inline-flex rounded-full bg-[var(--lkm-blue)] px-3 py-1 text-xs font-semibold text-white">
            Nouveautés
          </span>
          <h1 className="mt-6 font-[family-name:var(--font-display)] text-[2.8rem] font-semibold leading-[1] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
            Les derniers
            <br />
            arrivages.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#0b0b0f]/60 sm:text-lg">
            Les produits qui viennent d’arriver en boutique, du plus récent au
            plus ancien. Commandez sur WhatsApp ou passez en boutique.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-16">
        {arrivals.length > 0 ? (
          <ProductGrid>
            {arrivals.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </ProductGrid>
        ) : (
          <div className="flex flex-col items-center gap-6 rounded-[1.75rem] border border-white/10 bg-[var(--lkm-surface)] px-6 py-16 text-center">
            <p className="max-w-md text-white/60">
              Pas de nouveauté pour le moment. Parcourez toute la boutique.
            </p>
            <PillLink href="/boutique" variant="yellow">
              Voir la boutique
            </PillLink>
          </div>
        )}
      </section>
    </div>
  );
}
