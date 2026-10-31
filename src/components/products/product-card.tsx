"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, ShoppingBag } from "lucide-react";
import { formatPrice, hasPrice } from "@/lib/format";
import { useCart } from "@/store/cart";
import { useToast } from "@/store/toast";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const addItem = useCart((s) => s.addItem);
  const pushToast = useToast((s) => s.push);
  const available = hasPrice(product.price);
  const discount =
    product.compareAtPrice && product.price && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.24) }}
      className="group flex h-full flex-col rounded-[1.35rem] bg-[var(--lkm-cream)] p-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(0,0,0,0.32)] sm:rounded-[1.5rem] sm:p-3"
    >
      <Link
        href={`/produit/${product.slug}`}
        className="relative aspect-[4/3] overflow-hidden rounded-[1.1rem] bg-[#ebe6db] sm:rounded-[1.25rem]"
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
            className="object-contain p-4 transition duration-500 group-hover:scale-[1.04] sm:p-5"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 px-4 text-center">
            <span className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-[#1a1410]/20">
              LKM
            </span>
            <span className="text-xs text-[#1a1410]/35">Photo à venir</span>
          </div>
        )}

        <span className="absolute left-2.5 top-2.5 rounded-md bg-[var(--lkm-yellow)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#1a1400] shadow-sm sm:left-3 sm:top-3 sm:text-[11px]">
          En boutique
        </span>
        {product.promo || discount ? (
          <span className="absolute right-2.5 top-2.5 rounded-md bg-[#e5322d] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-white shadow-sm sm:right-3 sm:top-3 sm:text-[11px]">
            {discount ? `Promo -${discount}%` : "Promo"}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col px-1.5 pb-1.5 pt-3 sm:px-2 sm:pt-3.5">
        <Link href={`/produit/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-[2.6em] text-[15px] font-bold leading-snug tracking-tight text-[#14110e] transition group-hover:text-[#003d73] sm:text-base">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p
            className={cn(
              "font-[family-name:var(--font-display)] text-base font-bold tracking-tight sm:text-lg",
              available ? "text-[#0b5ea8]" : "text-[#1a1410]/45",
            )}
          >
            {formatPrice(product.price)}
            {discount ? (
              <span className="ml-2 text-xs font-medium text-[#1a1410]/45 line-through sm:text-sm">
                {formatPrice(product.compareAtPrice)}
              </span>
            ) : null}
          </p>
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5c6570] sm:text-[13px]">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                available ? "bg-[var(--lkm-blue)]" : "bg-[#9aa3ad]",
              )}
            />
            {available ? "Disponible" : "Sur demande"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            addItem(product);
            pushToast(`${product.name} ajouté au panier`, "success");
          }}
          className="mt-3.5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#0b3d6e] text-[13px] font-semibold text-white transition hover:bg-[#0a4f8c] active:scale-[0.98] sm:mt-4 sm:h-12 sm:text-sm"
          aria-label={`Ajouter ${product.name} au panier`}
        >
          <ShoppingBag className="h-4 w-4" />
          <span className="sm:hidden">Ajouter</span>
          <span className="hidden sm:inline">Ajouter au panier</span>
        </button>

        <Link
          href={`/produit/${product.slug}`}
          className="mt-2.5 inline-flex items-center justify-center gap-1.5 py-1 text-xs font-medium text-[#6b7280] transition hover:text-[#0b3d6e] sm:mt-3 sm:text-[13px]"
        >
          <Eye className="h-3.5 w-3.5" />
          Voir la fiche
        </Link>
      </div>
    </motion.article>
  );
}

export function ProductGrid({
  children,
  dense = false,
}: {
  children: ReactNode;
  dense?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5",
        dense ? "xl:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4",
      )}
    >
      {children}
    </div>
  );
}
