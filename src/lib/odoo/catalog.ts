/**
 * Lecture du catalogue publié dans Odoo (produits, catégories eCommerce,
 * photos, variantes). Aucune logique Next.js ici : ce module est aussi utilisé
 * par le script de vérification `npm run odoo:check`.
 */
import catalogData from "@/data/catalog.json";
import { odooCall, odooModelFields } from "@/lib/odoo/client";
import { getOdooConfig } from "@/lib/odoo/config";
import type { RepairData } from "@/data/repairs";
import type { OdooCompany } from "@/lib/shop-contacts";
import {
  groupAttributes,
  mapOdooCategories,
  mapOdooRepairs,
  mapOdooTemplates,
  stockStatus,
  isPromoInternalCategory,
  isRepairInternalCategory,
  promoCategoryIds,
  repairCategoryIds,
  type LegacyCategory,
  type OdooAttributeValueRow,
  type OdooPublicCategoryRow,
  type OdooTemplateRow,
} from "@/lib/odoo/map-product";
import type { Category, Product, ProductVariant } from "@/types";
import { optionsKey } from "@/lib/variants";

const TEMPLATE_FIELDS = [
  "id",
  "name",
  "list_price",
  "compare_list_price",
  "description_ecommerce",
  "website_description",
  "description_sale",
  "public_categ_ids",
  "website_url",
  "website_sequence",
  "website_ribbon_id",
  "product_variant_id",
  "product_tag_ids",
  "categ_id",
  "write_date",
  "create_date",
  "qty_available",
  "is_storable",
  "type",
] as const;

export type OdooCatalog = {
  products: Product[];
  categories: Category[];
  /** Tarifs de réparation gérés dans Odoo (null : catégorie absente). */
  repairs: RepairData | null;
  /** Sociétés Odoo (téléphone, adresse des boutiques). */
  companies: OdooCompany[] | null;
  diagnostics: {
    products: number;
    withImage: number;
    withoutImage: string[];
    withoutOdooCategory: string[];
    withoutPrice: string[];
    categories: number;
    publishedFilter: boolean;
    missingFields: string[];
    warnings: string[];
    repairs: number | null;
    promos: number;
  };
};

/**
 * Produits visibles sur le site : exactement ceux de la boutique en ligne
 * Odoo → « Peut être vendu » + « Publié ». Les produits archivés sont exclus
 * automatiquement par Odoo.
 */
export async function getOdooProductDomain(): Promise<{
  domain: unknown[];
  publishedFilter: boolean;
}> {
  const fields = await odooModelFields("product.template");
  const domain: unknown[] = [["sale_ok", "=", true]];
  const publishedFilter = fields.has("is_published");
  if (publishedFilter) domain.push(["is_published", "=", true]);
  return { domain, publishedFilter };
}

function legacyData() {
  const legacyCategories = (catalogData.categories as Category[]).filter(
    (c): c is LegacyCategory => typeof c.odooId === "number",
  );
  const legacyCategorySlugs = new Map(
    (catalogData.products as Product[]).map((p) => [p.slug, p.categorySlugs]),
  );
  return { legacyCategories, legacyCategorySlugs };
}

/** Nom court d’une boutique à partir du nom de société / entrepôt Odoo. */
function shopLabel(name: string) {
  const n = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (n.includes("djid")) return "Djidjolé";
  if (n.includes("leo") || n.includes("loe")) return "Léo 2000";
  return name;
}

/**
 * Pour chaque entrepôt (une boutique), liste des articles en stock.
 * On ne garde que « en stock ou non » : aucune quantité ne sort d’ici.
 */
async function fetchStockByShop(
  templateIds: number[],
): Promise<{ byTemplate: Map<number, string[]>; variantsInStock: Set<number> } | null> {
  if (templateIds.length === 0) return { byTemplate: new Map(), variantsInStock: new Set() };
  const companies = await odooCall<{ id: number }[]>("res.company", "search_read", {
    domain: [],
    fields: ["id"],
  });
  const context = { allowed_company_ids: companies.map((c) => c.id) };
  // Lignes de stock positives dans les emplacements internes, toutes boutiques.
  const quants = await odooCall<
    {
      product_tmpl_id?: [number, string] | false;
      product_id?: [number, string] | false;
      warehouse_id?: [number, string] | false;
      company_id?: [number, string] | false;
    }[]
  >("stock.quant", "search_read", {
    domain: [
      ["location_id.usage", "=", "internal"],
      ["quantity", ">", 0],
      ["product_tmpl_id", "in", templateIds],
    ],
    fields: ["product_tmpl_id", "product_id", "warehouse_id", "company_id"],
    context,
  });

  const result = new Map<number, string[]>();
  const variantsInStock = new Set<number>();
  for (const q of quants) {
    if (q.product_id) variantsInStock.add(q.product_id[0]);
    const tmpl = q.product_tmpl_id ? q.product_tmpl_id[0] : null;
    const where = q.warehouse_id || q.company_id;
    if (!tmpl || !where) continue;
    const label = shopLabel(where[1]);
    const list = result.get(tmpl) ?? [];
    if (!list.includes(label)) list.push(label);
    result.set(tmpl, list);
  }
  // Ordre stable : Djidjolé puis Léo 2000.
  for (const list of result.values()) list.sort();
  return { byTemplate: result, variantsInStock };
}

