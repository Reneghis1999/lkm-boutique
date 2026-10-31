import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCatalogSource, getOdooConfig, isOdooReady } from "@/lib/odoo/config";
import {
  fetchApiKeyExpirations,
  testOdooConnection,
} from "@/lib/odoo/client";
import { loadCatalog } from "@/lib/catalog";

function daysUntil(date: string) {
  const ms = new Date(date).getTime() - Date.now();
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

function NameList({ title, names }: { title: string; names: string[] }) {
  if (names.length === 0) return null;
  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer text-amber-100/90">
        {title} : {names.length}
      </summary>
      <ul className="mt-2 max-h-48 list-disc overflow-auto pl-5 text-white/55">
        {names.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </details>
  );
}

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const odoo = getOdooConfig();
  const sourcePref = getCatalogSource();
  const catalog = await loadCatalog();
  const activeSource = catalog.source;
  const products = catalog.products;
  const diag = catalog.diagnostics;

  let connection: { ok: boolean; message: string } | null = null;
  let keys: Awaited<ReturnType<typeof fetchApiKeyExpirations>> = null;
  if (odoo.configured) {
    [connection, keys] = await Promise.all([
      testOdooConnection(),
      fetchApiKeyExpirations(),
    ]);
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
        Intégration
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold">
        Connexion Odoo
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-white/55">
        La gestion produits / clients / factures se fait dans Odoo. Ce panneau
        sert uniquement à vérifier la connexion API et la source du catalogue
        affiché sur le site.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[var(--lkm-surface)] p-5">
          <p className="text-sm text-white/45">Source catalogue (préférence)</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold">
            {sourcePref}
          </p>
          <p className="mt-2 text-xs text-white/40">
            Variable <code className="text-white/70">CATALOG_SOURCE</code> =
            auto | odoo | json
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[var(--lkm-surface)] p-5">
          <p className="text-sm text-white/45">Source active maintenant</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold">
            {activeSource}
          </p>
          <p className="mt-2 text-xs text-white/40">
            {products.length} produit{products.length > 1 ? "s" : ""} chargés
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-[var(--lkm-surface)] p-5">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
          Statut Odoo
        </h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-white/45">URL</dt>
            <dd className="text-right text-white/85">
              {odoo.url || "— non défini —"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/45">Clé API</dt>
            <dd className="text-right text-white/85">
              {odoo.apiKey ? "renseignée" : "— manquante —"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/45">Base (optionnel)</dt>
            <dd className="text-right text-white/85">
              {odoo.database || "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/45">Prêt</dt>
            <dd className="text-right text-white/85">
              {isOdooReady() ? "oui" : "non"}
            </dd>
          </div>
        </dl>

        {connection ? (
          <p
            className={`mt-5 rounded-xl px-4 py-3 text-sm ${
              connection.ok
                ? "bg-emerald-500/15 text-emerald-200"
                : "bg-amber-500/15 text-amber-100"
            }`}
          >
            {connection.message}
          </p>
        ) : (
          <p className="mt-5 rounded-xl bg-white/5 px-4 py-3 text-sm text-white/50">
            En attente de <code className="text-white/80">ODOO_URL</code> +{" "}
            <code className="text-white/80">ODOO_API_KEY</code> (et plan Odoo
            avec API externe).
          </p>
        )}

        {catalog.error && (
          <p className="mt-3 rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-100">
            Le site affiche le catalogue JSON de secours car Odoo a renvoyé une
            erreur : {catalog.error}
          </p>
        )}

        {keys && keys.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-white/60">
            {keys.map((k, i) => {
              const days = k.expiration ? daysUntil(k.expiration) : null;
              return (
                <li key={`${k.name}-${i}`}>
                  Clé « {k.name} » :{" "}
                  {k.expiration ? (
                    <span
                      className={
                        days != null && days <= 14
                          ? "text-amber-200"
                          : "text-white/80"
                      }
                    >
                      expire le {k.expiration.slice(0, 10)} ({days} j)
                    </span>
                  ) : (
                    "sans date d’expiration"
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {diag && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-[var(--lkm-surface)] p-5">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
            Ce que le site lit dans Odoo
          </h2>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-4">
              <dt className="text-white/45">Produits publiés</dt>
              <dd className="text-white/85">{diag.products}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/45">Avec photo</dt>
              <dd className="text-white/85">{diag.withImage}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/45">Catégories (non vides)</dt>
              <dd className="text-white/85">{diag.categories}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/45">Filtre « Publié »</dt>
              <dd className="text-white/85">
                {diag.publishedFilter ? "actif" : "indisponible"}
              </dd>
            </div>
          </dl>
          <NameList title="Sans photo" names={diag.withoutImage} />
          <NameList
            title="Sans catégorie du site web dans Odoo"
            names={diag.withoutOdooCategory}
          />
          <NameList title="Sans prix" names={diag.withoutPrice} />
          <NameList title="Avertissements" names={diag.warnings} />
          <NameList
            title="Champs Odoo absents (ignorés)"
            names={diag.missingFields}
          />
        </div>
      )}

      <ol className="mt-8 list-decimal space-y-2 pl-5 text-sm text-white/55">
        <li>Confirmer le plan Odoo (API externe = plan Custom).</li>
        <li>
          Créer une clé API dans Odoo → Préférences → Sécurité du compte (3 mois
          maximum : à renouveler avant expiration).
        </li>
        <li>
          Ajouter les variables sur Vercel / <code>.env</code> local.
        </li>
        <li>Recharger cette page pour tester la connexion.</li>
      </ol>
    </div>
  );
}
