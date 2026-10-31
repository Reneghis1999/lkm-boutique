/**
 * Conversion des enregistrements Odoo → types du site (fonctions pures).
 */
import {
  REPAIR_LABOR,
  repairIcon,
  type RepairCategory,
  type RepairData,
  type RepairItem,
} from "@/data/repairs";
import { slugify } from "@/lib/slug";
import type {
  AccentColor,
  Category,
  CategoryGroup,
  Product,
  ProductOption,
  ProductSpec,
} from "@/types";

type Many2one = [number, string] | false;

/** Champs lus sur product.template (ceux absents de la base sont ignorés). */
export type OdooTemplateRow = {
  id: number;
  name?: string;
  list_price?: number;
  compare_list_price?: number | false;
  description_ecommerce?: string | false;
  website_description?: string | false;
  description_sale?: string | false;
  public_categ_ids?: number[];
  website_url?: string | false;
  website_sequence?: number;
  website_ribbon_id?: Many2one;
  product_variant_id?: Many2one;
  product_tag_ids?: number[];
  categ_id?: Many2one;
  write_date?: string;
};

export type OdooPublicCategoryRow = {
  id: number;
  name?: string;
  parent_id?: Many2one;
  sequence?: number;
};

export type OdooAttributeValueRow = {
  id: number;
  product_tmpl_id?: Many2one;
  attribute_id?: Many2one;
  name?: string;
};

/** Présentation soignée des catégories historiques (src/data/catalog.json). */
export type LegacyCategory = Category & { odooId: number };

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

