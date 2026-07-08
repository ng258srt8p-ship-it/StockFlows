# StockFlows — Project Status

> **Inventory Management & Demand Forecasting for Shopify Merchants**
> Generated: 2026-07-05 · Version 30.x (latest deployed)

---

## 1. At a Glance

| Field | Value |
|-------|-------|
| **App Name** | StockFlows (aka StockPulse) |
| **Live App** | https://stockflows.fly.dev |
| **Framework** | Remix v2.17.5 + React 18 + TypeScript 5.9 |
| **UI** | Shopify Polaris v12 + Tailwind CSS v4 |
| **Database** | PostgreSQL 14+ (Prisma ORM v6.8) |
| **Queue** | BullMQ + Redis 6+ (optional) |
| **State Management** | Zustand 5 (immer, devtools, persist) |
| **Hosting** | Fly.io (Docker, Node 22) |
| **Build System** | pnpm workspaces + Turborepo 2.3 + Vite 6/7 |
| **Testing** | Playwright (E2E) + Vitest (unit) |
| **Monitoring** | Sentry, Pino (structured logging) |
| **Target Version** | `30.0.0` (changelog as of 2026-07-03) |

---

## 2. What the App Does

StockFlows is a **Shopify-native** application that helps merchants manage inventory and forecast demand. It addresses the gap left by Shopify's discontinued Stocky app (2.8★, 208 reviews).

### Core Capabilities

| Feature | Status | Description |
|---------|--------|-------------|
| **Dashboard** | ✅ Live | KPI overview: total SKUs, low stock, out-of-stock, inventory value, forecast accuracy |
| **Inventory Tracking** | ✅ Live | Real-time stock levels across multiple locations with barcode scanning (USB HID + Camera via `html5-qrcode`) |
| **Demand Forecasting** | ✅ Live (backend stub) | ETS, linear regression, moving-average models via `simple-statistics`; AI-powered insights via OpenCode API |
| **Purchase Orders** | ✅ Live | Create, receive (partial/complete), and track POs with vendor management |
| **Receiving Workflow** | ✅ Live | Per-PO receiving screens, cost editing on receipt, barcode scanning |
| **Smart Reorder Alerts** | ✅ Live | Automatic alerts (critical/warning/info) when stock dips below reorder points; one-click PO creation from alerts |
| **ABC Analysis** | ✅ Live | Classify inventory by revenue contribution for prioritized management |
| **Seasonality Detection** | ✅ Live | Day-of-week and monthly demand pattern detection |
| **Stock Transfers** | ✅ Live | Multi-location stock transfers with status tracking (pending → completed) |
| **Cycle Counting** | ✅ Live | Cycle count adjustments with audit trail |
| **Reports** | ✅ Live | CSV export, PDF reports with branded templates |
| **Google Sheets Export** | ✅ Live | Sync inventory data to Google Sheets |
| **Notifications** | ✅ Live | Email (Resend + React Email), Slack webhooks, SMS (Twilio) — low-stock alerts, PO status updates, stockout warnings |
| **Settings** | ✅ Live | Per-shop configuration: thresholds, auto-reorder, forecast horizon, multi-channel notifications, AI toggles |
| **AI Insights** | ✅ Live (beta) | Natural-language demand explanations via OpenCode API; context builder assembles inventory data + forecast for AI query |
| **Migration Tool** | ✅ Live | Import from Stocky (legacy Shopify inventory app) and other sources |
| **Real-time Updates** | ✅ Live | Server-Sent Events (SSE) manager pushes inventory changes to the frontend instantly |

---

## 3. Project Structure