/**
 * Prix (et stock) de chaque variante pour les modèles qui proposent des choix
 * (marque, couleur…). Les noms de choix sont ceux des attributs Odoo.
 */
async function fetchVariants(
  templateIds: number[],
  attributeRows: OdooAttributeValueRow[],
  variantsInStock: Set<number> | null,
  tracked: Set<number>,
): Promise<Map<number, ProductVariant[]>> {
  const result = new Map<number, ProductVariant[]>();
  if (templateIds.length === 0) return result;
  const ptav = new Map(
    attributeRows
      .filter((r) => Array.isArray(r.attribute_id) && r.name)
      .map((r) => [r.id, { attr: (r.attribute_id as [number, string])[1], value: r.name!.trim() }]),
  );
  const companies = await odooCall<{ id: number }[]>("res.company", "search_read", {
    domain: [],
    fields: ["id"],
  });
  const rows = await odooCall<
    {
      id: number;
      product_tmpl_id: [number, string] | false;
      lst_price?: number;
      product_template_attribute_value_ids?: number[];
    }[]
  >("product.product", "search_read", {
    domain: [["product_tmpl_id", "in", templateIds]],
    fields: ["product_tmpl_id", "lst_price", "product_template_attribute_value_ids"],
    context: { allowed_company_ids: companies.map((c) => c.id) },
  });
  for (const r of rows) {
    if (!r.product_tmpl_id) continue;
    const tmpl = r.product_tmpl_id[0];
    const options: Record<string, string> = {};
    for (const id of r.product_template_attribute_value_ids ?? []) {
      const v = ptav.get(id);
      if (v) options[v.attr] = v.value;
    }
    if (Object.keys(options).length === 0) continue;
    const list = result.get(tmpl) ?? [];
    list.push({
      options,
      price: typeof r.lst_price === "number" && r.lst_price > 0 ? Math.round(r.lst_price) : null,
      inStock: variantsInStock && tracked.has(tmpl) ? variantsInStock.has(r.id) : undefined,
    });
    result.set(tmpl, list);
  }
  return result;
}

/**
 * Chaque boutique (société Odoo) a sa propre fiche pour un même article.
 * On fusionne les fiches de même nom : une seule carte sur le site, avec la
 * liste des boutiques où il est disponible.
 */
function mergeShopDuplicates(list: Product[]): Product[] {
  const key = (p: Product) =>
    p.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  const byKey = new Map<string, Product>();
  const out: Product[] = [];
  for (const p of list) {
    const k = key(p);
    const first = byKey.get(k);
    if (!first) {
      const copy = {
        ...p,
        availableAt: p.availableAt ? [...p.availableAt] : undefined,
        options: p.options.map((o) => ({ ...o, values: [...o.values] })),
      };
      byKey.set(k, copy);
      out.push(copy);
      continue;
    }
    if (p.availableAt?.length) {
      const shops = new Set([...(first.availableAt ?? []), ...p.availableAt]);
      first.availableAt = [...shops].sort();
    }
    // En stock si l’une des fiches l’est ; en rupture seulement si toutes le sont.
    if (first.inStock === true || p.inStock === true) first.inStock = true;
    else if (first.inStock === false && p.inStock === false) first.inStock = false;
    else first.inStock = undefined;
    if (!first.image && p.image) first.image = p.image;
    // Prix différents entre boutiques : on affiche le plus bas (prix ≥ 100 F,
    // pour ignorer un prix mal saisi comme « 1 F »).
    const valid = (x: number | null | undefined) => typeof x === "number" && x >= 100;
    if (valid(p.price) && (!valid(first.price) || p.price! < first.price!)) {
      first.price = p.price;
      first.compareAtPrice = p.compareAtPrice;
    }
    // Variantes : même choix dans les deux boutiques → prix le plus bas, stock si l’une en a.
    if (p.variants?.length) {
      const merged = new Map((first.variants ?? []).map((v) => [optionsKey(v.options), { ...v }]));
      for (const v of p.variants) {
        const k = optionsKey(v.options);
        const cur = merged.get(k);
        if (!cur) merged.set(k, { ...v });
        else {
          if (valid(v.price) && (!valid(cur.price) || v.price! < cur.price!)) cur.price = v.price;
          if (v.inStock === true) cur.inStock = true;
          else if (cur.inStock === undefined) cur.inStock = v.inStock;
        }
      }
      first.variants = [...merged.values()];
    }
    // Choix (marque, couleur…) : on réunit ceux des deux boutiques.
    for (const opt of p.options) {
      const mine = first.options.find((o) => o.name === opt.name);
      if (!mine) first.options = [...first.options, { ...opt, values: [...opt.values] }];
      else mine.values = [...new Set([...mine.values, ...opt.values])];
    }
    if (!first.description && p.description) first.description = p.description;
    first.categorySlugs = [...new Set([...first.categorySlugs, ...p.categorySlugs])];
    first.featured = first.featured || p.featured;
    first.promo = first.promo || p.promo;
  }
  return out;
}

