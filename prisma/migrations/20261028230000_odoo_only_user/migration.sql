-- Back-office local retiré : le catalogue / ventes passent par Odoo.
-- On conserve uniquement la table User (auth admin statut).

DROP TABLE IF EXISTS "SaleLine" CASCADE;
DROP TABLE IF EXISTS "Sale" CASCADE;
DROP TABLE IF EXISTS "ProductCategory" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "Category" CASCADE;
DROP TABLE IF EXISTS "Customer" CASCADE;
DROP TABLE IF EXISTS "Sequence" CASCADE;
