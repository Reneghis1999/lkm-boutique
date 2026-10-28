import { NextResponse } from "next/server";
import { filterProducts, getFeaturedProducts, getProducts } from "@/lib/catalog";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const featured = searchParams.get("featured") === "1";

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
