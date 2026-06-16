FROM node:20-alpine AS base
WORKDIR /app

RUN corepack enable && corepack prepare yarn@3.2.3 --activate

COPY . .

ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG MEDUSA_BACKEND_URL
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}
ENV MEDUSA_BACKEND_URL=${MEDUSA_BACKEND_URL}

RUN yarn install --immutable
RUN yarn build

# ─── Runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/yarn.lock ./yarn.lock
COPY --from=base /app/.yarnrc.yml ./.yarnrc.yml

EXPOSE 3000
# Lancer next directement sans passer par yarn
CMD ["node_modules/.bin/next", "start", "-p", "3000"]