```
stockflows/
├── app/                          # Remix application code
│   ├── components/               # Reusable UI components by domain
│   │   ├── forecasting/          # ForecastChart, ReorderRecommendation
│   │   ├── inventory/            # StockLevelChart, AlertsList
│   │   ├── receiving/            # BarcodeScanner (USB HID + Camera)
│   │   ├── settings/             # SettingsCard, SettingsSection, NotificationToggle
│   │   ├── shared/               # StockBadge, LoadingSkeleton
│   │   └── ui/                   # EmptyState, PageHeader, PillToggle, StatCard
│   ├── emails/                   # React Email templates (LowStock, POStatus, Stockout)
│   ├── hooks/                    # Custom React hooks (useForecast, useInventory, useSSE)
│   ├── lib/                      # Domain logic (see §4 below)
│   ├── routes/                   # Remix file-based routing (see §5)
│   ├── stores/                   # Zustand store (inventory.ts)
│   ├── root.tsx                  # Root layout with error boundaries, auth integration
│   └── entry.server.tsx          # SSR entry point
├── packages/                     # Workspace packages
│   ├── stockflows-ui/            # Shared UI library (builds to dist)
│   └── website/                  # Marketing/documentation website
├── demo/                         # Demo / tour landing (Vite + React 19, Tailwind v4)
├── prisma/                       # Database schema + migrations (see §6)
├── e2e/                          # 35+ Playwright E2E test files + snapshots
├── screenshots/                  # App screenshot assets (mobile + desktop)
├── scripts/                      # Build scripts (build-pages.sh, seed.ts)
├── build.py                      # Orchestrated build runner (logs + continues on failure)
├── server.js                     # Production server (remix-serve via process.spawn)
├── Dockerfile                    # Multi-stage build: Node 22, pnpm 9.15, Prisma generate
├── turbo.json                    # Turborepo task definitions (build, dev, test, lint)
├── pnpm-workspace.yaml           # Workspace roots: packages/*, demo
└── package.json                  # Root workspace config (Reskin dev scripts)
```

**File counts:** ~100 TypeScript/TSX files across `app/`, 35+ E2E test files, 17 Prisma model enums.

---

## 4. Library Architecture

### 4.1 Core Layers

| Layer | Directory | Purpose |
|-------|-----------|---------|
| **Auth** | `lib/auth/` | Middleware, permission checks (owner/manager/staff) |
| **Database** | `lib/db/` | Prisma client, audit logging, row-level security helpers |
| **Shopify** | `lib/shopify/` | API client, billing, server setup, webhooks, inventory sync, ID normalization |
| **Inventory** | `lib/inventory/` | Alert engine, cycle counting, transfer service, main inventory service |
| **Purchasing** | `lib/purchasing/` | PO management, receiving (partial/complete), cost tracking, smart reorder, vendor analytics, vendor CRUD |
| **Forecasting** | `lib/forecasting/` | Engine orchestration, ETS/exponential smoothing, moving average, linear regression, evaluator |
| **AI** | `lib/ai/` | Context builder (assembles inventory data + forecasts), OpenCode API client, types/completions |
| **Reports** | `lib/reports/` | PDF generation, branded templates |
| **Notifications** | `lib/notifications/` | Email (Resend), Slack webhooks, SMS (Twilio) |
| **Jobs** | `lib/jobs/` | BullMQ queue, Redis connection, scheduler, workers (forecast, alert, archive, inventory-sync, partition, report, staff-sync) |
| **Export** | `lib/export/` | Google Sheets integration |
| **SSE** | `lib/sse/` | Server-Sent Events manager for real-time frontend updates |
| **Schemas** | `lib/schemas/` | Zod validation schemas (inventory, settings) |
| **Utilities** | `lib/utils/` | Background task helpers |
| **Middleware** | `lib/middleware/` | Rate limiting |

### 4.2 Background Job Workers

| Worker | Purpose |
|--------|---------|
| `forecast.worker.ts` | Runs demand forecasts for all inventory items (ETSMultiple, moving average, linear regression) |
| `alert.worker.ts` | Evaluates reorder alerts against current stock levels, creates pending alerts |
| `inventory-sync.worker.ts` | Syncs Shopify inventory levels via GraphQL API (runs on webhook + scheduled) |
| `staff-sync.worker.ts` | Synces Shopify staff members to the local User table |
| `archive.worker.ts` | Archives old data (movements, forecasts) per retention policy |
| `report.worker.ts` | Generates PDF/CSV reports asynchronously |
| `partition.worker.ts` | Database partition management for time-series data |

