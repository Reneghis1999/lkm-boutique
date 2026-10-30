import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCatalogSource, getOdooConfig, isOdooReady } from "@/lib/odoo/config";
import { testOdooConnection } from "@/lib/odoo/client";
import { getCatalogSourceLabel, getProducts } from "@/lib/catalog";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const odoo = getOdooConfig();
  const sourcePref = getCatalogSource();
  const activeSource = await getCatalogSourceLabel();
  const products = await getProducts();

  let connection: { ok: boolean; message: string } | null = null;
  if (odoo.configured) {
    connection = await testOdooConnection();
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
      </div>

      <ol className="mt-8 list-decimal space-y-2 pl-5 text-sm text-white/55">
        <li>Confirmer le plan Odoo (API externe = plan Custom).</li>
        <li>
          Créer une clé API dans Odoo → Préférences → Sécurité du compte.
        </li>
        <li>
          Ajouter les variables sur Vercel / <code>.env</code> local.
        </li>
        <li>Recharger cette page pour tester la connexion.</li>
      </ol>
    </div>
  );
}
