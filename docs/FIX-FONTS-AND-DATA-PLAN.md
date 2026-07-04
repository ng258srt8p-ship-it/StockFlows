# StockFlows Demo Font Fix & Data Enrichment Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Fix font mismatches between demo and Shopify app, and add more realistic dummy data to give users a better sense of what the app looks like in production.

**Architecture:** Single static HTML file (demo.html) with inline CSS overrides and JavaScript page switching. The fix will:
1. Add Instrument Serif font import
2. Apply Instrument Serif to all heading elements
3. Fix h1 weight from 450 to 400
4. Add realistic dummy data to all pages

**Tech Stack:** HTML5, CSS (Polaris via CDN), JavaScript (vanilla), Playwright (testing)

---

## Gate Table

| Gate # | Gate | Verification Method | Pass Condition |
|--------|------|---------------------|----------------|
| 1 | Instrument Serif loads | `curl -s demo.html | grep "Instrument Serif"` | Font imported |
| 2 | h1 uses Instrument Serif | Computed style check | `fontFamily` contains "Instrument Serif" |
| 3 | h1 weight is 400 | Computed style check | `fontWeight: "400"` |
| 4 | Inventory has 26 items | `grep -c "Polaris-IndexTable__TableRow" demo.html` | Count >= 26 |
| 5 | Dashboard has alerts | `grep -c "Active Alerts" demo.html` | Count >= 1 |
| 6 | All E2E tests pass | `npx playwright test e2e/pixel-comparison.spec.ts` | 15 passed |

---

## Phase 1: Font Fixes

### Task 1.1: Add Instrument Serif font import

**Objective:** Import the Instrument Serif font from Google Fonts

**Files:**
- Modify: `public/demo.html`

**Step 1: Add font import to head**

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap">
```

**Step 2: Verify font loads**

```bash
curl -s https://stockflows.app/demo | grep "Instrument Serif"
```

Expected: `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap">`

**Step 3: Commit**

```bash
git add public/demo.html
git commit -m "feat: add Instrument Serif font import"
```

---

### Task 1.2: Apply Instrument Serif to headings

**Objective:** Apply Instrument Serif font to all heading elements

**Files:**
- Modify: `public/demo.html`

**Step 1: Add CSS override for headings**

```css
/* Apply Instrument Serif to headings */
h1, .Polaris-Text--headingLg, .Polaris-Header-Title, .Polaris-Text--headingMd {
  font-family: "Instrument Serif", Georgia, "Times New Roman", serif !important;
}

/* Fix h1 weight to match Shopify app */
h1 {
  font-weight: 400 !important;
}
```

**Step 2: Verify font is applied**

```bash
curl -s https://stockflows.app/demo | grep "Instrument Serif"
```

Expected: Multiple matches (font import + CSS override)

**Step 3: Commit**

```bash
git add public/demo.html
git commit -m "feat: apply Instrument Serif to headings and fix h1 weight"
```

---

## Phase 2: Data Enrichment

### Task 2.1: Add more inventory items

**Objective:** Increase inventory from 10 to 26 items to match the "26 products" stat

**Files:**
- Modify: `public/demo.html`

**Step 1: Add 16 more inventory items**

The inventory table should have 26 items total:
- 10 snowboards (various types)
- 5 ski equipment
- 5 snow gear
- 6 accessories

Each item needs:
- SKU
- Product name
- Location
- Quantity
- Reorder point
- Status badge (In Stock, Low Stock, Out of Stock)
- Cost

**Step 2: Update status badges**

Make sure the status distribution matches the dashboard stats:
- In Stock: 11 items
- Low Stock: 9 items
- Out of Stock: 6 items

**Step 3: Commit**

```bash
git add public/demo.html
git commit -m "feat: add 16 more inventory items to match 26 products stat"
```

---

### Task 2.2: Add more purchasing orders

**Objective:** Increase purchase orders from 4 to 8 for a more realistic view

**Files:**
- Modify: `public/demo.html`

**Step 1: Add 4 more purchase orders**

The purchasing table should have 8 POs total:
- 2 Draft status
- 2 Sent status
- 2 Partially received status
- 2 Received status

Each PO needs:
- PO Number (PO-005 to PO-008)
- Vendor name
- Status badge
- Items count
- Total cost
- Expected date

**Step 2: Commit**

```bash
git add public/demo.html
git commit -m "feat: add 4 more purchase orders for realistic data"
```

---

### Task 2.3: Add more forecasting cards

**Objective:** Increase forecast cards from 5 to 10 for better demonstration

**Files:**
- Modify: `public/demo.html`

**Step 1: Add 5 more forecast cards**

The forecasting grid should have 10 cards total:
- 4 A-class items (high priority)
- 3 B-class items (medium priority)
- 3 C-class items (low priority)

Each card needs:
- Product name
- Forecast model (ETS, Linear, Ensemble)
- Trend indicator (↑, ↓, →)
- Predicted stock
- Current stock
- Confidence level

**Step 2: Commit**

```bash
git add public/demo.html
git commit -m "feat: add 5 more forecast cards for better demonstration"
```

