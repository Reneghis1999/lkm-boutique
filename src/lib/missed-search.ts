"use client";

import { useEffect } from "react";
import { normalizeSearchTerm } from "@/lib/search-term";

const SENT_KEY = "lkm-missed-searches";

function alreadySent(term: string): boolean {
  try {
    const list = JSON.parse(sessionStorage.getItem(SENT_KEY) || "[]") as string[];
    if (list.includes(term)) return true;
    sessionStorage.setItem(SENT_KEY, JSON.stringify([...list, term].slice(-50)));
  } catch {
    // stockage indisponible : on envoie quand même
  }
  return false;
}

/**
 * Recherche sans résultat : quand le client s’arrête d’écrire (2,5 s) et que
 * rien ne correspond, on la note dans Odoo. Une seule fois par mot et par visite.
 */
export function useLogMissedSearch(query: string, noResult: boolean) {
  useEffect(() => {
    const term = normalizeSearchTerm(query);
    if (!noResult || term.replace(/\s/g, "").length < 3) return;
    const timer = window.setTimeout(() => {
      if (alreadySent(term)) return;
      fetch("/api/recherche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: query }),
        keepalive: true,
      }).catch(() => {
        // pas grave : ce n’est qu’une statistique
      });
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [query, noResult]);
}
