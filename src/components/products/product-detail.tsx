"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Plus, ShoppingBag } from "lucide-react";
import { ProductCard, ProductGrid } from "@/components/products/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, hasPrice } from "@/lib/format";
import { buildProductWhatsAppMessage, getWhatsAppUrl } from "@/lib/whatsapp";
import { useCart } from "@/store/cart";
import type { Category, Product } from "@/types";
import { cn } from "@/lib/utils";

export function ProductDetail({
  product,
  categories,
  related,
}: {
  product: Product;
  categories: Category[];
  related: Product[];
}) {
  const addItem = useCart((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      product.options.forEach((opt) => {
        if (opt.values[0]) initial[opt.name] = opt.values[0];
      });
      return initial;
    },
  );

  const cats = useMemo(
    () => categories.filter((c) => product.categorySlugs.includes(c.slug)),
    [categories, product.categorySlugs],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-8 text-sm text-white/40">
        <Link href="/boutique" className="hover:text-white">
          Boutique
        </Link>
        {cats[0] && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/categorie/${cats[0].slug}`}
              className="hover:text-white"
            >
              {cats[0].name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-white/70">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative aspect-square overflow-hidden rounded-3xl border border-white/8 bg-[var(--lkm-surface)]"
        >
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-contain p-8"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-white/30">
              Image indisponible
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col"
        >
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <Badge key={c.slug} variant={c.accent}>
                {c.name}
              </Badge>
            ))}
          </div>

          <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {product.name}
          </h1>

          <p
            className={cn(
              "mt-4 font-[family-name:var(--font-display)] text-3xl font-bold",
              hasPrice(product.price)
                ? "text-[var(--lkm-yellow)]"
                : "text-white/45",
            )}
          >
            {formatPrice(product.price)}
          </p>
          {product.compareAtPrice &&
          product.price &&
          product.compareAtPrice > product.price ? (
            <p className="mt-1 flex items-center gap-2 text-sm">
              <span className="text-white/40 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
              <span className="rounded-md bg-[#e5322d] px-2 py-0.5 text-xs font-bold text-white">
                -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
              </span>
            </p>
          ) : product.promo ? (
            <p className="mt-1">
              <span className="rounded-md bg-[#e5322d] px-2 py-0.5 text-xs font-bold text-white">
                Promo
              </span>
            </p>
          ) : null}

          {product.description ? (
            <p className="mt-5 text-base leading-relaxed text-white/55">
              {product.description}
            </p>
          ) : (
            <p className="mt-5 text-base leading-relaxed text-white/45">
              Produit disponible chez LKM Boutique. Passez en magasin pour
              tester, ou commandez via WhatsApp.
            </p>
          )}

          {product.options.map((opt) => (
            <div key={opt.name} className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                {opt.name}
              </p>
              <div className="flex flex-wrap gap-2">
                {opt.values.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setSelectedOptions((prev) => ({
                        ...prev,
                        [opt.name]: value,
                      }))
                    }
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm transition",
                      selectedOptions[opt.name] === value
                        ? "border-white bg-white text-[#0a0a0c]"
                        : "border-white/15 text-white/70 hover:border-white/30",
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {product.specs.length > 0 && (
            <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                Caractéristiques
              </p>
              <dl className="space-y-2">
                {product.specs.map((spec, i) => (
                  <div
                    key={`${spec.name}-${spec.value}-${i}`}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <dt className="text-white/45">{spec.name}</dt>
                    <dd className="text-right text-white/85">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-8 flex items-center gap-3">
            <div className="inline-flex items-center rounded-xl border border-white/10">
              <button
                type="button"
                className="px-3 py-2.5 text-white/70 hover:text-white"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="min-w-8 text-center text-sm font-semibold">
                {quantity}
              </span>
              <button
                type="button"
                className="px-3 py-2.5 text-white/70 hover:text-white"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="flex-1"
              onClick={() =>
                addItem(
                  product,
                  quantity,
                  Object.keys(selectedOptions).length
                    ? selectedOptions
                    : undefined,
                )
              }
            >
              <ShoppingBag className="h-4 w-4" />
              Ajouter au panier
            </Button>
            <Button
              size="lg"
              variant="whatsapp"
              className="flex-1"
              onClick={() => {
                window.open(
                  getWhatsAppUrl(
                    buildProductWhatsAppMessage(
                      product,
                      quantity,
                      Object.keys(selectedOptions).length
                        ? selectedOptions
                        : undefined,
                    ),
                  ),
                  "_blank",
                  "noopener,noreferrer",
                );
              }}
            >
              <MessageCircle className="h-4 w-4" />
              Commander WhatsApp
            </Button>
          </div>

          <Button
            variant="outline"
            className="mt-3"
            onClick={() =>
              addItem(
                product,
                1,
                Object.keys(selectedOptions).length
                  ? selectedOptions
                  : undefined,
              )
            }
          >
            <Plus className="h-4 w-4" />
            Ajouter rapidement ×1
          </Button>
        </motion.div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 font-[family-name:var(--font-display)] text-2xl font-bold text-white">
            Vous aimerez aussi
          </h2>
          <ProductGrid>
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </ProductGrid>
        </section>
      )}
    </div>
  );
}
