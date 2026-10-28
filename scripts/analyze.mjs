import { readFileSync, readdirSync, statSync } from "node:fs";

const data = JSON.parse(readFileSync("scraped/catalog.json", "utf8"));
const cats = Object.fromEntries(data.categories.map((c) => [c.slug, c]));
console.log("CATEGORIES");
for (const c of data.categories) {
  console.log(`${c.count}\t${c.sourceName}\t${c.slug}`);
}
const uncategorized = data.products.filter((p) => p.categorySlugs.length === 0);
console.log("\nUNCATEGORIZED", uncategorized.length);
for (const p of uncategorized) console.log("-", p.price, p.name);

const noPrice = data.products.filter((p) => p.price == null);
console.log("\nNO PRICE", noPrice.map((p) => p.name));

const specs = new Map();
for (const p of data.products) {
  for (const spec of p.specs || []) specs.set(spec.name, (specs.get(spec.name) || 0) + 1);
}
console.log("\nSPECS", [...specs.entries()]);

const options = data.products.filter((p) => p.options?.length);
console.log("OPTIONS", options.length, options.slice(0, 8).map((p) => ({ name: p.name, options: p.options })));

const compare = data.products.filter((p) => p.compareAtPrice && p.compareAtPrice !== p.price);
console.log("PROMOS", compare.length, compare.slice(0, 5));

const prices = data.products.map((p) => p.price).filter((n) => n != null).sort((a, b) => a - b);
console.log("PRICE min/median/max", prices[0], prices[Math.floor(prices.length / 2)], prices.at(-1));

const desc = data.products.filter((p) => p.description).slice(0, 12);
console.log("\nDESCRIPTIONS");
for (const p of desc) console.log("-", p.name, "=>", p.description.slice(0, 140));

const files = readdirSync("public/products");
let bytes = 0;
for (const file of files) bytes += statSync(`public/products/${file}`).size;
console.log("\nIMAGES", files.length, Math.round(bytes / 1024 / 1024) + "MB");

const platforms = { ps5: 0, ps4: 0, xbox: 0, iphone: 0, samsung: 0 };
for (const p of data.products) {
  const n = p.name.toLowerCase();
  if (n.includes("ps5")) platforms.ps5++;
  if (n.includes("ps4")) platforms.ps4++;
  if (n.includes("xbox") || n.includes("x box")) platforms.xbox++;
  if (n.includes("iph") || n.includes("iphon")) platforms.iphone++;
  if (n.includes("samsung") || n.includes("samusung")) platforms.samsung++;
}
console.log("PLATFORMS", platforms);

const multi = data.products.filter((p) => p.categorySlugs.length > 1);
console.log("MULTI CAT", multi.length);
