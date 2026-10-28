import { writeFileSync } from "node:fs";

async function save(url, file) {
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const t = await r.text();
  writeFileSync(file, t);
  console.log(file, t.length);
}

await save("https://lkm-boutique.odoo.com/", "scripts/home.html");
await save("https://lkm-boutique.odoo.com/shop/pincette-7-sa-sr-1448", "scripts/product-pincette.html");
await save("https://lkm-boutique.odoo.com/shop/call-of-dutty-mw-ps5-793", "scripts/product-cod.html");
await save("https://lkm-boutique.odoo.com/shop/category/pc-6", "scripts/cat-pc.html");
await save("https://lkm-boutique.odoo.com/shop/page/2", "scripts/shop-p2.html");
