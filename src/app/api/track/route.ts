import { after, NextResponse } from "next/server";
import { track, type TrackEvent } from "@/lib/stats";
import { normalizeSearchTerm } from "@/lib/search-term";

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview|lighthouse|headless/i;
const SOURCES = new Set(["Fiche produit", "Panier", "Réparation", "Rachat", "Rupture", "Pro", "Contact"]);

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";

/** Reçoit un événement du navigateur et le compte en arrière-plan. */
export async function POST(request: Request) {
  const res = new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  if (BOT.test(request.headers.get("user-agent") ?? "")) return res;

  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(await request.text()) as Record<string, unknown>;
  } catch {
    return res;
  }

  let event: TrackEvent | null = null;
  const type = clean(body.type, 20);
  if (type === "view") {
    const vid = clean(body.vid, 40);
    if (vid) event = { type: "view", vid };
  } else if (type === "product") {
    const slug = clean(body.slug, 150);
    if (/^[a-z0-9-]+$/.test(slug)) event = { type: "product", slug };
  } else if (type === "search") {
    const q = normalizeSearchTerm(clean(body.q, 100));
    if (q.replace(/\s/g, "").length >= 3) event = { type: "search", q };
  } else if (type === "whatsapp") {
    const source = clean(body.source, 30);
    const slug = clean(body.slug, 150);
    if (SOURCES.has(source)) {
      event = { type: "whatsapp", source, ...(/^[a-z0-9-]+$/.test(slug) ? { slug } : {}) };
    }
  }

  if (event) {
    const e = event;
    after(async () => {
      try {
        await track(e);
      } catch (err) {
        console.error("[track]", err instanceof Error ? err.message : err);
      }
    });
  }
  return res;
}
