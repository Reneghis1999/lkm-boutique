/**
 * Vérification de la connexion Odoo — à lancer sur place avec la clé API :
 *
 *   npm run odoo:check
 *
 * Lit ODOO_URL / ODOO_API_KEY / ODOO_DB dans .env.local (ou .env), puis
 * affiche ce que le site va afficher : produits, photos, catégories, et les
 * différences avec le catalogue actuel (catalog.json).
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(file: string) {
  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const [, key, rawValue] = m;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^(['"])(.*)\1$/, "$2");
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const ok = (msg: string) => console.log(`  ✅ ${msg}`);
const warn = (msg: string) => console.log(`  ⚠️  ${msg}`);
const fail = (msg: string) => console.log(`  ❌ ${msg}`);
const title = (msg: string) => console.log(`\n${msg}`);

function list(names: string[], max = 10) {
  for (const n of names.slice(0, max)) console.log(`       - ${n}`);
  if (names.length > max) console.log(`       … et ${names.length - max} autre(s)`);
}

async function main() {
  // Import après chargement des variables d’environnement.
  const { getOdooConfig } = await import("../src/lib/odoo/config");
  const { testOdooConnection, fetchApiKeyExpirations } = await import(
    "../src/lib/odoo/client"
  );
  const { fetchOdooCatalog } = await import("../src/lib/odoo/catalog");
  const catalogJson = (await import("../src/data/catalog.json")).default as {
    products: { slug: string; name: string; price: number | null }[];
  };

  const config = getOdooConfig();
  title("1. Configuration");
  if (!config.configured) {
    fail("ODOO_URL et/ou ODOO_API_KEY manquants dans .env.local");
    console.log(
      "\n  Exemple de .env.local :\n    CATALOG_SOURCE=odoo\n    ODOO_URL=https://lkm-boutique.odoo.com\n    ODOO_API_KEY=la_cle_copiee_depuis_odoo\n",
    );
    process.exit(1);
  }
  ok(`URL : ${config.url}`);
  ok(`Clé : ${config.apiKey.slice(0, 4)}…${config.apiKey.slice(-4)}`);
  if (process.env.CATALOG_SOURCE?.toLowerCase() === "json") {
    warn("CATALOG_SOURCE=json : le site ignorera Odoo. Mets CATALOG_SOURCE=odoo.");
  }

  title("2. Version d’Odoo");
  try {
    const res = await fetch(`${config.url}/web/version`);
    const v = (await res.json()) as { version?: string };
    ok(`Odoo ${v.version ?? "?"}`);
  } catch (e) {
    warn(`Version illisible (${e instanceof Error ? e.message : e})`);
  }

  title("3. Connexion avec la clé API");
  const conn = await testOdooConnection();
  if (!conn.ok) {
    fail(conn.message);
    console.log(
      "\n  Pistes : clé mal copiée / expirée, ou abonnement Odoo sans API externe\n  (seul le plan « Custom » donne accès à l’API).\n",
    );
    process.exit(1);
  }
  ok(conn.message);

  const keys = await fetchApiKeyExpirations();
  if (keys?.length) {
    for (const k of keys) {
      if (k.expiration) {
        const days = Math.ceil(
          (new Date(k.expiration).getTime() - Date.now()) / 86_400_000,
        );
        (days <= 14 ? warn : ok)(
          `Clé « ${k.name} » : expire le ${k.expiration.slice(0, 10)} (dans ${days} jours) — note-le dans ton agenda`,
        );
      } else {
        ok(`Clé « ${k.name} » : sans date d’expiration`);
      }
    }
  } else {
    warn(
      "Date d’expiration de la clé non lisible via l’API : note-la (3 mois max).",
    );
  }

  title("4. Catalogue lu dans Odoo");
  const catalog = await fetchOdooCatalog();
  const d = catalog.diagnostics;
  (d.products > 0 ? ok : fail)(`${d.products} produit(s) publié(s) sur le site`);
  (d.publishedFilter ? ok : warn)(
    d.publishedFilter
      ? "Filtre « Publié » actif (seuls les produits publiés s’affichent)"
      : "Champ « Publié » introuvable : tous les produits vendables s’affichent",
  );
  ok(`${d.withImage} produit(s) avec photo`);
  if (d.withoutImage.length) {
    warn(`${d.withoutImage.length} produit(s) sans photo :`);
    list(d.withoutImage);
  }
  ok(`${d.categories} catégorie(s) eCommerce utilisée(s)`);
  if (d.withoutOdooCategory.length) {
    warn(
      `${d.withoutOdooCategory.length} produit(s) sans « catégorie du site web » dans Odoo (à classer avec le client) :`,
    );
    list(d.withoutOdooCategory);
  }
  if (d.withoutPrice.length) {
    warn(`${d.withoutPrice.length} produit(s) sans prix :`);
    list(d.withoutPrice);
  }
  if (d.repairs === null) {
    console.log(
      "  ℹ️  Réparations : aucune fiche publiée dans la catégorie « REPARATION » → le site affiche ses tarifs de secours",
    );
  } else if (catalog.repairs) {
    ok(
      `${d.repairs} réparation(s) lue(s) dans Odoo — main d’œuvre ${catalog.repairs.labor} CFA`,
    );
    list(
      catalog.repairs.items.map(
        (r) =>
          `[${r.category}] ${r.title} : ${r.service != null ? `forfait ${r.service}` : r.labor != null ? `main d’œuvre ${r.labor} + pièce${r.partFrom ? ` dès ${r.partFrom}` : " selon modèle"}` : r.partFrom != null ? `pièce dès ${r.partFrom}` : "sur devis"}${r.popular ? " ★" : ""}`,
      ),
      30,
    );
  }
  if (d.promos > 0) {
    ok(`${d.promos} produit(s) en promotion (catégorie « Promotions ») :`);
    list(catalog.products.filter((p) => p.promo).map((p) => p.name));
  } else {
    console.log(
      "  ℹ️  Promotions : aucun produit publié dans une catégorie « Promotions » (section masquée sur l’accueil)",
    );
  }
  const { mergeShopContacts } = await import("../src/lib/shop-contacts");
  const contacts = mergeShopContacts(catalog.companies);
  if (contacts.fromOdoo.length) {
    ok(`Coordonnées reprises d’Odoo : ${contacts.fromOdoo.join(", ")}`);
  } else {
    console.log(
      "  ℹ️  Téléphones / adresses vides dans les sociétés Odoo → le site garde les siens",
    );
  }
  for (const w of d.warnings) warn(w);
  if (d.missingFields.length) {
    console.log(`  ℹ️  Champs absents (ignorés) : ${d.missingFields.join(", ")}`);
  }

  title("5. Comparaison avec le catalogue actuel du site (catalog.json)");
  const odooBySlug = new Map(catalog.products.map((p) => [p.slug, p]));
  const jsonBySlug = new Map(catalogJson.products.map((p) => [p.slug, p]));
  const same = catalog.products.filter((p) => jsonBySlug.has(p.slug));
  const added = catalog.products.filter((p) => !jsonBySlug.has(p.slug));
  const gone = catalogJson.products.filter((p) => !odooBySlug.has(p.slug));
  const priceChanged = same.filter(
    (p) => (jsonBySlug.get(p.slug)?.price ?? null) !== p.price,
  );

  ok(`${same.length} produit(s) gardent la même adresse sur le site`);
  if (added.length) {
    ok(`${added.length} nouveau(x) produit(s) depuis Odoo :`);
    list(added.map((p) => p.name));
  }
  if (gone.length) {
    warn(
      `${gone.length} produit(s) du site actuel absents d’Odoo (dépubliés, archivés ou renommés) :`,
    );
    list(gone.map((p) => p.name));
  }
  if (priceChanged.length) {
    warn(`${priceChanged.length} prix différent(s) (c’est Odoo qui fait foi) :`);
    list(
      priceChanged.map(
        (p) => `${p.name} : ${jsonBySlug.get(p.slug)?.price ?? "—"} → ${p.price ?? "—"}`,
      ),
    );
  }

  console.log(
    "\nTout est bon ? Lance `npm run dev`, ouvre http://localhost:3000/boutique,\npuis crée un produit test dans Odoo (Publié) et recharge la page.\n",
  );
}

main().catch((e) => {
  fail(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
