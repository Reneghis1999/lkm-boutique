/**
 * Propositions pendant la saisie : « bat » → Batterie iPhone, Batterie Pixel… ;
 * « man » → Manette PS4, Manette PS5… ; « acc » → Accessoire de réparation.
 * Calculées à partir des produits publiés : on ne propose que ce qu’on a.
 */
import type { Category, Product } from "@/types";
import { searchTokens } from "@/lib/search";

export type Suggestion = {
  label: string;
  /** Recherche à lancer. */
  q: string;
  /** Catégorie à filtrer (facultatif). */
  category?: string;
  count: number;
};

type Kind = {
  /** Débuts de mots qui déclenchent ce type (après correction des fautes). */
  words: string[];
  label: string;
  /** Le produit est de ce type si son nom contient un de ces mots… */
  nameWords?: string[];
  /** …ou s’il est dans une de ces catégories (début du slug). */
  categories?: string[];
  /** Filtrer par catégorie au clic (sinon on cherche « type marque »). */
  useCategory?: boolean;
};

const KINDS: Kind[] = [
  { words: ["batterie"], label: "Batterie", nameWords: ["batterie"] },
  { words: ["ecran"], label: "Écran", nameWords: ["ecran"] },
  { words: ["vitre"], label: "Vitre arrière", nameWords: ["vitre"] },
  { words: ["bout"], label: "Bout de charge", nameWords: ["bout"] },
  { words: ["capteur"], label: "Capteur", nameWords: ["capteur"] },
  { words: ["chargeur"], label: "Chargeur", nameWords: ["chargeur", "tete"] },
  { words: ["cable"], label: "Câble", nameWords: ["cable"] },
  { words: ["power"], label: "Power bank", nameWords: ["power"] },
  { words: ["coque", "pochette", "incassable"], label: "Coque", categories: ["coq"], useCategory: true },
  { words: ["vis"], label: "Vis", nameWords: ["vis"] },
  { words: ["manette"], label: "Manette", nameWords: ["manette"], categories: ["manette"] },
  { words: ["console"], label: "Console", categories: ["console"], useCategory: true },
  { words: ["jeu", "cd", "game"], label: "Jeux", categories: ["cd", "copie-de-jeux"], useCategory: true },
  { words: ["telephone", "tel", "portable", "smartphone"], label: "Téléphone", categories: ["telephone", "iphone", "motorola"], useCategory: true },
  { words: ["pc", "ordinateur", "laptop", "macbook"], label: "PC", categories: ["pc"], useCategory: true },
  { words: ["woofer", "enceinte", "baffle", "mp"], label: "Woofer", categories: ["mp3"], useCategory: true },
  { words: ["casque", "ecouteur"], label: "Casque", nameWords: ["casque", "ecouteur"] },
  { words: ["cle", "usb", "memoire", "carte"], label: "Clé USB", categories: ["cle-usb"], useCategory: true },
  { words: ["pencil", "pen", "stylet"], label: "Pencil", categories: ["pencil"], useCategory: true },
  { words: ["adaptateur", "souris", "hub"], label: "Adaptateur", categories: ["adaptateur"], useCategory: true },
  { words: ["sac", "pose", "sacoche"], label: "Sac PC", categories: ["sac"], useCategory: true },
];

