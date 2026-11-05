"use client";

import { useState } from "react";
import { Store, Truck } from "lucide-react";
import { shop } from "@/data/shop";
import type { DeliveryInfo } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/** État du choix « retrait en boutique / livraison » d’un panier. */
export function useDeliveryChoice() {
  const [mode, setMode] = useState<"pickup" | "delivery">("pickup");
  const [shopName, setShopName] = useState(shop.locations[0]?.name ?? "");
  const [area, setArea] = useState("");
  const delivery: DeliveryInfo =
    mode === "pickup" ? { mode, shop: shopName } : { mode, area };
  return { mode, setMode, shopName, setShopName, area, setArea, delivery };
}

type Props = ReturnType<typeof useDeliveryChoice>;

/** Choix du mode de réception, ajouté au message WhatsApp de la commande. */
export function DeliveryChoice({
  mode,
  setMode,
  shopName,
  setShopName,
  area,
  setArea,
}: Props) {
  const option =
    "flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors";
  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 text-sm text-white/50">Réception</legend>
      <div className="flex gap-2">
        <button
          type="button"
          aria-pressed={mode === "pickup"}
          onClick={() => setMode("pickup")}
          className={cn(
            option,
            mode === "pickup"
              ? "border-[var(--lkm-yellow)] bg-[var(--lkm-yellow)]/10 text-white"
              : "border-white/10 text-white/60 hover:text-white",
          )}
        >
          <Store className="h-4 w-4" /> Retrait en boutique
        </button>
        <button
          type="button"
          aria-pressed={mode === "delivery"}
          onClick={() => setMode("delivery")}
          className={cn(
            option,
            mode === "delivery"
              ? "border-[var(--lkm-yellow)] bg-[var(--lkm-yellow)]/10 text-white"
              : "border-white/10 text-white/60 hover:text-white",
          )}
        >
          <Truck className="h-4 w-4" /> Livraison à Lomé
        </button>
      </div>

      {mode === "pickup" ? (
        <label className="block">
          <span className="sr-only">Boutique</span>
          <select
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0b0b0f] px-3 py-2.5 text-sm text-white"
          >
            {shop.locations.map((loc) => (
              <option key={loc.id} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <div className="space-y-1.5">
          <label className="block">
            <span className="sr-only">Quartier ou adresse de livraison</span>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Votre quartier ou adresse à Lomé"
              className="w-full rounded-xl border border-white/10 bg-[#0b0b0f] px-3 py-2.5 text-sm text-white placeholder:text-white/35"
            />
          </label>
          <p className="text-xs text-white/40">
            Frais de livraison selon la distance.
          </p>
        </div>
      )}
    </fieldset>
  );
}
