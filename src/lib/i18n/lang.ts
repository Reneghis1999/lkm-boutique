"use client";

import { useSyncExternalStore } from "react";

export type Lang = "fr" | "en";
export const LANG_COOKIE = "lkm_lang";

export function getLang(): Lang {
  if (typeof document === "undefined") return "fr";
  return /(?:^|;\s*)lkm_lang=en\b/.test(document.cookie) ? "en" : "fr";
}

/** Change la langue (cookie d’un an) puis recharge la page. */
export function setLang(lang: Lang) {
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
  window.location.reload();
}

/** Langue choisie par le visiteur (« fr » côté serveur). */
export function useLang(): Lang {
  return useSyncExternalStore(
    () => () => {},
    getLang,
    () => "fr",
  );
}
