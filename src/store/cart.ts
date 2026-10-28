"use client";

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
