/**
 * Marchandises à commander : produits publiés en rupture ou presque, avec le
 * stock de chaque boutique (Djidjolé / Léo 2000), lu directement dans Odoo.
 */
import { odooCall } from "./client";

export type RestockRow = {
  name: string;
  djidjole: number;
  leo: number;
  total: number;
};

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

function shopOf(company: string) {
  const n = norm(company);
  return n.includes("djid") ? "djidjole" : n.includes("leo") || n.includes("loe") ? "leo" : null;
}

export async function fetchRestock(): Promise<RestockRow[] | null> {
  try {
    const templates = await odooCall<
      { id: number; name: string; company_id: [number, string] | false }[]
    >("product.template", "search_read", {
      domain: [
        ["is_published", "=", true],
        ["is_storable", "=", true],
      ],
      fields: ["name", "company_id"],
      context: { allowed_company_ids: [1, 2] },
    });
    if (!templates.length) return [];

    const quants = await odooCall<
      { product_tmpl_id: [number, string] | false; quantity: number }[]
    >("stock.quant", "search_read", {
      domain: [
        ["product_tmpl_id", "in", templates.map((t) => t.id)],
        ["location_id.usage", "=", "internal"],
      ],
      fields: ["product_tmpl_id", "quantity"],
      context: { allowed_company_ids: [1, 2] },
    });
    const qtyByTemplate = new Map<number, number>();
    for (const q of quants) {
      if (!q.product_tmpl_id) continue;
      const id = q.product_tmpl_id[0];
      qtyByTemplate.set(id, (qtyByTemplate.get(id) ?? 0) + q.quantity);
    }

    // Même produit dans les 2 boutiques → une seule ligne.
    const rows = new Map<string, RestockRow>();
    for (const t of templates) {
      const shop = t.company_id ? shopOf(t.company_id[1]) : null;
      const key = norm(t.name);
      const row = rows.get(key) ?? { name: t.name, djidjole: 0, leo: 0, total: 0 };
      const qty = Math.max(0, Math.round(qtyByTemplate.get(t.id) ?? 0));
      if (shop === "djidjole") row.djidjole += qty;
      else if (shop === "leo") row.leo += qty;
      row.total += qty;
      rows.set(key, row);
    }
    return [...rows.values()];
  } catch (e) {
    console.error("[restock]", e instanceof Error ? e.message : e);
    return null;
  }
}
