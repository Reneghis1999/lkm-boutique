import { NextResponse } from "next/server";
import { filterProducts, getFeaturedProducts, getProducts } from "@/lib/catalog";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const featured = searchParams.get("featured") === "1";
  const ids = searchParams.get("ids");

  // Données à jour des articles du panier (?ids=12,34)
  if (ids !== null) {
    const wanted = new Set(
      ids
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
        .slice(0, 100),
    );
    const products = await getProducts();
    const items = products
      .filter((p) => wanted.has(p.id))
      .map(({ id, slug, name, price, image }) => ({
        id,
        slug,
        name,
        price,
        image,
      }));
    return NextResponse.json(items, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  if (featured && !q.trim()) {
    const items = await getFeaturedProducts(6);
    return NextResponse.json(items);
  }

  const products = await getProducts();
  const items = q.trim()
    ? filterProducts({ query: q, sort: "featured" }, products).slice(0, 8)
    : products.slice(0, 8);

  return NextResponse.json(items);
}
