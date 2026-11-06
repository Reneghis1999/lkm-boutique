/**
 * Devis de réparation iPhone : prix de la pièce (catalogue Odoo) + main d’œuvre.
 * Les pièces sont lues dans les noms des produits publiés :
 *   « Écran iPhone 13 Pro Max », « Batterie iPhone 15 Pro (COUPE) avec nappe »,
 *   « Vitre arrière iPhone 14 (complet) », « Capteur iPhone 13 Pro ».
 */
import type { Product } from "@/types";
import type { RepairItem } from "@/data/repairs";

export type QuotePart = "Écran" | "Batterie" | "Vitre arrière" | "Capteur";
export const QUOTE_PARTS: QuotePart[] = ["Écran", "Batterie", "Vitre arrière", "Capteur"];

export type QuoteOption = {
  /** Version de la pièce : marque (UA, DD…), couleur, « COUPE avec nappe »… */
  label: string;
  price: number;
  availableAt?: string[];
  inStock?: boolean;
  slug: string;
};

export type QuoteEntry = { model: string; part: QuotePart; options: QuoteOption[] };

export type RepairQuoteData = {
  models: string[];
  entries: QuoteEntry[];
  labor: Record<QuotePart, number>;
};

const PART_RE = /^(ecran|batterie|vitre arriere|capteur)\s+(iphone\s.+)$/i;
const PART_OF: Record<string, QuotePart> = {
  ecran: "Écran",
  batterie: "Batterie",
  "vitre arriere": "Vitre arrière",
  capteur: "Capteur",
};

const strip = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Ordre naturel des iPhone : 6, 6s, 7… X, XR, XS… 11… 17, puis mini < (rien) < Plus < Pro < Pro Max. */
function modelKey(model: string): [number, number, string] {
  const m = strip(model).toLowerCase().replace(/^iphone\s*/, "");
  const gen: Record<string, number> = { x: 10, xr: 10.2, xs: 10.4, se: 8.5 };
  const head = m.split(/[\s/]/)[0];
  let g = gen[head] ?? parseFloat(head);
  if (Number.isNaN(g)) g = 99;
  if (/^\d+s\b/.test(head)) g += 0.5;
  if (/^\d+e\b/.test(head)) g += 0.3;
  const rank = /pro max/.test(m) ? 4 : /pro/.test(m) ? 3 : /plus|max/.test(m) ? 2 : /mini/.test(m) ? 0 : /air/.test(m) ? 2.5 : 1;
  return [g, rank, m];
}

function compareModels(a: string, b: string) {
  const ka = modelKey(a);
  const kb = modelKey(b);
  return ka[0] - kb[0] || ka[1] - kb[1] || ka[2].localeCompare(kb[2]);
}

export function buildRepairQuote(products: Product[], repairs: RepairItem[]): RepairQuoteData {
  const byKey = new Map<string, QuoteEntry>();
  for (const p of products) {
    const match = strip(p.name).trim().match(PART_RE);
    if (!match) continue;
    const part = PART_OF[match[1].toLowerCase()];
    // « iPhone 15 Pro (COUPE) avec nappe » → modèle « iPhone 15 Pro » + version « COUPE avec nappe »
    const rest = p.name.slice(p.name.toLowerCase().indexOf("iphone")).trim();
    const paren = rest.indexOf("(");
    const model = (paren >= 0 ? rest.slice(0, paren) : rest).trim().replace(/^iphone/i, "iPhone");
    const version = paren >= 0 ? rest.slice(paren).replace(/[()]/g, "").replace(/\s+/g, " ").trim() : "";

    const options: QuoteOption[] = [];
    const usable = (x: number | null | undefined): x is number => typeof x === "number" && x >= 100;
    if (p.variants?.length) {
      for (const v of p.variants) {
        if (!usable(v.price)) continue;
        options.push({
          label: [version, ...Object.values(v.options)].filter(Boolean).join(" · "),
          price: v.price,
          availableAt: v.availableAt ?? p.availableAt,
          inStock: v.inStock ?? p.inStock,
          slug: p.slug,
        });
      }
    } else if (usable(p.price)) {
      options.push({
        label: version || "Standard",
        price: p.price,
        availableAt: p.availableAt,
        inStock: p.inStock,
        slug: p.slug,
      });
    }
    if (!options.length) continue;

    // « iPhone 12 / 12 Pro » : même pièce pour les deux modèles.
    const models = model.split("/").map((m, i) => {
      const t = m.trim();
      return i === 0 || /^iphone/i.test(t) ? t : `iPhone ${t}`;
    });
    for (const m of models) {
      if (!m) continue;
      const key = `${m.toLowerCase()}|${part}`;
      const entry = byKey.get(key) ?? { model: m, part, options: [] as QuoteOption[] };
      entry.options.push(...options.map((o) => ({ ...o })));
      byKey.set(key, entry);
    }
  }

  for (const e of byKey.values()) {
    // En stock d’abord, puis du moins cher au plus cher.
    e.options.sort(
      (a, b) => Number(b.inStock !== false) - Number(a.inStock !== false) || a.price - b.price,
    );
  }

  const laborFor = (part: QuotePart) => {
    const key = strip(part).toLowerCase();
    const item = repairs.find((r) => strip(r.title).toLowerCase().includes(key));
    return item?.labor ?? item?.service ?? 2000;
  };

  const entries = [...byKey.values()];
  return {
    models: [
      ...new Map(entries.map((e) => [e.model.toLowerCase(), e.model])).values(),
    ].sort(compareModels),
    entries,
    labor: {
      Écran: laborFor("Écran"),
      Batterie: laborFor("Batterie"),
      "Vitre arrière": laborFor("Vitre arrière"),
      Capteur: laborFor("Capteur"),
    },
  };
}
