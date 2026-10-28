import { shop } from "@/data/shop";

export function formatPrice(price: number | null | undefined): string {
  if (price == null || Number.isNaN(price)) {
    return "Prix sur demande";
  }

  return `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(price)} ${shop.currency}`;
}

export function hasPrice(price: number | null | undefined): price is number {
  return typeof price === "number" && !Number.isNaN(price);
}
