import { NextResponse } from "next/server";
import { createStockAlert } from "@/lib/odoo/stock-alert";
import { productUrl } from "@/lib/site";

// Limite simple contre les envois en rafale (par instance serveur).
const WINDOW_MS = 10 * 60 * 1000;
const MAX_TRIES = 5;
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

const text = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "inconnu";
  if (tooMany(ip)) {
    return NextResponse.json({ ok: false, reason: "too_many" }, { status: 429, headers });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    // corps invalide
  }

  // Champ caché : rempli seulement par les robots.
  if (text(body.website, 100)) return NextResponse.json({ ok: true }, { headers });

  const product = text(body.product, 150);
  const name = text(body.name, 80);
  const phone = text(body.phone, 30);
  const slug = text(body.slug, 150);
  const options: Record<string, string> = {};
  if (body.options && typeof body.options === "object") {
    for (const [k, v] of Object.entries(body.options as Record<string, unknown>).slice(0, 5)) {
      const val = text(v, 40);
      if (val) options[text(k, 40)] = val;
    }
  }

  if (!product || !name || phone.replace(/\D/g, "").length < 8) {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400, headers });
  }

  try {
    await createStockAlert({
      product,
      options,
      name,
      phone,
      url: slug ? productUrl(slug) : undefined,
    });
    return NextResponse.json({ ok: true }, { headers });
  } catch (e) {
    console.error("[alerte] Odoo :", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 502, headers });
  }
}
