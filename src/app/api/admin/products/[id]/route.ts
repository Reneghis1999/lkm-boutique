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

type Params = Promise<{ id: string }>;

export async function PATCH(request: Request, { params }: { params: Params }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  let slug = existing.slug;
  if (parsed.data.slug || parsed.data.name) {
    const next = slugify(parsed.data.slug || parsed.data.name);
    if (next && next !== existing.slug) {
      const clash = await prisma.product.findFirst({
        where: { slug: next, NOT: { id } },
      });
      slug = clash ? `${next}-${Date.now().toString().slice(-4)}` : next;
    }
  }

  const categorySlugs = parsed.data.categorySlugs;
  if (categorySlugs) {
    await prisma.productCategory.deleteMany({ where: { productId: id } });
    const categories = await prisma.category.findMany({
      where: { slug: { in: categorySlugs } },
    });
    await prisma.productCategory.createMany({
      data: categories.map((c) => ({ productId: id, categoryId: c.id })),
    });
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: parsed.data.name.trim(),
      slug,
      price: parsed.data.price ?? null,
      compareAtPrice: parsed.data.compareAtPrice ?? null,
      description: parsed.data.description?.trim() || "",
      image: parsed.data.image ?? null,
      featured: parsed.data.featured ?? false,
      active: parsed.data.active ?? true,
    },
    include: { categories: { include: { category: true } } },
  });

  return NextResponse.json(product);
}

export async function DELETE(_request: Request, { params }: { params: Params }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