### 4.3 AI System Flow

```
User requests insight
  → Context builder assembles: inventory levels, forecasts, settings, alerts
  → Sends to OpenCode API (configurable model, 30s timeout)
  → Returns natural-language explanation
  → In-memory cache (5-min TTL, max 100 entries)
```

---

## 5. API Surface (Routes)

### 5.1 App Routes (`/app/*`)

| Route | Purpose |
|-------|---------|
| `/app` | Root — dashboard with KPI cards, recent activity, alerts |
| `/app/inventory` | Inventory list with search, filtering, barcode scanner |
| `/app/inventory/:id` | Single item detail — stock history, forecasts, adjustments |
| `/app/inventory/:id/adjust` | Manual quantity adjustment form |
| `/app/inventory/transfer` | Stock transfer between locations |
| `/app/purchasing` | PO list with status filters |
| `/app/purchasing/new` | Create new purchase order form |
| `/app/purchasing/:id` | PO detail with line items, receiving history |
| `/app/purchasing/:id/receive` | Partial/complete receiving workflow |
| `/app/purchasing/vendors` | Vendor directory and management |
| `/app/purchasing/vendors/:id` | Vendor detail with analytics |
| `/app/forecasting` | Forecast dashboard, forecast chart (Recharts) |
| `/app/reports` | Reports hub — CSV export, PDF generation |
| `/app/reports/export.csv` | CSV data export API |
| `/app/reports.pdf` | PDF report generation endpoint |
| `/app/settings` | Per-shop settings: thresholds, notifications, AI toggles |
| `/app/onboarding` | New merchant onboarding flow |
| `/app/migration` | Stocky/import tool for migrating existing data |

### 5.2 API Routes

| Route | Purpose |
|-------|---------|
| `/app/api/inventory` | REST inventory CRUD endpoint |
| `/app/api/insights` | AI-powered insight queries |
| `/app/api/sse` | Server-Sent Events stream for real-time updates |

### 5.3 Auth Routes

