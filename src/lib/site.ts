import { shop } from "@/data/shop";

const PRODUCTION_SITE_URL = "https://lkm-boutique.vercel.app";

function normalizeSiteUrl(raw: string | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw.trim().replace(/\/$/, "");
  if (!cleaned) return null;
  // Jamais d’URL locale dans les liens partagés (WhatsApp, etc.)
  if (
    /localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]/i.test(cleaned) ||
    cleaned.startsWith("http://192.168.") ||
    cleaned.startsWith("http://10.")
  ) {
    return null;
  }
  return cleaned;
}

/** URL publique du site — jamais localhost dans les messages clients */
export const siteUrl =
  normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) || PRODUCTION_SITE_URL;

export function absoluteUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalized}`;
}

export function productUrl(slug: string) {
  return absoluteUrl(`/produit/${slug}`);
}

export const siteName = shop.name;
