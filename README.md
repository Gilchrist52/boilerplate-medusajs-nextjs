# Boilerplate MedusaJS + Next.js - Procedure locale + Docker

Ce repository utilise un mode hybride :

- `docker-compose.yml` : infrastructure Docker
- `docker-compose.jobs.yml` : jobs one-shot `migrate` et `seed`

L'infrastructure Docker contient actuellement :

- `db` : Postgres 16
- `redis` : Redis 7

Les applications sont lancees en local :

- `medusa` : API Medusa sur `localhost:9000`
- `web` : storefront Next.js sur `localhost:3000`

Les jobs lances a la demande contiennent :

- `migrate` : applique les migrations Medusa
- `seed` : injecte les donnees de demo

## Prerequis

- Docker Desktop ou Docker Engine avec Compose v2
- Node.js 20+
- Yarn 3
- Un fichier `.env` a la racine du projet

## 1. Configuration

Copie `.env.example` en `.env`, puis ajuste les valeurs si necessaire.

Exemple :

```bash
cp .env.example .env
```

Sous PowerShell :

```powershell
Copy-Item .env.example .env
```

Variables importantes :

- `DATABASE_URL=postgresql://medusa:medusa@db:5432/medusa`
- `REDIS_URL=redis://redis:6379`
- `STORE_CORS=http://localhost:3000`
- `AUTH_CORS=http://localhost:3000`
- `ADMIN_CORS=http://localhost:7001`
- `JWT_SECRET=supersecret`
- `COOKIE_SECRET=supersecret`
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=...`
- `MEDUSA_BACKEND_URL=http://localhost:9000`

## 2. Initialiser l'infrastructure Docker

Pour un premier lancement, commence par demarrer uniquement l'infrastructure :

```bash
docker compose up -d --build db redis
```

Cette commande demarre :

- `db`
- `redis`

Les services `migrate`, `seed`, `medusa` et `web` ne sont pas encore lances a cette etape.

## 3. Lancer les jobs manuellement

Important :

- `docker-compose.jobs.yml` ne doit pas etre lance seul
- il faut d'abord demarrer `db` et `redis` avec `docker compose up -d --build db redis`
- les commandes `migrate` et `seed` se lancent ensuite separement, une par une si besoin
- chaque commande ci-dessous lance uniquement le job demande
- on specifie aussi `docker-compose.yml` car `docker-compose.jobs.yml` depend des services declares dans le fichier principal
- autrement dit, `docker-compose.yml` doit deja etre demarre, puis `docker-compose.jobs.yml` sert a ajouter le job voulu

Pour lancer uniquement la migration :

```bash
docker compose -f docker-compose.yml -f docker-compose.jobs.yml up migrate
```

Pour lancer uniquement le seed :

```bash
docker compose -f docker-compose.yml -f docker-compose.jobs.yml up seed
```

Notes utiles :

- `seed` depend deja de `migrate`
- un `up seed` lance donc aussi `migrate` si necessaire
- ces jobs sont des conteneurs one-shot, donc leur etat final `exited` est normal

## 4. Recuperer la publishable key

Le seed genere une publishable key Medusa necessaire au storefront.

Apres le seed, recupere la cle depuis les logs :

```bash
docker compose -f docker-compose.yml -f docker-compose.jobs.yml logs seed
```

Sous PowerShell, si tu veux filtrer uniquement la ligne qui contient la cle :

```powershell
docker compose -f docker-compose.yml -f docker-compose.jobs.yml logs seed | Select-String "pk_"
```

Exemple de valeur attendue :

```text
pk_997469512c3cf740d72aec9bc608ed84b7281298a537c403230bc586f44baa09
```

Ensuite, mets cette valeur dans le fichier `web/.env.local` :

```env
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_997469512c3cf740d72aec9bc608ed84b7281298a537c403230bc586f44baa09
```

Important :

- fais cette mise a jour avant de lancer `web`
- si la cle change, pense a relancer le front local

## 5. Configurer les applications en local

### Medusa

Copie le template local du backend :

```powershell
Copy-Item .\medusa\.env.template .\medusa\.env.local
```

Puis verifie au minimum ces valeurs dans `medusa/.env.local` :

```env
STORE_CORS=http://localhost:3000,http://localhost:9000
ADMIN_CORS=http://localhost:9000,http://localhost:7001
AUTH_CORS=http://localhost:3000,http://localhost:9000
REDIS_URL=redis://localhost:6379
JWT_SECRET=supersecret
COOKIE_SECRET=supersecret
DATABASE_URL=postgresql://medusa:medusa@localhost:5432/medusa
```

### Web

Copie le template local du storefront :

