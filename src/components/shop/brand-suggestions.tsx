"use client";

import type { Suggestion } from "@/lib/search-suggest";

/** Boutons « Batterie iPhone », « Manette PS5 »… proposés pendant la saisie. */
export function BrandSuggestions({
  items,
  onPick,
  className = "",
}: {
  items: Suggestion[];
  onPick: (s: Suggestion) => void;
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((s) => (
        <button
          key={s.label}
          type="button"
          onClick={() => onPick(s)}
          className="rounded-full border border-[var(--lkm-blue)]/40 bg-[var(--lkm-blue)]/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[var(--lkm-blue)]/25"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
