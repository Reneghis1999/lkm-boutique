"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatPrice, hasPrice } from "@/lib/format";
import { buildCartWhatsAppMessage, getWhatsAppUrl } from "@/lib/whatsapp";
import {
  getCartItemKey,
  useCart,
  useCartCount,
  useCartTotal,
} from "@/store/cart";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const count = useCartCount();
  const total = useCartTotal();
  const hasUnpriced = items.some((i) => !hasPrice(i.price));

  return (
    <div className="pt-20">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white sm:text-4xl">
          Panier
        </h1>
        <p className="mt-2 text-white/45">
          {count} article{count > 1 ? "s" : ""} — commande via WhatsApp
        </p>

        {items.length === 0 ? (
          <div className="mt-12 flex flex-col items-center rounded-2xl border border-white/8 bg-[var(--lkm-surface)] px-6 py-16 text-center">
            <ShoppingBag className="h-10 w-10 text-white/20" />
            <p className="mt-4 text-white/50">Votre panier est vide</p>
            <Link
              href="/boutique"
              className={cn(buttonVariants({ className: "mt-6" }))}
            >
              Parcourir la boutique
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-8 space-y-4">
              {items.map((item) => {
                const key = getCartItemKey(item);
                return (
                  <li
                    key={key}
                    className="flex gap-4 rounded-2xl border border-white/8 bg-[var(--lkm-surface)] p-4"
                  >
                    <Link
                      href={`/produit/${item.slug}`}
                      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-black/40"
                    >
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain p-2"
                        />
                      )}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <Link
                        href={`/produit/${item.slug}`}
                        className="font-medium text-white hover:text-[#9fd0ff]"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-sm text-[var(--lkm-yellow)]">
                        {formatPrice(item.price)}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="inline-flex items-center rounded-lg border border-white/10">
                          <button
                            type="button"
                            className="p-2 text-white/70"
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
                            className="p-2 text-white/70"
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
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 space-y-4 rounded-2xl border border-white/8 bg-[var(--lkm-surface)] p-6">
              <div className="flex justify-between">
                <span className="text-white/50">
                  {hasUnpriced ? "Sous-total estimé" : "Total"}
                </span>
                <span className="font-[family-name:var(--font-display)] text-2xl font-bold">
                  {formatPrice(total > 0 ? total : null)}
                </span>
              </div>
              {hasUnpriced && (
                <p className="text-xs text-white/40">
                  Certains articles n’ont pas de prix — à confirmer sur
                  WhatsApp.
                </p>
              )}
              <Button
                variant="whatsapp"
                size="lg"
                className="w-full"
                onClick={() =>
                  window.open(
                    getWhatsAppUrl(buildCartWhatsAppMessage(items)),
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              >
                Commander sur WhatsApp
              </Button>
              <p className="text-center text-[11px] text-white/35">
                Vérifiez le message prérempli puis envoyez-le vous-même. Aucune
                commande n’est confirmée automatiquement.
              </p>
              <button
                type="button"
                onClick={clearCart}
                className="w-full text-center text-sm text-white/40 hover:text-white"
              >
                Vider le panier
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
