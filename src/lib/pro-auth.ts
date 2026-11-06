import { createHmac, timingSafeEqual } from "node:crypto";

/** Cookie signé (httpOnly) prouvant qu’un code pro valide a été saisi. */
export const PRO_COOKIE = "lkm_pro";
export const PRO_COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 jours

function secret() {
  return process.env.PRO_SECRET || process.env.AUTH_SECRET || "";
}

/**
 * Codes pro autorisés : variable d’environnement PRO_CODES, séparés par des
 * virgules, au format « Nom:CODE » ou « CODE » (ex. « Kossi:KOS-2026,AMA77 »).
 */
function proCodes(): { name: string; code: string }[] {
  return (process.env.PRO_CODES ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const i = entry.lastIndexOf(":");
      return i > 0
        ? { name: entry.slice(0, i).trim(), code: entry.slice(i + 1).trim() }
        : { name: "", code: entry };
    })
    .filter((c) => c.code.length >= 4);
}

function sameText(a: string, b: string) {
  const x = Buffer.from(a.toUpperCase());
  const y = Buffer.from(b.toUpperCase());
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Renvoie le réparateur correspondant au code, ou null. */
export function checkProCode(code: string) {
  const clean = code.trim();
  if (!clean || !secret()) return null;
  return proCodes().find((c) => sameText(c.code, clean)) ?? null;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

/** Jeton du cookie : « nom.signature ». */
export function makeProToken(name: string) {
  const value = Buffer.from(name || "pro").toString("base64url");
  return `${value}.${sign(value)}`;
}

/** Nom du réparateur si le jeton est valide (et toujours dans PRO_CODES). */
export function readProToken(token: string | undefined): string | null {
  if (!token || !secret()) return null;
  const [value, signature] = token.split(".");
  if (!value || !signature) return null;
  const expected = sign(value);
  if (
    expected.length !== signature.length ||
    !timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  ) {
    return null;
  }
  const name = Buffer.from(value, "base64url").toString();
  const codes = proCodes();
  // Un code retiré de PRO_CODES désactive aussi les sessions ouvertes.
  if (name !== "pro" && !codes.some((c) => c.name === name)) return null;
  if (codes.length === 0) return null;
  return name;
}
