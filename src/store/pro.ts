"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { PRO_UI_COOKIE, proPrice } from "@/lib/pro-price";

type ProState = {
  pro: boolean;
  name: string | null;
  checked: boolean;
  set: (pro: boolean, name: string | null) => void;
};

export const useProStore = create<ProState>((set) => ({
  pro: false,
  name: null,
  checked: false,
  set: (pro, name) => set({ pro, name, checked: true }),
}));

let started = false;

/** Vérifie une fois la session pro auprès du serveur (si le cookie d’affichage existe). */
export function useProSync() {
  const setPro = useProStore((s) => s.set);
  useEffect(() => {
    if (started) return;
    started = true;
    const hasUiCookie = document.cookie
      .split(";")
      .some((c) => c.trim().startsWith(`${PRO_UI_COOKIE}=`));
    if (!hasUiCookie) {
      setPro(false, null);
      return;
    }
    fetch("/api/pro", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { pro?: boolean; name?: string | null }) =>
        setPro(Boolean(d.pro), d.name ?? null),
      )
      .catch(() => setPro(false, null));
  }, [setPro]);
}

/** Mode réparateur actif ? */
export function usePro() {
  useProSync();
  return useProStore((s) => s.pro);
}

/** Prix à afficher selon le mode (client ou réparateur). */
export function useDisplayPrice() {
  const pro = usePro();
  return (price: number | null | undefined) =>
    pro ? proPrice(price) : typeof price === "number" ? price : null;
}