---

### Task 2.4: Add more reports data

**Objective:** Add detailed valuation table and movement summary

**Files:**
- Modify: `public/demo.html`

**Step 1: Add valuation table with 10 items**

The reports page should have:
- Total Inventory Value: $2,101.72
- Total Items: 10
- Total Movements: 310
- Detailed table with 10 items showing:
  - Product name
  - SKU
  - Quantity
  - Unit cost
  - Total value

**Step 2: Add movement summary**

- Inbound movements: 150
- Outbound movements: 120
- Adjustments: 40

**Step 3: Commit**

```bash
git add public/demo.html
git commit -m "feat: add detailed valuation table and movement summary"
```

---

### Task 2.5: Add more settings options

**Objective:** Add additional configuration options for a more complete settings page

**Files:**
- Modify: `public/demo.html`

**Step 1: Add 2 more config cards**

The settings page should have 7 config cards total:
1. Notifications (existing)
2. Alert Thresholds (existing)
3. Forecasting (existing)
4. AI Features (existing)
5. General (existing)
6. **Inventory Management** (NEW)
   - Auto-reorder: OFF
   - Default reorder point: 10
   - Safety stock multiplier: 1.5x
7. **Reporting** (NEW)
   - Email reports: Weekly
   - Report format: PDF
   - Include charts: ON

**Step 2: Commit**

```bash
git add public/demo.html
git commit -m "feat: add 2 more config cards for complete settings page"
```

---

## Phase 3: Testing & Validation

### Task 3.1: Update E2E tests

**Objective:** Update tests to verify new data

**Files:**
- Modify: `e2e/pixel-comparison.spec.ts`

**Step 1: Update inventory row count test**

```typescript
test("8. Stat values match", async () => {
  const shopifyValues = await shopifyPage.evaluate(() => {
    const cards = document.querySelectorAll('.Polaris-Text--headingLg');
    return Array.from(cards).map(el => el.textContent?.trim()).filter(t => t && !t.includes('StockFlows'));
  });
  const demoValues = await demoPage.evaluate(() => {
    const cards = document.querySelectorAll('.Polaris-Text--headingLg');
    return Array.from(cards).map(el => el.textContent?.trim()).filter(t => t && !t.includes('StockFlows'));
  });
  expect(demoValues.slice(0, 4)).toEqual(shopifyValues.slice(0, 4));
});
```

**Step 2: Add inventory row count test**

```typescript
test("16. Inventory has 26 items", async () => {
  const demoRows = await demoPage.evaluate(() => {
    return document.querySelectorAll('#page-inventory .Polaris-IndexTable__TableRow').length;
  });
  expect(demoRows).toBe(26);
});
```

**Step 3: Commit**

```bash
git add e2e/pixel-comparison.spec.ts
git commit -m "test: update tests for new data counts"
```

---

### Task 3.2: Run visual comparison tests

**Objective:** Verify all visual elements match

**Files:**
- Run: `npx playwright test e2e/pixel-comparison.spec.ts`

**Step 1: Run tests**

```bash
npx playwright test e2e/pixel-comparison.spec.ts
```

Expected: 16 passed

**Step 2: Fix any failures**

**Step 3: Commit**

```bash
git add -A
git commit -m "test: verify visual parity with new data"
```

---

## Phase 4: Deployment

### Task 4.1: Deploy to Cloudflare

**Objective:** Deploy updated demo

**Step 1: Commit all changes**

```bash
git add -A
git commit -m "feat: fix fonts and add realistic dummy data"
```

**Step 2: Push to GitHub**

```bash
git push origin main
```

**Step 3: Verify deployment**

```bash
curl -s https://stockflows.app/demo | grep -c "Instrument Serif"
```

Expected: > 2

---

## Summary

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: Font Fixes | 2 tasks | 20 minutes |
| Phase 2: Data Enrichment | 5 tasks | 2 hours |
| Phase 3: Testing | 2 tasks | 30 minutes |
| Phase 4: Deployment | 1 task | 10 minutes |
| **Total** | **10 tasks** | **~3 hours** |

---

## Key Data Changes

| Page | Current | Target |
|------|---------|--------|
| **Dashboard** | 4 stat cards, 0 alerts, 0 activity | 4 stat cards, alerts with data, activity feed |
| **Inventory** | 10 items | 26 items |
| **Purchasing** | 4 POs | 8 POs |
| **Forecasting** | 5 cards | 10 cards |
| **Reports** | Basic stats | Detailed valuation table + movement summary |
| **Settings** | 5 config cards | 7 config cards |

---

## Font Comparison

| Element | Shopify App | Demo (Current) | Demo (Target) |
|---------|-------------|----------------|---------------|
| **h1 font** | Instrument Serif | Inter | Instrument Serif |
| **h2 font** | Instrument Serif | Inter | Instrument Serif |
| **stat font** | Instrument Serif | Inter | Instrument Serif |
| **h1 weight** | 400 | 450 | 400 |
| **h3 font** | Inter | Inter | Inter |
| **nav font** | Inter | Inter | Inter |
