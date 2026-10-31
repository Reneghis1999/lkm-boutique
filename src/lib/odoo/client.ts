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

/** Au-delà, on abandonne l’appel (le site bascule sur le catalogue JSON de secours). */
const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Client Odoo External JSON-2 API (Odoo 19+).
 * Doc: https://www.odoo.com/documentation/19.0/developer/reference/external_api.html
 *
 * Exemple d’appel :
 *   await odooCall("product.template", "search_read", { domain: [], fields: [...] })
 *
 * La clé API ne quitte jamais le serveur (pas de préfixe NEXT_PUBLIC_).
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
    "Content-Type": "application/json; charset=utf-8",
    Authorization: `bearer ${apiKey}`,
    "User-Agent": "lkm-boutique-nextjs",
  };
  if (database) {
    headers["X-Odoo-Database"] = database;
  }

  // Noms / descriptions en français par défaut.
  const context = {
    lang: "fr_FR",
    ...((body.context as Record<string, unknown> | undefined) ?? {}),
  };

  let res: Response | undefined;
  // Odoo Online limite le nombre d’appels : on réessaie (2 fois max) si
  // Odoo répond « trop de requêtes » (429) ou « indisponible » (503).
  for (let attempt = 0; ; attempt++) {
    try {
      res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ ...body, context }),
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (e) {
      const reason = e instanceof Error ? e.message : String(e);
      throw new OdooApiError(`Odoo ${model}.${method} injoignable : ${reason}`);
    }
    if ((res.status !== 429 && res.status !== 503) || attempt >= 2) break;
    const retryAfter = Number(res.headers.get("retry-after"));
    const delay =
      Number.isFinite(retryAfter) && retryAfter > 0
        ? Math.min(retryAfter * 1000, 3000)
        : 500 * 2 ** attempt;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = text.slice(0, 300);
    try {
      const parsed = JSON.parse(text) as { message?: string };
      if (parsed.message) message = parsed.message;
    } catch {
      // réponse non JSON : on garde le texte brut
    }
    throw new OdooApiError(
      `Odoo ${model}.${method} → HTTP ${res.status}${message ? ` : ${message}` : ""}`,
      res.status,
    );
  }

  return (await res.json()) as T;
}

type FieldsCacheEntry = { at: number; promise: Promise<Set<string>> };
const FIELDS_TTL_MS = 10 * 60 * 1000;
const fieldsCache = new Map<string, FieldsCacheEntry>();

/**
 * Liste des champs disponibles sur un modèle (selon les applis installées et
 * la version d’Odoo). Permet de ne jamais demander un champ inexistant, ce qui
 * ferait échouer tout l’appel.
 */
export function odooModelFields(model: string): Promise<Set<string>> {
  const cached = fieldsCache.get(model);
  if (cached && Date.now() - cached.at < FIELDS_TTL_MS) return cached.promise;

  const promise = odooCall<Record<string, unknown>>(model, "fields_get", {
    attributes: ["type"],
  }).then((fields) => new Set(Object.keys(fields ?? {})));

  fieldsCache.set(model, { at: Date.now(), promise });
  promise.catch(() => fieldsCache.delete(model));
  return promise;
}

export async function testOdooConnection(): Promise<{
  ok: boolean;
  message: string;
}> {
  try {
    const ctx = await odooCall<{ uid?: number }>("res.users", "context_get");
    let name = "OK";
    if (ctx?.uid) {
      const rows = await odooCall<{ name?: string; login?: string }[]>(
        "res.users",
        "search_read",
        {
          domain: [["id", "=", ctx.uid]],
          fields: ["name", "login"],
          limit: 1,
        },
      );
      if (rows?.[0]?.name) name = `${rows[0].name} — ${rows[0].login ?? ""}`;
    }
    return { ok: true, message: `Connexion Odoo OK (utilisateur : ${name})` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur inconnue";
    return { ok: false, message: msg };
  }
}

/**
 * Dates d’expiration des clés API de l’utilisateur connecté (best effort :
 * selon les droits, Odoo peut refuser cette lecture → null).
 * Rappel : une clé Odoo dure 3 mois maximum.
 */
export async function fetchApiKeyExpirations(): Promise<
  { name: string; expiration: string | null }[] | null
> {
  try {
    const ctx = await odooCall<{ uid?: number }>("res.users", "context_get");
    if (!ctx?.uid) return null;
    const rows = await odooCall<
      { name?: string; expiration_date?: string | false }[]
    >("res.users.apikeys", "search_read", {
      domain: [["user_id", "=", ctx.uid]],
      fields: ["name", "expiration_date"],
    });
    if (!Array.isArray(rows)) return null;
    return rows.map((r) => ({
      name: r.name || "Clé API",
      expiration: r.expiration_date || null,
    }));
  } catch {
    return null;
  }
}
