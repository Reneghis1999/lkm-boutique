# Déploiement LKM — Supabase + Vercel

## 1. Créer le projet Supabase
1. Va sur https://supabase.com → New project
2. **Database → Connection string → URI**
3. Copie l’URL dans `DATABASE_URL` (`.env` local + Vercel)

## 2. Storage images
1. Storage → New bucket `product-images` → **Public**
2. Policies : autoriser lecture publique + upload via service role
3. Renseigne dans `.env` :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

Sans Storage, les uploads partent dans `/public/uploads` (OK en local, pas idéal sur Vercel).

## 3. Local
```bash
# .env avec DATABASE_URL Supabase + AUTH_*
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Admin : `/admin/login`  
Email / mdp : valeurs `ADMIN_EMAIL` / `ADMIN_PASSWORD`

## 4. Vercel
Variables d’environnement :
- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_URL` = URL du site Vercel
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` (pour re-seed si besoin)

Build command : `prisma migrate deploy && prisma generate && next build`  
(ou garde `npm run build` + ajoute migrate en `postinstall` / build override)

## 5. Après premier deploy
```bash
npm run db:seed
```
(une fois, avec `DATABASE_URL` pointant sur Supabase)
