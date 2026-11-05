import { shop } from "@/data/shop";
import { siteUrl } from "@/lib/site";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function hh(h: number) {
  const whole = Math.floor(h);
  const min = Math.round((h - whole) * 60);
  return `${String(whole).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function openingHours() {
  return shop.hours.weekly.flatMap((slot, day) =>
    slot
      ? [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: DAYS[day],
            opens: hh(slot.opens),
            closes: hh(slot.closes),
          },
        ]
      : [],
  );
}

/**
 * Données structurées (schema.org) : aident Google à afficher LKM Boutique,
 * ses 2 boutiques, téléphones et horaires quand on cherche « LKM Boutique ».
 */
export function BusinessJsonLd() {
  const logo = `${siteUrl}/logo-lkm.png`;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: shop.name,
        alternateName: ["LKM", "LKM Gaming", "lkm.boutique1"],
        url: siteUrl,
        logo,
        sameAs: Object.values(shop.social),
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: shop.name,
        url: siteUrl,
        inLanguage: "fr",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      ...shop.locations.map((loc) => {
        const [lat, lng] = (loc.mapQuery ?? "").split(",").map(Number);
        return {
          "@type": "ElectronicsStore",
          "@id": `${siteUrl}/#${loc.id}`,
          name: `${shop.name} — ${loc.name.replace(/^Boutique\s+/i, "")}`,
          description: loc.description,
          url: `${siteUrl}/contact`,
          image: logo,
          telephone: loc.phone,
          priceRange: "CFA",
          currenciesAccepted: shop.currencyCode,
          parentOrganization: { "@id": `${siteUrl}/#organization` },
          address: {
            "@type": "PostalAddress",
            streetAddress: loc.address,
            addressLocality: "Lomé",
            addressCountry: "TG",
          },
          ...(Number.isFinite(lat) && Number.isFinite(lng)
            ? { geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng } }
            : {}),
          hasMap: loc.mapsUrl,
          openingHoursSpecification: openingHours(),
        };
      }),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
