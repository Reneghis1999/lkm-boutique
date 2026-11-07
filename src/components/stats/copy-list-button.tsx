"use client";

import { useState } from "react";

/** Copie la liste « à commander » pour l’envoyer au fournisseur. */
export function CopyListButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => {
          navigator.clipboard
            ?.writeText(text)
            .then(() => {
              setDone(true);
              window.setTimeout(() => setDone(false), 2000);
            })
            .catch(() => {});
        }}
        className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/85 hover:border-white/40"
      >
        {done ? "Liste copiée ✓" : "Copier la liste"}
      </button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-[#25d366] px-4 py-2 text-sm font-semibold text-[#0b0b0f]"
      >
        Envoyer sur WhatsApp
      </a>
    </div>
  );
}
