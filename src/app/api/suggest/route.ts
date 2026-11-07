import { NextResponse } from "next/server";
import { getCategories, getProducts } from "@/lib/catalog";
import { suggest } from "@/lib/search-suggest";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") || "";
  if (!q.trim()) return NextResponse.json([]);
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return NextResponse.json(suggest(q, products, categories));
}
