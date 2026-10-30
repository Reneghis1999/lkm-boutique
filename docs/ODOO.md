# Connexion Odoo → Next.js

## Rôle de chaque système

| Système | Rôle |
|---------|------|
| **Odoo** (`lkm-boutique.odoo.com`) | Back-office : produits, stock, clients, factures |
| **Next.js** | Vitrine + panier WhatsApp |
| **Postgres** | Compte admin uniquement (page `/admin` statut) |
| **`catalog.json`** | Fallback tant que l’API Odoo n’est pas branchée |

## Variables

```env
CATALOG_SOURCE=auto
ODOO_URL=https://lkm-boutique.odoo.com
ODOO_API_KEY=...
ODOO_DB=
```

- `auto` : Odoo si clé OK, sinon JSON  
- `odoo` : force Odoo (erreur → fallback JSON loggé)  
- `json` : ignore Odoo  

## Prérequis côté client

1. Plan Odoo avec **API externe** (souvent Custom, pas Free/Standard).
2. Clé API : Préférences → Sécurité du compte → New API Key.
3. Nous coller la clé (jamais dans le front).

## Fichiers prêts

- `src/lib/odoo/config.ts` — env  
- `src/lib/odoo/client.ts` — JSON-2 API  
- `src/lib/odoo/map-product.ts` — mapping  
- `src/lib/odoo/catalog.ts` — lecture produits  
- `src/lib/catalog.ts` — bascule auto / odoo / json  
- `/admin` — test de connexion  

## Quand la clé arrive

1. Ajouter les env en local + Vercel  
2. Ouvrir `/admin` → vérifier le statut vert  
3. Affiner le mapping (images URL, `website_published`, catégories e‑commerce)  
