"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { ProductCard, ProductGrid } from "@/components/products/product-card";
import { Input } from "@/components/ui/input";
import { filterProducts } from "@/lib/catalog-filter";
import type { Category, Product, SortOption } from "@/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 24;

const sorts: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Pertinence" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "name-asc", label: "Nom A–Z" },
  { value: "newest", label: "Récents" },
];

const groups = [
  { value: "", label: "Tous" },
  { value: "mobile", label: "Mobile" },
  { value: "pc", label: "PC" },
  { value: "gaming", label: "Gaming" },
  { value: "audio", label: "Audio" },
  { value: "repair", label: "Réparation" },
];

const pricePresets = [
  { label: "Tous les prix", min: "", max: "" },
  { label: "< 10 000", min: "", max: "10000" },
  { label: "10–50 000", min: "10000", max: "50000" },
  { label: "50–150 000", min: "50000", max: "150000" },
  { label: "> 150 000", min: "150000", max: "" },
];

export function Catalog({
  products,
  categories,
  initialQuery = "",
  initialCategory = "",
  initialGroup = "",
  initialSort = "featured",
  initialMinPrice = "",
  initialMaxPrice = "",
  initialPage = 1,
}: {
  products: Product[];
  categories: Category[];
  initialQuery?: string;
  initialCategory?: string;
  initialGroup?: string;
  initialSort?: SortOption;
  initialMinPrice?: string;
  initialMaxPrice?: string;
  initialPage?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [group, setGroup] = useState(initialGroup);
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [page, setPage] = useState(Math.max(1, initialPage));
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(
    () =>
      filterProducts(
        {
          query,
          category: category || undefined,
          group: group || undefined,
          sort,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
        },
        products,
        categories,
      ),
    [products, categories, query, category, group, sort, minPrice, maxPrice],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function syncUrl(next: {
    q?: string;
    category?: string;
    group?: string;
    sort?: string;
    min?: string;
    max?: string;
    page?: number;
  }) {
    const params = new URLSearchParams(searchParams.toString());
    const map: Record<string, string | undefined> = {
      q: next.q,
      category: next.category,
      group: next.group,
      sort: next.sort,
      min: next.min,
      max: next.max,
      page: next.page != null && next.page > 1 ? String(next.page) : "",
    };
    Object.entries(map).forEach(([key, value]) => {
      if (value === undefined) return;
      if (!value || (key === "sort" && value === "featured")) params.delete(key);
      else params.set(key, value);
    });
    startTransition(() => {
      router.replace(`/boutique?${params.toString()}`, { scroll: false });
    });
  }

  function applyFilters(partial: {
    q?: string;
    category?: string;
    group?: string;
    sort?: SortOption;
    min?: string;
    max?: string;
    page?: number;
  }) {
    const nextQuery = partial.q ?? query;
    const nextCategory = partial.category ?? category;
    const nextGroup = partial.group ?? group;
    const nextSort = partial.sort ?? sort;
    const nextMin = partial.min ?? minPrice;
    const nextMax = partial.max ?? maxPrice;
    const nextPage = partial.page ?? 1;

    if (partial.q !== undefined) setQuery(partial.q);
    if (partial.category !== undefined) setCategory(partial.category);
    if (partial.group !== undefined) setGroup(partial.group);
    if (partial.sort !== undefined) setSort(partial.sort);
    if (partial.min !== undefined) setMinPrice(partial.min);
    if (partial.max !== undefined) setMaxPrice(partial.max);
    setPage(nextPage);

    syncUrl({
      q: nextQuery,
      category: nextCategory,
      group: nextGroup,
      sort: nextSort,
      min: nextMin,
      max: nextMax,
      page: nextPage,
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
          Boutique
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-white sm:text-5xl">
          Catalogue LKM
        </h1>
        <p className="mt-3 text-white/50">
          {filtered.length} produit{filtered.length > 1 ? "s" : ""} — recherche,
          filtres et commande WhatsApp.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <Input
            value={query}
            onChange={(e) => applyFilters({ q: e.target.value, page: 1 })}
            placeholder="Rechercher un produit…"
            className="pl-10"
            autoFocus={Boolean(initialQuery)}
          />
        </div>
        <select
          value={sort}
          onChange={(e) =>
            applyFilters({ sort: e.target.value as SortOption, page: 1 })
          }
          className="h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-[var(--lkm-blue)]/60"
        >
          {sorts.map((s) => (
            <option key={s.value} value={s.value} className="bg-[#121214]">
              {s.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtres
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {groups.map((g) => (
          <button
            key={g.value || "all"}
            type="button"
            onClick={() =>
              applyFilters({ group: g.value, category: "", page: 1 })
            }
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
              group === g.value
                ? "bg-white text-[#0a0a0c]"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white",
            )}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside
          className={cn(
            "space-y-6 lg:block",
            filtersOpen ? "block" : "hidden",
          )}
        >
          <div className="space-y-2">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
              Catégories
            </p>
            <button
              type="button"
              onClick={() => applyFilters({ category: "", page: 1 })}
              className={cn(
                "block w-full rounded-lg px-3 py-2 text-left text-sm transition",
                !category
                  ? "bg-white/10 text-white"
                  : "text-white/55 hover:bg-white/5 hover:text-white",
              )}
            >
              Toutes
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() =>
                  applyFilters({ category: c.slug, group: "", page: 1 })
                }
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition",
                  category === c.slug
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:bg-white/5 hover:text-white",
                )}
              >
                <span>{c.name}</span>
                <span className="text-xs text-white/30">{c.count}</span>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
              Prix (CFA)
            </p>
            <div className="flex flex-wrap gap-2">
              {pricePresets.map((preset) => {
                const active =
                  minPrice === preset.min && maxPrice === preset.max;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      applyFilters({
                        min: preset.min,
                        max: preset.max,
                        page: 1,
                      })
                    }
                    className={cn(
                      "rounded-lg px-2.5 py-1.5 text-xs font-medium transition",
                      active
                        ? "bg-white text-[#0a0a0c]"
                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="Min"
                value={minPrice}
                onChange={(e) =>
                  applyFilters({ min: e.target.value, page: 1 })
                }
              />
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) =>
                  applyFilters({ max: e.target.value, page: 1 })
                }
              />
            </div>
          </div>
        </aside>

        <div>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-[var(--lkm-surface)] px-6 py-16 text-center">
              <p className="text-lg font-medium text-white">Aucun résultat</p>
              <p className="mt-2 text-sm text-white/45">
                Essayez un autre mot-clé ou réinitialisez les filtres.
              </p>
              <button
                type="button"
                className="mt-6 text-sm text-[var(--lkm-blue)] hover:underline"
                onClick={() => {
                  setQuery("");
                  setCategory("");
                  setGroup("");
                  setSort("featured");
                  setMinPrice("");
                  setMaxPrice("");
                  setPage(1);
                  router.replace("/boutique");
                }}
              >
                Réinitialiser
              </button>
            </div>
          ) : (
            <>
              <ProductGrid dense>
                {pageItems.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index % 12}
                  />
                ))}
              </ProductGrid>

              {totalPages > 1 && (
                <div className="mt-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <p className="text-sm text-white/40">
                    Page {currentPage} / {totalPages} ·{" "}
                    {(currentPage - 1) * PAGE_SIZE + 1}–
                    {Math.min(currentPage * PAGE_SIZE, filtered.length)} sur{" "}
                    {filtered.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => {
                        const next = currentPage - 1;
                        setPage(next);
                        syncUrl({
                          q: query,
                          category,
                          group,
                          sort,
                          min: minPrice,
                          max: maxPrice,
                          page: next,
                        });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="inline-flex h-10 items-center gap-1 rounded-xl border border-white/10 px-3 text-sm text-white disabled:opacity-35"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Précédent
                    </button>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => {
                        const next = currentPage + 1;
                        setPage(next);
                        syncUrl({
                          q: query,
                          category,
                          group,
                          sort,
                          min: minPrice,
                          max: maxPrice,
                          page: next,
                        });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="inline-flex h-10 items-center gap-1 rounded-xl border border-white/10 px-3 text-sm text-white disabled:opacity-35"
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
