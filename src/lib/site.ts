import { shop } from "@/data/shop";

/** URL publique du site — override avec NEXT_PUBLIC_SITE_URL en prod */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://lkmboutique.com";

export function absoluteUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalized}`;
}

export function productUrl(slug: string) {
  return absoluteUrl(`/produit/${slug}`);
}

export const siteName = shop.name;
