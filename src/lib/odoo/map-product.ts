import { slugify } from "@/lib/slug";
import type { Category, Product } from "@/types";

/** Forme minimale renvoyée par product.product / product.template */
export type OdooProductRow = {
  id: number;
  name?: string;
  display_name?: string;
  list_price?: number;
  description_sale?: string | false;
  default_code?: string | false;
  barcode?: string | false;
  website_published?: boolean;
  is_published?: boolean;
  active?: boolean;
  image_1920?: string | false;
  categ_id?: [number, string] | false;
};

export type OdooCategoryRow = {
  id: number;
  name?: string;
  display_name?: string;
  parent_id?: [number, string] | false;
};

function moneyToCfa(amount: number | undefined | null): number | null {
  if (amount == null || Number.isNaN(amount)) return null;
  // Odoo Online LKM est en CFA → list_price déjà en CFA. Si un jour en EUR, convertir ici.
  return Math.round(amount);
}

function categorySlugFromName(name: string) {
  return slugify(name) || `cat-${Date.now()}`;
}

export function mapOdooCategory(row: OdooCategoryRow, count = 0): Category {
  const name = row.name || row.display_name || `Catégorie ${row.id}`;
  return {
    slug: categorySlugFromName(name),
    name,
    shortName: name.slice(0, 24),
    description: "",
    icon: "Package",
    accent: "blue",
    group: "other",
    sourceName: name,
    count,
  };
}

export function mapOdooProduct(
  row: OdooProductRow,
  categorySlug?: string,
): Product {
  const name = (row.name || row.display_name || `Produit ${row.id}`).trim();
  const code =
    (typeof row.default_code === "string" && row.default_code) ||
    String(row.id);
  const slugBase = slugify(`${name}-${code}`) || `odoo-${row.id}`;

  let image: string | null = null;
  if (typeof row.image_1920 === "string" && row.image_1920.length > 40) {
    image = `data:image/png;base64,${row.image_1920}`;
  }

  const fromCateg =
    Array.isArray(row.categ_id) && row.categ_id[1]
      ? categorySlugFromName(row.categ_id[1])
      : undefined;

  return {
    id: `odoo-${row.id}`,
    slug: slugBase,
    name,
    price: moneyToCfa(row.list_price),
    compareAtPrice: null,
    description:
      typeof row.description_sale === "string" ? row.description_sale : "",
    categorySlugs: [categorySlug || fromCateg].filter(Boolean) as string[],
    image,
    specs: [],
    options: [],
    featured: false,
    position: row.id,
  };
}
