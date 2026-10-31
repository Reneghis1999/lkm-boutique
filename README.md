# LKM Boutique

Boutique e-commerce Next.js pour LKM Boutique (Lomé) — catalogue géré dans **Odoo**, panier et commandes WhatsApp.

Connexion Odoo (configuration, procédure, vérification) : voir [`docs/ODOO.md`](docs/ODOO.md).

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

- Catalogue : **Odoo** (produits publiés) dès que `ODOO_URL` + `ODOO_API_KEY` sont définis
- Catalogue de secours (sans Odoo) : `src/data/catalog.json`
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
npm run odoo:check   # vérifie la connexion Odoo (.env.local)
```
