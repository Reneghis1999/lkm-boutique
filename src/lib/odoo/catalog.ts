import { odooCall } from "@/lib/odoo/client";
import {
  mapOdooCategory,
  mapOdooProduct,
  type OdooCategoryRow,
  type OdooProductRow,
} from "@/lib/odoo/map-product";
import type { Category, Product } from "@/types";

const PRODUCT_FIELDS = [
  "id",
  "name",
  "display_name",
  "list_price",
  "description_sale",
  "default_code",
  "barcode",
  "active",
  "categ_id",
  // image_1920 est lourd — on l’activera quand la sync sera validée
] as const;

/**
 * Lit le catalogue publié depuis Odoo.
 * À affiner (website_published, variantes, images URL) dès que l’API est accessible.
 */
export async function fetchOdooProducts(): Promise<Product[]> {
  const rows = await odooCall<OdooProductRow[]>("product.product", "search_read", {
    domain: [
      ["active", "=", true],
      ["sale_ok", "=", true],
    ],
    fields: [...PRODUCT_FIELDS],
    limit: 500,
    order: "id asc",
  });

  if (!Array.isArray(rows)) return [];
  return rows.map((row) => mapOdooProduct(row));
}

export async function fetchOdooCategories(
  products: Product[],
): Promise<Category[]> {
  try {
    const rows = await odooCall<OdooCategoryRow[]>(
      "product.category",
      "search_read",
      {
        domain: [],
        fields: ["id", "name", "display_name", "parent_id"],
        limit: 200,
      },
    );
    if (!Array.isArray(rows)) return [];

    return rows.map((row) => {
      const mapped = mapOdooCategory(row);
      const count = products.filter((p) =>
        p.categorySlugs.includes(mapped.slug),
      ).length;
      return { ...mapped, count };
    });
  } catch {
    // Fallback : dériver depuis les produits
    const map = new Map<string, Category>();
    for (const p of products) {
      for (const slug of p.categorySlugs) {
        const existing = map.get(slug);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(slug, {
            slug,
            name: slug,
            shortName: slug.slice(0, 24),
            description: "",
            icon: "Package",
            accent: "blue",
            group: "other",
            sourceName: slug,
            count: 1,
          });
        }
      }
    }
    return [...map.values()];
  }
}
