import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatCfa, formatDateFr } from "@/lib/invoice";
import { CustomerForm } from "@/components/admin/customer-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Params = Promise<{ id: string }>;

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Params;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      sales: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!customer) notFound();

  return (
    <div>
      <Link href="/admin/clients" className="text-sm text-white/45 hover:text-white">
        ← Clients
      </Link>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold">
        {customer.name}
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[var(--lkm-surface)] p-5">
          <h2 className="font-semibold">Fiche client</h2>
          <div className="mt-4">
            <CustomerForm initial={customer} />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[var(--lkm-surface)] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Historique des ventes</h2>
            <Link
              href={`/admin/ventes/nouvelle?customerId=${customer.id}`}
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Facturer
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {customer.sales.length === 0 ? (
              <p className="text-sm text-white/40">Aucune vente.</p>
            ) : (
              customer.sales.map((sale) => (
                <Link
                  key={sale.id}
                  href={`/admin/ventes/${sale.id}`}
                  className="flex items-center justify-between rounded-xl border border-white/8 px-3 py-3 text-sm hover:border-white/20"
                >
                  <div>
                    <p className="font-medium">{sale.number}</p>
                    <p className="text-white/45">{formatDateFr(sale.invoiceDate)}</p>
                  </div>
                  <p className="font-semibold">{formatCfa(sale.total)}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
