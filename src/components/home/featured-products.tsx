"use client";

import Link from "next/link";
import { ProductCard, ProductGrid } from "@/components/products/product-card";
import { buttonVariants } from "@/components/ui/button";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
            Sélection
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Coups de cœur tech
          </h2>
          <p className="mt-3 max-w-xl text-white/50">
            Consoles, smartphones et accessoires mis en avant — prix affichés
            en CFA, commande via WhatsApp.
          </p>
        </div>
        <Link
          href="/boutique"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Tout voir
        </Link>
      </div>

      <ProductGrid>
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </ProductGrid>
    </section>
  );
}
