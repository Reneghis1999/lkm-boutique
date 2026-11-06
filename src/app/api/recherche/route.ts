import { NextResponse } from "next/server";
import { filterProducts, getProducts } from "@/lib/catalog";
import { normalizeSearchTerm } from "@/lib/search-term";
import { recordMissedSearch } from "@/lib/odoo/missed-search";

// Limite simple contre les envois en rafale (par instance serveur).
const WINDOW_MS = 10 * 60 * 1000;
const MAX_TRIES = 15;
const tries = new Map<string, { count: number; since: number }>();

function tooMany(ip: string) {
  const now = Date.now();
  const entry = tries.get(ip);
  if (!entry || now - entry.since > WINDOW_MS) {
    tries.set(ip, { count: 1, since: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_TRIES;
}

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "inconnu";
  if (tooMany(ip)) return NextResponse.json({ ok: false }, { status: 429, headers });

  let q = "";
  try {
    const body = (await request.json()) as { q?: unknown };
    q = typeof body.q === "string" ? body.q.slice(0, 100) : "";
  } catch {
    // corps invalide
  }
  const term = normalizeSearchTerm(q);
  if (term.replace(/\s/g, "").length < 3) {
    return NextResponse.json({ ok: false }, { status: 400, headers });
  }

  try {
    // On vérifie ici que la recherche ne donne vraiment rien.
    const products = await getProducts();
    if (filterProducts({ query: q, sort: "featured" }, products).length > 0) {
      return NextResponse.json({ ok: true, found: true }, { headers });
    }
    await recordMissedSearch(term);
    return NextResponse.json({ ok: true }, { headers });
  } catch (e) {
    console.error("[recherche] Odoo :", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false }, { status: 502, headers });
  }
}
