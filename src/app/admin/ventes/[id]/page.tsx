import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Download } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatCfa, formatDateFr } from "@/lib/invoice";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Params = Promise<{ id: string }>;

export default async function SaleDetailPage({ params }: { params: Params }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { id } = await params;
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      customer: true,
      lines: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!sale) notFound();

  return (
    <div>
      <Link href="/admin/ventes" className="text-sm text-white/45 hover:text-white">
        ← Ventes
      </Link>

      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            {sale.type}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold">
            {sale.number}
          </h1>
          <p className="mt-2 text-white/55">
            {sale.customer.name}
            {sale.customer.phone ? ` · ${sale.customer.phone}` : ""}
          </p>
        </div>
        <a
          href={`/api/admin/sales/${sale.id}/pdf`}
          className={cn(buttonVariants({ size: "lg" }))}
        >
          <Download className="h-4 w-4" />
          Télécharger PDF
        </a>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[var(--lkm-surface)] p-4">
          <p className="text-xs text-white/40">Date</p>
          <p className="mt-1 font-medium">{formatDateFr(sale.invoiceDate)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[var(--lkm-surface)] p-4">
          <p className="text-xs text-white/40">Échéance</p>
          <p className="mt-1 font-medium">
            {formatDateFr(sale.dueDate ?? sale.invoiceDate)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[var(--lkm-surface)] p-4">
          <p className="text-xs text-white/40">Total</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-xl font-bold">
            {formatCfa(sale.total)}
          </p>
        </div>
      </div>

      {(sale.source || sale.reference) && (
        <p className="mt-4 text-sm text-white/45">
          {sale.source ? `Source : ${sale.source}` : ""}
          {sale.source && sale.reference ? " · " : ""}
          {sale.reference ? `Réf. : ${sale.reference}` : ""}
        </p>
      )}

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.03] text-white/45">
            <tr>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium text-right">Qté</th>
              <th className="px-4 py-3 font-medium text-right">P.U.</th>
              <th className="px-4 py-3 font-medium text-right">Montant</th>
            </tr>
          </thead>
          <tbody>
            {sale.lines.map((line) => (
              <tr key={line.id} className="border-t border-white/8">
                <td className="px-4 py-3">{line.description}</td>
                <td className="px-4 py-3 text-right text-white/55">
                  {line.quantity}
                </td>
                <td className="px-4 py-3 text-right text-white/55">
                  {formatCfa(line.unitPrice)}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatCfa(line.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
