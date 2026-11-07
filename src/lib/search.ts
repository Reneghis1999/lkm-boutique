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
  fifa: "fc",
  cod: "call of duty",
  duty: "duty",
  dutty: "duty",
  // « derrière » = vitre arrière (façon de dire des clients), fautes comprises
  derriere: "vitre arriere",
  derrier: "vitre arriere",
  derrie: "vitre arriere",
  derri: "vitre arriere",
  derr: "vitre arriere",
  deriere: "vitre arriere",
  derier: "vitre arriere",
  derie: "vitre arriere",
  deri: "vitre arriere",
  dos: "vitre arriere",
  arier: "arriere",
  ariere: "arriere",
  arrier: "arriere",
  // autres fautes courantes
  ekran: "ecran",
  ecrant: "ecran",
  ecrans: "ecran",
  batri: "batterie",
  batrie: "batterie",
  baterie: "batterie",
  baterry: "batterie",
  capter: "capteur",
  capteurs: "capteur",
  // chargeurs et câbles
  charger: "chargeur",
  chargeu: "chargeur",
  chageur: "chargeur",
  chargeure: "chargeur",
  charg: "chargeur",
  cables: "cable",
  cabl: "cable",
  teste: "tete",
  tetes: "tete",
  typec: "type c",
  usbc: "usb c",
  magsafe: "magsafe",
  // iPhone mal écrit
  ipy: "iphone",
  ipho: "iphone",
  iphon: "iphone",
  ifone: "iphone",
  ifon: "iphone",
  aifone: "iphone",
  iphones: "iphone",
  do: "vitre arriere",
  // vis
  boulon: "vis",
  boulons: "vis",
  boulo: "vis",
  bouln: "vis",
  visse: "vis",
  visses: "vis",
  viss: "vis",
};

/**
 * Mots « de remplissage » : ils aident à classer mais ne sont pas obligatoires
 * (« chargeur complet iphone » trouve aussi les chargeurs iPhone sans le mot « complet »).
 */
const SOFT = new Set([
  "complet", "original", "originale", "origine", "pour", "de", "du", "des",
  "la", "le", "les", "un", "une", "neuf", "bon", "et", "avec",
]);

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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
  let hard = 0;
  for (const q of queryTokens) {
    const soft = SOFT.has(q);
    if (!soft) hard++;
    const inName = wordScore(q, name);
    if (inName) {
      score += inName * 3;
      continue;
    }
    const inOther = wordScore(q, other);
    if (!inOther) {
      if (soft) continue;
      return 0;
    }
    score += inOther;
  }
  if (hard === 0 && score === 0) return 0;
  // À score égal, le nom le plus court (le plus proche de la recherche) d’abord :
  // « vitre 15 » montre l’iPhone 15 avant le 15 Pro Max.
  return score * 100 - name.length;
}


/**
 * Recherches de secours quand rien ne correspond : on retire les derniers mots
 * un par un (« chargeur pro max 35w » → « chargeur pro max » → …),
 * tant qu’il reste un vrai mot (3 lettres ou plus).
 */
export function relaxedQueries(tokens: string[]): string[][] {
  const out: string[][] = [];
  const hard = tokens.filter((t) => !SOFT.has(t));
  for (let n = hard.length - 1; n >= 1; n--) {
    const kept = hard.slice(0, n);
    if (!kept.some((t) => t.length >= 3 && !isNumber(t))) break;
    out.push(kept);
  }
  return out;
}
