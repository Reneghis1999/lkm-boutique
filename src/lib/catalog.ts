import catalogData from "@/data/catalog.json";
import { prisma } from "@/lib/db";
import { mapCategory, mapProduct } from "@/lib/mappers";
import type { Category, Product, SortOption } from "@/types";

const jsonCategories = catalogData.categories as Category[];
const jsonProducts = catalogData.products as Product[];

function hasConfiguredDatabase() {
  const url = process.env.DATABASE_URL || "";
  if (!url.startsWith("postgresql://") && !url.startsWith("postgres://")) {
    return false;
  }
  if (
    url.includes("PASSWORD") ||
    url.includes("PROJECT_REF") ||
    url.includes("xxxx")
  ) {
    return false;
  }
  return true;
}

async function dbReady() {
  if (!hasConfiguredDatabase()) return false;
  try {
    const count = await prisma.product.count({ where: { active: true } });
    return count > 0;
  } catch {
    return false;
  }
}

export async function getCategories(): Promise<Category[]> {
  if (await dbReady()) {
    const rows = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { position: "asc" },
    });
    return rows.map(mapCategory).sort((a, b) => b.count - a.count);
  }
  return [...jsonCategories].sort((a, b) => b.count - a.count);
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | undefined> {
  if (await dbReady()) {
    const row = await prisma.category.findUnique({
      where: { slug },
      include: { _count: { select: { products: true } } },
    });
    return row ? mapCategory(row) : undefined;
  }
  return jsonCategories.find((c) => c.slug === slug);
}

export async function getProducts(): Promise<Product[]> {
  if (await dbReady()) {
    const rows = await prisma.product.findMany({
      where: { active: true },
      include: { categories: { include: { category: true } } },
      orderBy: { position: "asc" },
    });
    return rows.map(mapProduct);
  }
  return [...jsonProducts].sort((a, b) => a.position - b.position);
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  if (await dbReady()) {
    const row = await prisma.product.findFirst({
      where: { slug, active: true },
      include: { categories: { include: { category: true } } },
    });
    return row ? mapProduct(row) : undefined;
  }
  return jsonProducts.find((p) => p.slug === slug);
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
