import { isOdooReady } from "@/lib/odoo/config";
import { fetchOdooProductImage } from "@/lib/odoo/catalog";

/**
 * Photo d’un produit Odoo : /api/odoo/image/<id produit>/<version>.
 * La version change dès que la photo change dans Odoo → nouvelle URL, donc
 * l’image peut être mise en cache « pour toujours » sans jamais être périmée.
 */
function sniffImageType(bytes: Buffer): string | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0x89 && bytes.toString("ascii", 1, 4) === "PNG") {
    return "image/png";
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "image/jpeg";
  if (
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  if (bytes.toString("ascii", 0, 3) === "GIF") return "image/gif";
  return null;
}

function notFound(maxAge = 60) {
  return new Response("Image introuvable", {
    status: 404,
    headers: { "Cache-Control": `public, max-age=${maxAge}` },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; version: string }> },
) {
  const { id } = await params;
  const templateId = Number(id);
  if (!Number.isInteger(templateId) || templateId <= 0) return notFound(3600);
  if (!isOdooReady()) return notFound();

  let bytes: Buffer | null;
  try {
    bytes = await fetchOdooProductImage(templateId);
  } catch (e) {
    console.error("[odoo-image]", e);
    return new Response("Odoo indisponible", {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }

  if (!bytes) return notFound();
  const type = sniffImageType(bytes);
  if (!type) return notFound();

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": type,
      "Content-Length": String(bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