/** Marques / plateformes reconnues dans le nom (expression sur le nom normalisé). */
const BRANDS: { re: RegExp; label: string; q: string }[] = [
  { re: /\bps ?5\b|playstation 5/, label: "PS5", q: "ps5" },
  { re: /\bps ?4\b/, label: "PS4", q: "ps4" },
  { re: /\bps ?3\b/, label: "PS3", q: "ps3" },
  { re: /\bxbox\b/, label: "Xbox", q: "xbox" },
  { re: /\bswitch\b|nintendo|joy ?con/, label: "Switch", q: "switch" },
  { re: /\biphone\b|\bip ?\d/, label: "iPhone", q: "iphone" },
  { re: /\bipad\b/, label: "iPad", q: "ipad" },
  { re: /\bmacbook\b/, label: "MacBook", q: "macbook" },
  { re: /\bimac\b/, label: "iMac", q: "imac" },
  { re: /\bapple watch\b|\bwatch\b/, label: "Apple Watch", q: "watch" },
  { re: /\bsamsung\b|\bgalaxy\b/, label: "Samsung", q: "samsung" },
  { re: /\bpixel\b|\bgoogle\b/, label: "Pixel", q: "pixel" },
  { re: /\bhuawei\b/, label: "Huawei", q: "huawei" },
  { re: /\bredmi\b|\bxiaomi\b|\bpoco\b/, label: "Redmi", q: "redmi" },
  { re: /\btecno\b/, label: "Tecno", q: "tecno" },
  { re: /\bitel\b/, label: "Itel", q: "itel" },
  { re: /\binfinix\b/, label: "Infinix", q: "infinix" },
  { re: /\bmotorola\b|\bmoto\b/, label: "Motorola", q: "motorola" },
  { re: /\boraimo\b/, label: "Oraimo", q: "oraimo" },
  { re: /\bjbl\b/, label: "JBL", q: "jbl" },
  { re: /\bhp\b/, label: "HP", q: "hp" },
  { re: /\bmeta\b|\bquest\b/, label: "Meta Quest", q: "quest" },
  { re: /\bgarmin\b/, label: "Garmin", q: "garmin" },
];

function norm(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const cache = new WeakMap<Product, { name: string; words: string[] }>();
function info(p: Product) {
  let i = cache.get(p);
  if (!i) {
    i = { name: norm(p.name), words: searchTokens(p.name) };
    cache.set(p, i);
  }
  return i;
}

function isKind(p: Product, k: Kind): boolean {
  const { words } = info(p);
  if (k.nameWords?.some((nw) => words.some((w) => w.startsWith(nw)))) return true;
  if (k.categories?.some((c) => p.categorySlugs.some((s) => s.startsWith(c)))) return true;
  return false;
}

function categoryFor(p: Product, k: Kind): string | undefined {
  return p.categorySlugs.find((s) => k.categories?.some((c) => s.startsWith(c)));
}

export function suggest(
  query: string,
  products: Product[],
  categories: Category[] = [],
  max = 20,
): Suggestion[] {
  const tokens = searchTokens(query);
  if (tokens.length === 0) return [];
  const raw = norm(query);
  // Une marque déjà tapée → pas de propositions (le client sait ce qu’il veut).
  if (BRANDS.some((b) => b.re.test(raw))) return [];
  const first = tokens[0];
  if (first.length < 2) return [];

  const kind = KINDS.find((k) =>
    k.words.some((w) => w.startsWith(first) || first.startsWith(w)),
  );

  if (kind) {
    const found = new Map<string, Suggestion>();
    for (const p of products) {
      if (!isKind(p, kind)) continue;
      const brand = BRANDS.find((b) => b.re.test(info(p).name));
      if (!brand) continue;
      const label = `${kind.label} ${brand.label}`;
      const prev = found.get(label);
      if (prev) {
        prev.count++;
        continue;
      }
      const category = kind.useCategory ? categoryFor(p, kind) : undefined;
      found.set(label, {
        label,
        q: category ? brand.q : label,
        ...(category ? { category } : {}),
        count: 1,
      });
    }
    const list = [...found.values()].sort((a, b) => b.count - a.count).slice(0, max);
    if (list.length > 0) return list;
  }

  // Sinon : catégories dont un mot commence par ce qui est tapé.
  return categories
    .filter((c) => {
      const words = norm(c.name).split(" ");
      return words.some((w) => w.length > 2 && w.startsWith(norm(query).split(" ")[0]));
    })
    .slice(0, max)
    .map((c) => {
      const lower = c.name.toLowerCase();
      return { label: lower.charAt(0).toUpperCase() + lower.slice(1), q: "", category: c.slug, count: 0 };
    });
}
