"use client";

import { useState } from "react";
import { Check, Link2, MessageCircle, Share2 } from "lucide-react";
import { formatPrice, hasPrice } from "@/lib/format";
import { productUrl } from "@/lib/site";

/** Partager un produit : WhatsApp, Facebook ou copier le lien. */
export function ShareButtons({
  name,
  price,
  slug,
}: {
  name: string;
  price: number | null;
  slug: string;
}) {
  const [copied, setCopied] = useState(false);
  const url = productUrl(slug);
  const text = `${name}${hasPrice(price) ? ` — ${formatPrice(price)}` : ""} chez LKM Boutique (Lomé) :\n${url}`;

  const btn =
    "inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:border-white/40 hover:text-white";

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs text-white/45">
        <Share2 className="h-3.5 w-3.5" />
        Partager
      </span>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btn}
      >
        <MessageCircle className="h-3.5 w-3.5" />
        WhatsApp
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btn}
      >
        Facebook
      </a>
      <button
        type="button"
        className={btn}
        onClick={() => {
          navigator.clipboard
            ?.writeText(url)
            .then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            })
            .catch(() => {});
        }}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
        {copied ? "Lien copié" : "Copier le lien"}
      </button>
    </div>
  );
}
