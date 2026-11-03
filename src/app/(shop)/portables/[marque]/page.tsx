import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard, ProductGrid } from "@/components/products/product-card";
import { getPhoneBrand } from "@/lib/phones";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Params = Promise<{ marque: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { marque } = await params;
  const brand = await getPhoneBrand(marque);
  if (!brand) return { title: "Portables" };
  return {
    title: `${brand.name} — Portables`,
    description: `${brand.name} chez LKM Boutique à Lomé : prix en CFA, commande sur WhatsApp.`,
  };
}

export default async function PhoneBrandPage({ params }: { params: Params }) {
  const { marque } = await params;
  const brand = await getPhoneBrand(marque);
  if (!brand) notFound();

  return (
    <div className="pt-20">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
              Portables
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-white sm:text-5xl">
              {brand.name}
            </h1>
            <p className="mt-2 text-sm text-white/35">
              {brand.count} modèle{brand.count > 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/portables" className={cn(buttonVariants({ variant: "outline" }))}>
            Toutes les marques
          </Link>
        </div>

        <ProductGrid>
          {brand.products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </ProductGrid>
      </div>
    </div>
  );
}
