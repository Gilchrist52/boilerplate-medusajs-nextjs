# Boilerplate MedusaJS + Next.js - Procedure Docker

Ce repository utilise maintenant deux fichiers Docker Compose distincts :

- `docker-compose.yml` : stack principale
- `docker-compose.jobs.yml` : jobs one-shot `migrate` et `seed`

La stack principale contient actuellement :

- `db` : Postgres 16
- `redis` : Redis 7

Les jobs lances a la demande contiennent :

- `migrate` : applique les migrations Medusa
- `seed` : injecte les donnees de demo

## Prerequis

- Docker Desktop ou Docker Engine avec Compose v2
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

## 2. Demarrage de la stack principale

Pour construire les images et demarrer la stack principale :

```bash
docker compose up -d --build
```

Cette commande demarre uniquement :

- `db`
- `redis`

Les services `migrate` et `seed` ne sont plus executes automatiquement au demarrage.

## 3. Lancer les jobs manuellement

Pour appliquer les migrations :

```bash
docker compose -f docker-compose.yml -f docker-compose.jobs.yml up migrate
```

Pour lancer le seed :

```bash
docker compose -f docker-compose.yml -f docker-compose.jobs.yml up seed
```

Notes utiles :

- `seed` depend deja de `migrate`
- un `up seed` lance donc aussi `migrate` si necessaire
- ces jobs sont des conteneurs one-shot, donc leur etat final `exited` est normal

## 4. Verifier que tout est pret

Afficher l'etat des conteneurs :

```bash
docker compose ps
```

Suivre les logs de la stack principale :

```bash
docker compose logs -f
```

Suivre les logs des migrations :

```bash
docker compose -f docker-compose.yml -f docker-compose.jobs.yml logs -f migrate
```

Suivre les logs du seed :

```bash
docker compose -f docker-compose.yml -f docker-compose.jobs.yml logs -f seed
```

## 5. Acces aux services

- Postgres : `localhost:5432`
- Redis : `localhost:6379`

Si tu reactives plus tard les services `medusa` et `web` dans `docker-compose.yml`, tu pourras aussi exposer :

- Storefront : [http://localhost:3000](http://localhost:3000)
- API Medusa : [http://localhost:9000](http://localhost:9000)

## 6. Donnees seedees

Le seed s'execute via le service `seed` du fichier `docker-compose.jobs.yml`.

Il cree un compte client storefront par defaut :

- Email : `customer@ledronehub.test`
- Mot de passe : `Test1234!`

Important :

- ce compte est un compte client pour le storefront
- il ne permet pas de se connecter a l'admin Medusa sur `http://localhost:9000/app/login`

## 7. Creer un compte admin par defaut

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

## 8. Relancer uniquement le seed

Si tu veux rejouer le seed sans relancer toute la stack :

```bash
docker compose -f docker-compose.yml -f docker-compose.jobs.yml up seed
```

Attention :

- le seed est idempotent pour certaines donnees, comme le client par defaut
- si tu veux repartir d'une base totalement propre, il vaut mieux supprimer les volumes puis relancer

## 9. Arret et nettoyage

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
docker compose up -d --build
```

Puis rejouer les jobs :

```bash
docker compose -f docker-compose.yml -f docker-compose.jobs.yml up seed
```

## 10. Procedure conseillee en local

Pour un premier lancement :

```bash
docker compose down -v
docker compose up -d --build
docker compose -f docker-compose.yml -f docker-compose.jobs.yml up seed
docker compose ps
docker compose -f docker-compose.yml -f docker-compose.jobs.yml logs -f seed
```

## 11. Notes techniques

- `migrate` et `seed` sont defines dans `docker-compose.jobs.yml`.
- `migrate` et `seed` sont des jobs one-shot avec `restart: "no"`.
- `docker compose up` sur le fichier principal ne relance plus le seed automatiquement.
- Le seed utilise `medusa exec ./src/scripts/seed.ts`.

## 12. Depannage

- Si `seed` echoue, verifie les logs avec `docker compose -f docker-compose.yml -f docker-compose.jobs.yml logs -f seed`.
- Si `migrate` echoue, verifie les logs avec `docker compose -f docker-compose.yml -f docker-compose.jobs.yml logs -f migrate`.
- Si la base est dans un etat incoherent, relance depuis zero avec `docker compose down -v`.
