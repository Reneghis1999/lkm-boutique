import catalogData from "@/data/catalog.json";
import { getCatalogSource, isOdooReady } from "@/lib/odoo/config";
import {
  fetchOdooCategories,
  fetchOdooProducts,
} from "@/lib/odoo/catalog";
import type { Category, Product, SortOption } from "@/types";

const jsonCategories = catalogData.categories as Category[];
const jsonProducts = catalogData.products as Product[];

async function loadFromOdoo(): Promise<{
  products: Product[];
  categories: Category[];
} | null> {
  if (!isOdooReady()) return null;
  try {
    const products = await fetchOdooProducts();
    if (products.length === 0) return null;
    const categories = await fetchOdooCategories(products);
    return { products, categories };
  } catch (e) {
    console.error("[catalog] Odoo indisponible, fallback JSON:", e);
    return null;
  }
}

export async function getCatalogSourceLabel(): Promise<string> {
  const source = getCatalogSource();
  if (source === "json") return "json";
  if (isOdooReady()) {
    const odoo = await loadFromOdoo();
    if (odoo) return "odoo";
  }
  return "json";
}

export async function getCategories(): Promise<Category[]> {
  const source = getCatalogSource();
  if (source !== "json") {
    const odoo = await loadFromOdoo();
    if (odoo?.categories.length) {
      return [...odoo.categories].sort((a, b) => b.count - a.count);
    }
  }
  return [...jsonCategories].sort((a, b) => b.count - a.count);
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug);
}

export async function getProducts(): Promise<Product[]> {
  const source = getCatalogSource();
  if (source !== "json") {
    const odoo = await loadFromOdoo();
    if (odoo?.products.length) {
      return [...odoo.products].sort((a, b) => a.position - b.position);
    }
  }
  return [...jsonProducts].sort((a, b) => a.position - b.position);
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = await getProducts();
  const featured = products.filter((p) => p.featured && p.image);
  if (featured.length >= limit) return featured.slice(0, limit);

  const rest = products
    .filter((p) => p.image && !featured.some((f) => f.id === p.id))
    .sort((a, b) => (b.price ?? 0) - (a.price ?? 0));

  return [...featured, ...rest].slice(0, limit);
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  const products = await getProducts();
  return products
    .filter((p) => p.categorySlugs.includes(slug))
    .sort((a, b) => a.position - b.position);
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const products = await getProducts();
  return products
    .filter(
      (p) =>
        p.slug !== product.slug &&
        p.categorySlugs.some((c) => product.categorySlugs.includes(c)),
    )
    .slice(0, limit);
}

export async function getMainCategoryGroups() {
  const products = await getProducts();
  const groups = [
    {
      id: "mobile",
      title: "Phones & Accessoires",
      description: "Smartphones, batteries, power banks et pièces détachées.",
      accent: "blue" as const,
      href: "/boutique?group=mobile",
      slugs: [
        "telephone-samsung",
        "chargeur-telephone-porteble",
        "power-bank",
        "coq-iphone",
        "motorola-piecs-de-rechange",
      ],
    },
    {
      id: "pc",
      title: "PC & Matériels",
      description: "Ordinateurs, composants, adaptateurs et accessoires PC.",
      accent: "green" as const,
      href: "/boutique?group=pc",
      slugs: ["pc", "adaptateur-pc", "chargeur-pc", "sac-et-pose-pc", "pencil"],
    },
    {
      id: "gaming",
      title: "Consoles & Jeux",
      description: "PlayStation, Xbox, Switch, manettes et jeux originaux.",
      accent: "yellow" as const,
      href: "/boutique?group=gaming",
      slugs: ["consol-de-jeux", "cd", "manette", "copie-de-jeux"],
    },
    {
      id: "repair",
      title: "Service Réparation",
      description: "Diagnostic, maintenance et pièces pour PC & téléphones.",
      accent: "green" as const,
      href: "/reparation",
      slugs: ["accessoire-de-reparation", "motorola-piecs-de-rechange"],
    },
  ];

  return groups.map((g) => {
    const groupProducts = products.filter((p) =>
      p.categorySlugs.some((s) => g.slugs.includes(s)),
    );
    const cover =
      groupProducts.find((p) => p.image && p.featured)?.image ??
      groupProducts.find((p) => p.image)?.image ??
      null;
    return {
      ...g,
      count: groupProducts.length,
      image: cover,
    };
  });
}

export interface ProductFilters {
  query?: string;
  category?: string;
  group?: string;
  sort?: SortOption;
  minPrice?: number;
  maxPrice?: number;
}

const groupSlugMap: Record<string, string[]> = {
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

export function filterProducts(
  filters: ProductFilters = {},
  source: Product[] = jsonProducts,
): Product[] {
  let result = [...source];

  if (filters.category) {
    result = result.filter((p) =>
      p.categorySlugs.includes(filters.category!),
    );
  }

  if (filters.group && groupSlugMap[filters.group]) {
    const slugs = groupSlugMap[filters.group];
    result = result.filter((p) =>
      p.categorySlugs.some((s) => slugs.includes(s)),
    );
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

export function getCatalogStats() {
  return catalogData.stats;
}
