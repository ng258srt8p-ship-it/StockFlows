# StockFlows — Inventory Management for Shopify

> AI-powered inventory management, demand forecasting, and purchase order system for Shopify merchants.

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

### Developer Experience
- Remix streaming SSR for fast dashboard loads
- Tailwind CSS for rapid styling
- Zustand for client state with persistence
- BullMQ for background job processing
- Sentry for error tracking
- Pino structured logging

## Recent Changes (v2026-06-29)

### UI/UX Enhancements
- **Settings page restructured**: `<Page>` is now the outermost JSX return (was wrapped by `<Form>`), matching all other app pages
- **Marketing buttons removed**: "Watch Demo" and "Take Tour" buttons removed from `explore.html` (were only for marketing site, not app)
- **Section descriptions added**: Each settings card now has contextual help text
- **Safety Stock Multiplier field**: Added to Alert Thresholds card
- **Consistent card padding**: All cards use `p-4`, grid gaps use `gap-4` — matching Dashboard pattern

### Testing Infrastructure
- **New E2E test suites**: `settings-visual-match.spec.ts` (10 tests), `full-app-qa.spec.ts` (comprehensive), `ui-consistency.test.ts` (19 code-level tests)
- **Updated existing tests**: `comprehensive-noauth.spec.ts` updated to expect removed marketing buttons
- **All 86 tests passing**: 57 Playwright + 19 vitest + 10 new browser tests

### Code Quality
- **Build passes**: `npm run build` and `npx tsc --noEmit` both pass with zero errors
- **TypeScript strict**: All type errors resolved
- **Polaris v12 compatibility**: Updated to use correct component APIs (no DescriptionList subcomponents)

## Testing

```bash
# Unit tests (Vitest)
npx vitest run

# E2E tests (Playwright)
npx playwright test

# Both
npx vitest run && npx playwright test
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
read_locations, read_orders, read_customers, read_companies,
read_report_analytics, write_content
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
| `app/uninstalled` | Cleanup on uninstall |

### Flow Extensions
- **Low Stock Alert** trigger: Fires when inventory drops below reorder point
- Merchants can wire this into Flow workflows (e.g., auto-email vendor, Slack notification)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SHOPIFY_API_KEY` | Yes | Shopify app API key |
| `SHOPIFY_API_SECRET` | Yes | Shopify app API secret |
| `SHOPIFY_APP_URL` | Yes | Public URL of the app (e.g. `https://stockflows.app`) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_HOST` | No* | Redis host (default: localhost). Required for background jobs. |
| `REDIS_PORT` | No* | Redis port (default: 6379) |
| `SENTRY_DSN` | No | Sentry error tracking DSN |
| `RESEND_API_KEY` | No | Resend email service API key |
| `SLACK_WEBHOOK_URL` | No | Slack incoming webhook URL |
| `TWILIO_ACCOUNT_SID` | No | Twilio Account SID (for SMS alerts) |
| `TWILIO_AUTH_TOKEN` | No | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | No | Twilio phone number for outgoing SMS |

*Redis is optional — the app starts without it. Background jobs (inventory sync, alerts, forecasting) are only active when Redis is configured.

## Deployment

See [DEPLOY.md](DEPLOY.md) for full deployment instructions.

### Quick Deploy (Railway)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway up --service <service-name>

# Set environment variables
railway variable set "SHOPIFY_API_KEY=..." --service <service-name>
railway variable set "SHOPIFY_API_SECRET=..." --service <service-name>
railway variable set "DATABASE_URL=..." --service <service-name>
railway variable set "SHOPIFY_APP_URL=https://stockflows.app" --service <service-name>
```

### Quick Deploy (Fly.io)

```bash
fly auth login
fly launch --no-deploy
fly postgres create   # Creates free 3GB Postgres
fly secrets set SHOPIFY_API_KEY=... SHOPIFY_API_SECRET=... DATABASE_URL=...
fly deploy
```

## License

MIT