FROM node:20-alpine AS base
WORKDIR /app

RUN corepack enable && corepack prepare yarn@3.2.3 --activate

ENV YARN_HTTP_TIMEOUT=300000

COPY . .

RUN yarn install --immutable

RUN yarn build

# ─── Runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable && corepack prepare yarn@3.2.3 --activate

# Copier tout le dossier .medusa pour embarquer le build serveur et le build admin
COPY --from=base /app/.medusa ./.medusa
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/yarn.lock ./yarn.lock
COPY --from=base /app/.yarnrc.yml ./.yarnrc.yml
COPY --from=base /app/src ./src
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/medusa-config.ts ./medusa-config.ts
COPY --from=base /app/tsconfig.json ./tsconfig.json

EXPOSE 9000
# medusa start est disponible via node_modules/.bin
CMD ["node_modules/.bin/medusa", "start"]
