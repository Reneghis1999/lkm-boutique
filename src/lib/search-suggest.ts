/**
 * Propositions de marques pendant la saisie (« bat » → Batterie iPhone, Batterie Pixel…).
 * Calculées à partir des produits publiés : une marque n’apparaît que si on en a.
 */
import type { Product } from "@/types";
import { searchTokens } from "@/lib/search";

export type Suggestion = { label: string; q: string; count: number };

/** Types de pièces : mot cherché dans le nom du produit → libellé affiché. */
const TYPES: { word: string; label: string }[] = [
  { word: "batterie", label: "Batterie" },
  { word: "ecran", label: "Écran" },
  { word: "vitre", label: "Vitre arrière" },
  { word: "bout", label: "Bout de charge" },
  { word: "capteur", label: "Capteur" },
  { word: "chargeur", label: "Chargeur" },
  { word: "cable", label: "Câble" },
  { word: "coque", label: "Coque" },
  { word: "vis", label: "Vis" },
];

/** Marques reconnues dans le nom (mot → libellé). */
const BRANDS: { words: string[]; label: string }[] = [
  { words: ["iphone"], label: "iPhone" },
  { words: ["samsung"], label: "Samsung" },
  { words: ["pixel", "google"], label: "Pixel" },
  { words: ["huawei"], label: "Huawei" },
  { words: ["redmi", "xiaomi", "poco"], label: "Redmi" },
  { words: ["tecno"], label: "Tecno" },
  { words: ["itel"], label: "Itel" },
  { words: ["infinix"], label: "Infinix" },
  { words: ["motorola", "moto"], label: "Motorola" },
  { words: ["oppo"], label: "Oppo" },
  { words: ["nokia"], label: "Nokia" },
  { words: ["macbook"], label: "MacBook" },
  { words: ["ipad"], label: "iPad" },
  { words: ["watch"], label: "Apple Watch" },
];

const ALL_BRAND_WORDS = new Set(BRANDS.flatMap((b) => b.words));

const nameCache = new WeakMap<Product, string[]>();
function nameTokens(p: Product): string[] {
  let t = nameCache.get(p);
  if (!t) {
    t = searchTokens(p.name);
    nameCache.set(p, t);
  }
  return t;
}

export function suggestBrands(query: string, products: Product[], max = 20): Suggestion[] {
  const tokens = searchTokens(query);
  if (tokens.length === 0) return [];
  // Une marque déjà tapée → pas de propositions (le client sait ce qu’il veut).
  if (tokens.some((t) => ALL_BRAND_WORDS.has(t))) return [];
  const first = tokens[0];
  if (first.length < 2) return [];
  // « bout de charge » : le premier mot suffit.
  const type = TYPES.find((ty) => ty.word.startsWith(first) || first === ty.word);
  if (!type) return [];

  const counts = new Map<string, number>();
  for (const p of products) {
    const words = nameTokens(p);
    if (!words.some((w) => w.startsWith(type.word))) continue;
    const brand = BRANDS.find((b) => b.words.some((bw) => words.includes(bw)));
    if (!brand) continue;
    counts.set(brand.label, (counts.get(brand.label) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([brand, count]) => {
      const label = `${type.label} ${brand}`;
      return { label, q: label, count };
    });
}
