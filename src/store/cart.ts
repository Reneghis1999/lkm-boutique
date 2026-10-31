"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (
    product: Product,
    quantity?: number,
    selectedOptions?: Record<string, string>,
  ) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  /** Met à jour prix / nom / photo avec les données actuelles du catalogue. */
  refreshItems: (
    fresh: Pick<CartItem, "productId" | "slug" | "name" | "price" | "image">[],
  ) => void;
}

function itemKey(item: Pick<CartItem, "productId" | "selectedOptions">) {
  const opts = item.selectedOptions
    ? Object.entries(item.selectedOptions)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${v}`)
        .join("|")
    : "";
  return `${item.productId}::${opts}`;
}

export function getCartItemKey(item: CartItem) {
  return itemKey(item);
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      addItem: (product, quantity = 1, selectedOptions) => {
        const incoming: CartItem = {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
          selectedOptions,
        };
        const key = itemKey(incoming);
        const existing = get().items.find((i) => itemKey(i) === key);

        if (existing) {
          set({
            items: get().items.map((i) =>
              itemKey(i) === key
                ? { ...i, quantity: i.quantity + quantity }
                : i,
            ),
            isOpen: true,
          });
        } else {
          set({ items: [...get().items, incoming], isOpen: true });
        }
      },
      removeItem: (key) =>
        set({ items: get().items.filter((i) => itemKey(i) !== key) }),
      updateQuantity: (key, quantity) => {
        if (quantity <= 0) {
          get().removeItem(key);
          return;
        }
        set({
          items: get().items.map((i) =>
            itemKey(i) === key ? { ...i, quantity } : i,
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      refreshItems: (fresh) => {
        const byId = new Map(fresh.map((f) => [f.productId, f]));
        let changed = false;
        const items = get().items.map((item) => {
          const f = byId.get(item.productId);
          if (
            !f ||
            (f.price === item.price &&
              f.name === item.name &&
              f.image === item.image &&
              f.slug === item.slug)
          ) {
            return item;
          }
          changed = true;
          return {
            ...item,
            slug: f.slug,
            name: f.name,
            price: f.price,
            image: f.image,
          };
        });
        if (changed) set({ items });
      },
    }),
    { name: "lkm-cart" },
  ),
);

export function useCartCount() {
  return useCart((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
}

export function useCartTotal() {
  return useCart((s) =>
    s.items.reduce((sum, i) => {
      if (i.price == null) return sum;
      return sum + i.price * i.quantity;
    }, 0),
  );
}

/**
 * Aligne le panier sur le catalogue actuel (ex. prix modifié dans Odoo après
 * l’ajout au panier) pour que le message WhatsApp parte avec le bon prix.
 */
export function useSyncCartWithCatalog(enabled = true) {
  const ids = useCart((s) =>
    [...new Set(s.items.map((i) => i.productId))].sort().join(","),
  );
  const refreshItems = useCart((s) => s.refreshItems);

  useEffect(() => {
    if (!enabled || !ids) return;
    const controller = new AbortController();
    fetch(`/api/catalog?ids=${encodeURIComponent(ids)}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (
          rows:
            | {
                id: string;
                slug: string;
                name: string;
                price: number | null;
                image: string | null;
              }[]
            | null,
        ) => {
          if (!Array.isArray(rows)) return;
          refreshItems(
            rows.map((r) => ({
              productId: r.id,
              slug: r.slug,
              name: r.name,
              price: r.price,
              image: r.image,
            })),
          );
        },
      )
      .catch(() => {
        // hors ligne / requête annulée : on garde le panier tel quel
      });
    return () => controller.abort();
  }, [enabled, ids, refreshItems]);
}
