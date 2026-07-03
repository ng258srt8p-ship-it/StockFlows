# StockFlows — Inventory Management for Shopify

> AI-powered inventory management, demand forecasting, and purchase order system for Shopify merchants.

## Live App

- **Production**: https://stockflows.fly.dev
- **Shopify Partners**: https://dev.shopify.com/dashboard/223648437/apps/388020928513
- **Shopify Admin**: https://admin.shopify.com/store/stockflows2/apps/stockflows-app

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Redis 6+ (optional — required for background jobs)

### Setup

```bash
# Install dependencies
npm install

# Start PostgreSQL and Redis (Homebrew)
brew services start postgresql@16
brew services start redis

# Create database user and database
psql postgres -c "CREATE USER stockflows WITH PASSWORD 'stockflows' CREATEDB;"
psql postgres -c "CREATE DATABASE stockflows OWNER stockflows;"

# Run migrations
cp .env.example .env  # Edit with your database credentials
npx prisma migrate dev --name init

# Seed demo data
npx tsx scripts/seed.ts

# Start dev server
npx vite dev
```

The app will be available at `http://localhost:5173`.

### Health Checks

```bash
curl http://localhost:5173/health        # {"status":"alive"}
curl http://localhost:5173/health/ready  # {"status":"ready","checks":{"postgres":"ok","redis":"ok"}}
```

## Architecture

StockFlows follows a 4+1 architectural view model. See `ARCHITECTURE.md` for the full design.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Remix v2 + React 18 |
| **UI** | Shopify Polaris v12 + Tailwind CSS v4 |
| **Database** | PostgreSQL (Prisma ORM v6) |
| **Queue** | BullMQ + Redis |
| **State** | Zustand (with immer, devtools, persist) |
| **Forecasting** | simple-statistics (ETS, linear regression, moving average) |
| **Email** | Resend + React Email |
| **Monitoring** | Sentry, Pino (structured logging), Prometheus metrics |
| **Testing** | Vitest (unit) + Playwright (E2E) |
| **Build** | Vite + Remix |

### Project Structure

```
app/
├── components/          # Reusable UI components
│   ├── inventory/       # StockLevelChart, AlertsList
│   ├── receiving/       # BarcodeScanner (USB HID + Camera)
│   ├── shared/          # StockBadge, LoadingSkeleton
│   └── ui/              # Custom UI primitives
├── emails/              # React Email templates
├── hooks/               # useSSE (real-time updates)
├── lib/
│   ├── auth/            # RBAC permissions & middleware
│   ├── db/              # Prisma client, audit, RLS
│   ├── export/          # Google Sheets, CSV
│   ├── forecasting/     # ML engine, models, evaluator
│   ├── inventory/       # Domain services (transfer, cycle count, alerts)
│   ├── jobs/            # BullMQ queues & workers
│   ├── notifications/   # Email, Slack, SMS
│   ├── purchasing/      # PO, receiving, cost tracking, vendors
│   ├── reports/         # PDF generation
│   ├── schemas/         # Zod validation
│   ├── shopify/         # API client, webhooks, billing
│   └── sse/             # Real-time SSE manager
├── routes/              # Remix file-based routes
├── stores/              # Zustand state stores
├── root.tsx             # App shell with Polaris
└── tailwind.css         # Tailwind config
e2e/                     # Playwright E2E tests
tests/                   # Vitest unit & integration tests
prisma/                  # Database schema
extensions/              # Shopify Flow extensions
```

## Features

### Core Inventory
- Multi-location inventory tracking with real-time SSE updates
- Stock adjustments with audit trail
- Cycle counting workflow
- Inventory transfers between locations
- Barcode scanning (USB HID + camera + manual)

### Purchase Orders
- Create POs with line items and cost tracking
- Partial receiving with barcode scan
- Landed cost calculation (shipping + duties allocation)
- Vendor management

### Demand Forecasting
- ETS (Exponential Smoothing) model
- Linear regression model
- Weighted moving average
- Auto model selection (best MAPE wins)
- Ensemble blending (top 2 models)
- 30-day predictions with confidence intervals

### Alerts & Notifications
- Automatic reorder alerts (critical/warning/info)
- Email notifications (Resend + React Email)
- Slack webhook alerts
- SMS alerts via Twilio (optional)

### Reporting
- CSV export with all inventory data
- PDF reports via Playwright
- Google Sheets integration (optional)
- Inventory valuation by location

### Security & Compliance
- RBAC: Owner / Manager / Staff roles with 13 permissions
- GDPR compliance webhooks (data request, redaction)
- Audit logging for all mutations
- Webhook HMAC verification
- Row-level security (PostgreSQL RLS)

## Testing

```bash
# Unit tests (Vitest)
npx vitest run

# E2E tests (Playwright)
npx playwright test

# Live production tests (requires Chrome on port 9222)
npx playwright test e2e/validate-production.test.ts --config=playwright.live.config.ts
```

## Database

### ER Diagram

```
Shop ──┬── Location ──────── InventoryItem ──┬── StockMovement
       │                                      ├── StockTransfer
       ├── Vendor ──── PurchaseOrder ──────── │
       │                     │               ├── ForecastResult
       │                     ├── POLineItem  │
       │                     └── ReceivingEvent
       ├── User
       ├── Session
       ├── ShopSetting
       ├── ReorderAlert
       ├── AuditLog
       └── ProcessedWebhook
```

## Shopify Integration

### Required Scopes

```
read_inventory, write_inventory, read_products, write_products,
read_locations, write_locations, read_orders, write_orders,
read_customers, write_content
```

### Webhook Topics

| Topic | Purpose |
|-------|---------|
| `inventory_levels/update` | Real-time stock sync |
| `inventory_items/*` | Item CRUD events |
| `variants/in_stock` / `out_of_stock` | Stock status changes |
| `locations/*` | Location CRUD events |
| `orders/create` / `updated` | Order events |
| `products/create` / `updated` | Product events |
| `app/uninstalled` | Logging on uninstall (data preserved for reinstall) |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SHOPIFY_API_KEY` | Yes | Shopify app API key |
| `SHOPIFY_API_SECRET` | Yes | Shopify app API secret |
| `SHOPIFY_APP_URL` | Yes | Public URL of the app (e.g. `https://stockflows.fly.dev`) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Secret for signing session cookies |
| `SCOPES` | Yes | Comma-separated Shopify API scopes |
| `REDIS_URL` | No* | Redis URL (required for background jobs) |
| `SENTRY_DSN` | No | Sentry error tracking DSN |
| `RESEND_API_KEY` | No | Resend email service API key |
| `SLACK_WEBHOOK_URL` | No | Slack incoming webhook URL |

*Redis is optional — the app starts without it. Background jobs (inventory sync, alerts, forecasting) are only active when Redis is configured.

## Deployment

See [DEPLOY.md](DEPLOY.md) for full deployment instructions.

### Quick Deploy (Fly.io)

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login and deploy
fly auth login
fly launch --no-deploy
fly postgres create   # Creates free 3GB Postgres
fly redis create      # Optional: creates Redis for background jobs
fly secrets set SHOPIFY_API_KEY=... SHOPIFY_API_SECRET=... DATABASE_URL=...
fly secrets set SESSION_SECRET=$(openssl rand -hex 32)
fly secrets set SCOPES="read_inventory,write_inventory,read_products,write_products,read_locations,write_locations,read_orders,write_orders,read_customers,write_content"

fly deploy

# Push to Shopify Partners
shopify app deploy --allow-updates --allow-deletes
```

## License

MIT
