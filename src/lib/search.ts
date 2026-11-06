/**
 * Recherche « intelligente » du catalogue (module pur, utilisable partout) :
 * - chaque mot est cherché séparément, dans n’importe quel ordre ;
 * - le début d’un mot suffit (« batt » → batterie) ;
 * - sans accents ni majuscules ;
 * - abréviations de boutique (pm = Pro Max, iph = iPhone, vr = vitre arrière…).
 */
import type { Product } from "@/types";

/** Abréviations utilisées en boutique → mots complets. */
const ALIASES: Record<string, string> = {
  pm: "pro max",
  promax: "pro max",
  prm: "pro max",
  iph: "iphone",
  ip: "iphone",
  bat: "batterie",
  batt: "batterie",
  battery: "batterie",
  batteries: "batterie",
  vr: "vitre arriere",
  vitres: "vitre",
  xsmax: "xs max",
  xsmas: "xs max",
  cpl: "complet",
  spl: "simple",
  sam: "samsung",
  manettes: "manette",
  chargeurs: "chargeur",
  jeux: "jeu",
};

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\+/g, " plus ")
    // sépare chiffres et lettres collés : « 15pro » → « 15 pro », « iph11 » → « iph 11 »
    .replace(/(\d)([a-z])/g, "$1 $2")
    .replace(/([a-z])(\d)/g, "$1 $2")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Découpe en mots, abréviations développées. */
export function searchTokens(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter(Boolean)
    .flatMap((w) => (ALIASES[w] ?? w).split(" "));
}

const isNumber = (w: string) => /^\d+$/.test(w);

/** Un mot de la recherche correspond-il à un mot du produit ? 2 = exact, 1 = début. */
function wordScore(q: string, words: string[]): number {
  let best = 0;
  for (const w of words) {
    if (w === q) return 2;
    // Les nombres doivent être exacts (« 15 » ne doit pas trouver « 150W »).
    if (!isNumber(q) && w.startsWith(q)) best = 1;
  }
  return best;
}

type Indexed = { name: string[]; other: string[] };
const cache = new WeakMap<Product, Indexed>();

function index(p: Product): Indexed {
  let entry = cache.get(p);
  if (!entry) {
    entry = {
      name: searchTokens(p.name),
      other: searchTokens(`${p.categorySlugs.join(" ")} ${p.description ?? ""}`),
    };
    cache.set(p, entry);
  }
  return entry;
}

/**
 * Score d’un produit pour une recherche (0 = ne correspond pas).
 * Tous les mots doivent être trouvés ; le nom compte plus que le reste.
 */
export function searchScore(p: Product, queryTokens: string[]): number {
  if (queryTokens.length === 0) return 1;
  const { name, other } = index(p);
  let score = 0;
  for (const q of queryTokens) {
    const inName = wordScore(q, name);
    if (inName) {
      score += inName * 3;
      continue;
    }
    const inOther = wordScore(q, other);
    if (!inOther) return 0;
    score += inOther;
  }
  // À score égal, le nom le plus court (le plus proche de la recherche) d’abord :
  // « vitre 15 » montre l’iPhone 15 avant le 15 Pro Max.
  return score * 100 - name.length;
}