export async function fetchOdooCatalog(): Promise<OdooCatalog> {
  const warnings: string[] = [];
  const [{ domain, publishedFilter }, templateFields] = await Promise.all([
    getOdooProductDomain(),
    odooModelFields("product.template"),
  ]);

  const fields = TEMPLATE_FIELDS.filter((f) => templateFields.has(f));
  const missingFields = TEMPLATE_FIELDS.filter((f) => !templateFields.has(f));
  const order = templateFields.has("website_sequence")
    ? "website_sequence asc, id asc"
    : "id asc";

  const ptavDomain: unknown[] = [["ptav_active", "=", true]];
  if (publishedFilter) {
    ptavDomain.push(["product_tmpl_id.is_published", "=", true]);
  }

  // Tous les appels partent en parallèle : ~1 aller-retour vers Odoo.
  const [templates, categoryRows, imageRows, attributeRows, companies] =
    await Promise.all([
      odooCall<OdooTemplateRow[]>("product.template", "search_read", {
        domain,
        fields,
        order,
      }),
      templateFields.has("public_categ_ids")
        ? odooCall<OdooPublicCategoryRow[]>(
            "product.public.category",
            "search_read",
            { domain: [], fields: ["id", "name", "parent_id", "sequence"] },
          ).catch((e) => {
            warnings.push(`Catégories eCommerce illisibles : ${String(e)}`);
            return [] as OdooPublicCategoryRow[];
          })
        : Promise.resolve([] as OdooPublicCategoryRow[]),
      odooCall<{ res_id: number; checksum?: string | false }[]>(
        "ir.attachment",
        "search_read",
        {
          domain: [
            ["res_model", "=", "product.template"],
            ["res_field", "=", "image_1920"],
          ],
          fields: ["res_id", "checksum"],
        },
      ).catch((e) => {
        warnings.push(`Présence des photos non vérifiable : ${String(e)}`);
        return null;
      }),
      odooCall<OdooAttributeValueRow[]>(
        "product.template.attribute.value",
        "search_read",
        {
          domain: ptavDomain,
          fields: ["product_tmpl_id", "attribute_id", "name"],
        },
      ).catch((e) => {
        warnings.push(`Variantes / attributs illisibles : ${String(e)}`);
        return [] as OdooAttributeValueRow[];
      }),
      odooCall<OdooCompany[]>("res.company", "search_read", {
        domain: [],
        fields: ["name", "phone", "email", "street", "street2", "city"],
      }).catch((e) => {
        warnings.push(`Coordonnées des sociétés illisibles : ${String(e)}`);
        return null;
      }),
    ]);

  if (!Array.isArray(templates)) {
    throw new Error("Réponse Odoo inattendue pour product.template");
  }

  const images = imageRows
    ? new Map(
        imageRows
          .filter((r) => r.res_id)
          .map((r) => [r.res_id, r.checksum || String(r.res_id)]),
      )
    : null;

  const allCategoryRows = Array.isArray(categoryRows) ? categoryRows : [];

  // Réparations : fiches de la catégorie interne « REPARATION » (habitude du
  // client) ou de la catégorie du site web « Services de réparation ».
  const wantedRepair = process.env.ODOO_REPAIR_CATEGORY;
  const repairIds = repairCategoryIds(allCategoryRows, wantedRepair);
  const isRepair = (row: OdooTemplateRow) =>
    isRepairInternalCategory(row.categ_id, wantedRepair) ||
    (row.public_categ_ids ?? []).some((id) => repairIds.has(id));
  const repairRows = templates.filter(isRepair);
  const shopTemplates = templates.filter((row) => !isRepair(row));

  let repairs: RepairData | null = null;
  if (repairIds.size > 0 || repairRows.length > 0) {
    const tagIds = [...new Set(repairRows.flatMap((r) => r.product_tag_ids ?? []))];
    const tagRows = tagIds.length
      ? await odooCall<{ id: number; name: string }[]>("product.tag", "search_read", {
          domain: [["id", "in", tagIds]],
          fields: ["name"],
        }).catch(() => [] as { id: number; name: string }[])
      : [];
    repairs = mapOdooRepairs(repairRows, {
      repairIds,
      categoryNames: new Map(allCategoryRows.map((c) => [c.id, c.name || ""])),
      tagNames: new Map(tagRows.map((t) => [t.id, t.name])),
      images,
      publicImageBase: publishedFilter ? getOdooConfig().url : null,
    });
  }

  // Promotions : catégorie « Promotions » (site web ou interne). Les produits
  // restent dans la boutique ; la catégorie a sa propre page et son menu.
  const wantedPromo = process.env.ODOO_PROMO_CATEGORY;
  const promoIds = promoCategoryIds(allCategoryRows, wantedPromo);
  const isPromo = (row: OdooTemplateRow) =>
    isPromoInternalCategory(row.categ_id, wantedPromo) ||
    (row.public_categ_ids ?? []).some((id) => promoIds.has(id));

  const { legacyCategories, legacyCategorySlugs } = legacyData();
  const mappedCategories = mapOdooCategories(
    allCategoryRows.filter((c) => !repairIds.has(c.id) && !promoIds.has(c.id)),
    legacyCategories,
  );

  const trackedIds = shopTemplates
    .filter((r) => r.type !== "service" && stockStatus(r) !== undefined)
    .map((r) => r.id);
  const stock = await fetchStockByShop(trackedIds).catch((e) => {
    warnings.push(`Stock par boutique illisible : ${String(e)}`);
    return null;
  });
  const shopStock = stock?.byTemplate ?? null;

  // Modèles avec des choix (au moins un attribut à plusieurs valeurs).
  const allAttributeRows = Array.isArray(attributeRows) ? attributeRows : [];
  const multi = new Map<number, Map<number, Set<string>>>();
  for (const r of allAttributeRows) {
    const t = Array.isArray(r.product_tmpl_id) ? r.product_tmpl_id[0] : null;
    const a = Array.isArray(r.attribute_id) ? r.attribute_id[0] : null;
    if (!t || !a) continue;
    const m = multi.get(t) ?? new Map<number, Set<string>>();
    m.set(a, (m.get(a) ?? new Set()).add(r.name || ""));
    multi.set(t, m);
  }
  const withOptions = shopTemplates
    .map((r) => r.id)
    .filter((id) => [...(multi.get(id)?.values() ?? [])].some((v) => v.size > 1));
  const variants = await fetchVariants(
    withOptions,
    allAttributeRows,
    stock?.variantsInStock ?? null,
    new Set(trackedIds),
  ).catch((e) => {
    warnings.push(`Variantes (prix par choix) illisibles : ${String(e)}`);
    return null;
  });

  const { products: mappedProducts, withoutOdooCategory } = mapOdooTemplates(shopTemplates, {
    categoriesById: mappedCategories.byId,
    parentOf: mappedCategories.parentOf,
    attributes: groupAttributes(
      Array.isArray(attributeRows) ? attributeRows : [],
    ),
    images,
    publicImageBase: publishedFilter ? getOdooConfig().url : null,
    legacyCategorySlugs,
    isPromo,
    shopStock,
    variants,
  });

  const products = mergeShopDuplicates(mappedProducts);

  // Nombre de produits par catégorie ; on masque les catégories vides.
  const categories = mappedCategories.categories
    .map((c) => ({
      ...c,
      count: products.filter((p) => p.categorySlugs.includes(c.slug)).length,
    }))
    .filter((c) => c.count > 0);

  return {
    products,
    categories,
    repairs,
    companies: Array.isArray(companies) ? companies : null,
    diagnostics: {
      products: products.length,
      withImage: products.filter((p) => p.image).length,
      withoutImage: products.filter((p) => !p.image).map((p) => p.name),
      withoutOdooCategory: withoutOdooCategory.map((p) => p.name),
      withoutPrice: products.filter((p) => !p.price).map((p) => p.name),
      categories: categories.length,
      publishedFilter,
      missingFields,
      warnings,
      repairs: repairs ? repairs.items.length : null,
      promos: products.filter((p) => p.promo).length,
    },
  };
}

/** Photo d’un produit visible sur le site (base64 Odoo → octets). */
export async function fetchOdooProductImage(
  templateId: number,
): Promise<Buffer | null> {
  const { domain } = await getOdooProductDomain();
  const rows = await odooCall<{ id: number; image_1024?: string | false }[]>(
    "product.template",
    "search_read",
    {
      domain: [["id", "=", templateId], ...domain],
      fields: ["image_1024"],
      limit: 1,
    },
  );
  const b64 = rows?.[0]?.image_1024;
  if (!b64 || typeof b64 !== "string") return null;
  return Buffer.from(b64, "base64");
}
