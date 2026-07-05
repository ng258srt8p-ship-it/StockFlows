# StockFlows — Deployment Guide

> **Quick-Start:** `fly deploy` deploys the Remix app. `npx wrangler pages deploy public` deploys the static site. See [Quick-Start Deployment](#quick-start-deployment) for a 3-command summary.

---

## Table of Contents

1. [Quick-Start Deployment](#quick-start-deployment)
2. [Overview](#overview)
3. [Production Architecture](#production-architecture)
4. [Prerequisites](#prerequisites)
5. [Fly.io Deployment (Primary)](#flyio-deployment-primary)
6. [Shopify App Config Deploy](#shopify-app-config-deploy)
7. [Cloudflare Pages (Static Site)](#cloudflare-pages-static-site)
8. [Post-Deployment Verification](#post-deployment-verification)
9. [Rollback Procedures](#rollback-procedures)
10. [Troubleshooting](#troubleshooting)
11. [Recent Deployment Notes](#recent-deployment-notes)

---

## Quick-Start Deployment

For experienced developers who want the fast path:

```bash
# 1. Deploy the Remix app to Fly.io
cd "/Users/georgetozer/Development/Shopify Apps/stockflows"
fly deploy

# 2. Deploy Shopify app config (webhooks, scopes, etc.)
npx @shopify/cli app deploy --allow-updates

# 3. Deploy static marketing site to Cloudflare Pages
npx wrangler pages deploy public --project-name=stockflows --branch=main
```

**Post-deploy health check:**
```bash
curl https://stockflows.app/health
# Expected: {"status":"alive","timestamp":"2026-..."}
```

---

## Overview

StockFlows has two deployed components:

| Component | Host | Purpose |
|-----------|------|---------|
| **Remix app** (API server) | Fly.io | Webhooks, auth, admin UI, background jobs |
| **Static site** (tour/landing) | Cloudflare Pages | Marketing pages, privacy policy, tour |

The Shopify app runs on Fly.io. Cloudflare Pages serves the static marketing site at `stockflows.app`.

---

## Production Architecture

```
Shopify ──POST /webhooks──► Fly.io (Remix app)
                                    │
                                    ├── PostgreSQL (Fly Postgres)
                                    ├── Redis (Fly Redis, optional)
                                    └── BullMQ workers (in-process)

Merchants ──► Cloudflare Pages (stockflows.app)
              (tour, privacy policy, landing page)
```

### Webhook HMAC Verification

Shopify requires that webhook endpoints validate the HMAC digest of each request and return HTTP 401 when rejecting a request with an invalid digest.

Per [Shopify's documentation](https://shopify.dev/docs/apps/build/webhooks/verify-deliveries#hmac-verification):
- Algorithm: **HMAC-SHA256**
- Header: `X-Shopify-Hmac-SHA256`
- Encoding: **base64**
- Verification: Use `authenticate.webhook(request)` from `@shopify/shopify-app-remix`

Our implementation (`app/routes/webhooks.tsx`):
1. Receives all webhooks at `POST /webhooks`
2. Calls `authenticate.webhook(request)` which validates the HMAC via the Shopify library
3. Returns HTTP 401 on invalid HMAC (thrown by the library)
4. Returns HTTP 200 after processing

The custom `verifyWebhook()` utility in `app/lib/shopify/webhooks.ts` provides a backup HMAC verification method using `crypto.createHmac("sha256", secret).update(rawBody).digest("base64")` with timing-safe comparison.

---

## Prerequisites

### Fly.io
- [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/): `curl -L https://fly.io/install.sh | sh`
- Fly.io account: `fly auth login`

### Shopify CLI
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli): `npm install -g @shopify/cli`
- Shopify Partners account with app configured

### Cloudflare Pages
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/): `npm install -g wrangler`
- Cloudflare account with Pages project `stockflows`

### General
- Node.js 22+
- PostgreSQL database (Fly Postgres or external)
- Git access to the repository

---

## Fly.io Deployment (Primary)

### 1. Create App and Database (First-Time Setup)

```bash
fly launch --no-deploy              # Creates app config (fly.toml)
fly postgres create                 # Creates Fly Postgres (free 3GB tier)
fly redis create                    # Creates Fly Redis (for background jobs)
```

### 2. Set Environment Variables

```bash
# Required
fly secrets set SHOPIFY_API_KEY=your_key
fly secrets set SHOPIFY_API_SECRET=your_secret
fly secrets set SHOPIFY_APP_URL=https://stockflows.app
fly secrets set DATABASE_URL=postgresql://...  # From fly postgres create output

# Optional (for background jobs)
fly secrets set REDIS_HOST=...  # From fly redis create output
fly secrets set REDIS_PORT=6379

# Optional (for notifications)
fly secrets set RESEND_API_KEY=...
fly secrets set SLACK_WEBHOOK_URL=...
fly secrets set TWILIO_ACCOUNT_SID=...
fly secrets set TWILIO_AUTH_TOKEN=...
fly secrets set TWILIO_PHONE_NUMBER=...
```

### 3. Deploy

```bash
fly deploy
```

Fly.io builds the Docker image, runs migrations (if configured), and starts the app.

### 4. Run Database Migrations

```bash
fly ssh console -C "npx prisma migrate deploy"
```

### 5. Custom Domain (stockflows.app)

1. Get the Fly.io hostname:
   ```bash
   fly status
   # Shows: Hostname: stockflows.fly.dev
   ```

2. Add a CNAME record in Cloudflare DNS:
   ```
   Type: CNAME
   Name: @ (or stockflows.app)
   Target: stockflows.fly.dev
   Proxy: Proxied (orange cloud)
   ```

3. Add the custom domain on Fly.io:
   ```bash
   fly certs add stockflows.app
   ```

4. Update `SHOPIFY_APP_URL` in Fly.io secrets:
   ```bash
   fly secrets set SHOPIFY_APP_URL=https://stockflows.app
   ```

### Health Check

Fly.io uses the `/health` endpoint to determine if the app is running:

```bash
curl https://stockflows.app/health
# {"status":"alive","timestamp":"2026-06-24T03:34:33.735Z"}
```

### Fly.io Free Tier

- 3 shared-cpu-1x VMs (256MB RAM each)
- 3GB Fly Postgres
- Free TLS certificates
- Auto-stop/start machines

---

## Shopify App Config Deploy

Push the app config (webhook subscriptions, scopes, etc.) to Shopify Partners:

```bash
npx @shopify/cli app deploy --allow-updates
```

### What This Updates
- Webhook subscriptions (topics, URIs)
- Access scopes
- Auth redirect URLs
- App proxy configuration
- POS embedded settings

### Protected Customer Data (PCD)

The `orders/create` and `orders/updated` webhook topics require PCD approval from Shopify. These topics are currently removed from `shopify.app.toml` until PCD is approved during app submission. To re-add:

1. Apply for PCD in [Shopify Partners](https://partners.shopify.com)
2. Add topics back to `shopify.app.toml` under `[[webhooks.subscriptions]].topics`
3. Add them back to `REGISTERED_TOPICS` in `app/lib/shopify/webhooks.ts`
4. Redeploy: `npx @shopify/cli app deploy --allow-updates`

---

## Cloudflare Pages (Static Site)

The Cloudflare Pages project (`stockflows-tour`) serves the marketing pages from the `public/` directory.

### Deploy

```bash
npx wrangler pages deploy public --project-name=stockflows --branch=main
```

Or push to `main` — Cloudflare Pages auto-deploys from the linked GitHub repo.

### Custom Domain

`stockflows.app` is already configured as a custom domain on the Cloudflare Pages project. When switching the Remix app to Fly.io, update the DNS so `stockflows.app` points to Fly.io instead.

### Deploy Preview (Branch-based)

To deploy a preview for a feature branch:
```bash
npx wrangler pages deploy public --project-name=stockflows --branch=feature-branch
```

---

## Post-Deployment Verification

After deploying, run through this checklist to confirm everything is working:

### 1. Health Check
```bash
curl -s https://stockflows.app/health | jq .
# Expected: {"status":"alive","timestamp":"..."}
```

### 2. Fly.io Status
```bash
fly status
fly logs --app stockflows 2>&1 | tail -20
```
Verify: app shows as "deployed", no crash loops in logs.

### 3. Database Connectivity
```bash
fly ssh console -C "npx prisma migrate status"
# Expected: "Your database is up to date with your schema"
```

### 4. Shopify App Configuration
```bash
npx @shopify/cli app versions list
# Verify latest version is active
```

### 5. Webhook Verification (Shopify Partners)
1. Go to Shopify Partners → StockFlows → Test your webhook
2. Send a test webhook for `inventory_levels/update`
3. Verify it returns HTTP 200

### 6. App Installation Test
1. Open the app in a test store
2. Verify the embedded app loads
3. Check that inventory data syncs

### 7. Static Site Verification
```bash
curl -s -o /dev/null -w "%{http_code}" https://stockflows.app/
# Expected: 200
```

### 8. Background Jobs (Optional)
If Redis is configured:
```bash
fly ssh console -C "redis-cli ping"
# Expected: PONG
```

---

## Rollback Procedures

### Fly.io App Rollback

If the new deployment is broken, roll back to the previous release:

```bash
# List recent releases
fly releases list --app stockflows

# Roll back to the previous release
fly releases rollback --app stockflows

# Or roll back to a specific release
fly releases rollback <release-id> --app stockflows
```

**Important:** Rollback restores the app binary but does NOT roll back database migrations. See [Database Rollback](#database-rollback) below.

### Database Rollback

Database rollbacks are destructive and should only be used in development or critical production issues.

```bash
# Check current migration status
fly ssh console -C "npx prisma migrate status"

# If you need to undo a migration, create a new migration to revert
# This is safer than running migrate reset in production
```

**For critical production issues:**
1. Deploy the previous app version first (see above)
2. Assess if database changes are compatible
3. If not, create a Prisma migration to revert the schema changes
4. Deploy the revert migration

### Shopify App Config Rollback

To roll back Shopify app configuration:

1. Go to [Shopify Partners Dashboard](https://partners.shopify.com)
2. Navigate to StockFlows → Versions
3. Activate the previous version

### Cloudflare Pages Rollback

```bash
# List recent deployments
npx wrangler pages deployment list --project-name=stockflows

# Roll back to a previous deployment
npx wrangler pages deployment rollback <deployment-id> --project-name=stockflows
```

### Emergency Rollback Checklist

1. **Fly.io:** `fly releases rollback --app stockflows`
2. **Verify health:** `curl https://stockflows.app/health`
3. **Shopify:** Activate previous version in Partners dashboard
4. **Cloudflare:** Roll back Pages deployment if static site changed
5. **Database:** Assess migration compatibility, create revert if needed
6. **Notify:** Alert team of rollback and reason

---

## Troubleshooting

### Webhook 405 error

**Symptom:** Shopify validation reports "Expected HTTP 401, Received HTTP 405"

**Cause:** The Remix app is not deployed — the domain serves static files only.

**Fix:** Deploy the Remix app to Fly.io and ensure `stockflows.app` DNS points to the app server.

### Webhook 400 error (not 401)

**Symptom:** POST to `/webhooks` returns HTTP 400 instead of HTTP 401

**Cause:** The request is missing the `X-Shopify-Hmac-SHA256` header entirely.

**This is expected** — HTTP 400 means "no HMAC header present." HTTP 401 means "HMAC header present but invalid." Shopify validation sends a request with a valid HMAC structure, so it should get 401.

### Background jobs not running

**Cause:** Redis is not configured or not reachable.

**Fix:** Redis is optional — the app starts without it. Add Redis via `fly redis create` and set `REDIS_HOST`.

### Build fails on Fly.io

**Cause:** Usually the SSR build not running (only client build completes). PostCSS/Tailwind v4 config issues.

**Fix:** 
1. Ensure `package.json` build script is `remix vite:build` (not `vite build`).
2. PostCSS config must use `@tailwindcss/postcss` (v4 compatible), NOT `tailwindcss` directly.
3. Dependencies: `@tailwindcss/postcss` and `autoprefixer` must be in `devDependencies`.
4. **Working build command** (verified 2026-07-03):
   ```bash
   fly deploy --app stockflows --no-cache
   ```
   The `--no-cache` flag busts Docker layer cache to pick up dependency/config changes.

### Prisma migration failures

```bash
# Run migrations manually
fly ssh console -C "npx prisma migrate deploy"

# Or reset the database (development only)
fly ssh console -C "npx prisma migrate reset"
```

### App crashes after deploy

**Symptom:** Health check returns 502 or connection refused.

**Diagnosis:**
```bash
fly logs --app stockflows 2>&1 | tail -50
fly status --app stockflows
```

**Common causes:**
- Missing environment variables
- Database connection failure
- Port mismatch (app expects 3000)

**Fix:**
```bash
# Check secrets are set
fly secrets list --app stockflows

# Test database connection
fly ssh console -C "echo $DATABASE_URL | head -c 20..."

# Restart the app
fly apps restart stockflows
```

### DNS issues

**Symptom:** `stockflows.app` resolves to wrong IP or times out.

**Fix:**
```bash
# Check DNS resolution
dig stockflows.app +short
# Should return Fly.io IPs or CNAME to stockflows.fly.dev

# Verify SSL certificate
curl -vI https://stockflows.app 2>&1 | grep -E "SSL|certificate"
```

### Slow initial response (cold start)

**Symptom:** First request after idle period takes 10-30 seconds.

**Cause:** Fly.io auto-starts machines from sleep (free tier behavior).

**Fix:** This is normal on free tier. For production, consider:
- Setting `min_machines_running = 1` (already configured)
- Upgrading to a paid plan for persistent machines

---

## Dockerfile

```dockerfile
FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN npm run build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
```

Key notes:
- Uses `npx remix vite:build` (not plain `vite build`) — the Remix Vite plugin requires both client and SSR builds
- Prisma schema must be copied separately for `prisma generate`
- Redis is optional — BullMQ imports are lazy in `webhooks.tsx` and `entry.server.tsx`

---

## GitHub Actions CI

The CI pipeline (`.github/workflows/ci.yml`) runs on every push:

**Test job:**
1. `npm ci`
2. `npx tsc --noEmit --skipLibCheck` — TypeScript check
3. `npx vitest run` — Unit/integration tests
4. `npx vite build` — Production build

**Deploy job** (main branch only):
1. Runs Prisma migrations
2. Deploys app config to Shopify Partners via `shopify app deploy --force`

> **Note:** The deploy job requires `DATABASE_URL` as a GitHub Actions secret. Add it in Settings → Secrets → Actions.

---

## Recent Deployment Notes (v2026-06-29)

### App Changes Deployed
- Settings page restructured: `<Page>` outermost, `<Form>` inside `<Layout.Section>`
- Marketing buttons removed from `explore.html` (Watch Demo, Take Tour)
- Safety Stock Multiplier field added to settings
- Section descriptions added to all settings cards
- Consistent card padding (`p-4`) and grid gaps (`gap-4`) across all pages

### Testing
- All 86 tests pass (57 Playwright + 19 vitest + 10 new browser tests)
- New E2E test suites: settings-visual-match, full-app-qa
- Code-level consistency tests: 19 vitest tests

### Build Status
- `npm run build`: ✅ Passes
- `npx tsc --noEmit`: ✅ Zero errors
- All linting checks: ✅ Pass
