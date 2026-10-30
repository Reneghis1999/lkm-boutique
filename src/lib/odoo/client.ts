import { getOdooConfig } from "@/lib/odoo/config";

export class OdooApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "OdooApiError";
  }
}

/**
 * Client Odoo External JSON-2 API.
 * Doc: https://www.odoo.com/documentation/19.0/developer/reference/external_api.html
 *
 * Exemple d’appel :
 *   await odooCall("product.product", "search_read", { domain: [], fields: [...], limit: 50 })
 */
export async function odooCall<T = unknown>(
  model: string,
  method: string,
  body: Record<string, unknown> = {},
): Promise<T> {
  const { url, apiKey, database, configured } = getOdooConfig();
  if (!configured) {
    throw new OdooApiError(
      "Odoo non configuré (ODOO_URL / ODOO_API_KEY manquants).",
    );
  }

  const endpoint = `${url}/json/2/${model}/${method}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `bearer ${apiKey}`,
  };
  if (database) {
    headers["X-Odoo-Database"] = database;
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new OdooApiError(
      `Odoo ${model}.${method} → HTTP ${res.status}${text ? `: ${text.slice(0, 200)}` : ""}`,
      res.status,
    );
  }

  return (await res.json()) as T;
}

export async function testOdooConnection(): Promise<{
  ok: boolean;
  message: string;
}> {
  try {
    const rows = await odooCall<unknown[]>("res.users", "search_read", {
      domain: [["id", "=", 2]],
      fields: ["name", "login"],
      limit: 1,
    });
    const name =
      Array.isArray(rows) && rows[0] && typeof rows[0] === "object"
        ? String((rows[0] as { name?: string }).name || "OK")
        : "OK";
    return { ok: true, message: `Connexion Odoo OK (${name})` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur inconnue";
    return { ok: false, message: msg };
  }
}
