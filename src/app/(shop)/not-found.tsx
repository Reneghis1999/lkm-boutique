import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 pt-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
        404
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-white">
        Page introuvable
      </h1>
      <p className="mt-3 max-w-md text-white/50">
        Cette page n’existe pas ou le produit a été retiré du catalogue.
      </p>
      <Link href="/" className={cn(buttonVariants({ className: "mt-8" }))}>
        Retour à l’accueil
      </Link>
    </div>
  );
}
