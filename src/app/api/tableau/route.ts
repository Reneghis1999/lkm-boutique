import { NextResponse } from "next/server";
import { DASH_COOKIE, DASH_MAX_AGE, checkDashCode, makeDashToken } from "@/lib/dashboard-auth";

const tries = new Map<string, { n: number; t: number }>();

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "?";
  const e = tries.get(ip);
  const now = Date.now();
  if (e && now - e.t < 10 * 60 * 1000 && e.n >= 6) {
    return NextResponse.json({ ok: false, reason: "too_many" }, { status: 429 });
  }
  let code = "";
  try {
    code = String(((await request.json()) as { code?: unknown }).code ?? "");
  } catch {
    // corps invalide
  }
  if (!checkDashCode(code)) {
    tries.set(ip, e && now - e.t < 10 * 60 * 1000 ? { n: e.n + 1, t: e.t } : { n: 1, t: now });
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(DASH_COOKIE, makeDashToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: DASH_MAX_AGE,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(DASH_COOKIE);
  return res;
}

