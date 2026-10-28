import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const ROOT = path.resolve("scraped");
const IMG_DIR = path.resolve("public/products");
const BASE = "https://lkm-boutique.odoo.com";
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
};

function decodeEntities(value) {
  return value
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePrice(raw) {
  if (!raw) return null;
  const digits = decodeEntities(raw).replace(/[^\d]/g, "");
  if (!digits) return null;
  const value = Number(digits);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

async function fetchText(url) {
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) {
    throw new Error(`${response.status} ${url}`);
  }
  return response.text();
}

function parseListing(html) {
  const chunks = html.split('<article class="oe_product_cart');
  const products = [];
  for (const chunk of chunks.slice(1)) {
    const block = chunk.slice(0, 8000);
    const href = block.match(/href="(\/shop\/(?!category\/|cart|wishlist)[^"#?]+)"/);
    if (!href) continue;
    const sourcePath = href[1];
    const slugMatch = sourcePath.match(/\/shop\/(.+)-(\d+)$/);
    if (!slugMatch) continue;
    const slug = slugMatch[1];
    const templateId = Number(slugMatch[2]);
    const name =
      decodeEntities(block.match(/aria-label="([^"]+)"/)?.[1] || "") ||
      decodeEntities(block.match(/title="([^"]+)"/)?.[1] || "") ||
      slug;
    const imagePath = block.match(
      /src="(\/web\/image\/product\.product\/\d+\/image_\d+\/[^"]+)"/,
    )?.[1];
    const price = parsePrice(block.match(/class="oe_currency_value">([^<]+)/)?.[1]);
    const productId = imagePath?.match(/product\.product\/(\d+)\//)?.[1] ?? null;
    products.push({
      slug,
      templateId,
      productId: productId ? Number(productId) : null,
      name,
      price,
      imagePath: imagePath ? imagePath.replace(/\/image_\d+\//, "/image_1024/") : null,
      sourcePath,
    });
  }
  return products;
}

function parseCategories(html) {
  const categories = [];
  const seen = new Set();
  const regex = /href="\/shop\/category\/([^"]+)"[^>]*aria-label="([^"]+)"/g;
  let match;
  while ((match = regex.exec(html))) {
    const full = match[1];
    const idMatch = full.match(/^(.*)-(\d+)$/);
    if (!idMatch || seen.has(full)) continue;
    seen.add(full);
    categories.push({
      slug: idMatch[1],
      sourceId: Number(idMatch[2]),
      sourceName: decodeEntities(match[2]),
      sourcePath: `/shop/category/${full}`,
    });
  }
  return categories;
}

async function mapPool(items, limit, worker) {
  const results = new Array(items.length);
  let index = 0;
  async function run() {
    while (index < items.length) {
      const current = index++;
      results[current] = await worker(items[current], current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()));
  return results;
}

async function collectPages(firstUrl, makePageUrl) {
  const all = [];
  const seen = new Set();
  for (let page = 1; page <= 40; page += 1) {
    const url = page === 1 ? firstUrl : makePageUrl(page);
    let html;
    try {
      html = await fetchText(url);
    } catch (error) {
      console.log("stop", url, error.message);
      break;
    }
    const batch = parseListing(html);
    const fresh = batch.filter((product) => {
      if (seen.has(product.slug)) return false;
      seen.add(product.slug);
      return true;
    });
    console.log(url, "products", batch.length, "fresh", fresh.length);
    if (fresh.length === 0) break;
    all.push(...fresh.map((product) => ({ ...product, html })));
    if (batch.length < 10) break;
  }
  return all.map(({ html, ...product }) => product);
}

function parseDetail(html) {
  const descriptionMatch = html.match(
    /class="oe_structure mb-3 text-muted">([\s\S]*?)<\/div>\s*(?:<div class="o_product_tags|<\/div>)/,
  );
  let description = descriptionMatch ? stripTags(descriptionMatch[1]) : "";
  if (
    !description ||
    description.includes("Une description détaillée") ||
    description === "\u00a0"
  ) {
    description = "";
  }

  const exclusionsMatch = html.match(/data-attribute-exclusions="([^"]+)"/);
  const specs = [];
  if (exclusionsMatch) {
    try {
      const json = JSON.parse(decodeEntities(exclusionsMatch[1]));
      const mapped = json.mapped_attribute_names || {};
      for (const value of Object.values(mapped)) {
        const text = String(value);
        const splitAt = text.indexOf(":");
        if (splitAt > 0) {
          specs.push({
            name: text.slice(0, splitAt).trim(),
            value: text.slice(splitAt + 1).trim(),
          });
        }
      }
    } catch {
      // Attribute payload is optional.
    }
  }

  const options = [];
  const section = html.match(
    /o_wsale_product_details_content_section_attributes[\s\S]*?<\/ul>/,
  );
  if (section && !/section_attributes mb-4 d-none/.test(html.slice(html.indexOf(section[0]) - 120, html.indexOf(section[0]) + 40))) {
    const groups = [...html.matchAll(/data-attribute-name="([^"]+)"[\s\S]*?<ul[^>]*o_wsale_product_attribute[\s\S]*?<\/ul>/g)];
    for (const group of groups) {
      const hidden = /variant_attribute d-none/.test(group[0].slice(0, 400));
      if (hidden) continue;
      const values = [...group[0].matchAll(/data-value-name="([^"]+)"/g)].map((item) =>
        decodeEntities(item[1]),
      );
      const unique = [...new Set(values)];
      if (unique.length > 1) {
        options.push({ name: decodeEntities(group[1]), values: unique });
      }
    }
  }

  const listPriceBlock = html.match(/name="product_list_price" class="([^"]*)"[\s\S]*?oe_currency_value">([^<]+)/);
  const compareAtPrice =
    listPriceBlock && !listPriceBlock[1].includes("d-none") ? parsePrice(listPriceBlock[2]) : null;

  return {
    description,
    specs,
    options,
    compareAtPrice,
  };
}

