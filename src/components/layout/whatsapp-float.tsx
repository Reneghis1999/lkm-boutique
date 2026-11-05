import {
  buildWelcomeWhatsAppMessage,
  getWhatsAppUrl,
} from "@/lib/whatsapp";

/**
 * Bouton WhatsApp flottant (bas à droite), visible sur toutes les pages
 * de la boutique : un clic ouvre la discussion avec LKM Boutique.
 */
export function WhatsAppFloat() {
  return (
    <a
      href={getWhatsAppUrl(buildWelcomeWhatsAppMessage())}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Écrire à LKM Boutique sur WhatsApp"
      className="group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-6px_rgba(37,211,102,0.55)] ring-1 ring-black/10 transition-transform duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 motion-safe:animate-ping [animation-duration:2.4s]"
      />
      <svg
        viewBox="0 0 32 32"
        aria-hidden
        className="relative h-7 w-7 sm:h-8 sm:w-8"
        fill="currentColor"
      >
        <path d="M16.004 3.2C8.94 3.2 3.2 8.94 3.2 16c0 2.26.6 4.47 1.73 6.41L3.1 28.8l6.56-1.72A12.77 12.77 0 0 0 16 28.8h.004C23.06 28.8 28.8 23.06 28.8 16S23.064 3.2 16.004 3.2Zm0 23.44h-.003a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-3.89 1.02 1.04-3.79-.25-.39A10.6 10.6 0 0 1 5.36 16c0-5.87 4.78-10.64 10.65-10.64 2.84 0 5.51 1.11 7.52 3.12a10.57 10.57 0 0 1 3.11 7.53c0 5.87-4.77 10.63-10.64 10.63Zm5.84-7.97c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1.01 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.89-1.78-2.21-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66s1.15 3.09 1.31 3.3c.16.21 2.26 3.45 5.47 4.84.76.33 1.36.53 1.83.68.77.24 1.47.21 2.02.13.62-.09 1.89-.77 2.16-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z" />
      </svg>
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-[#0b0b0f]/90 px-3 py-1.5 text-sm font-medium text-white opacity-0 ring-1 ring-white/15 transition-opacity duration-200 group-hover:opacity-100 sm:block">
        Commander sur WhatsApp
      </span>
    </a>
  );
}
