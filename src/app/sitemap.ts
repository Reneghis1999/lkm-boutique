import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes = [
    "",
    "/boutique",
    "/promotions",
    "/categories",
    "/reparation",
    "/contact",
    "/panier",
  ].map((path) => ({
    url: `${siteUrl}${path || "/"}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const [categoriesList, productsList] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  const categories = categoriesList.map((category) => ({
    url: `${siteUrl}/categorie/${category.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const products = productsList.map((product) => ({
    url: `${siteUrl}/produit/${product.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...categories, ...products];
}
