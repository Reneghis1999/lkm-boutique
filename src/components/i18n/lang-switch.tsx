"use client";

import { setLang, useLang } from "@/lib/i18n/lang";
import { cn } from "@/lib/utils";

/** Bouton FR / EN. */
export function LangSwitch({ className }: { className?: string }) {
  const lang = useLang();
  return (
    <div
      data-no-translate
      className={cn("inline-flex rounded-full border border-white/15 p-0.5 text-xs font-semibold", className)}
      role="group"
      aria-label="Langue / Language"
    >
      {(["fr", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          onClick={() => lang !== l && setLang(l)}
          className={cn(
            "rounded-full px-2.5 py-1 uppercase transition",
            lang === l ? "bg-white text-[#0b0b0f]" : "text-white/60 hover:text-white",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
