import { createHmac, timingSafeEqual } from "node:crypto";

/** Accès au tableau de bord : code DASHBOARD_CODE (variable Vercel) + cookie signé. */
export const DASH_COOKIE = "lkm_dash";
export const DASH_MAX_AGE = 60 * 60 * 24 * 30;

const secret = () => process.env.AUTH_SECRET || "";
const code = () => (process.env.DASHBOARD_CODE || "").trim();
const sign = (v: string) => createHmac("sha256", secret()).update(`dash:${v}`).digest("base64url");

export function checkDashCode(input: string) {
  const want = code();
  if (!want || !secret() || want.length < 6) return false;
  const a = Buffer.from(input.trim().toUpperCase());
  const b = Buffer.from(want.toUpperCase());
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Le jeton change si le code change : l’ancien accès est alors coupé. */
export const makeDashToken = () => sign(code());

export function readDashToken(token: string | undefined) {
  if (!token || !code() || !secret()) return false;
  const want = sign(code());
  return token.length === want.length && timingSafeEqual(Buffer.from(token), Buffer.from(want));
}
