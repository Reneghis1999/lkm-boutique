import { REPAIR_LABOR, type RepairItem } from "@/data/repairs";
import { shop } from "@/data/shop";
import { formatPrice, hasPrice } from "@/lib/format";
import type { CartItem, Product } from "@/types";

function selectedOptionsLabel(options?: Record<string, string>) {
  if (!options || Object.keys(options).length === 0) return "";
  return ` (${Object.entries(options)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ")})`;
}

/** Message d’accueil — bouton WhatsApp navbar / contact */
export function buildWelcomeWhatsAppMessage(): string {
  return [
    `Bonjour LKM Boutique,`,
    ``,
    `Bienvenue — je souhaite être accompagné(e) pour mon achat ou une réparation.`,
    `Que me conseillez-vous ?`,
  ].join("\n");
}

export function buildProductWhatsAppMessage(
  product: Product,
  quantity = 1,
  selectedOptions?: Record<string, string>,
): string {
  const options = selectedOptionsLabel(selectedOptions);
  const lines = [
    `Bonjour LKM Boutique,`,
    ``,
    `Je souhaite commander :`,
    `• ${product.name}${options} × ${quantity}`,
  ];

  if (hasPrice(product.price)) {
    lines.push(`Prix unitaire : ${formatPrice(product.price)}`);
    lines.push(`Total : ${formatPrice(product.price * quantity)}`);
  } else {
    lines.push(`Prix : à confirmer en boutique`);
  }

  lines.push(``, `Merci !`);
  return lines.join("\n");
}

export function buildCartWhatsAppMessage(items: CartItem[]): string {
  const lines = [
    `Bonjour LKM Boutique,`,
    ``,
    `Je souhaite commander les articles suivants :`,
    ``,
  ];

  let total = 0;
  let allPriced = true;

  items.forEach((item, index) => {
    const options = selectedOptionsLabel(item.selectedOptions);
    lines.push(`${index + 1}. ${item.name}${options} × ${item.quantity}`);

    if (hasPrice(item.price)) {
      const lineTotal = item.price * item.quantity;
      total += lineTotal;
      lines.push(
        `   ${formatPrice(item.price)} / u — sous-total ${formatPrice(lineTotal)}`,
      );
    } else {
      allPriced = false;
      lines.push(`   Prix à confirmer`);
    }
  });

  lines.push(``);

  if (allPriced) {
    lines.push(`Total estimé : ${formatPrice(total)}`);
  } else if (total > 0) {
    lines.push(`Sous-total (articles tarifés) : ${formatPrice(total)}`);
    lines.push(
      `Certains articles n’ont pas de prix affiché — à confirmer avec vous.`,
    );
  } else {
    lines.push(`Prix à confirmer pour l’ensemble de la commande.`);
  }

  lines.push(``, `Merci !`);
  return lines.join("\n");
}

/** Prix d’une réparation en une ligne (pièce + main d’œuvre, ou forfait). */
export function repairPriceLine(item: RepairItem): string {
  if (item.service != null) {
    return `Forfait ${formatPrice(item.service)} (main d’œuvre comprise)`;
  }
  if (item.partFrom != null) {
    return `Pièce à partir de ${formatPrice(item.partFrom)} + main d’œuvre ${formatPrice(REPAIR_LABOR)}`;
  }
  return `Main d’œuvre ${formatPrice(REPAIR_LABOR)} + pièce selon le modèle`;
}

/** Message WhatsApp pour une réparation choisie sur le site. */
export function buildRepairWhatsAppMessage(
  item: RepairItem,
  device?: string,
): string {
  return [
    `Bonjour LKM Boutique,`,
    ``,
    `Je souhaite une réparation :`,
    `• ${item.title}`,
    `• Appareil : ${device?.trim() || "(marque et modèle à préciser)"}`,
    `• Prix indiqué sur le site : ${repairPriceLine(item)}`,
    ``,
    `Pouvez-vous me confirmer le prix exact et le délai ?`,
    `Merci !`,
  ].join("\n");
}

/** Message WhatsApp pour une panne non listée (devis personnalisé). */
export function buildRepairQuoteMessage(input: {
  deviceType: string;
  device: string;
  issue: string;
}): string {
  return [
    `Bonjour LKM Boutique,`,
    ``,
    `J’aimerais un devis de réparation :`,
    `• Type d’appareil : ${input.deviceType || "(à préciser)"}`,
    `• Marque et modèle : ${input.device.trim() || "(à préciser)"}`,
    `• Panne : ${input.issue.trim() || "(à préciser)"}`,
    ``,
    `Merci !`,
  ].join("\n");
}

export function getWhatsAppUrl(message: string, phone = shop.whatsapp) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
