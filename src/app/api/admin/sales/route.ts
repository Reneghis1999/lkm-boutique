import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createSale } from "@/lib/sales";

const schema = z.object({
  type: z.enum(["FAC", "INV"]),
  customerId: z.string().optional(),
  newCustomer: z
    .object({
      name: z.string().min(1),
      phone: z.string().optional(),
    })
    .optional(),
  source: z.string().optional(),
  reference: z.string().optional(),
  lines: z
    .array(
      z.object({
        description: z.string().min(1),
        quantity: z.number().positive(),
        unitPrice: z.number().nonnegative(),
        productSlug: z.string().nullable().optional(),
      }),
    )
    .min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides. Vérifiez client et lignes." },
      { status: 400 },
    );
  }

  try {
    let customerId = parsed.data.customerId;

    if (!customerId && parsed.data.newCustomer) {
      const customer = await prisma.customer.create({
        data: {
          name: parsed.data.newCustomer.name.trim(),
          phone: parsed.data.newCustomer.phone?.trim() || null,
        },
      });
      customerId = customer.id;
    }

    if (!customerId) {
      return NextResponse.json(
        { error: "Sélectionnez ou créez un client." },
        { status: 400 },
      );
    }

    const sale = await createSale({
      type: parsed.data.type,
      customerId,
      source: parsed.data.source,
      reference: parsed.data.reference,
      createdById: session.user.id,
      lines: parsed.data.lines,
    });

    return NextResponse.json(sale);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la facture." },
      { status: 500 },
    );
  }
}
