import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDashboardStats } from "@/lib/sales";
import { formatCfa, formatDateFr } from "@/lib/invoice";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const stats = await getDashboardStats();

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            Vue d’ensemble
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold">
            Tableau de bord
          </h1>
        </div>
        <Link
          href="/admin/ventes/nouvelle"
          className={cn(buttonVariants({ size: "lg" }))}
        >
          Nouvelle facture
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Clients", value: String(stats.customers) },
          { label: "Factures", value: String(stats.salesCount) },
          { label: "Ventes ce mois", value: String(stats.monthCount) },
          { label: "CA du mois", value: formatCfa(stats.monthTotal) },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-white/10 bg-[var(--lkm-surface)] p-5"
          >
            <p className="text-sm text-white/45">{card.label}</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
            Dernières factures
          </h2>
          <Link href="/admin/ventes" className="text-sm text-[var(--lkm-blue)]">
            Tout voir
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-white/45">
              <tr>
                <th className="px-4 py-3 font-medium">N°</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentSales.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-white/40">
                    Aucune facture pour le moment.
                  </td>
                </tr>
              ) : (
                stats.recentSales.map((sale) => (
                  <tr key={sale.id} className="border-t border-white/8">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/ventes/${sale.id}`}
                        className="text-[var(--lkm-blue)] hover:underline"
                      >
                        {sale.number}
                      </Link>
                    </td>
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
    </div>
  );
}
