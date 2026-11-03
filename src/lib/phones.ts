/**
 * Rubrique « Portables » : les téléphones du catalogue rangés par marque.
 * La marque vient du nom de la catégorie Odoo (ex. « IPHONE », « MOTOROLA »)
 * ou, à défaut, du nom du produit. Les accessoires et pièces sont exclus.
 */
import { loadCatalog } from "@/lib/catalog";
import type { Category, Product } from "@/types";

export type PhoneBrand = {
  slug: string;
  name: string;
  match: RegExp;
};

export const PHONE_BRANDS: PhoneBrand[] = [
  { slug: "iphone", name: "iPhone", match: /\b(iphone|apple)\b/ },
  { slug: "samsung", name: "Samsung", match: /\b(samsung|galaxy)\b/ },
  { slug: "motorola", name: "Motorola", match: /\b(motorola|moto)\b/ },
  { slug: "google-pixel", name: "Google Pixel", match: /\b(pixel|google)\b/ },
  { slug: "xiaomi", name: "Xiaomi & Redmi", match: /\b(xiaomi|redmi|poco)\b/ },
  { slug: "tecno", name: "Tecno", match: /\btecno\b/ },
  { slug: "infinix", name: "Infinix", match: /\binfinix\b/ },
  { slug: "itel", name: "itel", match: /\bitel\b/ },
  { slug: "huawei", name: "Huawei", match: /\b(huawei|honor)\b/ },
  { slug: "oppo", name: "Oppo & Realme", match: /\b(oppo|realme)\b/ },
  { slug: "nokia", name: "Nokia", match: /\bnokia\b/ },
  { slug: "lg", name: "LG", match: /\blg\b/ },
  { slug: "tablettes", name: "iPad & tablettes", match: /\b(ipad|tablette|tab)\b/ },
];

/** Accessoires, pièces et objets qui ne sont pas des téléphones. */
const NOT_A_PHONE =
  /(coque|\bcoq\b|pochette|chargeur|cable|ecouteur|airpod|power ?bank|verre|protection|\bfilm\b|vitre|ecran|nappe|connecteur|support|stylet|pencil|montre|watch|piece|rechange|adaptateur|cle usb|memoire)/;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function brandOf(text: string): PhoneBrand | undefined {
  const n = normalize(text);
  return PHONE_BRANDS.find((b) => b.match.test(n));
}

function phoneBrandOf(
  product: Product,
  categories: Map<string, Category>,
): PhoneBrand | undefined {
  const name = normalize(product.name);
  if (NOT_A_PHONE.test(name)) return undefined;

  const cats = product.categorySlugs
    .map((s) => categories.get(s))
    .filter((c): c is Category => Boolean(c));

  // Catégorie Odoo d’une marque (« IPHONE », « MOTOROLA »…), hors pièces.
  for (const c of cats) {
    if (c.group === "repair" || NOT_A_PHONE.test(normalize(c.name + " " + c.sourceName))) continue;
    const brand = brandOf(c.sourceName) ?? brandOf(c.name);
    if (brand && brand.slug !== "tablettes") return brandOf(product.name) ?? brand;
  }

  // Sinon : téléphone rangé dans une catégorie mobile, marque lue dans son nom.
  if (cats.some((c) => c.group === "mobile")) return brandOf(product.name);
  return undefined;
}

export async function getPhonesByBrand() {
  const { products, categories } = await loadCatalog();
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const groups = new Map<string, Product[]>();
  for (const product of products) {
    const brand = phoneBrandOf(product, bySlug);
    if (!brand) continue;
    const list = groups.get(brand.slug) ?? [];
    list.push(product);
    groups.set(brand.slug, list);
  }
  return PHONE_BRANDS.filter((b) => groups.has(b.slug)).map((b) => {
    const list = groups.get(b.slug)!;
    return {
      ...b,
      products: list,
      count: list.length,
      image: list.find((p) => p.image)?.image ?? null,
    };
  });
}

export async function getPhoneBrand(slug: string) {
  return (await getPhonesByBrand()).find((b) => b.slug === slug);
}
