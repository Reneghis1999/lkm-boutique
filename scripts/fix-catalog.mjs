import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const path = resolve("src/data/catalog.json");
const catalog = JSON.parse(readFileSync(path, "utf8"));

/** @param {string} name */
function inferCategory(name) {
  const n = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (/\b(pen(cil)?|styl(o|us)|s[- ]?pen)\b/.test(n)) return "pencil";
  if (/\b(power\s*bank|batterie externe)\b/.test(n)) return "power-bank";
  if (/\bbat(\s|_|-)?iph|batterie\s*iph/.test(n)) return "accessoire-de-reparation";
  if (
    /\b(ps5|ps4|xbox|switch|playstation|portal|console|slim|one s)\b/.test(n) &&
    !/\b(ps4|ps5|xbox|switch)\b.*\b(jeu|fc|gta|cod|ufc|2k|spider|last of us|gear)\b/.test(
      n,
    ) &&
    !/\b(2k|ufc|fc|gta|cod|spider|last of us|gear\.?club|w2k|fifa|call of)\b/.test(n)
  ) {
    // Consoles hardware vs games: high price or console keywords without game titles
    if (
      /\b(slim|one s|oled|portal|console|500go|500gb|1to|hak)\b/.test(n) ||
      /\b(xbox one|ps4 slim|ps5|playstation portal|switch oled)\b/.test(n)
    ) {
      return "consol-de-jeux";
    }
  }
  if (
    /\b(2k\d{2}|ufc|w2k|fc\s?\d|gta|cod|spider|last of us|gear\.?club|fifa|call of|mw|ps4|ps5|switch)\b/.test(
      n,
    ) &&
    !/\b(slim|portal|console|500go|500gb|oled|one s)\b/.test(n)
  ) {
    return "cd";
  }
  if (/\b(ps4|ps5|xbox|switch)\b/.test(n) && /\b(jeu|game)\b/.test(n)) return "cd";
  // Remaining titled games often end with platform
  if (/\b(ps4|ps5|xbox|switch)\b/.test(n) && !/\b(slim|portal|500|hak|direct)\b/.test(n)) {
    return "cd";
  }
  if (/\b(iphone|ipad|samsung|lg wing|telephone|phone)\b/.test(n)) {
    return "telephone-samsung";
  }
  if (/\b(imac|macbook|pc\b|ordinateur)\b/.test(n)) return "pc";
  if (/\b(cable|c[aâ]ble|chargeur|vidvie|typ\s*c|usb[- ]?c)\b/.test(n)) {
    return "chargeur-telephone-porteble";
  }
  if (/\b(pochette|coque|etui)\b/.test(n)) return "coq-iphone";
  if (/\b(montre|garmin|whoop|watch)\b/.test(n)) return "telephone-samsung";
  if (/\b(bo[iî]tier externe|hdd|ssd|disque)\b/.test(n)) return "cle-usb-et-memoire";
  if (
    /\b(lame|tresse|spatule|pachoir|bga|tapi|tapis|ouverture|precision|dessouder)\b/.test(
      n,
    )
  ) {
    return "accessoire-de-reparation";
  }
  if (/\b(manette|joystick|pad)\b/.test(n)) return "manette";
  if (/\b(enceinte|woofer|mp3|audio|haut[- ]parleur)\b/.test(n)) return "mp3";
  return null;
}

