# StockFlows Feature Enhancement Plan

## Objective
Implement the top customer-requested features, test them, update the website to highlight them, and deploy to all platforms.

## Phase 1: Research & Feature Prioritization

### Top Customer-Requested Features (from Shopify Community)
| # | Feature | Customer Need | Competitive Gap |
|---|---------|---------------|-----------------|
| 1 | **QuickBooks Integration** | "inventory + accounting alignment (COGS, invoices, QuickBooks)" | No app connects inventory to accounting |
| 2 | **Automated PO Generation** | "PO generation based on sales trends" | Manual PO creation only |
| 3 | **Audit Trail with User Attribution** | "WHO did an action... very basic feature" | Missing in most apps |
| 4 | **Reason Codes for Adjustments** | "We use reason codes in Stocky" | No categorization |
| 5 | **Barcode Scanning + Stock Movement** | "absence of a consistent stock movement" | Basic counting only |
| 6 | **Multi-Location Variant Management** | "variant combinations across locations" | Oversimplified |
| 7 | **Low Stock Alerts (Customizable)** | "notification for when product is out of stock" | Basic thresholds |
| 8 | **Shipment Receiving Verification** | "delivery gets marked received... but a few units were short" | No discrepancy handling |

### Competitive Analysis Summary
| Competitor | Rating | Price | Key Weakness |
|------------|--------|-------|--------------|
| Stocky | 2.9/5 | Free (POS Pro $89) | **Being discontinued Aug 2026** |
| Inventory Planner | 4.5/5 | ~$4k/yr | Sync failures, slow support |
| Stock Sync | 4.7/5 | Free-$29/mo | No forecasting |
| SKULabs | 4.9/5 | $299/mo | Too expensive for SMBs |

**Market Gap:** Mid-market ($50-150/mo) with full features = StockFlows opportunity

---

## Phase 2: Feature Implementation

### Task 1: QuickBooks Integration Module
**Files:** `app/lib/accounting/quickbooks.ts`, `app/routes/app.settings.accounting.tsx`

```typescript
// Core sync functionality
- Sync COGS from purchase orders
- Import invoices from QuickBooks
- Update inventory valuations
- Financial reporting alignment
```

### Task 2: Automated PO Generation
**Files:** `app/lib/purchasing/auto-po.ts`, `app/routes/app.purchasing.tsx`

```typescript
// Auto-PO logic
- Analyze 90-day sales trends
- Calculate days until stockout
- Generate POs for items below reorder point
- Group by vendor
```

### Task 3: Audit Trail System
**Files:** `prisma/schema.prisma`, `app/lib/inventory/audit.ts`

```typescript
// Audit logging
- Log all inventory adjustments
- Track user attribution
- Store reason codes
- Maintain timestamped history
```

### Task 4: Barcode Scanning Enhancement
**Files:** `app/components/receiving/BarcodeScanner.tsx`, `app/routes/app.inventory.$id.adjust.tsx`

```typescript
// Enhanced scanning
- Scan-in/scan-out workflows
- Automatic stock movement logging
- Location-based movements
- Discrepancy detection
```

---

## Phase 3: Testing

### Unit Tests
```bash
npx vitest run app/lib/accounting/
npx vitest run app/lib/purchasing/
npx vitest run app/lib/inventory/
```

### E2E Tests
```bash
npx playwright test e2e/health-api.spec.ts
npx playwright test e2e/inventory-workflows.spec.ts
npx playwright test e2e/full-app-qa.spec.ts
```

### Live Production Tests
```bash
npx playwright test --config=playwright.live.config.ts
```

---

## Phase 4: Website Updates

### Update Features Section
- Add QuickBooks integration card
- Add automated PO card
- Add audit trail card
- Add barcode scanning card

### Update Competitive Comparison
- Add accounting integration row
- Add audit trail row
- Highlight price advantage

### Update Demo Screenshots
- Take new screenshots showing new features
- Update demo gallery

---

## Phase 5: Deployment

### Step 1: Commit Changes
```bash
git add -A
git commit -m "feat: implement customer-requested features"
git push origin main
```

### Step 2: Deploy to Fly.io
```bash
fly deploy --app stockflows
```

### Step 3: Deploy to Shopify
```bash
shopify app deploy --allow-updates --allow-deletes
```

### Step 4: Deploy to Cloudflare
```bash
wrangler pages deploy public --project-name=stockflows
```

### Step 5: Verify All Deployments
```bash
curl -s https://stockflows.fly.dev/health
curl -s https://stockflows.app
curl -s https://stockflows.fly.dev/app
```

---

## Phase 6: Monitoring (Cron Job)

### Hourly Monitoring Script
```bash
#!/bin/bash
# scripts/monitor.sh

# Check health endpoints
FLY_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://stockflows.fly.dev/health)
CF_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://stockflows.app)

# Check for errors
ERRORS=$(fly logs --app stockflows --no-tail 2>&1 | grep -i error | tail -5)

# Report status
echo "[$(date)] Fly: $FLY_HEALTH | CF: $CF_HEALTH | Errors: $ERRORS"
```

### Cron Schedule
```bash
0 * * * * /path/to/scripts/monitor.sh >> /path/to/logs/cron.log 2>&1
```

---

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Customer-requested features | 8/8 implemented | 0/8 |
| Unit test coverage | >80% | ~60% |
| E2E tests passing | 100% | 100% |
| Website updated | Yes | Partial |
| Deployed to all platforms | Yes | Yes |
| Cloudflare build successful | Yes | Yes |

---

## Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1: Research | Day 1 | Feature list, competitive analysis |
| Phase 2: Implementation | Days 2-5 | 4 new features |
| Phase 3: Testing | Day 6 | All tests passing |
| Phase 4: Website | Day 7 | Updated marketing site |
| Phase 5: Deployment | Day 7 | All platforms deployed |
| Phase 6: Monitoring | Ongoing | Hourly checks |

---

## Next Steps

1. **Review this plan** and approve
2. **Start implementation** with QuickBooks integration
3. **Run tests** after each feature
4. **Update website** with new features
5. **Deploy** to all platforms
6. **Set up monitoring** cron job
