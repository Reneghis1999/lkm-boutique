export const WARRANTY_NOTE = `NOTE DE GARANTIE – LKM
* Écrans et batteries : 24 h de garantie. Écrans collés, écrans transparents et écrans sans plastique : aucune garantie.
* Téléphones sans boîte : 1 semaine. Téléphones en boîte : 1 mois. Consoles : 1 semaine. CD : 24 h.
* Aucun remboursement après la vente. Un échange est possible si la garantie est toujours valable.
* LKM Service de Réparation vous accorde 15 % de réduction sur le remplacement d’un écran cassé dans les 3 mois suivant l’achat du téléphone, à condition que la réparation soit effectuée chez LKM.`;

export type InvoiceType = "FAC" | "INV";

export function formatInvoiceNumber(type: InvoiceType, year: number, n: number) {
  return `${type}/${year}/${String(n).padStart(5, "0")}`;
}

export function formatCfa(amount: number) {
  return `${new Intl.NumberFormat("fr-FR").format(amount)} CFA`;
}

export function formatDateFr(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-FR");
}
