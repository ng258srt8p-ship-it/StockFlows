# StockFlows — Deployment Guide

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

## Fly.io Deployment (Primary)

### Prerequisites

- [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/): `curl -L https://fly.io/install.sh | sh`
- Fly.io account: `fly auth login`

### 1. Create App and Database

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

---

## Fly.io Free Tier

- 3 shared-cpu-1x VMs (256MB RAM each)
- 3GB Fly Postgres
- Free TLS certificates
- Auto-stop/start machines

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

## Shopify App Config Deploy

Push the app config (webhook subscriptions, scopes, etc.) to Shopify Partners:

```bash
npx @shopify/cli app deploy --allow-updates
```

### Protected Customer Data (PCD)

The `orders/create` and `orders/updated` webhook topics require PCD approval from Shopify. These topics are currently removed from `shopify.app.toml` until PCD is approved during app submission. To re-add:

1. Apply for PCD in [Shopify Partners](https://partners.shopify.com)
2. Add topics back to `shopify.app.toml` under `[[webhooks.subscriptions]].topics`
3. Add them back to `REGISTERED_TOPICS` in `app/lib/shopify/webhooks.ts`
4. Redeploy: `npx @shopify/cli app deploy --allow-updates`

---

## Troubleshooting

### Webhook 405 error

**Symptom:** Shopify validation reports "Expected HTTP 401, Received HTTP 405"

**Cause:** The Remix app is not deployed — the domain serves static files only.

**Fix:** Deploy the Remix app to Fly.io and ensure `stockflows.app` DNS points to the app server.

### Webhook 400 error (not 401)

**Symptom:** POST to `/webhooks` returns HTTP 400 instead of 401

**Cause:** The request is missing the `X-Shopify-Hmac-SHA256` header entirely.

**This is expected** — HTTP 400 means "no HMAC header present." HTTP 401 means "HMAC header present but invalid." Shopify validation sends a request with a valid HMAC structure, so it should get 401.

### Background jobs not running

**Cause:** Redis is not configured or not reachable.

**Fix:** Redis is optional — the app starts without it. Add Redis via `fly redis create` and set `REDIS_HOST`.

### Build fails on Fly.io

**Cause:** Usually the SSR build not running (only client build completes).

**Fix:** Ensure `package.json` build script is `remix vite:build` (not `vite build`).

### Prisma migration failures

```bash
# Run migrations manually
fly ssh console -C "npx prisma migrate deploy"

# Or reset the database (development only)
fly ssh console -C "npx prisma migrate reset"
```

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