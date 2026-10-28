import { prisma } from "@/lib/db";
import {
  formatInvoiceNumber,
  type InvoiceType,
} from "@/lib/invoice";

export async function nextSaleNumber(type: InvoiceType) {
  const year = new Date().getFullYear();

  const seq = await prisma.sequence.upsert({
    where: { type_year: { type, year } },
    create: { type, year, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
  });

  return formatInvoiceNumber(type, year, seq.lastNumber);
}

export type SaleLineInput = {
  description: string;
  quantity: number;
  unitPrice: number;
  productSlug?: string | null;
};

export async function createSale(input: {
  type: InvoiceType;
  customerId: string;
  invoiceDate?: Date;
  dueDate?: Date | null;
  source?: string | null;
  reference?: string | null;
  notes?: string | null;
  createdById?: string | null;
  lines: SaleLineInput[];
}) {
  if (!input.lines.length) {
    throw new Error("Au moins une ligne est requise.");
  }

  const lines = input.lines.map((line, index) => {
    const quantity = Number(line.quantity) || 1;
    const unitPrice = Math.round(Number(line.unitPrice) || 0);
    return {
      description: line.description.trim(),
      quantity,
      unitPrice,
      amount: Math.round(quantity * unitPrice),
      productSlug: line.productSlug || null,
      sortOrder: index,
    };
  });

  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  const number = await nextSaleNumber(input.type);

  return prisma.sale.create({
    data: {
      number,
      type: input.type,
      status: "confirmed",
      invoiceDate: input.invoiceDate ?? new Date(),
      dueDate: input.dueDate ?? input.invoiceDate ?? new Date(),
      source: input.source || null,
      reference: input.reference || null,
      notes: input.notes || null,
      total,
      customerId: input.customerId,
      createdById: input.createdById || null,
      lines: { create: lines },
    },
    include: {
      customer: true,
      lines: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getDashboardStats() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [customers, salesCount, monthSales, recentSales] = await Promise.all([
    prisma.customer.count(),
    prisma.sale.count({ where: { status: "confirmed" } }),
    prisma.sale.aggregate({
      where: {
        status: "confirmed",
        invoiceDate: { gte: startOfMonth },
      },
      _sum: { total: true },
      _count: true,
    }),
    prisma.sale.findMany({
      where: { status: "confirmed" },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return {
    customers,
    salesCount,
    monthCount: monthSales._count,
    monthTotal: monthSales._sum.total ?? 0,
    recentSales,
  };
}
