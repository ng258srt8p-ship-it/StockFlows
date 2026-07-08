# StockFlows v7

A comprehensive Shopify inventory forecasting and analytics application.

## Project Structure

```
stockflows-v7/
├── app/                    # Shopify app with 31+ routes and Polaris components
├── prisma/                 # Database schema with 17 models
├── e2e/                    # 35+ end-to-end tests
├── packages/
│   ├── stockflows-ui/      # Shared UI library (components, hooks, utils)
│   ├── website/            # Public landing page (Vite + React)
│   └── demo/               # Interactive demo/tour (Vite + React + Zustand)
├── .github/
│   └── workflows/
│       └── deploy.yml      # CI/CD pipeline (Fly.io + Cloudflare Pages)
└── scripts/
    ├── build-v7.sh         # Build script
    └── seed-demo-data.ts   # Demo data seeder
```

## Setup

```bash
# Install dependencies
pnpm install

# Run database migrations
cd app && npx prisma migrate deploy && cd ..

# Start development servers
pnpm dev:website    # Landing page at http://localhost:5173
pnpm dev:demo       # Interactive demo at http://localhost:5174
```

## Build

```bash
# Build all packages
pnpm build:v7

# Or build specific packages
pnpm --filter @stockflows/website build
pnpm --filter @stockflows/demo build
```

## Test

```bash
# Run E2E tests
pnpm test:e2e
```

## Deployment

### Automated (CI/CD)

The `.github/workflows/deploy.yml` pipeline automatically:
- Builds all packages on push to main
- Deploys app to Fly.io
- Deploys website and demo to Cloudflare Pages

### Manual

```bash
# Build everything
./scripts/build-v7.sh

# Deploy to Fly.io
flyctl deploy --app stockflows --remote-only

# Deploy website to Cloudflare Pages
npx wrangler pages deploy packages/website/dist --project-name=stockflows-website

# Deploy demo to Cloudflare Pages
npx wrangler pages deploy packages/demo/dist --project-name=stockflows-tour
```

## Tech Stack

- **Framework**: Shopify App Bridge + Polaris UI
- **Runtime**: Node.js 20 (Vercel/Fly.io)
- **Database**: PostgreSQL with Prisma ORM
- **Testing**: Playwright for E2E tests
- **Build**: pnpm workspaces + Turbo
- **Deployment**: Fly.io (app) + Cloudflare Pages (website/demo)

## License

Proprietary - StockFlows
