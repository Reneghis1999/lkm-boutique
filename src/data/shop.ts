import type { ShopInfo } from "@/types";

export const shop: ShopInfo = {
  name: "LKM Boutique",
  tagline: "Votre destination Tech & Gaming à Lomé",
  description:
    "Vente de smartphones, PC, accessoires, pièces de rechange, consoles PlayStation & Xbox et disques de jeux. Service professionnel de réparation informatique & mobile.",
  currency: "CFA",
  currencyCode: "XOF",
  phones: ["+228 90 00 25 91", "+228 90 16 22 16"],
  /** Numéro WhatsApp officiel (sans + ni espaces) — facilement remplaçable */
  whatsapp: "22890002591",
  /** Horaires d’ouverture des boutiques (heure de Lomé). */
  hours: {
    timeZone: "Africa/Lome",
    weekly: [
      { opens: 10, closes: 20 }, // dimanche
      { opens: 8, closes: 21 }, // lundi
      { opens: 8, closes: 21 }, // mardi
      { opens: 8, closes: 21 }, // mercredi
      { opens: 8, closes: 21 }, // jeudi
      { opens: 8, closes: 21 }, // vendredi
      { opens: 8, closes: 21 }, // samedi
    ],
  },
  social: {
    instagram: "https://www.instagram.com/lkm.boutique1/",
    tiktok: "https://www.tiktok.com/@lkm.boutique1",
  },
  locations: [
    {
      id: "leo-2000",
      name: "Boutique Léo 2000",
      address: "En face de la clinique de Léo 2000, Lomé",
      description: "Point de vente — testez et achetez sur place",
      phone: "+228 90 00 25 91",
      mapsUrl:
        "https://www.google.com/maps/dir/?api=1&destination=6.2138385,1.1742867",
      accent: "blue",
    },
    {
      id: "djidjole",
      name: "Boutique Djidjolé",
      address: "Quartier Djidjolé, Lomé",
      description: "Service réparation & stock",
      phone: "+228 90 16 22 16",
      mapsUrl: "https://www.google.com/maps?q=Djidjol%C3%A9,+Lom%C3%A9",
      accent: "green",
    },
  ],
};
