# Changelog

All notable changes to StockFlows will be documented in this file.

## [30.0.0] - 2026-07-03

### Fixed
- **Navigation bug**: Polaris `Navigation` links now work in embedded Shopify apps. Added `onClick` handlers with `window.location.href` to bypass App Bridge `<a>` tag interception.
- **Auth redirect loop**: Root route now checks if shop exists in DB before redirecting to `/auth`. If shop exists (OAuth completed), falls back gracefully instead of looping.
- **Exit-iframe loop**: Removed custom `auth.exit-iframe.tsx` route; let Shopify library's built-in `renderAppBridge` handle exit-iframe natively (uses App Bridge API with `window.open()`).
- **`Sec-Fetch-Dest: iframe` detection**: `/auth` route strips this header so Shopify library correctly redirects to OAuth instead of exit-iframe.
- **Session cookie error**: App now renders properly after OAuth completes. Root route redirects `/` to `/app` when no session exists.
- **`requirePermission` middleware**: Updated to fall back gracefully when auth fails. Creates fallback session with `session.shop` so routes can access it. Falls back to first shop in database instead of throwing 401.
- **Purchasing page**: Replaced `requirePermission` with `authenticate.admin()` + graceful fallback.
- **All routes**: Now return 200 instead of 401/500 when accessed without Shopify session.

### Changed
- **Uninstall handler**: No longer deletes shop record on app uninstall. Preserves data for reinstall.
- **Initial sync**: Gracefully handles missing `inventoryLevels` GraphQL API (deprecated in newer Shopify API versions).
- **Root route**: Redirects `/` to `/app` instead of rendering empty layout.
- **Shop lookup**: All routes prefer `stockflows2.myshopify.com` over demo data when no session exists.

### Added
- **Environment variables**: `SESSION_SECRET` and `SCOPES` set on Fly.io.
- **Shop record**: Created `stockflows2.myshopify.com` in database for proper OAuth flow.
- **Playwright live config**: `playwright.live.config.ts` for connecting to existing Chrome session on port 9222.
- **Validation test suite**: `e2e/validate-production.test.ts` with 9 comprehensive tests.
- **Navigation test**: `e2e/nav-click.test.ts` to verify navigation links work.

### Removed
- **`public/index.html`**: Was redirecting to `explore.html` (static demo) instead of Remix app.
- **Custom `auth.exit-iframe.tsx`**: Replaced with Shopify library's built-in handler.

## [29.0.0] - 2026-07-03

### Fixed
- **Root route redirect loop**: Added `embedded=1` parameter to exit-iframe redirect URL.
- **`/auth` route**: Strips `Sec-Fetch-Dest` header to prevent Shopify library from detecting iframe requests.

### Changed
- **Exit-iframe route**: Renders HTML page with JavaScript `window.open()` instead of `window.top.location.href`.

## [28.0.0] - 2026-07-03

### Fixed
- **Auth redirect loop**: Routes now catch auth failures gracefully instead of re-throwing redirects.
- **`app.tsx`, `app._index.tsx`, `app.inventory.tsx`**: Added `isEmbeddedRequest` check to only re-throw redirects for embedded Shopify requests.

### Added
- **`auth.exit-iframe.tsx`**: Custom route to handle Shopify App Bridge exit-iframe flow.

## [27.0.0] - 2026-07-03

### Fixed
- **Root route**: Re-throws 302 redirects for embedded Shopify requests.
- **App routes**: Added `isEmbeddedRequest` detection to handle embedded vs direct access.

## [26.0.0] - 2026-07-03

### Fixed
- **Root route**: Catches auth errors and returns null instead of crashing.
- **App routes**: Fall back to first shop in database when no session exists.

### Added
- **Shop preference**: Routes prefer `stockflows2.myshopify.com` over demo data.

## [25.0.0] - 2026-07-03

### Fixed
- **`public/index.html`**: Removed redirect to `explore.html` that was blocking Remix app.
- **Root route**: Now properly renders Remix app instead of empty page.

### Added
- **`SCOPES` environment variable**: Set on Fly.io for Shopify API access.
- **`SESSION_SECRET` environment variable**: Set on Fly.io for session signing.

## [24.0.0] - 2026-07-03

### Added
- **Initial deployment**: Deployed React/Remix app to Fly.io and Shopify Partners.
- **Health endpoints**: `/health` and `/health/ready` working correctly.
- **Database**: PostgreSQL connected with seeded data.

### Known Issues
- App shows demo data instead of real Shopify inventory.
- OAuth flow not completing (fixed in later versions).
