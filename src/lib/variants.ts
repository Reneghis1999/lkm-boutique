/**
 * Variantes d’un produit (marque, couleur…) : prix et stock propres à chaque
 * choix, tels qu’ils sont dans Odoo. Module pur (navigateur et serveur).
 */
import type { Product, ProductVariant } from "@/types";

/** Variante correspondant aux choix du client (tous les choix faits doivent coller). */
export function findVariant(
  product: Pick<Product, "variants">,
  selected?: Record<string, string>,
): ProductVariant | undefined {
  if (!product.variants?.length || !selected) return undefined;
  const picks = Object.entries(selected);
  if (picks.length === 0) return undefined;
  return product.variants.find((v) =>
    picks.every(([name, value]) => v.options[name] === undefined || v.options[name] === value),
  );
}

/** Prix pour les choix faits (variante si connue, sinon prix du produit). */
export function priceFor(
  product: Pick<Product, "variants" | "price">,
  selected?: Record<string, string>,
): number | null {
  const v = findVariant(product, selected);
  return v?.price ?? product.price;
}

/** Prix mini / maxi parmi les variantes (null si pas de différence). */
export function priceRange(
  product: Pick<Product, "variants">,
): { min: number; max: number } | null {
  const prices = (product.variants ?? [])
    .map((v) => v.price)
    .filter((p): p is number => typeof p === "number" && p >= 100);
  if (prices.length < 2) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? null : { min, max };
}

/** Clé stable d’une combinaison de choix. */
export function optionsKey(options: Record<string, string>): string {
  return Object.entries(options)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
}
