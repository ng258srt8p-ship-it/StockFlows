# StockFlows v7 — Shopify App Dockerfile for Fly.io
# Multi-stage build for production deployment

# Stage 1: Build
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY app/package.json ./app/
COPY packages/stockflows-ui/package.json ./packages/stockflows-ui/
COPY packages/website/package.json ./packages/website/
COPY packages/demo/package.json ./packages/demo/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY app ./app
COPY packages ./packages
COPY prisma ./prisma
COPY tsconfig.json ./

# Generate Prisma client
RUN cd app && npx prisma generate

# Build the app
RUN pnpm --filter app build

# Stage 2: Production
FROM node:20-alpine AS runner

# Install pnpm and Prisma dependencies
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy built artifacts
COPY --from=builder /app/app/build ./app/build
COPY --from=builder /app/app/public ./app/public
COPY --from=builder /app/app/package.json ./app/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/app/node_modules ./app/node_modules

# Copy Prisma schema and migrations
COPY prisma ./prisma
COPY app/prisma ./app/prisma

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV DATABASE_URL=""
ENV SHOPIFY_API_KEY=""
ENV SHOPIFY_API_SECRET=""
ENV SENTRY_DSN=""

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Run the app
CMD ["sh", "-c", "cd app && npx prisma migrate deploy && node build/server/index.js"]
