import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { shop } from "@/data/shop";
import {
  WARRANTY_NOTE,
  formatCfa,
  formatDateFr,
} from "@/lib/invoice";

type PdfSale = {
  number: string;
  type: string;
  invoiceDate: Date;
  dueDate: Date | null;
  source: string | null;
  reference: string | null;
  total: number;
  customer: {
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
  };
  lines: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
};

function collect(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

export async function buildInvoicePdf(sale: PdfSale): Promise<Buffer> {
  const doc = new PDFDocument({
    size: "A4",
    margin: 48,
    info: {
      Title: `Facture ${sale.number}`,
      Author: shop.name,
    },
  });

  const done = collect(doc);

  const left = 48;
  const right = doc.page.width - 48;
  let y = 48;

  const logoPath = path.join(process.cwd(), "public", "logo-lkm-full.png");
  if (fs.existsSync(logoPath)) {
    try {
      doc.image(logoPath, left, y, { width: 78, height: 78 });
    } catch {
      /* ignore logo errors */
    }
  }

  doc
    .fillColor("#111")
    .font("Helvetica-Bold")
    .fontSize(16)
    .text(`Facture ${sale.number}`, left + 260, y + 8, {
      width: right - left - 260,
      align: "right",
    });

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#555")
    .text(shop.name, left + 90, y + 18)
    .text("Togo · Lomé", left + 90, y + 32)
    .text(shop.phones.join(" · "), left + 90, y + 46);

  y += 96;
  doc
    .moveTo(left, y)
    .lineTo(right, y)
    .strokeColor("#dddddd")
    .stroke();

  y += 18;
  doc.fillColor("#111").font("Helvetica-Bold").fontSize(12).text(sale.customer.name, left, y);
  y += 16;
  doc.font("Helvetica").fontSize(10).fillColor("#333");
  if (sale.customer.phone) {
    doc.text(`Tél. ${sale.customer.phone}`, left, y);
    y += 14;
  }
  if (sale.customer.email) {
    doc.text(sale.customer.email, left, y);
    y += 14;
  }
  if (sale.customer.address) {
    doc.text(sale.customer.address, left, y, { width: 240 });
    y += 28;
  }

  const metaX = left + 300;
  let metaY = 120;
  doc.font("Helvetica").fontSize(9).fillColor("#666");
  const meta = [
    ["Date de facturation", formatDateFr(sale.invoiceDate)],
    ["Échéance", formatDateFr(sale.dueDate ?? sale.invoiceDate)],
    ...(sale.source ? [["Source", sale.source] as const] : []),
    ...(sale.reference ? [["Référence", sale.reference] as const] : []),
    ["Communication de paiement", sale.number],
  ];

  for (const [label, value] of meta) {
    doc.text(label, metaX, metaY, { width: 100 });
    doc.fillColor("#111").font("Helvetica-Bold").text(String(value), metaX + 100, metaY, {
      width: 110,
      align: "right",
    });
    doc.font("Helvetica").fillColor("#666");
    metaY += 16;
  }

  y = Math.max(y, metaY) + 20;

  doc
    .fillColor("#111")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("NOTE DE GARANTIE – LKM", left, y);
  y += 14;
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#444")
    .text(WARRANTY_NOTE.replace("NOTE DE GARANTIE – LKM\n", ""), left, y, {
      width: right - left,
      lineGap: 2,
    });

  y = doc.y + 18;

  const colDesc = left;
  const colQty = left + 270;
  const colUnit = left + 340;
  const colAmount = left + 420;

  doc.rect(left, y, right - left, 22).fill("#f3f3f3");
  doc.fillColor("#111").font("Helvetica-Bold").fontSize(9);
  doc.text("DESCRIPTION", colDesc + 6, y + 6);
  doc.text("QUANTITÉ", colQty, y + 6, { width: 60, align: "right" });
  doc.text("PRIX UNITAIRE", colUnit, y + 6, { width: 70, align: "right" });
  doc.text("MONTANT", colAmount, y + 6, { width: 70, align: "right" });

  y += 28;
  doc.font("Helvetica").fontSize(9).fillColor("#222");

  for (const line of sale.lines) {
    const descHeight = doc.heightOfString(line.description, { width: 250 });
    const rowHeight = Math.max(20, descHeight + 6);

    if (y + rowHeight > doc.page.height - 80) {
      doc.addPage();
      y = 48;
    }

    doc.text(line.description, colDesc + 6, y, { width: 250 });
    doc.text(
      line.quantity.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      colQty,
      y,
      { width: 60, align: "right" },
    );
    doc.text(
      line.unitPrice.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      colUnit,
      y,
      { width: 70, align: "right" },
    );
    doc.text(formatCfa(line.amount), colAmount, y, {
      width: 70,
      align: "right",
    });
    y += rowHeight + 4;
  }

  y += 8;
  doc
    .moveTo(left, y)
    .lineTo(right, y)
    .strokeColor("#dddddd")
    .stroke();
  y += 12;

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#111")
    .text(`Total ${formatCfa(sale.total)}`, left, y, {
      width: right - left,
      align: "right",
    });

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#888")
    .text("Page 1 / 1", left, doc.page.height - 40, {
      width: right - left,
      align: "center",
    });

  doc.end();
  return done;
}
