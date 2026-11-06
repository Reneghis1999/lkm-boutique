import { REPAIR_LABOR, type RepairItem } from "@/data/repairs";
import { shop } from "@/data/shop";
import { formatPrice, hasPrice } from "@/lib/format";
import { PRO_DISCOUNT, proPrice } from "@/lib/pro-price";
import type { CartItem, Product } from "@/types";

/** Client réparateur (espace pro) : prix remisés et mention dans le message. */
export type ProInfo = { name: string | null } | null | undefined;

function proLines(pro: ProInfo): string[] {
  if (!pro) return [];
  const who = pro.name && pro.name !== "pro" ? ` — ${pro.name}` : "";
  return [
    ``,
    `Client PRO (réparateur)${who} : prix réparateur -${Math.round(PRO_DISCOUNT * 100)} %.`,
  ];
}

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
  pro?: ProInfo,
): string {
  const options = selectedOptionsLabel(selectedOptions);
  const lines = [
    `Bonjour LKM Boutique,`,
    ``,
    `Je souhaite commander :`,
    `• ${product.name}${options} × ${quantity}`,
  ];

  const unit = pro ? proPrice(product.price) : product.price;
  if (hasPrice(unit)) {
    lines.push(`Prix unitaire : ${formatPrice(unit)}`);
    lines.push(`Total : ${formatPrice(unit * quantity)}`);
  } else {
    lines.push(`Prix : à confirmer en boutique`);
  }

  lines.push(...proLines(pro));
  lines.push(``, `Merci !`);
  return lines.join("\n");
}

/** Mode de réception choisi dans le panier. */
export type DeliveryInfo =
  | { mode: "pickup"; shop: string }
  | { mode: "delivery"; area: string };

function deliveryLines(delivery?: DeliveryInfo): string[] {
  if (!delivery) return [];
  if (delivery.mode === "pickup") {
    return [``, `Réception : retrait en boutique (${delivery.shop})`];
  }
  return [
    ``,
    `Réception : livraison à domicile à Lomé`,
    `Quartier / adresse : ${delivery.area.trim() || "(à préciser)"}`,
    `Frais de livraison selon la distance.`,
  ];
}

export function buildCartWhatsAppMessage(
  items: CartItem[],
  delivery?: DeliveryInfo,
  pro?: ProInfo,
): string {
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

    const unit = pro ? proPrice(item.price) : item.price;
    if (hasPrice(unit)) {
      const lineTotal = unit * item.quantity;
      total += lineTotal;
      lines.push(
        `   ${formatPrice(unit)} / u — sous-total ${formatPrice(lineTotal)}`,
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

  lines.push(...proLines(pro));
  lines.push(...deliveryLines(delivery));
  lines.push(``, `Merci !`);
  return lines.join("\n");
}

/** Prix d’une réparation en une ligne (pièce + main d’œuvre, ou forfait). */
export function repairPriceLine(
  item: RepairItem,
  labor: number = REPAIR_LABOR,
): string {
  if (item.service != null) {
    return `Forfait ${formatPrice(item.service)} (main d’œuvre comprise)`;
  }
  if (item.partFrom != null) {
    return `Pièce à partir de ${formatPrice(item.partFrom)} + main d’œuvre ${formatPrice(item.labor ?? labor)}`;
  }
  if (item.labor != null) {
    return `Main d’œuvre ${formatPrice(item.labor)} + pièce selon le modèle`;
  }
  return `Sur devis (main d’œuvre ${formatPrice(labor)} + pièce selon le modèle)`;
}

/** Message WhatsApp pour une réparation choisie sur le site. */
export function buildRepairWhatsAppMessage(
  item: RepairItem,
  device?: string,
  labor: number = REPAIR_LABOR,
): string {
  return [
    `Bonjour LKM Boutique,`,
    ``,
    `Je souhaite une réparation :`,
    `• ${item.title}`,
    `• Appareil : ${device?.trim() || "(marque et modèle à préciser)"}`,
    `• Prix indiqué sur le site : ${repairPriceLine(item, labor)}`,
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
