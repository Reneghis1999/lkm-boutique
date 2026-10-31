"use client";

import { ProductCard, ProductGrid } from "@/components/products/product-card";
import { PillLink } from "@/components/home/motion/pill-link";
import { RevealOnScroll, RevealTitle } from "@/components/home/motion/reveal";
import type { Product } from "@/types";

/** Produits de la catégorie « Promotions » d’Odoo (masquée s’il n’y en a pas). */
export function Promotions({ products, total }: { products: Product[]; total: number }) {
  if (products.length === 0) return null;
  return (
    <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20">
      <RevealOnScroll className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span data-reveal className="inline-flex rounded-full bg-[#e5322d] px-3 py-1 text-xs font-semibold text-white">
            Promotions
          </span>
          <RevealTitle
            lines={["Les promos", "du moment."]}
            className="mt-5 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1] tracking-[-0.035em] text-white sm:text-6xl"
          />
          <p data-reveal className="mt-4 max-w-xl text-white/55">
            Prix réduits sur une sélection de produits LKM Boutique — dans la
            limite des stocks disponibles.
          </p>
        </div>
        <div data-reveal>
          <PillLink href="/promotions" variant="yellow">
            {total > products.length ? `Voir les ${total} promos` : "Voir les promos"}
          </PillLink>
        </div>
      </RevealOnScroll>
      <ProductGrid>
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </ProductGrid>
    </section>
  );
}
