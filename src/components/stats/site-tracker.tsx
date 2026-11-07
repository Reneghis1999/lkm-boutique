"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { sendTrack, trackWhatsApp } from "@/lib/track-client";

function visitorId() {
  try {
    let id = localStorage.getItem("lkm_vid");
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("lkm_vid", id);
    }
    return id;
  } catch {
    return "anonyme";
  }
}

const isWa = (u: unknown) => typeof u === "string" && /(^|\/\/)(wa\.me|api\.whatsapp\.com)\//.test(u);

/** Compte les pages vues, les fiches produit et les clics WhatsApp. */
export function SiteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/tableau")) return;
    sendTrack({ type: "view", vid: visitorId() });
    const m = pathname.match(/^\/produit\/([a-z0-9-]+)/);
    if (m) sendTrack({ type: "product", slug: m[1] });
  }, [pathname]);

  useEffect(() => {
    // Liens WhatsApp cliqués
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a");
      if (a && isWa(a.href)) trackWhatsApp(a.href);
    };
    document.addEventListener("click", onClick, true);
    // WhatsApp ouvert par un bouton (window.open)
    const original = window.open;
    window.open = function (url?: string | URL, ...rest) {
      const u = url?.toString();
      if (isWa(u)) trackWhatsApp(u!);
      return original.call(window, url, ...rest);
    } as typeof window.open;
    return () => {
      document.removeEventListener("click", onClick, true);
      window.open = original;
    };
  }, []);

  return null;
}