const categoryMeta = {
  cd: {
    name: "Jeux vidéo",
    shortName: "Jeux",
    description: "Jeux originaux PlayStation, Xbox, Switch et plus.",
  },
  pencil: {
    name: "Stylos & Pencil",
    shortName: "Pencil",
    description: "Stylos numériques et accessoires tablette.",
  },
  "consol-de-jeux": {
    name: "Consoles",
    shortName: "Consoles",
    description: "PlayStation, Xbox, Nintendo Switch et accessoires console.",
  },
  manette: {
    name: "Manettes",
    shortName: "Manettes",
    description: "Manettes et pads pour consoles et PC.",
  },
  "power-bank": {
    name: "Power banks",
    shortName: "Power banks",
    description: "Batteries externes pour téléphone et voyage.",
  },
  pc: {
    name: "Ordinateurs PC",
    shortName: "PC",
    description: "PC, Mac et ordinateurs reconditionnés ou neufs.",
  },
  mp3: {
    name: "Audio & enceintes",
    shortName: "Audio",
    description: "Enceintes, woofer et accessoires audio.",
  },
  "telephone-samsung": {
    name: "Smartphones & tablettes",
    shortName: "Phones",
    description: "Smartphones, iPhone, iPad et montres connectées.",
  },
  "cle-usb-et-memoire": {
    name: "Clés USB & mémoire",
    shortName: "Stockage",
    description: "Clés USB, cartes mémoire et boîtiers de stockage.",
  },
  "adaptateur-pc": {
    name: "Adaptateurs PC",
    shortName: "Adaptateurs",
    description: "Adaptateurs, hubs et connectique PC.",
  },
  "accessoire-de-reparation": {
    name: "Pièces de réparation",
    shortName: "Réparation",
    description: "Outils et pièces pour réparation mobile & PC.",
  },
  "sac-et-pose-pc": {
    name: "Sacs & supports PC",
    shortName: "Sacs PC",
    description: "Sacs, poses et supports pour ordinateurs.",
  },
  "chargeur-pc": {
    name: "Chargeurs PC",
    shortName: "Chargeurs PC",
    description: "Chargeurs et alimentations pour ordinateurs.",
  },
  "chargeur-telephone-porteble": {
    name: "Chargeurs & câbles",
    shortName: "Chargeurs",
    description: "Chargeurs téléphone, câbles USB-C et Lightning.",
  },
  "motorola-piecs-de-rechange": {
    name: "Pièces Motorola",
    shortName: "Motorola",
    description: "Pièces de rechange Motorola.",
  },
  "coq-iphone": {
    name: "Coques & pochettes",
    shortName: "Coques",
    description: "Coques, étuis et pochettes téléphone / tablette.",
  },
  "copie-de-jeux": {
    name: "Copies de jeux",
    shortName: "Copies",
    description: "Copies de jeux disponibles en boutique.",
  },
};

let assigned = 0;
for (const product of catalog.products) {
  if (!product.categorySlugs?.length) {
    const slug = inferCategory(product.name);
    if (slug) {
      product.categorySlugs = [slug];
      assigned += 1;
    }
  }

  // Better fallback description when scrape text is empty/generic
  const cat = product.categorySlugs?.[0];
  const catLabel =
    categoryMeta[cat]?.name ||
    catalog.categories.find((c) => c.slug === cat)?.name ||
    "Tech & Gaming";
  if (!product.description?.trim() || product.description.length < 25) {
    product.description = `${product.name} disponible chez LKM Boutique à Lomé (${catLabel}). Prix affiché en CFA — venez tester en magasin ou commandez via WhatsApp.`;
  }
}

for (const category of catalog.categories) {
  const meta = categoryMeta[category.slug];
  if (meta) {
    category.name = meta.name;
    category.shortName = meta.shortName;
    category.description = meta.description;
  }
  category.count = catalog.products.filter((p) =>
    p.categorySlugs.includes(category.slug),
  ).length;
}

catalog.stats = {
  products: catalog.products.length,
  withPrice: catalog.products.filter((p) => p.price != null).length,
  withDescription: catalog.products.filter(
    (p) => p.description && p.description.length >= 40,
  ).length,
  withImage: catalog.products.filter((p) => p.image).length,
  sharedPlaceholders: 0,
  uncategorized: catalog.products.filter((p) => !p.categorySlugs?.length)
    .length,
};

writeFileSync(path, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
console.log(
  JSON.stringify(
    {
      assigned,
      uncategorized: catalog.stats.uncategorized,
      withDescription: catalog.stats.withDescription,
      withImage: catalog.stats.withImage,
    },
    null,
    2,
  ),
);