```powershell
Copy-Item .\web\.env.template .\web\.env.local
```

Puis verifie au minimum ces valeurs dans `web/.env.local` :

```env
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_REGION=fr
```

## 6. Demarrer les applications en local

Installe d'abord les dependances si necessaire :

```bash
cd medusa
yarn install
cd ../web
yarn install
```

Ensuite lance le backend Medusa dans un terminal :

```bash
cd medusa
yarn dev
```

Puis lance le storefront Next.js dans un second terminal :

```bash
cd web
yarn dev
```

## 7. Verifier que tout est pret

Afficher l'etat des conteneurs :

```bash
docker compose ps
```

Suivre les logs de la stack principale :

```bash
docker compose logs -f
```

Le backend local doit ensuite repondre sur [http://localhost:9000](http://localhost:9000).

Le storefront local doit ensuite repondre sur [http://localhost:3000](http://localhost:3000).

Suivre les logs du job `migrate` :

```bash
docker compose -f docker-compose.yml -f docker-compose.jobs.yml logs -f migrate
```

Suivre les logs du job `seed` :

```bash
docker compose -f docker-compose.yml -f docker-compose.jobs.yml logs -f seed
```

## 8. Acces aux services

- Storefront : [http://localhost:3000](http://localhost:3000)
- API Medusa : [http://localhost:9000](http://localhost:9000)
- Postgres : `localhost:5432`
- Redis : `localhost:6379`

## 9. Donnees seedees

Le seed s'execute via le service `seed` du fichier `docker-compose.jobs.yml`.

Il cree un compte client storefront par defaut :

- Email : `customer@ledronehub.test`
- Mot de passe : `Test1234!`

Important :

- ce compte est un compte client pour le storefront
- il ne permet pas de se connecter a l'admin Medusa sur `http://localhost:9000/app/login`

## 10. Creer un compte admin par defaut

Pour creer un utilisateur admin Medusa, lance la commande suivante dans le dossier `medusa` :

```bash
npx medusa user -e admin@ledronehub.test -p Test1234!
```

Tu pourras ensuite te connecter a l'admin sur [http://localhost:9000/app/login](http://localhost:9000/app/login) avec :

- Email : `admin@ledronehub.test`
- Mot de passe : `Test1234!`

Selon ton script de seed, il peut aussi creer :

- les regions EUR et USD
- les produits de demo

## 11. Relancer uniquement le seed

Si tu veux rejouer le seed sans relancer toute la stack :

```bash
docker compose -f docker-compose.yml -f docker-compose.jobs.yml up seed
```

Attention :

- `docker-compose.yml` doit deja etre demarre
- le seed est idempotent pour certaines donnees, comme le client par defaut
- si tu veux repartir d'une base totalement propre, il vaut mieux supprimer les volumes puis relancer

## 12. Arret et nettoyage

Arreter la stack :

```bash
docker compose down
```

Arreter la stack et supprimer les volumes :

```bash
docker compose down -v
```

Puis relancer proprement :

```bash
docker compose up -d --build db redis
```

Puis rejouer les jobs :

```bash
docker compose -f docker-compose.yml -f docker-compose.jobs.yml up seed
```

## 13. Procedure conseillee en local

Pour un premier lancement :

```bash
docker compose down -v
docker compose up -d --build db redis
docker compose -f docker-compose.yml -f docker-compose.jobs.yml up migrate
docker compose -f docker-compose.yml -f docker-compose.jobs.yml up seed
```

Puis dans deux terminaux separes :

```bash
cd medusa
yarn dev
```

```bash
cd web
yarn dev
```

## 14. Notes techniques

- `migrate` et `seed` sont defines dans `docker-compose.jobs.yml`.
- `migrate` et `seed` sont des jobs one-shot avec `restart: "no"`.
- `db` et `redis` tournent dans Docker.
- `medusa` et `web` sont lances en local avec `yarn dev`.
- `docker-compose.jobs.yml` n'est pas autonome et suppose que `docker-compose.yml` est deja demarre.
- Le seed utilise `medusa exec ./src/scripts/seed.ts`.

## 15. Depannage

- Si `seed` echoue, verifie les logs avec `docker compose -f docker-compose.yml -f docker-compose.jobs.yml logs -f seed`.
- Si `migrate` echoue, verifie les logs avec `docker compose -f docker-compose.yml -f docker-compose.jobs.yml logs -f migrate`.
- Si `medusa` ne demarre pas en local, verifie `medusa/.env.local`.
- Si `web` ne demarre pas en local, verifie `web/.env.local` et la publishable key.
- Si la base est dans un etat incoherent, relance depuis zero avec `docker compose down -v`.
