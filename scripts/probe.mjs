const urls = [
  "https://lkm-boutique.odoo.com/",
  "https://lkm-boutique.odoo.com/shop/pincette-7-sa-sr-1448",
  "https://lkm-boutique.odoo.com/shop/call-of-dutty-mw-ps5-793",
  "https://lkm-boutique.odoo.com/shop?ppg=100",
];

for (const u of urls) {
  const r = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0" } });
  const t = await r.text();
  console.log("\n====", r.status, u, "len", t.length);
  const maps = [...t.matchAll(/https?:\/\/[^"'\\s>]*(?:maps|goo\.gl|wa\.me|whatsapp|facebook|instagram|tiktok)[^"'\\s>]*/gi)].map((m) => m[0]);
  console.log("links", [...new Set(maps)].slice(0, 30));
  const articles = t.match(/<article/g)?.length ?? 0;
  console.log("articles", articles);
  const desc = t.match(/id="product_full_description"[\s\S]{0,1500}/);
  console.log("desc", desc ? desc[0].slice(0, 800) : "none");
  const attrs = t.match(/o_wsale_product_attribute[\s\S]{0,400}/);
  console.log("attrs", attrs ? attrs[0].slice(0, 300) : "none");
}
