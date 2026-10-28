import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { buildInvoicePdf } from "@/lib/pdf-invoice";

type Params = Promise<{ id: string }>;

export async function GET(_request: Request, { params }: { params: Params }) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Non autorisé", { status: 401 });
  }

  const { id } = await params;
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      customer: true,
      lines: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!sale) {
    return new Response("Facture introuvable", { status: 404 });
  }

  const pdf = await buildInvoicePdf(sale);
  const filename = `${sale.number.replaceAll("/", "_")}.pdf`;

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
