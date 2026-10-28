import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  price: z.number().nullable().optional(),
  compareAtPrice: z.number().nullable().optional(),
  description: z.string().optional(),
  image: z.string().nullable().optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  categorySlugs: z.array(z.string()).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    include: { categories: { include: { category: true } } },
    orderBy: [{ updatedAt: "desc" }],
  });

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const baseSlug = slugify(parsed.data.slug || parsed.data.name) || `produit-${Date.now()}`;
  let slug = baseSlug;
  let i = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }

  const categorySlugs = parsed.data.categorySlugs || [];
  const categories = categorySlugs.length
    ? await prisma.category.findMany({ where: { slug: { in: categorySlugs } } })
    : [];

  const count = await prisma.product.count();

  const product = await prisma.product.create({
    data: {
      name: parsed.data.name.trim(),
      slug,
      price: parsed.data.price ?? null,
      compareAtPrice: parsed.data.compareAtPrice ?? null,
      description: parsed.data.description?.trim() || "",
      image: parsed.data.image || null,
      featured: parsed.data.featured ?? false,
      active: parsed.data.active ?? true,
      position: count + 1,
      categories: {
        create: categories.map((c) => ({ categoryId: c.id })),
      },
    },
    include: { categories: { include: { category: true } } },
  });

  return NextResponse.json(product);
}
