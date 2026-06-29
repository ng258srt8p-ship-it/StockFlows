# StockFlows — Deployment to Shopify Dev Testing Environment

> **Goal:** Push all local changes to the Shopify dev testing environment at https://admin.shopify.com/store/stockflows/apps/stockflows-app

---

## Current State

### Local Changes (Not Yet Deployed)
| Change | File | Status |
|--------|------|--------|
| Settings page restructure (`<Page>` outermost) | `app/routes/app.settings.tsx` | ✅ Local commit |
| Marketing buttons removed from explore.html | `public/explore.html` | ✅ Local commit |
| Safety Stock Multiplier field added | `app/routes/app.settings.tsx` | ✅ Local commit |
| Section descriptions on all settings cards | `app/routes/app.settings.tsx` | ✅ Local commit |
| Consistent card padding (`p-4`) & grid gaps (`gap-4`) | All route files | ✅ Local commit |
| New E2E test suites | `e2e/` | ✅ Local commit |
| TypeScript strict mode clean | All files | ✅ Local commit |

### Git Status
```bash
On branch main
Your branch is ahead of 'origin/main' by 5 commits.
  (use "git push" to publish your local commits)
```

---

## Deployment Plan

### Phase 1: Push to GitHub (Triggers CI/CD)

```bash
cd "/Users/georgetozer/Development/Shopify Apps/stockflows"
git push origin main
```

**Expected CI/CD Pipeline:**
1. **GitHub Actions CI** runs:
   - `npm ci`
   - `npx tsc --noEmit --skipLibCheck` — TypeScript check
   - `npx vitest run` — Unit tests
   - `npx vite build` — Production build
2. **Deploy job** (main branch only):
   - Runs Prisma migrations on Railway
   - Deploys app config to Shopify Partners via `shopify app deploy --force`

### Phase 2: Verify Railway Deployment

```bash
# Check Railway service status
railway status --service stockflows-app

# Check logs
railway logs --service stockflows-app

# Verify health endpoint
curl https://stockflows.app/health
# Expected: {"status":"alive","timestamp":"..."}
```

### Phase 3: Verify Shopify App Config Deployed

```bash
# Check Shopify app config version
npx @shopify/cli app info
```

Should show the latest config version with updated webhook subscriptions.

### Phase 4: Test in Dev Store

1. Navigate to: https://admin.shopify.com/store/stockflows/apps/stockflows-app
2. Install/update the app if needed
3. Verify all pages load correctly:
   - Dashboard
   - Inventory
   - Purchasing
   - Forecasting
   - Reports
   - Settings (verify structure matches Dashboard)
4. Test settings save:
   - Change Low Stock Threshold → Save → Reload → Verify persisted
   - Toggle Email Alerts → Save → Reload → Verify persisted
   - Toggle AI Insights → Save → Reload → Verify persisted

### Phase 5: Verify Marketing Pages Removed

```bash
# Check explore.html no longer has marketing buttons
curl -s https://stockflows.app/explore.html | grep -i "watch demo\|take tour"
# Expected: no output (empty)
```

### Phase 6: Run Full Test Suite Against Deployed App

```bash
# Point Playwright at production
BASE_URL=https://stockflows.app npx playwright test e2e/settings-visual-match.spec.ts --reporter=list
BASE_URL=https://stockflows.app npx playwright test e2e/comprehensive-noauth.spec.ts --reporter=list
```

---

## Expected Results After Deployment

| Check | Expected Result |
|-------|-----------------|
| Git push | ✅ 5 commits pushed to origin/main |
| GitHub Actions CI | ✅ All checks pass |
| Railway deploy | ✅ Service healthy, health check passes |
| Shopify app config | ✅ Deployed with updated webhooks |
| Dev store app | ✅ Loads without errors |
| Settings page | ✅ Matches Dashboard structure exactly |
| Settings form save | ✅ All fields persist after reload |
| explore.html | ✅ No "Watch Demo" or "Take Tour" buttons |
| Marketing site | ✅ tour.html still has buttons (marketing site OK) |
| E2E tests vs prod | ✅ All pass |

---

## Rollback Plan (If Issues)

```bash
# 1. Revert to previous Railway deployment
railway rollback --service stockflows-app

# 2. Or revert git and re-push
git revert HEAD~5..HEAD
git push origin main

# 3. Re-deploy Shopify app config
npx @shopify/cli app deploy --allow-updates
```

---

## Verification Checklist (Post-Deploy)

- [ ] `git push origin main` completed
- [ ] GitHub Actions CI: All green
- [ ] Railway service: Healthy
- [ ] `curl https://stockflows.app/health` returns 200
- [ ] Shopify app config deployed: `npx @shopify/cli app info` shows latest
- [ ] Dev store: App loads at https://admin.shopify.com/store/stockflows/apps/stockflows-app
- [ ] Settings page: Visual match with Dashboard (no Form wrapper, correct subtitle)
- [ ] Settings form: Save → Reload → Values persist
- [ ] explore.html: No Watch Demo / Take Tour buttons
- [ ] tour.html: Still has marketing buttons (expected)
- [ ] Playwright tests vs prod: All pass

---

## Post-Deploy Monitoring

- Watch Sentry for new errors (1 hour)
- Watch Railway logs for background job errors (1 hour)
- Verify nightly forecast job runs (check logs next morning)
- Verify webhook processing (check processed_webhooks table)