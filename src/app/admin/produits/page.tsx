import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatCfa } from "@/lib/invoice";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const products = await prisma.product.findMany({
    include: { categories: { include: { category: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            Catalogue
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold">
            Produits
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Ajoutez, modifiez ou masquez les articles de la boutique.
          </p>
        </div>
        <Link
          href="/admin/produits/nouveau"
          className={cn(buttonVariants({ size: "lg" }))}
        >
          Nouveau produit
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.03] text-white/45">
            <tr>
              <th className="px-4 py-3 font-medium">Produit</th>
              <th className="px-4 py-3 font-medium">Prix</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-white/40">
                  Aucun produit en base. Lancez le seed après Supabase.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-t border-white/8">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-black/30">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt=""
                            fill
                            className="object-contain p-1"
                            sizes="48px"
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-white/40">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {product.price != null ? formatCfa(product.price) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        product.active
                          ? "bg-[var(--lkm-green)]/15 text-[#6dffb0]"
                          : "bg-white/10 text-white/45",
                      )}
                    >
                      {product.active ? "Actif" : "Masqué"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/produits/${product.id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                      )}
                    >
                      Modifier
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
