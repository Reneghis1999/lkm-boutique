import { odooCall, odooModelFields } from "@/lib/odoo/client";
import type { RepairLookup, RepairStatus } from "@/lib/repair-status";

export type { RepairLookup } from "@/lib/repair-status";

type OrderRow = {
  id: number;
  name: string;
  state: string;
  date_order?: string | false;
  amount_total?: number;
  partner_id?: [number, string] | false;
  company_id?: [number, string] | false;
  tag_ids?: number[];
};

type LineRow = { name?: string; display_type?: string | false };

const digits = (s: string) => s.replace(/\D/g, "");

/** Compare les 8 derniers chiffres (numéros togolais, avec ou sans +228). */
function samePhone(a: string, b: string) {
  const x = digits(a).slice(-8);
  const y = digits(b).slice(-8);
  return x.length === 8 && x === y;
}

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/**
 * Statut d’une réparation enregistrée comme devis Odoo (sale.order).
 * - Devis (brouillon / envoyé)       → Reçu en boutique
 * - Devis confirmé                   → En réparation
 * - Étiquette « Prêt »               → Prêt à récupérer
 * - Étiquette « Récupéré » / « Livré » → Récupéré
 * - Annulé                           → Annulé
 */
function statusFrom(order: OrderRow, tagNames: string[]): RepairStatus {
  if (order.state === "cancel") return "cancelled";
  const tags = tagNames.map(normalize);
  if (tags.some((t) => t.includes("recupere") || t.includes("livre")))
    return "done";
  if (tags.some((t) => t.includes("pret"))) return "ready";
  if (order.state === "sale" || order.state === "done") return "repairing";
  return "received";
}

/**
 * Cherche un devis par sa référence (ex. S00042) et vérifie que le numéro de
 * téléphone donné est bien celui du client, pour ne rien dévoiler à un tiers.
 */
export async function lookupRepair(
  reference: string,
  phone: string,
): Promise<RepairLookup> {
  const ref = reference.trim().toUpperCase();
  if (!/^[A-Z0-9/_-]{3,30}$/.test(ref) || digits(phone).length < 8) {
    return { ok: false, reason: "not_found" };
  }

  try {
    const orders = await odooCall<OrderRow[]>("sale.order", "search_read", {
      domain: [["name", "=ilike", ref]],
      fields: [
        "name",
        "state",
        "date_order",
        "amount_total",
        "partner_id",
        "company_id",
        "tag_ids",
      ],
      limit: 1,
    });
    const order = orders?.[0];
    if (!order || !order.partner_id) return { ok: false, reason: "not_found" };

    const partnerFields = await odooModelFields("res.partner");
    const phoneFields = ["phone", "mobile"].filter((f) => partnerFields.has(f));
    const partners = await odooCall<Record<string, string | false>[]>(
      "res.partner",
      "read",
      { ids: [order.partner_id[0]], fields: phoneFields },
    );
    const known = phoneFields
      .map((f) => partners?.[0]?.[f])
      .filter((v): v is string => typeof v === "string" && v.length > 0);
    if (!known.some((p) => samePhone(p, phone))) {
      return { ok: false, reason: "not_found" };
    }

    const [tags, lines] = await Promise.all([
      order.tag_ids?.length
        ? odooCall<{ name: string }[]>("crm.tag", "read", {
            ids: order.tag_ids,
            fields: ["name"],
          }).catch(() => [])
        : Promise.resolve([]),
      odooCall<LineRow[]>("sale.order.line", "search_read", {
        domain: [["order_id", "=", order.id]],
        fields: ["name", "display_type"],
        limit: 20,
      }),
    ]);

    return {
      ok: true,
      reference: order.name,
      status: statusFrom(
        order,
        tags.map((t) => t.name),
      ),
      date: order.date_order || null,
      shop: order.company_id ? order.company_id[1] : null,
      items: lines
        .filter((l) => !l.display_type && l.name)
        .map((l) => String(l.name).split("\n")[0]),
      total: typeof order.amount_total === "number" ? order.amount_total : null,
    };
  } catch (e) {
    console.error("[suivi] Odoo :", e instanceof Error ? e.message : e);
    return { ok: false, reason: "error" };
  }
}
