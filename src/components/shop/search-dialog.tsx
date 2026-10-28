"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types";

export function SearchDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setQuery("");
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const url = query.trim()
        ? `/api/catalog?q=${encodeURIComponent(query.trim())}`
        : "/api/catalog?featured=1";
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) return;
        const data = (await res.json()) as Product[];
        setResults(data);
      } catch {
        /* aborted */
      }
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [open, query]);

  function closeSearch() {
    setQuery("");
    onClose();
  }

  function goToBoutique(q: string) {
    setQuery("");
    onClose();
    router.push(q ? `/boutique?q=${encodeURIComponent(q)}` : "/boutique");
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-start justify-center bg-black/70 px-4 pt-24 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeSearch}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#121216] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <Search className="h-4 w-4 text-white/40" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") goToBoutique(query.trim());
                }}
                placeholder="Rechercher un produit…"
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
              />
              <button
                type="button"
                onClick={closeSearch}
                className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-white/40">
                  Aucun résultat
                </p>
              ) : (
                results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/produit/${product.slug}`}
                    onClick={closeSearch}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5"
                  >
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-black/30">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-1"
                          sizes="48px"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {product.name}
                      </p>
                      <p className="text-xs text-white/45">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
            <button
              type="button"
              onClick={() => goToBoutique(query.trim())}
              className="w-full border-t border-white/10 px-4 py-3 text-left text-sm text-[var(--lkm-blue)] hover:bg-white/[0.03]"
            >
              Voir tous les résultats dans la boutique →
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
