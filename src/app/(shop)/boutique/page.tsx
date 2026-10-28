import { Suspense } from "react";
import type { Metadata } from "next";
import { Catalog } from "@/components/shop/catalog";
import { getCategories, getProducts } from "@/lib/catalog";
import type { SortOption } from "@/types";

export const metadata: Metadata = {
  title: "Boutique",
  description:
    "Catalogue complet LKM Boutique — smartphones, PC, consoles, jeux et accessoires à Lomé.",
};

type SearchParams = Promise<{
  q?: string;
  category?: string;
  group?: string;
  sort?: string;
  min?: string;
  max?: string;
  page?: string;
}>;

export default async function BoutiquePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const products = await getProducts();
  const categories = await getCategories();

  return (
    <div className="pt-20">
      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 py-20 text-white/40">
            Chargement du catalogue…
          </div>
        }
      >
        <Catalog
          products={products}
          categories={categories}
          initialQuery={params.q ?? ""}
          initialCategory={params.category ?? ""}
          initialGroup={params.group ?? ""}
          initialSort={(params.sort as SortOption) || "featured"}
          initialMinPrice={params.min ?? ""}
          initialMaxPrice={params.max ?? ""}
          initialPage={params.page ? Number(params.page) || 1 : 1}
        />
      </Suspense>
    </div>
  );
}
