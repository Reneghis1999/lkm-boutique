import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  PRO_COOKIE,
  PRO_COOKIE_MAX_AGE,
  checkProCode,
  makeProToken,
  readProToken,
} from "@/lib/pro-auth";
import { PRO_UI_COOKIE } from "@/lib/pro-price";

const NO_STORE = { "Cache-Control": "no-store" };

// Limite simple contre les essais de codes en rafale.
const WINDOW_MS = 10 * 60 * 1000;
const tries = new Map<string, { count: number; since: number }>();
function tooMany(ip: string) {
  const now = Date.now();
  const e = tries.get(ip);
  if (!e || now - e.since > WINDOW_MS) {
    tries.set(ip, { count: 1, since: now });
    return false;
  }
  e.count += 1;
  return e.count > 8;
}

/** État de la session pro. */
export async function GET() {
  const jar = await cookies();
  const name = readProToken(jar.get(PRO_COOKIE)?.value);
  const res = NextResponse.json({ pro: name !== null, name }, { headers: NO_STORE });
  if (!name && jar.get(PRO_UI_COOKIE)) res.cookies.delete(PRO_UI_COOKIE);
  return res;
}

/** Connexion avec un code pro. */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "inconnu";
  if (tooMany(ip)) {
    return NextResponse.json({ pro: false, reason: "too_many" }, { status: 429, headers: NO_STORE });
  }
  let code = "";
  try {
    const body = (await request.json()) as { code?: unknown };
    code = typeof body.code === "string" ? body.code : "";
  } catch {
    // corps invalide
  }
  const match = checkProCode(code);
  if (!match) {
    return NextResponse.json({ pro: false, reason: "invalid" }, { status: 401, headers: NO_STORE });
  }
  const name = match.name || "pro";
  const res = NextResponse.json({ pro: true, name }, { headers: NO_STORE });
  const base = {
    path: "/",
    maxAge: PRO_COOKIE_MAX_AGE,
    sameSite: "lax" as const,
    secure: true,
  };
  res.cookies.set(PRO_COOKIE, makeProToken(name), { ...base, httpOnly: true });
  res.cookies.set(PRO_UI_COOKIE, "1", base);
  return res;
}

/** Déconnexion. */
export async function DELETE() {
  const res = NextResponse.json({ pro: false }, { headers: NO_STORE });
  res.cookies.delete(PRO_COOKIE);
  res.cookies.delete(PRO_UI_COOKIE);
  return res;
}
