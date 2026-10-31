/**
 * Lecture du catalogue publié dans Odoo (produits, catégories eCommerce,
 * photos, variantes). Aucune logique Next.js ici : ce module est aussi utilisé
 * par le script de vérification `npm run odoo:check`.
 */
import catalogData from "@/data/catalog.json";
import { odooCall, odooModelFields } from "@/lib/odoo/client";
import { getOdooConfig } from "@/lib/odoo/config";
import {
  groupAttributes,
  mapOdooCategories,
  mapOdooTemplates,
  type LegacyCategory,
  type OdooAttributeValueRow,
  type OdooPublicCategoryRow,
  type OdooTemplateRow,
} from "@/lib/odoo/map-product";
import type { Category, Product } from "@/types";

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
  "write_date",
] as const;

export type OdooCatalog = {
  products: Product[];
  categories: Category[];
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
  const [templates, categoryRows, imageRows, attributeRows] =
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

  const { legacyCategories, legacyCategorySlugs } = legacyData();
  const mappedCategories = mapOdooCategories(
    Array.isArray(categoryRows) ? categoryRows : [],
    legacyCategories,
  );

  const { products, withoutOdooCategory } = mapOdooTemplates(templates, {
    categoriesById: mappedCategories.byId,
    parentOf: mappedCategories.parentOf,
    attributes: groupAttributes(
      Array.isArray(attributeRows) ? attributeRows : [],
    ),
    images,
    publicImageBase: publishedFilter ? getOdooConfig().url : null,
    legacyCategorySlugs,
  });

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
