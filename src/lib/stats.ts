/**
 * Statistiques du site (visites, produits vus, recherches, clics WhatsApp),
 * comptées par jour dans la base Upstash Redis. Aucune donnée personnelle :
 * seulement des compteurs (le visiteur est un identifiant aléatoire).
 */
import { Redis } from "@upstash/redis";

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
export const redis = url && token ? new Redis({ url, token }) : null;

const KEEP_SECONDS = 40 * 24 * 3600; // 40 jours d’historique

/** Date du jour à Lomé (UTC), format AAAA-MM-JJ. */
export function day(offset = 0) {
  return new Date(Date.now() - offset * 86400000).toISOString().slice(0, 10);
}

export type TrackEvent =
  | { type: "view"; vid: string }
  | { type: "product"; slug: string }
  | { type: "search"; q: string }
  | { type: "whatsapp"; source: string; slug?: string };

export async function track(e: TrackEvent) {
  if (!redis) return;
  const d = day();
  const p = redis.pipeline();
  const keys: string[] = [];
  if (e.type === "view") {
    p.incr(`v:${d}`);
    p.pfadd(`u:${d}`, e.vid);
    keys.push(`v:${d}`, `u:${d}`);
  } else if (e.type === "product") {
    p.zincrby(`p:${d}`, 1, e.slug);
    keys.push(`p:${d}`);
  } else if (e.type === "search") {
    p.zincrby(`s:${d}`, 1, e.q);
    keys.push(`s:${d}`);
  } else {
    p.zincrby(`w:${d}`, 1, e.source);
    keys.push(`w:${d}`);
    if (e.slug) {
      p.zincrby(`wp:${d}`, 1, e.slug);
      keys.push(`wp:${d}`);
    }
  }
  for (const k of keys) p.expire(k, KEEP_SECONDS);
  await p.exec();
}

type Ranked = { name: string; count: number }[];

async function topOver(prefix: string, days: number, limit: number): Promise<Ranked> {
  if (!redis) return [];
  const p = redis.pipeline();
  for (let i = 0; i < days; i++) p.zrange(`${prefix}:${day(i)}`, 0, -1, { withScores: true });
  const res = (await p.exec()) as (string | number)[][];
  const sum = new Map<string, number>();
  for (const list of res) {
    for (let i = 0; i + 1 < (list?.length ?? 0); i += 2) {
      const name = String(list[i]);
      sum.set(name, (sum.get(name) ?? 0) + Number(list[i + 1]));
    }
  }
  return [...sum.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export type DashboardStats = {
  ready: boolean;
  views: { today: number; week: number; month: number };
  visitors: { today: number; week: number; month: number };
  daily: { day: string; views: number }[];
  products: Ranked;
  productViews: Record<string, number>;
  searches: Ranked;
  whatsapp: Ranked;
  whatsappProducts: Ranked;
  whatsappTotal: number;
};

export async function readStats(days = 30): Promise<DashboardStats> {
  const empty: DashboardStats = {
    ready: false,
    views: { today: 0, week: 0, month: 0 },
    visitors: { today: 0, week: 0, month: 0 },
    daily: [],
    products: [],
    productViews: {},
    searches: [],
    whatsapp: [],
    whatsappProducts: [],
    whatsappTotal: 0,
  };
  if (!redis) return empty;

  const dayList = Array.from({ length: days }, (_, i) => day(i));
  const counts = (await redis.mget<(number | null)[]>(...dayList.map((d) => `v:${d}`))).map(
    (n) => Number(n ?? 0),
  );
  const sumDays = (n: number) => counts.slice(0, n).reduce((a, b) => a + b, 0);
  const uKeys = (n: number) => dayList.slice(0, n).map((d) => `u:${d}`);
  const [uToday, uWeek, uMonth] = await Promise.all([
    redis.pfcount(uKeys(1)[0]),
    redis.pfcount(uKeys(7)[0], ...uKeys(7).slice(1)),
    redis.pfcount(uKeys(days)[0], ...uKeys(days).slice(1)),
  ]);
  const [allProducts, searches, whatsapp, whatsappProducts] = await Promise.all([
    topOver("p", days, 2000),
    topOver("s", days, 15),
    topOver("w", days, 10),
    topOver("wp", days, 10),
  ]);

  return {
    ready: true,
    views: { today: sumDays(1), week: sumDays(7), month: sumDays(days) },
    visitors: { today: uToday, week: uWeek, month: uMonth },
    daily: dayList.slice(0, 14).map((d, i) => ({ day: d, views: counts[i] })).reverse(),
    products: allProducts.slice(0, 10),
    productViews: Object.fromEntries(allProducts.map((r) => [r.name, r.count])),
    searches,
    whatsapp,
    whatsappProducts,
    whatsappTotal: whatsapp.reduce((a, b) => a + b.count, 0),
  };
}
