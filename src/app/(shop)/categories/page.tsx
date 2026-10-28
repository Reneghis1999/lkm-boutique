import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getCategories, getProductsByCategory } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Catégories",
  description:
    "Parcourez toutes les catégories LKM Boutique — jeux, consoles, smartphones, PC, chargeurs et réparation.",
};

export default async function CategoriesPage() {
  const allCategories = await getCategories();
  const categories = await Promise.all(
    allCategories.map(async (category) => {
      const products = await getProductsByCategory(category.slug);
      const cover = products.find((p) => p.image)?.image ?? null;
      return { ...category, image: cover };
    }),
  );

  return (
    <div className="pt-20">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
          Catalogue
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold text-white sm:text-5xl">
          Toutes les catégories
        </h1>
        <p className="mt-4 max-w-2xl text-white/50">
          {categories.length} rayons issus du stock LKM Boutique à Lomé —
          cliquez pour voir les produits.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categorie/${category.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[var(--lkm-surface)] p-4 transition hover:border-white/25"
            >
              <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-[#0d0d10]">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="320px"
                    className="object-contain p-4 transition duration-300 group-hover:scale-[1.04]"
                  />
                ) : null}
              </div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-white">
                {category.name}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-white/50">
                {category.description}
              </p>
              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="text-white/40">
                  {category.count} produit{category.count > 1 ? "s" : ""}
                </span>
                <ArrowUpRight
                  className="h-4 w-4 text-white/40 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
                  strokeWidth={1.75}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
