import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard, ProductGrid } from "@/components/products/product-card";
import {
  getCategoryBySlug,
  getProductsByCategory,
} from "@/lib/catalog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

// Pas de generateStaticParams : la page est rendue à chaque visite pour
// refléter immédiatement ce que le client modifie dans Odoo.

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Catégorie" };
  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getProductsByCategory(slug);

  return (
    <div className="pt-20">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
              Catégorie
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-white sm:text-5xl">
              {category.name}
            </h1>
            <p className="mt-3 max-w-xl text-white/50">
              {category.description ||
                `${products.length} produit(s) disponibles chez LKM Boutique.`}
            </p>
            <p className="mt-2 text-sm text-white/35">
              {products.length} article{products.length > 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/boutique"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Tout le catalogue
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="rounded-2xl border border-white/8 bg-[var(--lkm-surface)] px-6 py-16 text-center text-white/45">
            Aucun produit dans cette catégorie pour le moment.
          </p>
        ) : (
          <ProductGrid>
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </ProductGrid>
        )}
      </div>
    </div>
  );
}