/** Description HTML Odoo → texte simple (paragraphes conservés). */
export function htmlToText(html: string | false | undefined | null): string {
  if (!html || typeof html !== "string") return "";
  const text = decodeEntities(
    html
      .replace(/<(br|\/p|\/div|\/li|\/h[1-6])\s*\/?>/gi, "\n")
      .replace(/<li[^>]*>/gi, "• ")
      .replace(/<[^>]+>/g, ""),
  );
  return text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

/**
 * Slug à partir de l’URL Odoo (« /shop/pincette-7-sa-sr-1448 » →
 * « pincette-7-sa-sr ») : mêmes adresses que le catalogue actuel.
 */
export function slugFromWebsiteUrl(
  websiteUrl: string | false | undefined,
  templateId: number,
): string | null {
  if (!websiteUrl || typeof websiteUrl !== "string") return null;
  const last = websiteUrl.split("?")[0].split("/").filter(Boolean).pop();
  if (!last) return null;
  const withoutId = last.replace(new RegExp(`-${templateId}$`), "");
  const clean = withoutId
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
  return clean || null;
}

function many2oneId(value: Many2one | undefined): number | null {
  return Array.isArray(value) ? value[0] : null;
}

// ---------------------------------------------------------------------------
// Catégories
// ---------------------------------------------------------------------------

const GROUP_RULES: [CategoryGroup, RegExp][] = [
  ["repair", /(repar|piece|rechange|outil|soudure|souder)/],
  [
    "gaming",
    /(\bjeux?\b|game|gaming|console|playstation|\bps[2-5]\b|xbox|switch|nintendo|manette|\bcd\b)/,
  ],
  [
    "mobile",
    /(telephone|phone|smartphone|samsung|tablette|ipad|power ?bank|coque|\bcoq\b|montre)/,
  ],
  ["audio", /(audio|casque|ecouteur|enceinte|woofer|mp3|speaker|airpod)/],
  [
    "pc",
    /(\bpc\b|ordinateur|laptop|macbook|\bmac\b|clavier|souris|usb|disque|ssd|\bram\b|imprimante|ecran|adaptateur|\bhub\b|cable|memoire)/,
  ],
];

/** Rubrique (Mobile, PC, Gaming…) déduite du nom d’une nouvelle catégorie. */
export function inferCategoryGroup(name: string): CategoryGroup {
  const n = normalize(name);
  for (const [group, re] of GROUP_RULES) {
    if (re.test(n)) return group;
  }
  return "other";
}

const GROUP_STYLE: Record<CategoryGroup, { icon: string; accent: AccentColor }> =
  {
    gaming: { icon: "Gamepad2", accent: "yellow" },
    mobile: { icon: "Smartphone", accent: "blue" },
    pc: { icon: "Laptop", accent: "green" },
    audio: { icon: "Speaker", accent: "blue" },
    repair: { icon: "Wrench", accent: "green" },
    other: { icon: "Package", accent: "blue" },
  };

/**
 * Catégories eCommerce Odoo → catégories du site.
 * - Catégorie historique (même id Odoo) : on garde son adresse, son icône, sa
 *   description et son libellé soigné… sauf si le client l’a renommée dans
 *   Odoo, auquel cas on affiche le nouveau nom.
 * - Nouvelle catégorie : nom Odoo, rubrique déduite du nom (ou du parent).
 */
export function mapOdooCategories(
  rows: OdooPublicCategoryRow[],
  legacy: LegacyCategory[],
): {
  categories: Category[];
  byId: Map<number, Category>;
  parentOf: Map<number, number>;
} {
  const legacyById = new Map(legacy.map((c) => [c.odooId, c]));
  const parentOf = new Map<number, number>();
  for (const row of rows) {
    const parent = many2oneId(row.parent_id);
    if (parent) parentOf.set(row.id, parent);
  }

  const sorted = [...rows].sort((a, b) => a.id - b.id);
  const usedSlugs = new Set<string>();
  const byId = new Map<number, Category>();

  // 1) Catégories historiques d’abord (leurs adresses sont prioritaires).
  const ordered = [
    ...sorted.filter((r) => legacyById.has(r.id)),
    ...sorted.filter((r) => !legacyById.has(r.id)),
  ];

  for (const row of ordered) {
    const odooName = (row.name || `Catégorie ${row.id}`).trim();
    const old = legacyById.get(row.id);

    if (old) {
      const renamed = normalize(odooName) !== normalize(old.sourceName);
      usedSlugs.add(old.slug);
      byId.set(row.id, {
        ...old,
        name: renamed ? odooName : old.name,
        shortName: renamed ? odooName.slice(0, 24) : old.shortName,
        sourceName: odooName,
        odooId: row.id,
        count: 0,
      });
      continue;
    }

    let slug = slugify(odooName) || `categorie-${row.id}`;
    if (usedSlugs.has(slug)) slug = `${slug}-${row.id}`;
    usedSlugs.add(slug);

    byId.set(row.id, {
      slug,
      name: odooName,
      shortName: odooName.slice(0, 24),
      description: "",
      icon: "Package",
      accent: "blue",
      group: inferCategoryGroup(odooName),
      sourceName: odooName,
      odooId: row.id,
      count: 0,
    });
  }

  // 2) Une nouvelle catégorie sans rubrique évidente hérite de celle du parent.
  for (const [id, category] of byId) {
    if (legacyById.has(id)) continue;
    let group = category.group;
    let cursor = parentOf.get(id);
    const seen = new Set<number>([id]);
    while (group === "other" && cursor && !seen.has(cursor)) {
      seen.add(cursor);
      group = byId.get(cursor)?.group ?? "other";
      cursor = parentOf.get(cursor);
    }
    const style = GROUP_STYLE[group];
    byId.set(id, { ...category, group, icon: style.icon, accent: style.accent });
  }

  return { categories: [...byId.values()], byId, parentOf };
}

/** Slugs de la catégorie et de ses parents (comme la boutique Odoo). */
function categorySlugsWithAncestors(
  ids: number[],
  byId: Map<number, Category>,
  parentOf: Map<number, number>,
): string[] {
  const slugs: string[] = [];
  for (const id of ids) {
    let cursor: number | undefined = id;
    const seen = new Set<number>();
    while (cursor && !seen.has(cursor)) {
      seen.add(cursor);
      const cat = byId.get(cursor);
      if (cat && !slugs.includes(cat.slug)) slugs.push(cat.slug);
      cursor = parentOf.get(cursor);
    }
  }
  return slugs;
}

// ---------------------------------------------------------------------------
// Attributs → options (choix multiples) / caractéristiques (valeur unique)
// ---------------------------------------------------------------------------

export function groupAttributes(rows: OdooAttributeValueRow[]): Map<
  number,
  { options: ProductOption[]; specs: ProductSpec[] }
> {
  const byTemplate = new Map<number, Map<string, string[]>>();
  for (const row of rows) {
    const tmplId = many2oneId(row.product_tmpl_id);
    const attribute = Array.isArray(row.attribute_id)
      ? row.attribute_id[1]
      : null;
    const value = row.name?.trim();
    if (!tmplId || !attribute || !value) continue;
    const attrs = byTemplate.get(tmplId) ?? new Map<string, string[]>();
    const values = attrs.get(attribute) ?? [];
    if (!values.includes(value)) values.push(value);
    attrs.set(attribute, values);
    byTemplate.set(tmplId, attrs);
  }

  const result = new Map<
    number,
    { options: ProductOption[]; specs: ProductSpec[] }
  >();
  for (const [tmplId, attrs] of byTemplate) {
    const options: ProductOption[] = [];
    const specs: ProductSpec[] = [];
    for (const [name, values] of attrs) {
      if (values.length > 1) options.push({ name, values });
      else specs.push({ name, value: values[0] });
    }
    result.set(tmplId, { options, specs });
  }
  return result;
}

// ---------------------------------------------------------------------------
// Produits
// ---------------------------------------------------------------------------

export type ImageInfo = Map<number, string> | null;

/** Ruban qui met en avant (Nouveau, Ventes, Promo…), pas un ruban de stock. */
export function isHighlightRibbon(ribbon: Many2one | undefined): boolean {
  if (!Array.isArray(ribbon)) return false;
  return !/(epuis|rupture|sold out|out of stock|indisponible)/.test(
    normalize(ribbon[1] || ""),
  );
}

function imageVersion(row: OdooTemplateRow, images: ImageInfo): string | null {
  if (images) {
    const checksum = images.get(row.id);
    return checksum ? checksum.slice(0, 16) : null;
  }
  // Pas d’info fiable sur la présence d’une photo : on tente quand même.
  return slugify(row.write_date || "") || "v1";
}

export function mapOdooTemplates(
  rows: OdooTemplateRow[],
  ctx: {
    categoriesById: Map<number, Category>;
    parentOf: Map<number, number>;
    attributes: Map<number, { options: ProductOption[]; specs: ProductSpec[] }>;
    images: ImageInfo;
    /**
     * Adresse publique d’Odoo (produits publiés) : les photos sont alors
     * servies par la boutique en ligne Odoo, sans consommer d’appels API.
     */
    publicImageBase?: string | null;
    /** Catégories du catalogue historique, par slug produit (secours). */
    legacyCategorySlugs: Map<string, string[]>;
  },
): { products: Product[]; withoutOdooCategory: Product[] } {
  const usedSlugs = new Set<string>();
  const products: Product[] = [];
  const withoutOdooCategory: Product[] = [];

  for (const row of [...rows].sort((a, b) => a.id - b.id)) {
    const name = (row.name || `Produit ${row.id}`).trim();

    let slug =
      slugFromWebsiteUrl(row.website_url, row.id) ||
      slugify(name) ||
      `produit-${row.id}`;
    if (usedSlugs.has(slug)) slug = `${slug}-${row.id}`;
    usedSlugs.add(slug);

    let categorySlugs = categorySlugsWithAncestors(
      row.public_categ_ids ?? [],
      ctx.categoriesById,
      ctx.parentOf,
    );
    const hasOdooCategory = categorySlugs.length > 0;
    if (!hasOdooCategory) {
      categorySlugs = ctx.legacyCategorySlugs.get(slug) ?? [];
    }

    // Prix à 0 dans Odoo = pas de prix → « Prix à confirmer » sur le site.
    const price =
      typeof row.list_price === "number" && row.list_price > 0
        ? Math.round(row.list_price)
        : null;
    const compare =
      typeof row.compare_list_price === "number" &&
      price != null &&
      row.compare_list_price > price
        ? Math.round(row.compare_list_price)
        : null;

    const description =
      htmlToText(row.description_ecommerce) ||
      htmlToText(row.website_description) ||
      (typeof row.description_sale === "string"
        ? row.description_sale.trim()
        : "");

    const version = imageVersion(row, ctx.images);
    const attrs = ctx.attributes.get(row.id);
    const variantId = many2oneId(row.product_variant_id);

    const product: Product = {
      // Même identifiant que le catalogue actuel (variante Odoo) → paniers conservés.
      id: variantId ? String(variantId) : `tmpl-${row.id}`,
      slug,
      name,
      price,
      compareAtPrice: compare,
      description,
      categorySlugs,
      image: version
        ? ctx.publicImageBase
          ? `${ctx.publicImageBase}/web/image/product.template/${row.id}/image_1024?unique=${version}`
          : `/api/odoo/image/${row.id}/${version}`
        : null,
      specs: attrs?.specs ?? [],
      options: attrs?.options ?? [],
      // « Mis en avant » = un ruban (Nouveau, Promo…) posé dans Odoo,
      // sauf les rubans de stock (Épuisé, En rupture…).
      featured: isHighlightRibbon(row.website_ribbon_id),
      position: row.website_sequence ?? row.id,
    };

    products.push(product);
    if (!hasOdooCategory) withoutOdooCategory.push(product);
  }

  return { products, withoutOdooCategory };
}

// ---------------------------------------------------------------------------
// Réparations (catégorie du site web « Services de réparation »)
// ---------------------------------------------------------------------------

/** Nom de la catégorie racine des réparations (ACCESSOIRE DE réparation exclu). */
export function isRepairRootName(name: string, wanted?: string): boolean {
  const n = normalize(name);
  if (wanted && n === normalize(wanted)) return true;
  return /^(services? (de )?)?reparations?$/.test(n);
}

/**
 * Catégorie interne (Inventaire) de réparation : « REPARATION », « Services
 * de réparation »… à n’importe quel niveau du chemin (« Tous / REPARATION »).
 */
export function isRepairInternalCategory(
  categ: Many2one | undefined,
  wanted?: string,
): boolean {
  if (!Array.isArray(categ)) return false;
  return categ[1]
    .split("/")
    .some((segment) => isRepairRootName(segment.trim(), wanted));
}

/** Ids de la catégorie « Services de réparation » et de ses sous-catégories. */
export function repairCategoryIds(
  rows: OdooPublicCategoryRow[],
  wanted?: string,
): Set<number> {
  const roots = rows.filter((r) => isRepairRootName(r.name || "", wanted));
  const ids = new Set(roots.map((r) => r.id));
  let grew = true;
  while (grew) {
    grew = false;
    for (const r of rows) {
      const parent = many2oneId(r.parent_id);
      if (parent && ids.has(parent) && !ids.has(r.id)) {
        ids.add(r.id);
        grew = true;
      }
    }
  }
  return ids;
}

const REPAIR_TAB_RULES: [RepairCategory, RegExp][] = [
  ["console", /(console|manette|playstation|\bps[2-5]\b|xbox|switch|nintendo|\bjeux?\b)/],
  ["computer", /(ordinateur|\bpc\b|laptop|macbook|\bmac\b|imprimante|clavier)/],
  ["phone", /(telephone|phone|smartphone|tablette|ipad|mobile|iphone|samsung|tecno|infinix|itel)/],
];

function repairTab(text: string): RepairCategory | null {
  const n = normalize(text);
  for (const [tab, re] of REPAIR_TAB_RULES) if (re.test(n)) return tab;
  return null;
}

/**
 * Fiches de réparation Odoo → tarifs du site, en suivant les habitudes du
 * client (catégorie interne « REPARATION ») :
 * - « Changement … » / « Remplacement … » : le prix Odoo est la main d’œuvre,
 *   la pièce est en plus selon le modèle (ou « Pièce à partir de 15000 »
 *   écrit dans la description) ;
 * - autres services (flash, mise à jour, récupération…) : forfait ;
 * - étiquette « Forfait » : forfait dans tous les cas ;
 * - prix à 0 : sur devis ;
 * - un ruban (Nouveau !, Ventes…) : « Le plus demandé ».
 * La fiche « Main d’œuvre » (facultative) fixe la main d’œuvre affichée.
 */
export function mapOdooRepairs(
  rows: OdooTemplateRow[],
  ctx: {
    repairIds: Set<number>;
    categoryNames: Map<number, string>;
    tagNames: Map<number, string>;
  },
): RepairData {
  let laborProduct: number | null = null;
  const items: RepairItem[] = [];

  for (const row of rows) {
    const rawTitle = (row.name || "").trim();
    if (!rawTitle) continue;
    const n = normalize(rawTitle);
    const price =
      typeof row.list_price === "number" && row.list_price > 0
        ? Math.round(row.list_price)
        : null;

    if (/^main d/.test(n)) {
      if (price) laborProduct = price;
      continue;
    }

    const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
    const subNames = (row.public_categ_ids ?? [])
      .filter((id) => ctx.repairIds.has(id))
      .map((id) => ctx.categoryNames.get(id) || "");
    const category =
      subNames.map(repairTab).find(Boolean) ?? repairTab(rawTitle) ?? "phone";

    const tags = (row.product_tag_ids ?? []).map((id) =>
      normalize(ctx.tagNames.get(id) || ""),
    );
    const description =
      htmlToText(row.description_ecommerce) ||
      htmlToText(row.website_description) ||
      (typeof row.description_sale === "string" ? row.description_sale.trim() : "");

    const flat = tags.some((t) => t.includes("forfait")) || /forfait/.test(n);
    const partSwap = !flat && /^(changement|remplacement|reparation)\b/.test(n);
    const partMatch = normalize(description).match(/piece[^0-9]{0,30}(\d[\d\s.]*)/);
    const partFrom = partMatch ? Number(partMatch[1].replace(/[\s.]/g, "")) || null : null;

    items.push({
      id: `odoo-${row.id}`,
      category,
      title: title.replace(/\s*\(?forfait\)?\s*$/i, "").trim() || title,
      description,
      icon: repairIcon(rawTitle, category),
      service: partSwap || price == null ? null : price,
      labor: partSwap ? price : null,
      partFrom: partSwap && price != null ? partFrom : null,
      popular: isHighlightRibbon(row.website_ribbon_id),
    });
  }

  const laborValues = items.map((i) => i.labor).filter((v): v is number => v != null);
  const labor = laborProduct ?? (laborValues.length ? Math.min(...laborValues) : REPAIR_LABOR);
  return { items, labor, source: "odoo" };
}
