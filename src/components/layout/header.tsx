"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildWelcomeWhatsAppMessage,
  getWhatsAppUrl,
} from "@/lib/whatsapp";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { SearchDialog } from "@/components/shop/search-dialog";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/boutique", label: "Boutique" },
  { href: "/promotions", label: "Promotions" },
  { href: "/categories", label: "Catégories" },
  { href: "/reparation", label: "Réparation" },
  { href: "/contact", label: "Contact" },
];

function useHydratedCartCount() {
  return useSyncExternalStore(
    (onStoreChange) => useCart.subscribe(onStoreChange),
    () => useCart.getState().items.reduce((sum, i) => sum + i.quantity, 0),
    () => 0,
  );
}

function PromoCount({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--lkm-yellow)] px-1 text-[10px] font-bold leading-none text-[#1a1400]">
      {count}
    </span>
  );
}

export function Header({ promoCount = 0 }: { promoCount?: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const openCart = useCart((s) => s.openCart);
  const count = useHydratedCartCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    const id = window.requestAnimationFrame(onScroll);
    return () => {
      window.cancelAnimationFrame(id);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function onSearchSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/boutique?q=${encodeURIComponent(q)}` : "/boutique");
    setMobileOpen(false);
  }

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-white/10 bg-[#0a0a0c]/92 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:h-[4.5rem] sm:gap-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5"
            onClick={() => setMobileOpen(false)}
            aria-label="LKM Boutique — Accueil"
          >
            <Image
              src="/logo-lkm.png"
              alt="LKM Boutique"
              width={48}
              height={48}
              className="h-10 w-10 rounded-lg object-cover sm:h-11 sm:w-11"
              priority
            />
            <span className="hidden min-[420px]:block">
              <span className="block text-xs font-semibold leading-none text-white/45">
                Tech & Gaming
              </span>
              <span className="mt-0.5 block text-[11px] leading-none text-white/30">
                Lomé
              </span>
            </span>
          </Link>

          <nav className="ml-1 hidden items-center gap-0.5 lg:flex">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative rounded-lg px-3 py-2 text-sm font-medium transition",
                    active
                      ? "text-white"
                      : "text-white/55 hover:bg-white/5 hover:text-white",
                  )}
                >
                  {link.label}
                  {link.href === "/promotions" ? <PromoCount count={promoCount} /> : null}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-[var(--lkm-blue)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          <form
            onSubmit={onSearchSubmit}
            className="relative ml-auto hidden min-w-0 max-w-xs flex-1 xl:block 2xl:max-w-sm"
          >
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un produit…"
              className="h-10 w-full rounded-full border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[var(--lkm-blue)]/50 focus:bg-white/8 focus:ring-2 focus:ring-[var(--lkm-blue)]/20"
            />
          </form>

          <div className={cn("flex items-center gap-1.5 sm:gap-2", "ml-auto xl:ml-0")}>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white/70 transition hover:bg-white/8 hover:text-white xl:hidden"
              aria-label="Rechercher"
            >
              <Search className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={openCart}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-white/85 transition hover:bg-white/8 hover:text-white"
              aria-label="Ouvrir le panier"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--lkm-yellow)] px-1 text-[10px] font-bold text-[#1a1400]">
                  {count}
                </span>
              )}
            </button>

            <Button
              size="sm"
              variant="whatsapp"
              className="hidden sm:inline-flex"
              onClick={() =>
                window.open(
                  getWhatsAppUrl(buildWelcomeWhatsAppMessage()),
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              WhatsApp
            </Button>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white/85 lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/8 bg-[#0a0a0c]/98 backdrop-blur-xl lg:hidden"
            >
              <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-3 py-3 text-base font-medium text-white/80 hover:bg-white/8"
                  >
                    {link.label}
                    {link.href === "/promotions" ? <PromoCount count={promoCount} /> : null}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    setSearchOpen(true);
                  }}
                  className="rounded-xl px-3 py-3 text-left text-base font-medium text-white/80 hover:bg-white/8"
                >
                  Rechercher
                </button>
                <Button
                  variant="whatsapp"
                  className="mt-2"
                  onClick={() =>
                    window.open(
                      getWhatsAppUrl(buildWelcomeWhatsAppMessage()),
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                >
                  Contacter sur WhatsApp
                </Button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
