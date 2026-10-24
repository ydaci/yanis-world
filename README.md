# Yanis' World — Blog multilingue

Un projet **Next.js 15 + React 19 + TypeScript + Supabase**, inspiré des maquettes Figma de Yanis' World.

## 1. Démarrage immédiat

Prérequis : Node.js 20+ et npm.

```bash
npm install
npm run dev
```

Ouvrir **http://localhost:3000**. Sans fichier `.env.local`, les pages fonctionnent en **mode démonstration** avec des articles fictifs. Les commentaires et l'administration ne persistent PAS encore.

## 2. Activer la vraie base de données Supabase

1. Créer un projet sur https://supabase.com ; dans **SQL Editor**, exécuter `supabase/schema.sql`.
2. Dans **Authentication > Users**, créer ton propre utilisateur (email + mot de passe).
3. Copier l'UUID de cet utilisateur, puis exécuter dans SQL Editor :
   ```sql
   insert into public.admin_users(user_id) values ('TON-UUID-ICI');
   ```
4. Copier `.env.example` vers `.env.local`. Renseigner l'URL du projet et la **clé publique anon/publishable** (jamais la clé service_role).
5. Relancer `npm run dev` et ouvrir **http://localhost:3000/admin/login**.
6. Écrire un article, cocher **Publish now**, enregistrer. Les commentaires des visiteurs seront en attente de modération dans `/admin`.

Les articles de démonstration disparaissent volontairement une fois Supabase activé : crée alors tes vrais articles.

## 3. Pages

- `/` — accueil anglais
- `/japan`, `/china`, `/korea` — journaux
- `/{lang}/{slug}` — lecture + commentaire avec pseudo
- `/about` — présentation
- `/admin/login` et `/admin` — espace de publication privé

## 4. Design et images

La direction artistique suit les maquettes : ivoire, vert foncé, rose sakura, terracotta et vert sauge. Les images fournies sont des **illustrations vectorielles originales locales** inspirées des paysages, pour que le site fonctionne sans images externes, clés API ni problèmes de droits. Tu peux ensuite remplacer les fichiers de `public/` par tes propres photos sous licence adaptée.

## 5. Avant mise en production

- Mettre en place CAPTCHA et limitation de fréquence contre le spam des commentaires (l'exemple ne suffit pas pour un trafic réel).
- Tester les politiques RLS, la connexion / déconnexion, la modération et les formulaires.
- Configurer ton domaine sur Vercel, ses variables d'environnement, les pages légales et une politique de confidentialité adaptée.
- Conserver les secrets dans `.env.local` et jamais dans GitHub.

## 6. Hébergement

Pousser le dossier sur GitHub ; importer le dépôt dans Vercel ; ajouter les deux variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
