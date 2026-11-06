"use client";

import { GuaranteeNote } from "@/components/shop/guarantee-note";
import { proPrice } from "@/lib/pro-price";
import { RecentlyViewed } from "@/components/products/recently-viewed";
import { ShareButtons } from "@/components/products/share-buttons";
import { useRecent } from "@/store/recent";
import { StockAlertForm } from "@/components/products/stock-alert-form";
import { findVariant, shopAvailabilityText } from "@/lib/variants";
import { usePro, useProStore } from "@/store/pro";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  const addRecent = useRecent((s) => s.add);
  useEffect(() => {
    addRecent(product.id);
  }, [addRecent, product.id]);
  const [quantity, setQuantity] = useState(1);
  const pro = usePro();
  const proName = useProStore((st) => st.name);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      product.options.forEach((opt) => {
        if (opt.values[0]) initial[opt.name] = opt.values[0];
      });
      return initial;
    },
  );

  // Prix et stock du choix en cours (marque, couleur…), tels que dans Odoo.
  const variant = findVariant(product, selectedOptions);
  const shown: Product = {
    ...product,
    price: variant?.price ?? product.price,
    inStock: variant?.inStock ?? product.inStock,
    availableAt: variant?.availableAt ?? product.availableAt,
  };
  const variantOut = variant?.inStock === false && product.inStock !== false;
  const isOut = (name: string, value: string) =>
    findVariant(product, { ...selectedOptions, [name]: value })?.inStock === false;

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
              hasPrice(shown.price)
                ? "text-[var(--lkm-yellow)]"
                : "text-white/45",
            )}
          >
            {formatPrice(pro ? proPrice(shown.price) : shown.price)}
            {pro && hasPrice(shown.price) ? (
              <span className="ml-3 rounded-md bg-[var(--lkm-blue)] px-2 py-1 align-middle text-xs font-bold uppercase text-white">
                Prix pro
              </span>
            ) : null}
          </p>
          {pro && hasPrice(shown.price) ? (
            <p className="mt-1 text-sm text-white/40 line-through">
              {formatPrice(shown.price)}
            </p>
          ) : null}
          {product.compareAtPrice &&
          shown.price &&
          product.compareAtPrice > shown.price ? (
            <p className="mt-1 flex items-center gap-2 text-sm">
              <span className="text-white/40 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
              <span className="rounded-md bg-[#e5322d] px-2 py-0.5 text-xs font-bold text-white">
                -{Math.round((1 - shown.price / product.compareAtPrice) * 100)}%
              </span>
            </p>
          ) : product.promo ? (
            <p className="mt-1">
              <span className="rounded-md bg-[#e5322d] px-2 py-0.5 text-xs font-bold text-white">
                Promo
              </span>
            </p>
          ) : null}
          <ShareButtons name={product.name} price={shown.price} slug={product.slug} />

          <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                shown.inStock === false ? "bg-[#e5322d]" : "bg-[#3ddc8a]",
              )}
            />
            <span className={shown.inStock === false ? "text-red-300" : "text-[#3ddc8a]"}>
              {variantOut
                ? "Ce choix est en rupture — choisissez-en un autre ou demandez sur WhatsApp"
                : shown.inStock === false
                ? "Rupture de stock — demandez quand il revient sur WhatsApp"
                : shown.availableAt?.length
                  ? shopAvailabilityText(shown.availableAt)
                  : hasPrice(shown.price)
                    ? "Disponible"
                    : "Sur demande"}
            </span>
          </p>

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
                    <span className={cn(isOut(opt.name, value) && "line-through opacity-50")}>
                      {value}
                    </span>
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
              disabled={shown.inStock === false}
              onClick={() =>
                addItem(
                  shown,
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
                    shown.inStock === false
                      ? `Bonjour LKM Boutique,\n\nLe produit « ${product.name}${Object.keys(selectedOptions).length ? ` (${Object.values(selectedOptions).join(", ")})` : ""} » est en rupture sur le site. Pouvez-vous me prévenir quand il sera disponible ?\n\nMerci !`
                      : buildProductWhatsAppMessage(
                      shown,
                      quantity,
                      Object.keys(selectedOptions).length
                        ? selectedOptions
                        : undefined,
                      pro ? { name: proName } : undefined,
                    ),
                  ),
                  "_blank",
                  "noopener,noreferrer",
                );
              }}
            >
              <MessageCircle className="h-4 w-4" />
              {shown.inStock === false ? "Demander sur WhatsApp" : "Commander WhatsApp"}
            </Button>
          </div>

          <Button
            variant="outline"
            className="mt-3"
            onClick={() =>
              addItem(
                shown,
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
          <GuaranteeNote className="mt-3" />

          {shown.inStock === false && (
            <StockAlertForm
              key={JSON.stringify(selectedOptions)}
              product={product.name}
              slug={product.slug}
              options={Object.keys(selectedOptions).length ? selectedOptions : undefined}
            />
          )}
        </motion.div>
      </div>

      <RecentlyViewed excludeId={product.id} className="mt-20" />

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
