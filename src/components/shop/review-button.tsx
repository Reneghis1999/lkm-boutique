import { Star } from "lucide-react";
import { shop } from "@/data/shop";
import { cn } from "@/lib/utils";

/** Lien d’avis Google de la boutique (Léo 2000 si son nom l’indique, sinon Djidjolé, l’atelier). */
export function reviewUrlFor(shopName: string | null | undefined): string | null {
  const n = (shopName ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const id = n.includes("leo") || n.includes("loe") ? "leo-2000" : "djidjole";
  return shop.locations.find((l) => l.id === id)?.reviewUrl ?? null;
}

export function ReviewButton({
  href,
  label = "Laisser un avis Google",
  className,
}: {
  href: string;
  label?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[var(--lkm-yellow)]/50 px-4 py-2 text-sm font-medium text-[var(--lkm-yellow)] transition hover:bg-[var(--lkm-yellow)] hover:text-[#1a1400]",
        className,
      )}
    >
      <Star className="h-4 w-4 fill-current" />
      {label}
    </a>
  );
}
