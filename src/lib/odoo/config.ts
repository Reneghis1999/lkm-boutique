export type CatalogSource = "odoo" | "json" | "auto";

export function getCatalogSource(): CatalogSource {
  const raw = (process.env.CATALOG_SOURCE || "auto").toLowerCase();
  if (raw === "odoo" || raw === "json" || raw === "auto") return raw;
  return "auto";
}

export function getOdooConfig() {
  const url = (process.env.ODOO_URL || "").replace(/\/$/, "");
  const apiKey = process.env.ODOO_API_KEY || "";
  const database = process.env.ODOO_DB || "";
  const configured = Boolean(url && apiKey);

  return {
    url,
    apiKey,
    database,
    configured,
  };
}

export function isOdooReady() {
  const source = getCatalogSource();
  if (source === "json") return false;
  return getOdooConfig().configured;
}
