import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { slug: true, name: true },
  });

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
        Catalogue
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold">
        Nouveau produit
      </h1>
      <div className="mt-8 max-w-2xl rounded-2xl border border-white/10 bg-[var(--lkm-surface)] p-5 sm:p-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
