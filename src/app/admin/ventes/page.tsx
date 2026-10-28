import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatCfa, formatDateFr } from "@/lib/invoice";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminSalesPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const sales = await prisma.sale.findMany({
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            Facturation
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold">
            Ventes & factures
          </h1>
        </div>
        <Link
          href="/admin/ventes/nouvelle"
          className={cn(buttonVariants({ size: "lg" }))}
        >
          Nouvelle facture
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.03] text-white/45">
            <tr>
              <th className="px-4 py-3 font-medium">N°</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-white/40">
                  Aucune facture.
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.id} className="border-t border-white/8">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/ventes/${sale.id}`}
                      className="text-[var(--lkm-blue)] hover:underline"
                    >
                      {sale.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-white/55">{sale.type}</td>
                  <td className="px-4 py-3">{sale.customer.name}</td>
                  <td className="px-4 py-3 text-white/55">
                    {formatDateFr(sale.invoiceDate)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCfa(sale.total)}
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
