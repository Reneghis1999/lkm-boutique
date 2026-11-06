/** Remise accordée aux réparateurs (espace pro). */
export const PRO_DISCOUNT = 0.1;

/** Cookie lisible côté navigateur pour l’affichage (la vérification se fait côté serveur). */
export const PRO_UI_COOKIE = "lkm_pro_ui";

/** Prix réparateur, arrondi au franc. */
export function proPrice(price: number | null | undefined): number | null {
  if (typeof price !== "number" || Number.isNaN(price)) return null;
  return Math.round(price * (1 - PRO_DISCOUNT));
}
