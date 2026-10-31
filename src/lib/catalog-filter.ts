/**
 * Filtres / tri du catalogue — module « pur », utilisable côté navigateur
 * (aucun import Odoo ni du gros catalog.json ici).
 */
import type { Category, CategoryGroup, Product, SortOption } from "@/types";

/** Rubriques historiques (catégories eCommerce Odoo existantes). */
export const GROUP_CATEGORY_SLUGS: Record<string, string[]> = {
  mobile: [
    "telephone-samsung",
    "chargeur-telephone-porteble",
    "power-bank",
    "coq-iphone",
    "motorola-piecs-de-rechange",
  ],
  pc: [
    "pc",
    "adaptateur-pc",
    "chargeur-pc",
    "sac-et-pose-pc",
    "cle-usb-et-memoire",
    "pencil",
  ],
  gaming: ["consol-de-jeux", "cd", "manette", "copie-de-jeux"],
  audio: ["mp3"],
  repair: ["accessoire-de-reparation", "motorola-piecs-de-rechange"],
};

const KNOWN_GROUP_SLUGS = new Set(Object.values(GROUP_CATEGORY_SLUGS).flat());

/**
 * Catégories d’une rubrique : la liste historique + les nouvelles catégories
 * créées dans Odoo dont la rubrique a été déduite (champ `group`).
 */
export function categorySlugsForGroup(
  group: string,
  categories: Category[] = [],
  base: string[] = GROUP_CATEGORY_SLUGS[group] ?? [],
): string[] {
  const extra = categories
    .filter(
      (c) =>
        c.group === (group as CategoryGroup) && !KNOWN_GROUP_SLUGS.has(c.slug),
    )
    .map((c) => c.slug);
  return [...new Set([...base, ...extra])];
}

export interface ProductFilters {
  query?: string;
  category?: string;
  group?: string;
  sort?: SortOption;
  minPrice?: number;
  maxPrice?: number;
}

export function filterProducts(
  filters: ProductFilters = {},
  source: Product[],
  categories: Category[] = [],
): Product[] {
  let result = [...source];

  if (filters.category) {
    result = result.filter((p) =>
      p.categorySlugs.includes(filters.category!),
    );
  }

  if (filters.group) {
    const slugs = categorySlugsForGroup(filters.group, categories);
    if (slugs.length > 0) {
      result = result.filter((p) =>
        p.categorySlugs.some((s) => slugs.includes(s)),
      );
    }
  }

  if (filters.query?.trim()) {
    const q = filters.query.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.categorySlugs.some((s) => s.includes(q)),
    );
  }

  if (filters.minPrice != null) {
    result = result.filter(
      (p) => p.price != null && p.price >= filters.minPrice!,
    );
  }

  if (filters.maxPrice != null) {
    result = result.filter(
      (p) => p.price != null && p.price <= filters.maxPrice!,
    );
  }

  switch (filters.sort) {
    case "price-asc":
      result.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
      break;
    case "price-desc":
      result.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
      break;
    case "name-asc":
      result.sort((a, b) => a.name.localeCompare(b.name, "fr"));
      break;
    case "newest":
      result.sort((a, b) => b.position - a.position);
      break;
    case "featured":
    default:
      result.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return a.position - b.position;
      });
  }

  return result;
}
