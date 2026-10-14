# Production image for the API server and the built client.
# Build and run the whole stack with `docker compose up -d --build`.

FROM node:26-alpine AS base
# Node 25+ no longer ships corepack, so pnpm comes from npm.
RUN npm install -g pnpm@12.3.4
WORKDIR /app

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM node:26-alpine
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080
WORKDIR /app
COPY package.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/server-built ./server-built
COPY --from=build /app/static ./static
COPY public ./public
# The server applies these on boot.
COPY drizzle ./drizzle
USER node
EXPOSE 8080
CMD ["node", "server-built/server.js"]
