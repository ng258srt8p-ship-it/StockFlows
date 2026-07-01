# StockFlows — App Store Submission Checklist

## Current State
- App name, description, tags, pricing: DONE (APP-STORE-LISTING.md)
- Privacy policy: DONE (public/privacy.html)
- GDPR webhooks: DONE (webhooks.privacy.tsx)
- Uninstall handler: DONE (webhooks.tsx — app/uninstalled topic)
- Health check endpoints: DONE (/health, /health/ready)
- E2E tests: DONE (41 passing)
- Tour page: DONE (public/tour.html)
- Webhook HMAC verification: DONE (POST /webhooks returns 401 on invalid HMAC)
- Production deployment: DONE (Fly.io — Remix app + PostgreSQL)
- Static site deployment: DONE (Cloudflare Pages — tour, landing, privacy)

## What Needs to Be Done

### 1. Fix shopify.app.toml client_id
The current client_id is `abc123def456` (placeholder). For a real App Store submission, this needs the actual Partner Dashboard client_id. However, for dev/test this is fine.

### 2. Create 5 App Store Screenshots
Need 5 screenshots at 1270x760px:
1. Dashboard overview
2. Inventory list with status badges
3. Forecasting page
4. Purchase orders page
5. Reports/valuation page

### 3. Ensure all required privacy webhooks work
Already implemented but need to verify the route file handles all 3 topics correctly.

### 4. Run full test suite and verify build
- `npx vitest run` — unit/integration tests
- `npx playwright test` — E2E tests
- `npx vite build` — production build

### 5. Verify the app loads correctly in a Shopify dev store
Need a Shopify Partner account to install on a dev store for testing.

### 6. Push all remaining changes to GitHub
Ensure everything is committed and pushed.

### 7. Apply for Protected Customer Data (PCD) access
The `orders/create` and `orders/updated` webhooks require PCD approval from Shopify. Apply in the Partner Dashboard before app submission. Once approved, re-add these topics to `shopify.app.toml` and `REGISTERED_TOPICS`.

### 8. Configure custom domain
Point `stockflows.app` DNS to the Fly.io deployment:
- CNAME record: `@ → <service>.fly.dev`
- Update `SHOPIFY_APP_URL` to `https://stockflows.app`

## What We Can Do Now (No Partner Account Needed)
1. Fix the package.json scripts
2. Generate screenshot placeholders / capture from tour
3. Verify build compiles cleanly
4. Verify all tests pass
5. Ensure all required app store metadata is complete
6. Create a Terms of Service page (required by some categories)
7. Finalize the app description and listing copy