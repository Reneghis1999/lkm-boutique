"use client";

/** Envoie un événement de statistique sans ralentir la page. */
export function sendTrack(data: Record<string, string | undefined>) {
  try {
    const body = JSON.stringify(data);
    if (navigator.sendBeacon?.("/api/track", new Blob([body], { type: "text/plain" }))) return;
    void fetch("/api/track", { method: "POST", body, keepalive: true });
  } catch {
    // statistique seulement : on ignore les erreurs
  }
}

/** D’après le message WhatsApp, d’où vient la commande. */
export function whatsappSource(url: string): string {
  let text = "";
  try {
    text = new URL(url).searchParams.get("text") ?? "";
  } catch {
    // lien sans message
  }
  if (/commander les articles suivants/i.test(text)) return "Panier";
  if (/souhaite commander/i.test(text)) return "Fiche produit";
  if (/en rupture/i.test(text)) return "Rupture";
  if (/réparation|reparation|devis/i.test(text)) return "Réparation";
  if (/vendre|échanger mon téléphone|echanger/i.test(text)) return "Rachat";
  if (/réparateur|code pro/i.test(text)) return "Pro";
  return "Contact";
}

export function trackWhatsApp(url: string) {
  const source = whatsappSource(url);
  const m = window.location.pathname.match(/^\/produit\/([a-z0-9-]+)/);
  sendTrack({ type: "whatsapp", source, slug: m?.[1] });
}
