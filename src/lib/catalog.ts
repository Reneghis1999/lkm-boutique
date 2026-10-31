/**
 * Accès au catalogue côté serveur.
 *
 * Source : Odoo (dès que ODOO_URL + ODOO_API_KEY sont définis), sinon le
 * catalogue JSON. Avec Odoo, chaque page est rendue à la demande : ce que le
 * client modifie dans Odoo apparaît dès que la page est rechargée.
 * Pour les filtres côté navigateur, voir `@/lib/catalog-filter`.
 */
import { cache } from "react";
import { connection } from "next/server";
import catalogData from "@/data/catalog.json";
import { categorySlugsForGroup } from "@/lib/catalog-filter";
import { getCatalogSource, isOdooReady } from "@/lib/odoo/config";
import { fetchOdooCatalog, type OdooCatalog } from "@/lib/odoo/catalog";
import type { Category, Product } from "@/types";

export { filterProducts, type ProductFilters } from "@/lib/catalog-filter";

const jsonCategories = catalogData.categories as Category[];
const jsonProducts = catalogData.products as Product[];

export type LoadedCatalog = {
  products: Product[];
  categories: Category[];
  source: "odoo" | "json";
  /** Erreur Odoo si on a dû basculer sur le JSON de secours. */
  error?: string;
  diagnostics?: OdooCatalog["diagnostics"];
};

/**
 * Chargé une seule fois par requête (layout + page + metadata partagent le
 * résultat), jamais mis en cache d’une requête à l’autre.
 */
const loadCatalog = cache(async (): Promise<LoadedCatalog> => {
  if (isOdooReady()) {
    // Rendu à chaque visite (pas de page figée au build).
    await connection();
    try {
      const odoo = await fetchOdooCatalog();
      return {
        products: [...odoo.products].sort((a, b) => a.position - b.position),
        categories: [...odoo.categories].sort((a, b) => b.count - a.count),
        source: "odoo",
        diagnostics: odoo.diagnostics,
      };
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      console.error("[catalog] Odoo indisponible, catalogue JSON affiché :", e);
      return { ...jsonCatalog(), error };
    }
  }
  return jsonCatalog();
});

function jsonCatalog(): LoadedCatalog {
  return {
    products: [...jsonProducts].sort((a, b) => a.position - b.position),
    categories: [...jsonCategories].sort((a, b) => b.count - a.count),
    source: "json",
  };
}

export { loadCatalog };

export async function getCatalogSourceLabel(): Promise<string> {
  if (getCatalogSource() === "json") return "json";
  return (await loadCatalog()).source;
}

export async function getCategories(): Promise<Category[]> {
  return (await loadCatalog()).categories;
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug);
}

export async function getProducts(): Promise<Product[]> {
  return (await loadCatalog()).products;
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}

const legacyFeaturedSlugs = jsonProducts
  .filter((p) => p.featured)
  .map((p) => p.slug);

/**
 * Sélection de la page d’accueil : produits avec ruban dans Odoo, puis
 * l’ancienne sélection, puis les plus chers — toujours avec photo.
 */
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = (await getProducts()).filter((p) => p.image);
  const picked: Product[] = [];
  const add = (p: Product | undefined) => {
    if (p && picked.length < limit && !picked.some((x) => x.id === p.id)) {
      picked.push(p);
    }
  };

  products.filter((p) => p.featured).forEach(add);
  legacyFeaturedSlugs.forEach((slug) =>
    add(products.find((p) => p.slug === slug)),
  );
  [...products]
    .sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    .forEach(add);

  return picked;
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
  const { products, categories } = await loadCatalog();
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
    // Les nouvelles catégories créées dans Odoo rejoignent leur rubrique.
    const slugs = categorySlugsForGroup(g.id, categories, g.slugs);
    const groupProducts = products.filter((p) =>
      p.categorySlugs.some((s) => slugs.includes(s)),
    );
    const cover =
      groupProducts.find((p) => p.image && p.featured)?.image ??
      groupProducts.find((p) => p.image)?.image ??
      null;
    return {
      ...g,
      slugs,
      count: groupProducts.length,
      image: cover,
    };
  });
}

export function getCatalogStats() {
  return catalogData.stats;
}
