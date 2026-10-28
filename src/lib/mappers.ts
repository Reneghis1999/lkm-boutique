import type { Category as DbCategory, Product as DbProduct } from "@prisma/client";
import type { AccentColor, Category, CategoryGroup, Product } from "@/types";

type ProductWithCategories = DbProduct & {
  categories?: Array<{ category: DbCategory }>;
};

export function mapProduct(p: ProductWithCategories): Product {
  let specs: Product["specs"] = [];
  let options: Product["options"] = [];
  try {
    specs = JSON.parse(p.specsJson || "[]");
  } catch {
    specs = [];
  }
  try {
    options = JSON.parse(p.optionsJson || "[]");
  } catch {
    options = [];
  }

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    description: p.description,
    categorySlugs: (p.categories || []).map((c) => c.category.slug),
    image: p.image,
    specs,
    options,
    featured: p.featured,
    position: p.position,
  };
}

export function mapCategory(
  c: DbCategory & { _count?: { products: number } },
): Category {
  return {
    slug: c.slug,
    name: c.name,
    shortName: c.shortName,
    description: c.description,
    icon: c.icon,
    accent: (c.accent as AccentColor) || "blue",
    group: (c.group as CategoryGroup) || "other",
    sourceName: c.sourceName,
    count: c._count?.products ?? 0,
  };
}
