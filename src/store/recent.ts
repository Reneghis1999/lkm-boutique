"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Produits vus récemment : gardés seulement sur l’appareil du client
 * (stockage du navigateur), rien n’est envoyé au serveur.
 */
const MAX = 8;

type RecentState = {
  ids: string[];
  add: (id: string) => void;
  clear: () => void;
};

export const useRecent = create<RecentState>()(
  persist(
    (set) => ({
      ids: [],
      add: (id) => set((s) => ({ ids: [id, ...s.ids.filter((x) => x !== id)].slice(0, MAX) })),
      clear: () => set({ ids: [] }),
    }),
    { name: "lkm-recent" },
  ),
);
