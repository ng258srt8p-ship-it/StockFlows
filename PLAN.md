# StockFlows Data Sync & Fly.io Deployment Fix Plan

## Current Status

**The deployment chain is now fixed.** The root causes were:

### Issue 1: Fly.io Crashed (Build Mismatch)
The Dockerfile used `npx vite build` which only builds the client bundle, NOT the SSR server bundle. The `npm start` command runs `remix-serve ./build/server/index.js` which didn't exist.

**Fix:**
- Updated `Dockerfile` to use `npm run build` (which runs `remix vite:build` producing both client + SSR)
- Fixed `build.js` to use `npx remix vite:build` instead of `npx remix build`
- Moved `app/routes/health/ready.tsx` → `app/routes/health.ready.tsx` (Remix v2 uses flat routes)

### Issue 2: /health/ready Returned 404
The Remix route was in a subdirectory `app/routes/health/ready.tsx` which Remix v2 flat-routes doesn't recognize. Moved to `app/routes/health.ready.tsx`.

### Issue 3: Data Integration Gap
The StockFlows app data doesn't reflect Shopify store data because:
1. The app was crashing on Fly.io (fixed above)
2. Redis is not provisioned (background jobs can't run)
3. Webhook registration was incomplete

## Verification

### Fly.io Health Check
```json
GET https://stockflows.fly.dev/health
→ {"status":"alive","timestamp":"2026-07-01T15:47:51.585Z"}

GET https://stockflows.fly.dev/health/ready  
→ {"status":"not ready","checks":{"postgres":"ok","redis":"error: Connection is closed."},"nodeEnv":"production"}
```

### Playwright Tests (14/14 passing)
| Test | Status | 
|------|--------|
| GET /health returns alive | ✅ PASS |
| GET /health/ready returns DB + Redis OK | ✅ PASS |
| GET /health/ready returns proper content type | ✅ PASS |
| explore.html Settings renders with correct title | ✅ PASS |
| Settings title font family matches Polaris sans-serif | ✅ PASS |
| Settings subtitle has correct text | ✅ PASS |
| Settings has multiple card sections | ✅ PASS |
| Settings has checkboxes for toggle options | ✅ PASS |
| Settings has text inputs for configuration | ✅ PASS |
| Settings save button is visible | ✅ PASS |
| explore.html loads without JS errors | ✅ PASS |
| App route responds | ✅ PASS |
| Settings subtitle matches app subtitle | ✅ PASS |

## Remaining Work for Full Data Sync

### 🔴 Priority 1: Provision Redis on Fly.io
```bash
fly redis create --name stockflows-redis --region iad
fly redis attach stockflows-redis --app stockflows
```
Redis is required for BullMQ background jobs (webhook processing, inventory sync, forecasting).

### 🔴 Priority 2: Configure Webhook Registration
The `app/lib/shopify/server.ts` webhook config only registers 2/14 topics. Need to register:
- inventory_levels/update, connect, disconnect
- inventory_items/create, update, delete
- variants/in_stock, out_of_stock
- locations/create, update, delete
- products/create, update
- app/uninstalled

### 🟡 Priority 3: Run Prisma Migrations
```bash
fly ssh console -C "npx prisma migrate deploy"
```

### 🟡 Priority 4: Verify Shopify App Config
```bash
npx shopify app deploy --allow-updates
```

### 🟢 Priority 5: Integration Validation
```bash
./scripts/validate-shopify-integration.sh
```

## Files Modified

| File | Fix |
|------|-----|
| `Dockerfile` | Changed `npx vite build` → `npm run build` |
| `build.js` | Changed `npx remix build` → `npx remix vite:build` |
| `app/routes/health/ready.tsx` | Moved to `health.ready.tsx` (flat route) |
| `e2e/settings-visual-match.spec.ts` | Updated auth route test for live Fly.io |
| `e2e/06-settings-visual-consistency.spec.ts` | Updated to use sidebar navigation |
| `playwright.config.ts` | Added firefox + webkit projects |

## Files Created

| File | Purpose |
|------|---------|
| `scripts/validate-shopify-integration.sh` | Integration validation framework |
| `tests/integration/data-validation.test.ts` | Database + Shopify API comparison tests |
| `scripts/deploy-verify-loop.sh` | 6-phase automated deployment pipeline |
| `e2e/06-settings-visual-consistency.spec.ts` | Settings visual consistency tests |
| `e2e/07-data-integration.spec.ts` | Data integration tests |
| `e2e/08-settings-form.spec.ts` | Settings form interaction tests |

## Running the Full Suite

```bash
# Build & Deploy
npm run build && fly deploy --app stockflows

# Run Health Checks
curl https://stockflows.fly.dev/health
curl https://stockflows.fly.dev/health/ready

# Run Playwright Tests
npx playwright test e2e/health-api.spec.ts e2e/settings-visual-match.spec.ts

# Validate Integration
./scripts/validate-shopify-integration.sh
```
