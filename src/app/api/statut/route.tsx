/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import { ImageResponse } from "next/og";
import { getFeaturedProducts, getNewArrivals, getPromoProducts } from "@/lib/catalog";
import { formatPrice, hasPrice } from "@/lib/format";
import { priceRange } from "@/lib/variants";
import type { Product } from "@/types";

/**
 * Image du jour pour le statut WhatsApp / TikTok (1080 × 1920).
 * ?type=nouveautes | promos   &download=1 pour télécharger.
 */
const W = 1080;
const H = 1920;
const YELLOW = "#f5c518";

/** Photo du produit en « data URL » (seulement JPEG/PNG, sinon rien). */
async function photo(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (!/image\/(png|jpe?g)/.test(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return `data:${type.split(";")[0]};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

function priceLabel(p: Product) {
  const range = priceRange(p);
  if (range) return `dès ${formatPrice(range.min)}`;
  return hasPrice(p.price) ? formatPrice(p.price) : "Prix sur WhatsApp";
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const type = params.get("type") === "promos" ? "promos" : "nouveautes";

  let products: Product[];
  let title: string;
  let subtitle: string;
  if (type === "promos") {
    products = (await getPromoProducts()).filter((p) => p.image).slice(0, 4);
    title = "PROMOS";
    subtitle = "Prix réduits, dans la limite des stocks";
    if (products.length === 0) {
      products = await getFeaturedProducts(4);
      title = "SÉLECTION";
      subtitle = "Nos coups de cœur du moment";
    }
  } else {
    products = await getNewArrivals(4);
    title = "NOUVEAUTÉS";
    subtitle = "Arrivés cette semaine en boutique";
  }

  const [logo, ...photos] = await Promise.all([
    photo(new URL("/logo-lkm.png", request.url).toString()),
    ...products.map((p) => photo(p.image)),
  ]);

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(180deg, #0b0b0f 0%, #141a14 100%)",
          color: "white",
          padding: "70px 60px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {logo ? <img src={logo} width={120} height={120} style={{ borderRadius: 24 }} /> : null}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 44, fontWeight: 700 }}>LKM Boutique</div>
            <div style={{ fontSize: 30, color: "rgba(255,255,255,0.6)" }}>Tech & Gaming · Lomé</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 60 }}>
          <div style={{ fontSize: 110, fontWeight: 800, color: YELLOW, letterSpacing: -2 }}>{title}</div>
          <div style={{ fontSize: 36, color: "rgba(255,255,255,0.7)", marginTop: 6 }}>{subtitle}</div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            marginTop: 50,
            rowGap: 36,
          }}
        >
          {products.map((p, i) => (
            <div
              key={p.id}
              style={{
                width: 465,
                display: "flex",
                flexDirection: "column",
                background: "rgba(255,255,255,0.06)",
                borderRadius: 32,
                padding: 22,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: 400,
                  background: "white",
                  borderRadius: 22,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {photos[i] ? (
                  <img src={photos[i]!} style={{ maxWidth: "92%", maxHeight: "92%", objectFit: "contain" }} />
                ) : (
                  <div style={{ fontSize: 30, color: "#999" }}>LKM</div>
                )}
              </div>
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 600,
                  marginTop: 18,
                  height: 88,
                  overflow: "hidden",
                  lineHeight: 1.25,
                }}
              >
                {p.name.length > 42 ? `${p.name.slice(0, 40)}…` : p.name}
              </div>
              <div style={{ fontSize: 44, fontWeight: 800, color: YELLOW, marginTop: 8 }}>{priceLabel(p)}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "auto" }}>
          <div
            style={{
              display: "flex",
              background: "#25d366",
              color: "#0b0b0f",
              fontSize: 44,
              fontWeight: 800,
              padding: "24px 48px",
              borderRadius: 999,
            }}
          >
            Commandez sur WhatsApp · 90 00 25 91
          </div>
          <div style={{ fontSize: 38, fontWeight: 700, marginTop: 26 }}>lkmboutique.store</div>
          <div style={{ fontSize: 30, color: "rgba(255,255,255,0.6)", marginTop: 10 }}>
            Djidjolé · Léo 2000 (en face de la clinique)
          </div>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
        ...(params.get("download")
          ? { "Content-Disposition": `attachment; filename="lkm-${type}-${new Date().toISOString().slice(0, 10)}.png"` }
          : {}),
      },
    },
  );
  return image;
}
