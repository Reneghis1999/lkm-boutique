import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

type Params = Promise<{ id: string }>;

export default async function EditProductPage({ params }: { params: Params }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { categories: { include: { category: true } } },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <Link
        href="/admin/produits"
        className="text-sm text-white/45 hover:text-white"
      >
        ← Produits
      </Link>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          {product.name}
        </h1>
        <DeleteProductButton id={product.id} />
      </div>
      <div className="mt-8 max-w-2xl rounded-2xl border border-white/10 bg-[var(--lkm-surface)] p-5 sm:p-6">
        <ProductForm
          categories={categories}
          initial={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            description: product.description,
            image: product.image,
            featured: product.featured,
            active: product.active,
            categorySlugs: product.categories.map((c) => c.category.slug),
          }}
        />
      </div>
    </div>
  );
}
