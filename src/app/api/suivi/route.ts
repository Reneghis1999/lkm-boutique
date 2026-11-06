import { NextResponse } from "next/server";
import { lookupRepair } from "@/lib/odoo/repair-tracking";

// Limite simple contre les essais en rafale (par instance serveur).
const WINDOW_MS = 10 * 60 * 1000;
const MAX_TRIES = 10;
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
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "inconnu";
  if (tooMany(ip)) {
    return NextResponse.json(
      { ok: false, reason: "too_many" },
      { status: 429, headers: { "Cache-Control": "no-store" } },
    );
  }

  let reference = "";
  let phone = "";
  try {
    const body = (await request.json()) as {
      reference?: unknown;
      phone?: unknown;
    };
    reference = typeof body.reference === "string" ? body.reference : "";
    phone = typeof body.phone === "string" ? body.phone : "";
  } catch {
    // corps invalide : traité comme « introuvable »
  }

  const result = await lookupRepair(reference, phone);
  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
