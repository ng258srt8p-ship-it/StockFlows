FROM node:22-bookworm-slim AS base
WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy workspace config files AND .npmrc first for layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# Copy workspace package manifests (no source yet — cache deps layer)
COPY packages/stockflows-ui/package.json ./packages/stockflows-ui/

# Install all dependencies (respects .npmrc shamefully-hoist)
RUN pnpm install

# Copy Prisma schema and generate client
COPY prisma ./prisma
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV DIRECT_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate

# Copy source files
COPY . .

# Build shared library first, then Remix app
RUN pnpm --filter @stockflows/ui build
RUN pnpm remix vite:build

ENV NODE_ENV=production
EXPOSE 3000
# Run remix-serve directly from pnpm store
CMD ["node", "node_modules/.pnpm/@remix-run+serve@2.17.5_typescript@5.9.3/node_modules/@remix-run/serve/dist/cli.js", "./build/server/index.js"]
