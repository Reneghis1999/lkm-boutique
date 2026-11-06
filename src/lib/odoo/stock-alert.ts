/**
 * Demandes « Prévenez-moi quand c'est revenu ».
 * Chaque demande devient une tâche dans le projet Odoo « Alertes retour en
 * stock » (créé automatiquement la première fois).
 */
import { odooCall } from "./client";

export const STOCK_ALERT_PROJECT = "Alertes retour en stock";

let projectId: number | null = null;

async function getProjectId(): Promise<number> {
  if (projectId) return projectId;
  const found = await odooCall<{ id: number }[]>("project.project", "search_read", {
    domain: [["name", "=", STOCK_ALERT_PROJECT]],
    fields: ["id"],
    limit: 1,
  });
  if (found[0]) {
    projectId = found[0].id;
    return projectId;
  }
  const created = await odooCall<number[] | number>("project.project", "create", {
    vals_list: [{ name: STOCK_ALERT_PROJECT, company_id: false }],
  });
  projectId = Array.isArray(created) ? created[0] : created;
  return projectId;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type StockAlertInput = {
  product: string;
  options?: Record<string, string>;
  name: string;
  phone: string;
  url?: string;
};

export async function createStockAlert(input: StockAlertInput): Promise<void> {
  const project = await getProjectId();
  const choice = input.options && Object.keys(input.options).length
    ? ` (${Object.values(input.options).join(", ")})`
    : "";
  const lines = [
    `<p><b>Produit :</b> ${escapeHtml(input.product + choice)}</p>`,
    `<p><b>Client :</b> ${escapeHtml(input.name)}</p>`,
    `<p><b>Téléphone :</b> ${escapeHtml(input.phone)}</p>`,
    input.url ? `<p><b>Fiche :</b> ${escapeHtml(input.url)}</p>` : "",
    `<p>À prévenir quand le produit revient en stock.</p>`,
  ];
  await odooCall("project.task", "create", {
    vals_list: [
      {
        name: `${input.product}${choice} — ${input.name} ${input.phone}`.slice(0, 200),
        project_id: project,
        description: lines.join(""),
      },
    ],
  });
}
