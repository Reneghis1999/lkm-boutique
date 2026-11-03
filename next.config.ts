import type { NextConfig } from "next";

// Photos produits servies par la boutique publique Odoo (domaine de ODOO_URL).
const odooHost = (() => {
  try {
    return process.env.ODOO_URL ? new URL(process.env.ODOO_URL).hostname : null;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  // Anciennes adresses de catégories (fautes corrigées) → nouvelles adresses.
  async redirects() {
    return [
      { source: "/categorie/chargeur-telephone-porteble", destination: "/categorie/chargeur-telephone-portable", permanent: true },
      { source: "/categorie/consol-de-jeux", destination: "/categorie/console-de-jeux", permanent: true },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      ...(odooHost
        ? [{ protocol: "https" as const, hostname: odooHost, pathname: "/web/image/**" }]
        : []),
      {
        protocol: "https",
        hostname: "**.odoo.com",
      },
      {
        protocol: "https",
        hostname: "lkm-boutique.odoo.com",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
