import { shop } from "@/data/shop";
import type { ShopLocation } from "@/types";

/** Société Odoo (une par boutique : « LKM Boutique Leo 2000 », « … Djidjole »). */
export type OdooCompany = {
  id: number;
  name?: string;
  phone?: string | false;
  email?: string | false;
  street?: string | false;
  street2?: string | false;
  city?: string | false;
};

export type ShopContacts = {
  locations: ShopLocation[];
  phones: string[];
  /** Champs effectivement repris d’Odoo (pour le diagnostic). */
  fromOdoo: string[];
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function text(value: string | false | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Coordonnées affichées : celles des sociétés Odoo quand elles sont remplies
 * (téléphone, adresse), sinon celles du site. Chaque boutique du site est
 * reliée à la société Odoo dont le nom contient son identifiant
 * (« leo », « djidjole »).
 */
export function mergeShopContacts(companies: OdooCompany[] | null | undefined): ShopContacts {
  const fromOdoo: string[] = [];
  const odooPhones: string[] = [];

  const locations = shop.locations.map((loc) => {
    const key = normalize(loc.id.split("-")[0]);
    const company = (companies ?? []).find((c) => normalize(c.name || "").includes(key));
    if (!company) return loc;

    const phone = text(company.phone);
    const street = [text(company.street), text(company.street2)].filter(Boolean).join(", ");
    const city = text(company.city);
    const address = street ? [street, city].filter(Boolean).join(", ") : "";

    if (phone) {
      odooPhones.push(phone);
      fromOdoo.push(`téléphone ${loc.name}`);
    }
    if (address) fromOdoo.push(`adresse ${loc.name}`);
    return {
      ...loc,
      phone: phone || loc.phone,
      address: address || loc.address,
    };
  });

  return {
    locations,
    phones: odooPhones.length ? [...new Set(odooPhones)] : shop.phones,
    fromOdoo,
  };
}
