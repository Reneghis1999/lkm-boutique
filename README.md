# LKM Boutique

Boutique e-commerce frontend Next.js pour LKM Boutique (Lomé) — catalogue local, panier et commandes WhatsApp.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Framer Motion + GSAP
- Zustand (panier persisté)
- Lucide React

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Données

- Catalogue scrapé : `scraped/catalog.json` → transformé dans `src/data/catalog.json`
- Infos boutique / WhatsApp : `src/data/shop.ts`
- Services réparation : `src/data/services.ts`
- Images produits : `public/products/`

Le numéro WhatsApp se configure via `shop.whatsapp` dans `src/data/shop.ts`.

## Scripts

```bash
npm run build
npm run lint
npm start
```
