"use client";

import { ProductCard, ProductGrid } from "@/components/products/product-card";
import { PillLink } from "@/components/home/motion/pill-link";
import { RevealOnScroll, RevealTitle } from "@/components/home/motion/reveal";
import type { Product } from "@/types";

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8">
      <RevealOnScroll className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span data-reveal className="inline-flex rounded-full bg-[var(--lkm-blue)] px-3 py-1 text-xs font-semibold text-white">
            Sélection
          </span>
          <RevealTitle
            lines={["Coups de cœur", "tech."]}
            className="mt-5 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1] tracking-[-0.035em] text-white sm:text-6xl"
          />
          <p data-reveal className="mt-4 max-w-xl text-white/55">
            Consoles, smartphones et accessoires mis en avant — prix affichés
            en CFA, commande via WhatsApp.
          </p>
        </div>
        <div data-reveal>
          <PillLink href="/boutique" variant="light">
            Tout voir
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
