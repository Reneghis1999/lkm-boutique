"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice, hasPrice } from "@/lib/format";
import { proPrice } from "@/lib/pro-price";
import { usePro } from "@/store/pro";
import { useRecent } from "@/store/recent";

type Item = { id: string; slug: string; name: string; price: number | null; image: string | null };

/** Rangée « Vus récemment » (rien ne s’affiche si la liste est vide). */
export function RecentlyViewed({ excludeId, className }: { excludeId?: string; className?: string }) {
  const ids = useRecent((s) => s.ids);
  const clear = useRecent((s) => s.clear);
  const pro = usePro();
  const [items, setItems] = useState<Item[]>([]);
  const wanted = ids.filter((id) => id !== excludeId);
  const key = wanted.join(",");

  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    fetch(`/api/catalog?ids=${encodeURIComponent(key)}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: Item[]) => {
        const byId = new Map(rows.map((r) => [r.id, r]));
        setItems(key.split(",").map((id) => byId.get(id)).filter((x): x is Item => !!x));
      })
      .catch(() => {
        // hors ligne : on n’affiche rien
      });
    return () => controller.abort();
  }, [key]);

  if (!key || items.length === 0) return null;

  return (
    <section className={className}>
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white">
          Vus récemment
        </h2>
        <button
          type="button"
          onClick={() => {
            clear();
            setItems([]);
          }}
          className="text-sm text-white/45 underline-offset-4 hover:text-white hover:underline"
        >
          Effacer
        </button>
      </div>
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {items.map((p) => (
          <Link
            key={p.id}
            href={`/produit/${p.slug}`}
            className="w-36 shrink-0 snap-start rounded-2xl border border-white/10 bg-[var(--lkm-surface)] p-3 transition hover:border-white/30 sm:w-44"
          >
            <div className="relative aspect-square overflow-hidden rounded-xl bg-white">
              {p.image ? (
                <Image src={p.image} alt={p.name} fill sizes="176px" className="object-contain p-2" />
              ) : null}
            </div>
            <p className="mt-2 line-clamp-2 text-xs font-medium text-white/85">{p.name}</p>
            <p
              className={
                hasPrice(p.price)
                  ? "mt-1 text-sm font-bold text-[var(--lkm-yellow)]"
                  : "mt-1 text-sm text-white/45"
              }
            >
              {formatPrice(pro ? proPrice(p.price) : p.price)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
