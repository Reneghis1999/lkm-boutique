import type { Metadata } from "next";
import { ProductCard, ProductGrid } from "@/components/products/product-card";
import { PillLink } from "@/components/home/motion/pill-link";
import { getPromoProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Promotions",
  description:
    "Les promotions du moment chez LKM Boutique à Lomé : consoles, smartphones, PC et accessoires à prix réduit.",
};

export default async function PromotionsPage() {
  const promos = await getPromoProducts();

  return (
    <div className="pt-[5.5rem]">
      <section className="px-3 sm:px-4 lg:px-5">
        <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[2rem] bg-[var(--lkm-cream)] px-7 py-14 text-[#0b0b0f] sm:px-12 sm:py-20 lg:px-16">
          <span className="inline-flex rounded-full bg-[#e5322d] px-3 py-1 text-xs font-semibold text-white">
            Promotions
          </span>
          <h1 className="mt-6 font-[family-name:var(--font-display)] text-[2.8rem] font-semibold leading-[1] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
            Les promos
            <br />
            du moment.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#0b0b0f]/60 sm:text-lg">
            {promos.length > 0
              ? `${promos.length} produit${promos.length > 1 ? "s" : ""} à prix réduit, dans la limite des stocks disponibles. Commandez sur WhatsApp ou passez en boutique.`
              : "Aucune promotion en ce moment — revenez bientôt, ou parcourez toute la boutique."}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-16">
        {promos.length > 0 ? (
          <ProductGrid>
            {promos.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </ProductGrid>
        ) : (
          <div className="flex flex-col items-center gap-6 rounded-[1.75rem] border border-white/10 bg-[var(--lkm-surface)] px-6 py-16 text-center">
            <p className="max-w-md text-white/60">
              Pas de promotion pour le moment. Nos prix sont affichés en CFA sur
              toute la boutique.
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
