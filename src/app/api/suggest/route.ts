import { NextResponse } from "next/server";
import { getProducts } from "@/lib/catalog";
import { suggestBrands } from "@/lib/search-suggest";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") || "";
  if (!q.trim()) return NextResponse.json([]);
  const products = await getProducts();
  return NextResponse.json(suggestBrands(q, products));
}
