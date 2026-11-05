import { cn } from "@/lib/utils";

/** Carte Google Maps intégrée (sans clé API), chargée au défilement. */
export function LocationMap({
  query,
  title,
  className,
}: {
  /** Coordonnées « lat,lng » ou adresse à afficher. */
  query: string;
  title: string;
  className?: string;
}) {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=16&hl=fr&output=embed`;
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/10 bg-white/5",
        className,
      )}
    >
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block h-56 w-full border-0 sm:h-64"
        allowFullScreen
      />
    </div>
  );
}
