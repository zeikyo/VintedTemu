# StockPilot

Application SaaS React + TypeScript pour suivre une activité d'achat-revente Temu, Vinted et Pokémon : stock, ventes, dépenses, bénéfice net et ROI.

## Fonctionnalités

- Authentification Supabase et isolation des données avec RLS.
- Produits, stock, ventes, dépenses, plateformes et catégories.
- Calcul automatique du coût unitaire, bénéfice net, ROI et marge.
- Dashboard, graphiques, classements et badges de rentabilité.
- Recherche, filtres, import/export CSV et confirmations de suppression.
- Interface responsive avec mode de démonstration local.

## Installation

```bash
npm install
copy .env.example .env.local
npm run dev
```

Sans variables Supabase, l'application démarre en mode local avec un espace vide stocké dans `localStorage`.

## Configuration Supabase

1. Créer un projet sur Supabase.
2. Ouvrir `SQL Editor` et exécuter [`supabase/schema.sql`](supabase/schema.sql).
3. Dans `Authentication > URL Configuration` :
   - définir `Site URL` avec l'URL de production exacte ;
   - ajouter `https://votre-domaine.fr/auth/callback` dans `Redirect URLs` ;
   - ajouter `http://localhost:5173/auth/callback` pour le développement local.
4. Copier l'URL du projet et la clé publique `anon` dans `.env.local` :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon
```

Les politiques RLS du schéma garantissent que chaque utilisateur ne peut lire et modifier que ses propres lignes.

Si les tables ont déjà été créées avec une version antérieure, exécuter plutôt
[`supabase/migrate-existing.sql`](supabase/migrate-existing.sql). Cette migration
préserve les données et peut être relancée plusieurs fois.

Si le diagnostic indique uniquement `GRANT MANQUANT`, exécuter le script court
[`supabase/fix-permissions.sql`](supabase/fix-permissions.sql).

Pour activer le statut cadeau sur une base existante, exécuter
[`supabase/add-gift-status.sql`](supabase/add-gift-status.sql).

## Calculs

- Coût unitaire = `(prix d'achat total + livraison achat) / quantité`
- Bénéfice net vente = `prix vente - coût unitaire - frais - emballage - remise - livraison à charge`
- ROI = `bénéfice net / coût unitaire × 100`
- Bénéfice net global = `bénéfices des ventes - dépenses générales`

## Déploiement Vercel

1. Importer le dépôt dans Vercel.
2. Le preset Vite est détecté automatiquement.
3. Ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans `Settings > Environment Variables`.
4. Déployer.
5. Dans Supabase Auth, définir l'URL finale comme `Site URL` et ajouter
   `https://votre-url-vercel.app/auth/callback` aux `Redirect URLs`.

Le fichier `vercel.json` redirige toutes les routes vers React Router.

## Commandes

```bash
npm run dev
npm run build
npm run check:supabase
npm run lint
npm run preview
```
"# VintedTemu" 