async function downloadImage(product) {
  if (!product.imagePath) return { image: null, imageHash: null };
  const url = `${BASE}${product.imagePath}`;
  try {
    const response = await fetch(url, { headers: HEADERS });
    if (!response.ok) return { image: null, imageHash: null };
    const type = response.headers.get("content-type") || "";
    const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < 800) return { image: null, imageHash: null };
    const hash = createHash("sha1").update(buffer).digest("hex");
    const filename = `${product.slug}.${ext}`;
    await writeFile(path.join(IMG_DIR, filename), buffer);
    return { image: `/products/${filename}`, imageHash: hash, imageBytes: buffer.length };
  } catch (error) {
    console.log("image fail", product.slug, error.message);
    return { image: null, imageHash: null };
  }
}

await mkdir(ROOT, { recursive: true });
await mkdir(IMG_DIR, { recursive: true });

console.log("listing shop");
const shopHtml = await fetchText(`${BASE}/shop`);
const categories = parseCategories(shopHtml);
console.log("categories", categories.map((category) => category.sourceName).join(" | "));

const listed = await collectPages(`${BASE}/shop`, (page) => `${BASE}/shop/page/${page}`);
const bySlug = new Map(listed.map((product) => [product.slug, { ...product, categorySlugs: [] }]));

for (const category of categories) {
  const pages = await collectPages(
    `${BASE}${category.sourcePath}`,
    (page) => `${BASE}${category.sourcePath}/page/${page}`,
  );
  category.count = pages.length;
  for (const product of pages) {
    const existing = bySlug.get(product.slug);
    if (existing) {
      if (!existing.categorySlugs.includes(category.slug)) existing.categorySlugs.push(category.slug);
      if (!existing.imagePath && product.imagePath) existing.imagePath = product.imagePath;
      if (existing.price == null && product.price != null) existing.price = product.price;
    } else {
      bySlug.set(product.slug, { ...product, categorySlugs: [category.slug] });
    }
  }
}

const products = [...bySlug.values()];
console.log("unique products", products.length);

await mapPool(products, 8, async (product, index) => {
  try {
    const html = await fetchText(`${BASE}${product.sourcePath}`);
    const detail = parseDetail(html);
    Object.assign(product, detail);
    if ((index + 1) % 25 === 0) console.log("details", index + 1, "/", products.length);
  } catch (error) {
    console.log("detail fail", product.slug, error.message);
    product.description = "";
    product.specs = [];
    product.options = [];
    product.compareAtPrice = null;
  }
});

console.log("images");
await mapPool(products, 6, async (product, index) => {
  const image = await downloadImage(product);
  Object.assign(product, image);
  if ((index + 1) % 25 === 0) console.log("images", index + 1, "/", products.length);
});

const hashCounts = new Map();
for (const product of products) {
  if (!product.imageHash) continue;
  hashCounts.set(product.imageHash, (hashCounts.get(product.imageHash) || 0) + 1);
}
for (const product of products) {
  product.imageIsSharedPlaceholder = product.imageHash ? (hashCounts.get(product.imageHash) || 0) >= 8 : false;
  delete product.imagePath;
}

const payload = {
  scrapedAt: new Date().toISOString(),
  source: BASE,
  categories,
  products: products.map((product, index) => ({ ...product, position: index })),
  stats: {
    products: products.length,
    withPrice: products.filter((product) => product.price != null).length,
    withDescription: products.filter((product) => product.description).length,
    withImage: products.filter((product) => product.image).length,
    sharedPlaceholders: products.filter((product) => product.imageIsSharedPlaceholder).length,
    uncategorized: products.filter((product) => product.categorySlugs.length === 0).length,
  },
};

await writeFile(path.join(ROOT, "catalog.json"), JSON.stringify(payload, null, 2));
console.log(payload.stats);
