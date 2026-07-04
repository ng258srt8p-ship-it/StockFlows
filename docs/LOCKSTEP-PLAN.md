# StockFlows Lockstep Plan

> **Goal:** Make stockflows.app/demo and stockflows.fly.dev/app exactly the same - pixel-perfect match.

**Architecture:** The demo uses static HTML with dummy data. The Shopify app uses real data from Shopify. To make them match, we need to:
1. Update the demo to use the same product names and locations as the Shopify app
2. Ensure all pages have identical content
3. Create a cron job to verify and fix differences every 30 minutes

---

## Differences Found

| Page | Shopify App | Demo | Fix Needed |
|------|-------------|------|------------|
| **Inventory Locations** | My Custom Location | Warehouse A/B | Change demo to "My Custom Location" |
| **Inventory Products** | Shopify test snowboard products | Custom winter sports products | Change demo products to match |
| **VIEW INVENTORY button** | Present | Present (duplicate) | Remove duplicate |
| **Dashboard Stats** | 26 SKUs, 9 Low Stock, 6 Out of Stock | Same | ✅ Match |
| **Forecast Cards** | 10 products | 10 products | ✅ Match |
| **ABC Analysis** | 10 items | 10 items | ✅ Match |
| **Reports** | 10 valuation items | 10 items | ✅ Match |

---

## Implementation Steps

### Step 1: Update Demo Inventory Locations

**File:** `public/demo.html`

Change all location references from "Warehouse A/B" to "My Custom Location"

### Step 2: Update Demo Inventory Products

**File:** `public/demo.html`

Change product names to match the Shopify app:
- Alpine Touring Ski Boots → The Collection Snowboard: Liquid
- Backcountry Ski Poles → The Collection Snowboard: Oxygen
- etc.

### Step 3: Remove Duplicate VIEW INVENTORY Button

**File:** `public/demo.html`

Remove the duplicate button if present.

### Step 4: Deploy Changes

```bash
git add -A
git commit -m "fix: match demo inventory to Shopify app exactly"
git push origin main
```

### Step 5: Verify Changes

```bash
# Compare inventory items
curl -s "https://stockflows.fly.dev/app/inventory" | grep -o "My Custom Location" | wc -l
curl -s "https://stockflows.app/demo" | grep -o "My Custom Location" | wc -l
```

---

## Cron Job for Monitoring

Create a cron job that runs every 30 minutes to:
1. Compare both apps
2. Fix any differences
3. Deploy changes

---

## Summary

| Phase | Tasks | Time |
|-------|-------|------|
| Phase 1: Update Locations | 1 task | 10 min |
| Phase 2: Update Products | 1 task | 30 min |
| Phase 3: Deploy | 1 task | 10 min |
| Phase 4: Verify | 1 task | 10 min |
| **Total** | **4 tasks** | **~1 hour** |
