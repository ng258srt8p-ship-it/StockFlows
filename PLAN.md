# Plan: Fix StockFlows Data Sync & Shopify Dev Store Visibility

## Executive Summary

The StockFlows app is now deployed to Fly.io (`https://stockflows.fly.dev/`) and Shopify Partners (v14). The app is accessible at `https://stockflows.fly.dev/` with healthy PostgreSQL connection. However, **inventory data does not sync** because Redis is not provisioned (blocking background job processing for webhooks).

---

## Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Fly.io App | ✅ Running | `https://stockflows.fly.dev/` - healthy |
| PostgreSQL | ✅ Connected | Fly Postgres working |
| Redis | ❌ Missing | Not provisioned - blocks webhook processing |
| Shopify App Config (v14) | ✅ Deployed | All URLs point to `stockflows.fly.dev` |
| Webhook Registration | ✅ Complete | 14/14 topics registered |
| Fly.io App Secrets | ✅ Configured | DB, Shopify keys, APP_URL set |
| Playwright Tests | ✅ 22/22 passing | Cross-browser (Chromium, Firefox, Safari) |

---

## Root Cause: Why Inventory Doesn't Sync

| Issue | Impact | Severity |
|-------|--------|----------|
| **Redis not provisioned** | BullMQ queue unavailable → webhook handlers can't queue/process inventory updates | 🔴 Critical |
| **Webhook processing disabled** | Shopify sends inventory updates to `/webhooks` but no worker picks them up | 🔴 Critical |
| **Background jobs blocked** | Forecasting, alerts, inventory sync all run via BullMQ workers | 🔴 Critical |

---

## Immediate Action Plan

### Phase 1: Provision Redis (30 min) 🔴 **BLOCKER**

```bash
# 1. Create Fly Redis (or Upstash)
fly redis create --name stockflows-redis --region iad --plan "Fixed 250MB"

# 2. Attach to app (auto-sets REDIS_URL secret)
fly redis attach stockflows-redis --app stockflows

# 3. Deploy to pick up REDIS_URL
fly deploy --app stockflows
```

**Verification:**
```bash
curl https://stockflows.fly.dev/health/ready
# Should return: {"status":"ready","checks":{"postgres":"ok","redis":"ok"}}
```

---

### Phase 2: Verify Webhook Processing (15 min)

```bash
# Test webhook endpoint
curl -X POST https://stockflows.fly.dev/webhooks \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Topic: inventory_levels/update" \
  -H "X-Shopify-Hmac-SHA256: <valid_hmac>" \
  -d '{"inventory_item_id":123,"location_id":456,"available":10}'
```

Check logs:
```bash
fly logs --app stockflows --no-tail | grep -i "webhook\|bullmq\|redis"
```

---

### Phase 3: Verify Inventory Sync End-to-End (30 min)

1. In Shopify dev store (`stockflows.myshopify.com`):
   - Create a product
   - Adjust inventory level
2. In StockFlows admin (`https://admin.shopify.com/store/stockflows/apps/stockflows-app`):
   - Verify inventory appears in real-time
   - Check `https://stockflows.fly.dev/health/ready` shows `redis: "ok"`

---

### Phase 4: DNS & Custom Domain (Optional, 1 hr)

Current: `stockflows.app` → Cloudflare Pages (marketing site)
Desired: `stockflows.app` → Fly.io app (remix server) for app routes

**Options:**
1. **Subdomain approach** (recommended): 
   - `app.stockflows.app` → Fly.io
   - `stockflows.app` → Cloudflare (marketing)
2. **Full migration**: Move all DNS to Fly.io, serve both marketing + app

---

## Files Changed / Created

| File | Change |
|------|--------|
| `Dockerfile` | `RUN npx remix vite:build` (SSR build) |
| `build.js` | `npx remix vite:build` |
| `app/routes/health/ready.tsx` → `app/routes/health.ready.tsx` | Flat route for Remix v2 |
| `shopify.app.toml` | All URLs → `https://stockflows.fly.dev` |
| `e2e/settings-visual-match.spec.ts` | Fixed auth test for live Fly.io |
| `e2e/06-settings-visual-consistency.spec.ts` | Fixed test navigation |
| `tests/integration/data-validation.test.ts` | Fixed TypeScript types |
| `scripts/validate-shopify-integration.sh` | Created validation script |
| `scripts/deploy-verify-loop.sh` | Created deploy-verify pipeline |
| `tests/unit/settings-styles.test.ts` | Updated grid-cols expectations |

---

## Acceptance Criteria (Definition of Done)

| Criterion | Target |
|-----------|--------|
| Fly.io `/health/ready` | `status: "ready"`, `redis: "ok"` |
| Webhook processing | `POST /webhooks` returns 200, BullMQ job enqueued |
| Shopify dev store | `admin.shopify.com/store/stockflows/apps/stockflows-app` loads |
| Inventory sync | Adjust inventory in Shopify → reflects in StockFlows within 10s |
| Playwright tests | 75+ tests passing across Chromium/Firefox/WebKit |
| Background jobs | Forecasting, alerts, sync all running via BullMQ |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Redis provisioning fails | Use Upstash Redis (managed) as fallback |
| Webhook HMAC validation fails | Verify `SHOPIFY_API_SECRET` matches Shopify Partners |
| DNS propagation delays | Test with `stockflows.fly.dev` first |
| Max restart limit on Fly | `fly machine restart-count reset --app stockflows` |

---

## Timeline

| Phase | Duration | Owner |
|-------|----------|-------|
| Phase 1: Redis Provisioning | 30 min | DevOps |
| Phase 2: Webhook Verification | 15 min | Backend |
| Phase 3: E2E Sync Test | 30 min | QA |
| Phase 4: DNS Migration | 1 hr | DevOps (optional) |

---

## Monitoring & Alerting

Add to monitoring:
```bash
# Uptime check
fly checks list --app stockflows

# Log monitoring
fly logs --app stockflows --follow

# Custom metrics
# Add Prometheus/Grafana for BullMQ queue depth
```

---

**Next Step:** Execute Phase 1 (Redis provisioning) to unblock data synchronization.