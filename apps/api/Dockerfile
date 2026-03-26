FROM node:20-alpine AS base
RUN npm install -g pnpm@9.15.4

# --- Builder stage ---
FROM base AS builder
WORKDIR /app

# Copy workspace manifests for dependency resolution
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/config/package.json ./packages/config/
COPY packages/db/package.json ./packages/db/
COPY packages/types/package.json ./packages/types/
COPY packages/validators/package.json ./packages/validators/

RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/api ./apps/api
COPY packages ./packages

# Generate Prisma client
RUN pnpm --filter @sanchay/db db:generate

# Build
RUN pnpm --filter @sanchay/api build

# --- Runner stage ---
FROM node:20-alpine AS runner
RUN npm install -g pnpm@9.15.4
WORKDIR /app

ENV NODE_ENV=production

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/config/package.json ./packages/config/
COPY packages/db/package.json ./packages/db/
COPY packages/types/package.json ./packages/types/
COPY packages/validators/package.json ./packages/validators/

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/packages/db/prisma ./packages/db/prisma

EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]
