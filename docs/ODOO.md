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

## Réparations (page /reparation)

Gérées dans Odoo comme le client le fait déjà : fiches (type Service) dans sa
**catégorie interne « REPARATION »** (Inventaire), ou dans une catégorie du
site web « Services de réparation ». Une fiche **publiée** apparaît sur la page
Réparation (et plus dans la boutique) ; dépubliée, elle disparaît.

| Dans Odoo | Sur le site |
|---|---|
| « Changement … » / « Remplacement … » au prix de 2 000 | « Main d’œuvre 2 000 CFA + pièce selon le modèle » |
| … avec « Pièce à partir de 15000 » dans la description | « Pièce à partir de 15 000 CFA + main d’œuvre 2 000 CFA » |
| Autre service (flash, mise à jour, récupération…) | « Forfait [prix], main d’œuvre comprise » |
| Étiquette « Forfait » | Forfait, quel que soit le nom |
| Prix à 0 | « Sur devis » |
| Ruban (Nouveau !, Ventes…) | « Le plus demandé » |
| Nom contenant iPhone / PC / console… | Onglet Téléphones / Ordinateurs / Consoles (téléphone par défaut) |
| Photo de la fiche | Photo de la carte (mise à jour dès qu’elle change) ; sans photo, une icône |

Le bouton WhatsApp reprend le nom et le prix d’Odoo. Tant qu’aucune fiche de
réparation n’est publiée, le site affiche les tarifs de secours de
`src/data/repairs.ts`. Nom de catégorie personnalisable : `ODOO_REPAIR_CATEGORY`.

Les rubans « Épuisé » / « En rupture de stock » ne mettent pas un produit en
avant sur l’accueil.

## Promotions (accueil, menu, page /promotions)

Catégorie **« PROMOTION »** (interne, comme celle du client) ou catégorie du
site web « Promotions ». Tout produit **publié** qui y est rangé :
- apparaît dans la section « Les promos du moment » de l’accueil (8 max ;
  section masquée s’il n’y a aucune promo) et sur la page `/promotions` ;
- fait apparaître le nombre de promos à côté du menu « Promotions » ;
- reste visible dans la boutique, avec un badge « Promo ».

Avec un **prix barré** (champ « Prix barré » / compare price dans Odoo), la carte
affiche l’ancien prix barré et le badge « Promo -X% ». Sortir le produit de la
catégorie = fin de la promo sur le site. Nom personnalisable : `ODOO_PROMO_CATEGORY`.

## Coordonnées et horaires des boutiques

- **Téléphones et adresses** : lus dans les **sociétés Odoo** (Paramètres →
  Sociétés → « LKM Boutique Leo 2000 » / « LKM Boutique Djidjole » : champs
  Téléphone, Rue, Ville). Champ vide → valeur du site (`src/data/shop.ts`).
  Le numéro WhatsApp reste celui du site (`shop.whatsapp`).
- **Horaires** : `src/data/shop.ts` (`hours.weekly`) — lundi au samedi 8h–21h,
  dimanche 10h–20h. Badge « Ouvert maintenant / Fermé » calculé à l’heure de
  Lomé (pied de page, Contact, accueil, Réparation).

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