| Route | Purpose |
|-------|---------|
| `/auth` | OAuth entry (strips `Sec-Fetch-Dest` header) |
| `/auth/login` | Login flow page |
| `/auth/shopify/callback` | Shopify OAuth callback handler |
| `/auth/callback` | General auth callback |
| `/auth/exit-iframe` | App Bridge exit-iframe handling (using Shopify library's built-in handler) |

### 5.4 Webhooks & Health

| Route | Purpose |
|-------|---------|
| `/webhooks` | Shopify webhook endpoint (orders, inventory, products) |
| `/health` | Liveness check (`{"status":"alive"}`) |
| `/health/ready` | Readiness check (PostgreSQL + Redis status) |

---

## 6. Data Model (Prisma Schema)

**17 models**, **13 enums**, covering the full inventory lifecycle:

| Model | Records | Key Relations |
|-------|---------|---------------|
| `Shop` | 1 per merchant | → Locations, POs, Alerts, Settings, Users, Vendors |
| `Session` | OAuth sessions | Belongs to Shop (cascade delete) |
| `User` | Authenticated users | Belongs to Shop, role (OWNER/MANAGER/STAFF) |
| `Location` | Warehouses, retail stores, 3PLs | → InventoryItems, Forecasts, POs, Transfers |
| `InventoryItem` | Stocked products/variants | → ForecastResults, POLineItems, StockMovements, Alerts |
| `StockMovement` | Sale/return/adjustment/transfers | Belongs to InventoryItem (type enum) |
| `StockTransfer` | Inter-location transfers | From/To locations, status (PENDING→COMPLETED) |
| `Vendor` | Supply chain contacts | → PurchaseOrders |
| `PurchaseOrder` | Active/completed POs | → POLineItems, ReceivingEvents (unique: shopId + poNumber) |
| `POLineItem` | Individual PO line items | InventoryItem, Vendor (unit cost, landed cost) |
| `ReceivingEvent` | Receiving history per PO | Belongs to PurchaseOrder (json line items) |
| `ForecastResult` | Predicted demand | InventoryItem + Location (unique per item/location/date) |
| `ReorderAlert` | Stock alerts (critical/warning/info) | InventoryItem + Location + Shop (active/pending/dismissed) |
| `ShopSetting` | Per-shop configuration | 1:1 with Shop (thresholds, notification prefs, AI toggles) |
| `AuditLog` | Action audit trail | Shop (indexed by entity type + ID) |
| `ProcessedWebhook` | Deduplication table | 1 per Shopify webhook event (unique eventId) |

**Enums:** ShopPlan, UserRole, LocationType, MovementType, TransferStatus, POStatus, AlertUrgency, AlertStatus

---

## 7. Auth & Security

- **Shopify OAuth 2.0** via `@shopify/shopify-app-remix` + session storage
- **Embedded app** pattern with App Bridge integration
- **Graceful auth fallback**: when no session exists (dev/E2E mode), falls back to the first shop record in DB
- **Permission system**: role-based (owner/manager/staff), with JSON permissions field
- **Rate limiting** middleware configured
- **Audit logging** on all significant actions (create, update, delete)
- **Webhook deduplication** via `ProcessedWebhook` table (prevents double-processing)

---

## 8. Real-time Architecture

### Server-Sent Events (SSE)
- `/app/api/sse` endpoint maintains persistent connections
- Pushes inventory updates to all connected browsers instantly
- Used by dashboard, inventory list, and forecasting views

### Background Jobs (BullMQ + Redis)
- **Scheduled**: forecast runs, alert evaluation, inventory sync, report generation
- **Event-driven**: triggered by Shopify webhooks (order created, inventory updated)
- Workers run with concurrency limits and rate limiting

---

## 9. Testing

| Category | Files | Coverage Area |
|----------|-------|---------------|
| **Dashboard** | `dashboard.spec.ts` | KPI cards, layout, data loading |
| **Inventory** | `inventory-workflows.spec.ts` | List, detail, adjustments, barcode scanning |
| **Forecasting** | `forecasting.spec.ts` | Chart rendering, forecast data, recommendations |
| **Purchasing** | `full-flow.spec.ts` | PO creation → receiving → completion lifecycle |
| **Settings** | `settings.spec.ts`, `settings-visual-match.spec.ts` | All settings forms, visual consistency |
| **Reports** | `reports-export.spec.ts`, `pdf-modal.spec.ts` | CSV/PDF generation, modal interactions |
| **Notifications** | `notifications.spec.ts` | Email, SMS, Slack alert delivery |
| **Data Sync** | `data-integration.spec.ts`, `05-e2e-data-sync.spec.ts` | Cross-system data consistency |
| **Security** | `security.spec.ts`, `claims-audit.spec.ts` | Auth flows, access controls |
| **API** | `health-api.spec.ts`, `04-api-connectivity.spec.ts` | Health checks, REST endpoints |
| **Visual Regression** | `visual-regression.spec.ts` + 6 PNG snapshots | Pixel-accurate UI comparison (dashboard, forecasting, inventory, purchasing, reports, settings) |
| **Live Chrome** | `live-chrome-audit.spec.ts`, `live-test.spec.ts` | Headed browser testing against live environments |

**Total E2E test files:** 35+ (across `e2e/` directory)

---

## 10. Deployment

| Environment | URL | Notes |
|-------------|-----|-------|
| **Production** | https://stockflows.fly.dev | Fly.io, Docker, Node 22 |
| **Demo/Tour** | `demo/dist/` (built via Vite) | Landing page + product tour |
| **Shopify Partners** | Dashboard ID 223648437 | App registered on Shopify Partners |
| **Shopify Admin** | `admin.shopify.com/store/stockflows2/apps/stockflows-app` | Installed on stockflows2 store |

### Deploy Script
```bash
# Build all workspace packages + Remix app
pnpm run build

# Deploy demo/tour to Cloudflare Pages
pnpm run deploy:tour

# Health checks (post-deploy verification)
curl http://stockflows.fly.dev/health
curl http://stockflows.fly.dev/health/ready
```

---

## 11. Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `DIRECT_URL` | Yes | Prisma introspection URL |
| `SESSION_SECRET` | Yes | Session cookie signing |
| `SCOPES` | Yes | Shopify API permission scopes |
| `OPENCODE_API_KEY` | No (AI features) | OpenCode API key for AI insights |
| `OPENCODE_MODEL` | No (AI features) | Model name (default: `big-pickle`) |
| `REDIS_URL` | No (jobs) | Redis connection for BullMQ |
| `SENTRY_DSN` | No | Sentry error monitoring |
| `RESEND_API_KEY` | No (email) | Resend email service key |
| `TWILIO_*` | No (SMS) | Twilio SMS credentials |
| `SLACK_WEBHOOK_URL` | No (notifications) | Slack incoming webhook URL |

---

## 12. Dependencies Summary

| Category | Packages |
|----------|----------|
| **Framework** | `@remix-run/*` (dev + serve) v2.17.5 |
| **Shopify** | `@shopify/shopify-api` v13.1, `@shopify/shopify-app-remix` v4.2, `@shopify/shopify-app-session-storage` v5.0 |
| **UI** | `@shopify/polaris` v12, Tailwind CSS v4.3, Recharts v3.8 (charts) |
| **Database** | Prisma v6.8, `@prisma/client` v6.8 |
| **Queue** | BullMQ v5.79 (Redis-based job queue) |
| **State** | Zustand v5 (immer, devtools, persist) |
| **AI** | `simple-statistics` v7.9 (ETS, regression, moving average) |
| **Email** | Resend v6.17, `@react-email/components` v1.0 |
| **Monitoring** | Sentry (`@sentry/remix` v10.63), Pino v10 (structured logging) |
| **Testing** | Playwright v1.61, Vitest v4.1, MSW v2.14 |
| **Validation** | Zod v4.4 |
| **Other** | `csv-parse`, `csv-stringify`, `html5-qrcode` (barcode scanning), `isbot`, `twilio`, `react-email` |

---

## 13. Known Issues & Technical Debt

| Issue | Severity | Notes |
|-------|----------|-------|
| **Forecasting backend stub** | Medium | Forecast worker logs "items to forecast" but the `runForecast()` call is commented out — statistical models are implemented but not wired to the worker yet |
| **Legacy `node_modules` in demo** | Low | `demo/node_modules` exists separately; should be cleaned up or hoisted |
| **Missing `remix.config.js`** | Low | Not found in repo; may be using default or file-based conventions only |
| **Large E2E suite** | Low | 35+ test files — valuable but may need consolidation and flake-rate monitoring |
| **API version management** | Medium | Annual Shopify API version bump is the stated recurring maintenance task |

---

## 14. Other Documentation Files

| File | Purpose |
|------|---------|
| `ARCHITECTURE.md` | 4+1 architectural view model (logical, process, development, physical, scenarios) — written as "StockPulse 2.0" |
| `CHANGELOG.md` | Version history (v24–v30, latest 2026-07-03) |
| `IMPLEMENTATION-ROADMAP.md` | Feature delivery timeline and milestones |
| `APP-STORE-CHECKLIST.md` | Shopify App Store submission requirements |
| `APP-STORE-FORM.md` | App Store listing form data |
| `APP-STORE-LISTING.md` | Public-facing store listing copy |
| `COMPETITIVE-ANALYSIS.md` | Competitive landscape (Stocky, etc.) |
| `DEPLOY.md` | Deployment procedures and checklists |
| `CHART-REDESIGN-SPEC.md` | Chart UI redesign specifications |
| `demo-vs-app-diff.md` | Comparison between demo and production app |

---

## 15. Quick Reference

| Action | Command |
|--------|---------|
| Start dev server | `pnpm run dev` |
| Build all packages | `pnpm run build` |
| Push DB schema | `pnpm run db:push` |
| Seed demo data | `pnpm run db:seed:demo` |
| Run E2E tests | `pnpm run test:e2e` |
| Start demo/tour | `pnpm run demo:dev` |
| Deploy tour to Cloudflare | `pnpm run deploy:tour` |

---

*This document was auto-generated from the current repository state on 2026-07-05.*
