"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatPrice, hasPrice } from "@/lib/format";
import { buildCartWhatsAppMessage, getWhatsAppUrl } from "@/lib/whatsapp";
import {
  getCartItemKey,
  useCart,
  useCartCount,
  useCartTotal,
} from "@/store/cart";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem } = useCart();
  const count = useCartCount();
  const total = useCartTotal();
  const hasUnpriced = items.some((i) => !hasPrice(i.price));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Fermer le panier"
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col border-l border-white/10 bg-[#0c0c0f] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-white">
                  Panier
                </h2>
                <p className="text-xs text-white/45">
                  {count} article{count > 1 ? "s" : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/60 hover:bg-white/8 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <ShoppingBag className="h-10 w-10 text-white/20" />
                  <p className="text-sm text-white/50">Votre panier est vide</p>
                  <Link
                    href="/boutique"
                    onClick={closeCart}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Voir la boutique
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => {
                    const key = getCartItemKey(item);
                    return (
                      <li
                        key={key}
                        className="flex gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3"
                      >
                        <Link
                          href={`/produit/${item.slug}`}
                          onClick={closeCart}
                          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-black/40"
                        >
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-contain p-1.5"
                            />
                          ) : null}
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <Link
                            href={`/produit/${item.slug}`}
                            onClick={closeCart}
                            className="truncate text-sm font-medium text-white hover:text-[#9fd0ff]"
                          >
                            {item.name}
                          </Link>
                          {item.selectedOptions && (
                            <p className="mt-0.5 text-[11px] text-white/40">
                              {Object.entries(item.selectedOptions)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(" · ")}
                            </p>
                          )}
                          <p className="mt-1 text-sm font-semibold text-[var(--lkm-yellow)]">
                            {formatPrice(item.price)}
                          </p>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="inline-flex items-center rounded-lg border border-white/10">
                              <button
                                type="button"
                                className="p-1.5 text-white/70 hover:text-white"
                                onClick={() =>
                                  updateQuantity(key, item.quantity - 1)
                                }
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="min-w-7 text-center text-sm">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                className="p-1.5 text-white/70 hover:text-white"
                                onClick={() =>
                                  updateQuantity(key, item.quantity + 1)
                                }
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(key)}
                              className="text-white/40 hover:text-red-400"
                              aria-label="Retirer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="space-y-3 border-t border-white/8 p-5">
                <div className="flex items-end justify-between">
                  <span className="text-sm text-white/50">
                    {hasUnpriced ? "Sous-total estimé" : "Total"}
                  </span>
                  <span className="font-[family-name:var(--font-display)] text-xl font-bold text-white">
                    {formatPrice(total > 0 ? total : null)}
                  </span>
                </div>
                {hasUnpriced && (
                  <p className="text-xs text-white/40">
                    Certains articles n’ont pas de prix affiché — à confirmer
                    sur WhatsApp.
                  </p>
                )}
                <Button
                  variant="whatsapp"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    window.open(
                      getWhatsAppUrl(buildCartWhatsAppMessage(items)),
                      "_blank",
                      "noopener,noreferrer",
                    );
                  }}
                >
                  Commander sur WhatsApp
                </Button>
                <p className="text-center text-[11px] text-white/35">
                  Vous vérifierez et enverrez le message vous-même. Aucune
                  commande n’est enregistrée automatiquement.
                </p>
                <Link
                  href="/panier"
                  onClick={closeCart}
                  className="block text-center text-sm text-white/55 hover:text-white"
                >
                  Voir le panier complet
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
