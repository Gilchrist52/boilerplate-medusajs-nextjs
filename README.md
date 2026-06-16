# Boilerplate MedusaJS + Next.js - Procedure Docker

Ce repository peut etre lance entierement avec Docker Compose.

La stack demarree contient :

- `db` : Postgres 16
- `redis` : Redis 7
- `migrate` : job one-shot pour les migrations Medusa
- `seed` : job one-shot pour injecter les donnees de demo
- `medusa` : API Medusa sur le port `9000`
- `web` : storefront Next.js sur le port `3000`

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

## 2. Demarrage complet

Pour construire les images et demarrer toute la stack :

```bash
docker compose up -d --build
```

Ordre logique de demarrage :

1. `db` et `redis`
2. `migrate`
3. `seed`
4. `medusa`
5. `web`

Le service `seed` est automatique et ne tourne qu'une seule fois. Il cree notamment :

- les regions EUR et USD
- les produits de demo
- le client par defaut

## 3. Verifier que tout est pret

Afficher l'etat des conteneurs :

```bash
docker compose ps
```

Suivre les logs globaux :

```bash
docker compose logs -f
```

Suivre uniquement le seed :

```bash
docker compose logs -f seed
```

Suivre uniquement Medusa :

```bash
docker compose logs -f medusa
```

## 4. Acces aux applications

- Storefront : [http://localhost:3000](http://localhost:3000)
- API Medusa : [http://localhost:9000](http://localhost:9000)
- Postgres : `localhost:5432`
- Redis : `localhost:6379`

## 5. Donnees seedees

Le seed s'execute via le service `seed` du `docker-compose.yml`.

Il cree un client par defaut :

- Email : `customer@ledronehub.test`
- Mot de passe : `Test1234!`

## 6. Relancer uniquement le seed

Si tu veux rejouer le seed sans relancer toute la stack :

```bash
docker compose run --rm seed
```

Attention :

- le seed est idempotent pour certaines donnees, comme le client par defaut
- si tu veux repartir d'une base totalement propre, il vaut mieux supprimer les volumes puis relancer

## 7. Arret et nettoyage

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

## 8. Procedure conseillee en local

Pour un premier lancement :

```bash
docker compose down -v
docker compose up -d --build
docker compose ps
docker compose logs -f seed
```

Ensuite ouvre :

- [http://localhost:3000](http://localhost:3000)
- [http://localhost:9000](http://localhost:9000)

## 9. Notes techniques

- `migrate` et `seed` sont des jobs one-shot avec `restart: "no"`.
- `medusa` attend la fin des migrations et du seed avant de demarrer.
- `web` attend que `medusa` soit en bonne sante.
- Le seed utilise `medusa exec ./src/scripts/seed.ts`.

## 10. Depannage

- Si `web` ne demarre pas, verifie que `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` est bien renseigne dans `.env`.
- Si `medusa` ne demarre pas, verifie les logs avec `docker compose logs -f medusa`.
- Si `seed` echoue, verifie les logs avec `docker compose logs -f seed`.
- Si la base est dans un etat incoherent, relance depuis zero avec `docker compose down -v`.
