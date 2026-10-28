import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CustomerForm } from "@/components/admin/customer-form";

export default async function AdminCustomersPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const customers = await prisma.customer.findMany({
    include: { _count: { select: { sales: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            CRM
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold">
            Clients
          </h1>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[340px_1fr]">
        <div className="rounded-2xl border border-white/10 bg-[var(--lkm-surface)] p-5">
          <h2 className="font-semibold text-white">Nouveau client</h2>
          <div className="mt-4">
            <CustomerForm />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-white/45">
              <tr>
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">Téléphone</th>
                <th className="px-4 py-3 font-medium">Ventes</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-white/40">
                    Aucun client enregistré.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="border-t border-white/8">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-white/55">{c.phone || "—"}</td>
                    <td className="px-4 py-3 text-white/55">{c._count.sales}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/clients/${c.id}`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        Voir
                      </Link>
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
