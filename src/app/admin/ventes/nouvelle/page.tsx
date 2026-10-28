import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getProducts } from "@/lib/catalog";
import { SaleForm } from "@/components/admin/sale-form";

type Search = Promise<{ customerId?: string }>;

export default async function NewSalePage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const params = await searchParams;
  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, phone: true },
  });

  const catalog = (await getProducts())
    .filter((p) => p.price != null)
    .slice(0, 400)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      price: p.price,
    }));

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
        Facturation
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold">
        Nouvelle facture
      </h1>
      <p className="mt-2 text-sm text-white/50">
        Numérotation automatique FAC/AAAA/xxxxx ou INV/AAAA/xxxxx + note de
        garantie LKM sur le PDF.
      </p>

      <div className="mt-8 rounded-2xl border border-white/10 bg-[var(--lkm-surface)] p-5 sm:p-6">
        <SaleForm
          customers={customers}
          catalog={catalog}
          defaultCustomerId={params.customerId}
        />
      </div>
    </div>
  );
}
