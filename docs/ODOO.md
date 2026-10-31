# Connexion Odoo → site Next.js

## Principe

| Système | Rôle |
|---------|------|
| **Odoo** (`lkm-boutique.odoo.com`) | **Le seul outil du client** : il crée / modifie ses produits, prix, photos, catégories |
| **Site Next.js** | Affiche ce qui est dans Odoo + panier / commande WhatsApp |
| **`/admin`** | Page de test **réservée au développeur** (statut de la connexion, diagnostic) |
| **`src/data/catalog.json`** | Catalogue de secours, utilisé seulement si Odoo est injoignable ou non configuré |

**Ce que le client fait dans Odoo apparaît sur le site dès qu’on recharge la
page** : aucun cache entre deux visites, chaque page relit Odoo.

### Ce qui s’affiche sur le site

Exactement les produits de la boutique en ligne Odoo :

- **« Peut être vendu »** coché, et
- **« Publié »** sur le site web (bouton *Publier* / champ *Publié*).

| Dans Odoo | Sur le site |
|---|---|
| Nom, prix de vente | Nom, prix (prix à 0 → « Prix à confirmer ») |
| Prix barré (*compare_list_price*) | Prix barré |
| Photo principale | Photo (mise à jour dès qu’elle change) |
| **Catégories du site web** (eCommerce) | Catégories et rubriques (Mobile, PC, Consoles…) |
| Description eCommerce / description de vente | Description |
| Attributs (Couleur, Capacité…) | Choix (≥ 2 valeurs) ou caractéristiques (1 valeur) |
| Ruban (*Nouveau*, *Promo*…) | Produit mis en avant sur la page d’accueil |
| Ordre de la boutique (*website_sequence*) | Ordre « Pertinence » |
| Dépublier / archiver | Le produit disparaît du site |

Une **nouvelle catégorie** créée dans Odoo apparaît automatiquement ; sa rubrique
(Mobile, PC, Gaming, Audio, Réparation) est déduite de son nom ou de sa
catégorie parente. Les catégories existantes gardent leur adresse et leur
présentation ; si le client les renomme, le nouveau nom s’affiche.

## Prérequis côté Odoo

1. Abonnement **Custom** : l’API externe n’existe pas sur les plans *Standard*
   ou *One App Free*.
2. Une **clé API** : avatar → *Mon profil / Préférences* → onglet *Sécurité du
   compte* → *Nouvelle clé API*. Durée **3 mois maximum** (limite Odoo) →
   noter la date et **renouveler avant expiration** (sinon le site repasse sur
   le catalogue de secours). La clé ne s’affiche qu’une fois : la copier.
   Idéalement, créer la clé sur un utilisateur dédié « API Site Web » avec les
   droits Ventes / Inventaire / Site web en lecture.

## Variables d’environnement

`.env.local` (local) et Vercel → *Settings → Environment Variables* :

```env
CATALOG_SOURCE=odoo
ODOO_URL=https://lkm-boutique.odoo.com
ODOO_API_KEY=la_cle_copiee_depuis_odoo
# ODOO_DB=   (inutile sur Odoo Online)
```

- `odoo` / `auto` : Odoo si la clé est définie (erreur → catalogue JSON + log)
- `json` : ignore Odoo

Jamais de préfixe `NEXT_PUBLIC_` : la clé reste côté serveur.
Après modification sur Vercel : **Redeploy**.

## Procédure sur place

1. Créer la clé API (voir ci-dessus) et la coller dans `.env.local`.
2. Vérifier : `npm run odoo:check` — affiche la connexion, la date d’expiration
   de la clé, le nombre de produits / photos / catégories, les produits sans
   catégorie ou sans photo, et les différences avec le catalogue actuel.
3. `npm run dev` → `http://localhost:3000/admin` (statut vert) et `/boutique`.
4. Démo : créer un produit test dans Odoo (prix, photo, catégorie du site web,
   **Publié**) → recharger le site → il apparaît.
5. Ajouter les variables sur Vercel → Redeploy → refaire la démo en ligne.

## Fichiers

- `src/lib/odoo/config.ts` — variables d’environnement
- `src/lib/odoo/client.ts` — appels API JSON-2 (Odoo 19+), test de connexion
- `src/lib/odoo/catalog.ts` — lecture produits, catégories, photos, attributs
- `src/lib/odoo/map-product.ts` — conversion Odoo → format du site
- `src/lib/catalog.ts` — accès catalogue côté serveur (Odoo ou JSON de secours)
- `src/lib/catalog-filter.ts` — filtres / tri (utilisables côté navigateur)
- `src/app/api/odoo/image/[id]/[version]/route.ts` — photos des produits
- `scripts/odoo-check.ts` — vérification (`npm run odoo:check`)
- `/admin` — statut et diagnostic (développeur uniquement)
