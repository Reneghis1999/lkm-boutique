import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { DashboardLogin, DashboardLogout } from "@/components/stats/dashboard-login";
import { getProducts } from "@/lib/catalog";
import { DASH_COOKIE, readDashToken } from "@/lib/dashboard-auth";
import { odooCall } from "@/lib/odoo/client";
import { STOCK_ALERT_PROJECT } from "@/lib/odoo/stock-alert";
import { MISSED_SEARCH_PROJECT } from "@/lib/odoo/missed-search";
import { readStats } from "@/lib/stats";
import { fetchRestock } from "@/lib/odoo/restock";
import { CopyListButton } from "@/components/stats/copy-list-button";

export const metadata: Metadata = {
  title: "Tableau de bord",
  robots: { index: false, follow: false },
};

async function odooTasks(project: string) {
  try {
    const rows = await odooCall<{ name: string; stage_id: [number, string] | false }[]>(
      "project.task",
      "search_read",
      {
        domain: [["project_id.name", "=", project]],
        fields: ["name", "stage_id"],
        limit: 200,
      },
    );
    return rows;
  } catch {
    return null;
  }
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[var(--lkm-surface)] p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Rank({ rows, empty, label }: { rows: { name: string; count: number }[]; empty: string; label?: (n: string) => React.ReactNode }) {
  if (!rows.length) return <p className="text-sm text-white/40">{empty}</p>;
  const max = rows[0].count || 1;
  return (
    <ol className="space-y-2">
      {rows.map((r) => (
        <li key={r.name} className="text-sm">
          <div className="flex justify-between gap-3">
            <span className="truncate text-white/85">{label ? label(r.name) : r.name}</span>
            <span className="shrink-0 font-semibold text-[var(--lkm-yellow)]">{r.count}</span>
          </div>
          <div className="mt-1 h-1 rounded bg-white/5">
            <div className="h-1 rounded bg-[var(--lkm-yellow)]/70" style={{ width: `${(r.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

function Big({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/45">{label}</p>
    </div>
  );
}

export default async function TableauPage() {
  const jar = await cookies();
  const allowed = readDashToken(jar.get(DASH_COOKIE)?.value);

  if (!allowed) {
    return (
      <main className="min-h-screen px-5 py-20">
        <h1 className="text-center font-[family-name:var(--font-display)] text-3xl font-bold text-white">
          Tableau de bord LKM
        </h1>
        <DashboardLogin />
      </main>
    );
  }

  const [stats, products, alerts, missed, restock] = await Promise.all([
    readStats(30),
    getProducts(),
    odooTasks(STOCK_ALERT_PROJECT),
    odooTasks(MISSED_SEARCH_PROJECT),
    fetchRestock(),
  ]);
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const productName = (slug: string) => bySlug.get(slug)?.name ?? slug;

  const watch = stats.products
    .map((r) => ({ r, p: bySlug.get(r.name) }))
    .filter(({ p }) => p && (p.inStock === false || (p.availableAt?.length ?? 2) < 2))
    .slice(0, 8);

  const pendingAlerts = (alerts ?? []).filter((t) => !t.stage_id || /prévenir/i.test(t.stage_id[1]));
  const missedTop = (missed ?? [])
    .map((t) => {
      const m = t.name.match(/^(.*) — (\d+) recherche/);
      return m ? { name: m[1], count: Number(m[2]) } : null;
    })
    .filter((x): x is { name: string; count: number } => !!x)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const maxDay = Math.max(1, ...stats.daily.map((d) => d.views));

  // À commander : ruptures et presque finis, les plus regardés d’abord
  const normName = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const slugByName = new Map(products.map((p) => [normName(p.name), p.slug]));
  const withViews = (restock ?? []).map((r) => {
    const slug = slugByName.get(normName(r.name));
    return { ...r, slug, views: slug ? (stats.productViews[slug] ?? 0) : 0 };
  });
  const byImportance = (a: { views: number; total: number }, b: { views: number; total: number }) =>
    b.views - a.views || a.total - b.total;
  const ruptures = withViews.filter((r) => r.total <= 0).sort(byImportance);
  const lowStock = withViews
    .filter((r) => r.total > 0 && r.total <= 2)
    .sort(byImportance);
  const orderText = [
    "Commande LKM Boutique :",
    ...[...ruptures.slice(0, 40), ...lowStock.slice(0, 40)].map(
      (r) => `- ${r.name} (Djidjolé ${r.djidjole} / Léo 2000 ${r.leo})`,
    ),
  ].join("\n");

  return (
    <main className="mx-auto max-w-6xl px-5 py-10" data-no-translate>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">LKM Boutique</p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-white">
            Tableau de bord
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-white/45 hover:text-white">
            Voir le site
          </Link>
          <DashboardLogout />
        </div>
      </div>

      {!stats.ready && (
        <p className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
          La base de statistiques n’est pas encore reliée au site.
        </p>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card title="Visites (pages vues)">
          <div className="grid grid-cols-3 gap-4">
            <Big label="aujourd’hui" value={stats.views.today} />
            <Big label="7 jours" value={stats.views.week} />
            <Big label="30 jours" value={stats.views.month} />
          </div>
          <div className="mt-5 flex h-20 items-end gap-1">
            {stats.daily.map((d) => (
              <div key={d.day} className="flex-1" title={`${d.day} : ${d.views}`}>
                <div className="rounded-t bg-[var(--lkm-yellow)]/70" style={{ height: `${(d.views / maxDay) * 80}px` }} />
              </div>
            ))}
          </div>
          <p className="mt-1 text-xs text-white/35">14 derniers jours</p>
        </Card>
        <Card title="Visiteurs (personnes)">
          <div className="grid grid-cols-3 gap-4">
            <Big label="aujourd’hui" value={stats.visitors.today} />
            <Big label="7 jours" value={stats.visitors.week} />
            <Big label="30 jours" value={stats.visitors.month} />
          </div>
          <div className="mt-5 border-t border-white/10 pt-4">
            <Big label="clics « Commander / WhatsApp » (30 jours)" value={stats.whatsappTotal} />
          </div>
        </Card>

        <Card title="Produits les plus regardés (30 jours)">
          <Rank
            rows={stats.products}
            empty="Pas encore de données."
            label={(slug) => (
              <Link href={`/produit/${slug}`} className="hover:underline">
                {productName(slug)}
              </Link>
            )}
          />
        </Card>
        <Card title="Commandes WhatsApp — d’où elles viennent">
          <Rank rows={stats.whatsapp} empty="Pas encore de clics." />
          {stats.whatsappProducts.length > 0 && (
            <>
              <p className="mt-5 text-xs font-semibold uppercase text-white/40">Produits commandés depuis leur fiche</p>
              <div className="mt-2">
                <Rank rows={stats.whatsappProducts} empty="" label={productName} />
              </div>
            </>
          )}
        </Card>

        <Card title="Recherches des clients (30 jours)">
          <Rank rows={stats.searches} empty="Pas encore de recherches." />
        </Card>
        <Card title="Recherches sans résultat (à commander ?)">
          <Rank rows={missedTop} empty={missed ? "Aucune pour le moment." : "Odoo injoignable."} />
        </Card>

        <Card title="Stock à surveiller (très regardés)">
          {watch.length === 0 ? (
            <p className="text-sm text-white/40">Rien à signaler.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {watch.map(({ r, p }) => (
                <li key={r.name} className="flex justify-between gap-3">
                  <Link href={`/produit/${r.name}`} className="truncate text-white/85 hover:underline">
                    {p!.name}
                  </Link>
                  <span className={p!.inStock === false ? "shrink-0 text-red-300" : "shrink-0 text-amber-300"}>
                    {p!.inStock === false ? "Rupture" : `Seulement ${p!.availableAt?.join(", ")}`} · {r.count} vues
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Alertes « Prévenez-moi » à traiter">
          {alerts === null ? (
            <p className="text-sm text-white/40">Odoo injoignable.</p>
          ) : pendingAlerts.length === 0 ? (
            <p className="text-sm text-white/40">Aucune alerte en attente.</p>
          ) : (
            <>
              <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-white">{pendingAlerts.length}</p>
              <ul className="mt-2 space-y-1 text-sm text-white/75">
                {pendingAlerts.slice(0, 8).map((t) => (
                  <li key={t.name} className="truncate">{t.name}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-white/40">Dans Odoo › Projet › {STOCK_ALERT_PROJECT}</p>
            </>
          )}
        </Card>
      </div>
      <section className="mt-8 rounded-2xl border border-white/10 bg-[var(--lkm-surface)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">À commander</h2>
            <p className="mt-1 text-sm text-white/55">
              Produits publiés, stock en direct d’Odoo. Les plus regardés sur le site sont en premier.
            </p>
          </div>
          {restock && (ruptures.length > 0 || lowStock.length > 0) ? <CopyListButton text={orderText} /> : null}
        </div>
        {restock === null ? (
          <p className="mt-4 text-sm text-white/40">Odoo injoignable pour le moment.</p>
        ) : (
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {[
              { title: `Ruptures (${ruptures.length})`, rows: ruptures, color: "text-red-300" },
              { title: `Bientôt finis (${lowStock.length})`, rows: lowStock, color: "text-amber-300" },
            ].map((block) => (
              <div key={block.title}>
                <p className={`text-sm font-semibold ${block.color}`}>{block.title}</p>
                {block.rows.length === 0 ? (
                  <p className="mt-2 text-sm text-white/40">Rien à signaler.</p>
                ) : (
                  <div className="mt-2 max-h-96 overflow-y-auto pr-1">
                    <table className="w-full text-sm">
                      <thead className="text-left text-xs text-white/40">
                        <tr>
                          <th className="py-1 font-normal">Produit</th>
                          <th className="py-1 text-right font-normal">Djidjolé</th>
                          <th className="py-1 text-right font-normal">Léo</th>
                          <th className="py-1 text-right font-normal">Vues</th>
                        </tr>
                      </thead>
                      <tbody>
                        {block.rows.slice(0, 60).map((r) => (
                          <tr key={r.name} className="border-t border-white/5">
                            <td className="max-w-[14rem] truncate py-1.5 text-white/85">
                              {r.slug ? (
                                <Link href={`/produit/${r.slug}`} className="hover:underline">
                                  {r.name}
                                </Link>
                              ) : (
                                r.name
                              )}
                            </td>
                            <td className={`py-1.5 text-right ${r.djidjole === 0 ? "text-red-300" : "text-white/75"}`}>{r.djidjole}</td>
                            <td className={`py-1.5 text-right ${r.leo === 0 ? "text-red-300" : "text-white/75"}`}>{r.leo}</td>
                            <td className="py-1.5 text-right text-white/45">{r.views || "–"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {block.rows.length > 60 && (
                      <p className="mt-2 text-xs text-white/35">+ {block.rows.length - 60} autres</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-white/10 bg-[var(--lkm-surface)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
          Statut WhatsApp du jour
        </h2>
        <p className="mt-1 text-sm text-white/55">
          Images prêtes à poster en statut WhatsApp ou TikTok, mises à jour chaque jour avec Odoo.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {[
            { type: "nouveautes", label: "Nouveautés" },
            { type: "promos", label: "Promos" },
          ].map((s) => (
            <div key={s.type} className="flex flex-col gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/statut?type=${s.type}`}
                alt={`Statut ${s.label}`}
                className="w-full rounded-xl border border-white/10"
                loading="lazy"
              />
              <a
                href={`/api/statut?type=${s.type}&download=1`}
                className="rounded-full bg-[#25d366] px-4 py-2.5 text-center text-sm font-semibold text-[#0b0b0f]"
              >
                Télécharger « {s.label} »
              </a>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-8 text-xs text-white/30">
        Données des 30 derniers jours, mises à jour en direct.
      </p>
    </main>
  );
}
