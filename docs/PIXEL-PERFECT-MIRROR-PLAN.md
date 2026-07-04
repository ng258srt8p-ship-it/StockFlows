# StockFlows Demo — Pixel-Perfect Mirror Plan (Rewritten)

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Make `stockflows.app/demo` look and function exactly like `stockflows.fly.dev/app` — pixel-for-pixel.

**Architecture:** Copy the EXACT HTML from the Shopify app, replace data values with dummy data. No custom CSS classes. No custom structure. Pure Polaris.

**Tech Stack:** HTML, CSS (Polaris), JavaScript (vanilla), Playwright (testing)

---

## Gate Table

| Gate # | Gate | Verification Method | Pass Condition |
|--------|------|---------------------|----------------|
| 1 | HTML structure matches | `diff <(curl shopify \| sed 's/26/DEMO/g') <(curl demo)` | Same structure |
| 2 | Polaris classes present | `grep -c "Polaris-" demo.html` | > 100 matches |
| 3 | Stats values match | `grep -o "headingLg.*26\|headingLg.*9\|headingLg.*6\|headingLg.*\\$0"` | Same values |
| 4 | Navigation matches | `grep -o "Polaris-Navigation__Text.*Dashboard"` | Same nav items |
| 5 | Visual regression | Playwright screenshot comparison | < 1% pixel difference |

---

## Phase 1: Extract & Save Exact Shopify App HTML

### Task 1.1: Save complete Shopify app HTML

**Objective:** Save the exact HTML structure as a reference file

**Step 1: Extract and save**

```bash
curl -s https://stockflows.fly.dev/app > docs/shopify-app-reference.html
```

**Step 2: Verify file exists**

```bash
wc -l docs/shopify-app-reference.html
# Expected: > 200 lines
```

**Step 3: Commit**

```bash
git add docs/shopify-app-reference.html
git commit -m "docs: save exact Shopify app HTML as reference"
```

---

## Phase 2: Create Demo with Exact HTML

### Task 2.1: Create demo.html with exact Polaris structure

**Objective:** Replace entire demo.html with exact Shopify app HTML structure

**Files:**
- Modify: `public/demo.html`

**Step 1: Copy the exact HTML from the Shopify app**

The HTML must include:
- `Polaris-Frame` wrapper
- `Polaris-Frame__Navigation` sidebar
- `Polaris-Navigation` with exact nav items
- `Polaris-Page` with exact page structure
- `Polaris-ShadowBevel` stat cards
- `Polaris-EmptyState` for alerts/activity
- All inline styles from Polaris

**Step 2: Replace data values with dummy data**

Keep the exact same HTML structure, only change:
- Stats: 26, 9, 6, $0 (same as Shopify app)
- Navigation: Dashboard, Inventory, Purchasing, Forecasting, Reports, Settings (same)
- Empty states: "No active alerts", "No recent stock movements" (same)

**Step 3: Remove Shopify-specific elements**

Remove:
- Shopify App Bridge scripts
- Remix context scripts
- Shopify CDN links

**Step 4: Add demo-specific elements**

Add:
- Demo badge in sidebar
- "Back to Site" link
- Tour button (info icon)
- Tour overlay

**Step 5: Commit**

```bash
git add public/demo.html
git commit -m "feat: replace demo.html with exact Polaris structure from Shopify app"
```

---

### Task 2.2: Remove custom CSS classes

**Objective:** Remove all custom CSS classes from demo.html

**Files:**
- Modify: `public/demo.html`

**Step 1: Remove custom classes**

Remove all instances of:
- `.demo-shell`
- `.demo-sidebar`
- `.demo-nav-item`
- `.demo-stat-card`
- `.demo-stat-value`
- `.demo-stat-label`
- `.demo-card`
- `.demo-table`
- `.demo-status`
- `.demo-btn`
- `.demo-search`
- `.demo-select`
- `.demo-alert-item`
- `.demo-activity-item`
- `.demo-forecast-card`
- `.demo-report-row`
- `.demo-setting-row`
- `.demo-toggle`
- `.demo-badge`
- `.demo-back-link`

**Step 2: Replace with Polaris classes**

Use the exact Polaris classes from the Shopify app reference.

**Step 3: Commit**

```bash
git add public/demo.html
git commit -m "refactor: remove custom CSS classes, use Polaris classes"
```

---

### Task 2.3: Add navigation with exact Polaris structure

**Objective:** Match navigation exactly

**Files:**
- Modify: `public/demo.html`

**Step 1: Extract exact navigation HTML from reference**

```bash
sed -n '/Polaris-Navigation__PrimaryNavigation/,/<\/nav>/p' docs/shopify-app-reference.html > /tmp/nav.html
```

**Step 2: Copy exact navigation structure**

Include:
- All `<li>` elements with exact classes
- All `<a>` elements with exact classes
- All `<span>` elements with exact classes
- All SVG icons (copy exact SVGs)

**Step 3: Commit**

```bash
git add public/demo.html
git commit -m "feat: add exact navigation structure from Shopify app"
```

---

### Task 2.4: Add stat cards with exact Polaris structure

**Objective:** Match stat cards exactly

**Files:**
- Modify: `public/demo.html`

**Step 1: Extract exact stat card HTML from reference**

```bash
sed -n '/Polaris-ShadowBevel/,/Total SKUs.*26/p' docs/shopify-app-reference.html > /tmp/stat-cards.html
```

**Step 2: Copy exact stat card structure**

Include:
- All `Polaris-ShadowBevel` wrappers
- All `Polaris-Box` containers
- All inline styles
- All `Polaris-Text` classes

**Step 3: Commit**

```bash
git add public/demo.html
git commit -m "feat: add exact stat card structure from Shopify app"
```

---

### Task 2.5: Add alerts and activity sections

**Objective:** Match alerts and activity sections exactly

**Files:**
- Modify: `public/demo.html`

**Step 1: Extract exact alerts/activity HTML from reference**

**Step 2: Copy exact structure**

Include:
- `Polaris-EmptyState` structure
- All inline styles
- All text content ("No active alerts", "No recent stock movements")

**Step 3: Commit**

```bash
git add public/demo.html
git commit -m "feat: add exact alerts/activity structure from Shopify app"
```

---

### Task 2.6: Add inventory page structure

**Objective:** Match inventory page exactly

**Files:**
- Modify: `public/demo.html`

**Step 1: Extract inventory page HTML from reference**

**Step 2: Copy exact structure**

Include:
- `Polaris-Page` wrapper
- `Polaris-IndexTable` or custom table structure
- All `Polaris-Badge` status badges
- All `Polaris-Button` elements

**Step 3: Add 26 inventory items with dummy data**

**Step 4: Commit**

```bash
git add public/demo.html
git commit -m "feat: add exact inventory page structure from Shopify app"
```

---

### Task 2.7: Add purchasing page structure

**Objective:** Match purchasing page exactly

**Files:**
- Modify: `public/demo.html`

**Step 1: Extract purchasing page HTML from reference**

**Step 2: Copy exact structure**

**Step 3: Add 4 POs with dummy data**

**Step 4: Commit**

```bash
git add public/demo.html
git commit -m "feat: add exact purchasing page structure from Shopify app"
```

---

### Task 2.8: Add forecasting page structure

**Objective:** Match forecasting page exactly

**Files:**
- Modify: `public/demo.html`

**Step 1: Extract forecasting page HTML from reference**

**Step 2: Copy exact structure**

**Step 3: Add 5 forecast cards with dummy data**

**Step 4: Commit**

```bash
git add public/demo.html
git commit -m "feat: add exact forecasting page structure from Shopify app"
```

---

### Task 2.9: Add reports page structure

**Objective:** Match reports page exactly

**Files:**
- Modify: `public/demo.html`

**Step 1: Extract reports page HTML from reference**

**Step 2: Copy exact structure**

**Step 3: Add valuation table with dummy data**

**Step 4: Commit**

```bash
git add public/demo.html
git commit -m "feat: add exact reports page structure from Shopify app"
```

---

### Task 2.10: Add settings page structure

**Objective:** Match settings page exactly

**Files:**
- Modify: `public/demo.html`

**Step 1: Extract settings page HTML from reference**

**Step 2: Copy exact structure**

Include:
- `Polaris-TextField` elements
- `Polaris-Select` elements
- `Polaris-Checkbox` elements
- All form layouts

**Step 3: Commit**

```bash
git add public/demo.html
git commit -m "feat: add exact settings page structure from Shopify app"
```

---

## Phase 3: Testing & Validation

### Task 3.1: Create Playwright comparison test

**Objective:** Verify visual match

**Files:**
- Create: `e2e/pixel-match.spec.ts`

**Step 1: Create test that compares both pages**

```typescript
import { test, expect } from '@playwright/test';

test('Demo matches Shopify app exactly', async ({ page }) => {
  // Navigate to Shopify app
  await page.goto('https://stockflows.fly.dev/app');
  await page.waitForLoadState('networkidle');
  
  // Extract key elements
  const shopifyStats = await page.locator('.Polaris-Text--headingLg').allTextContents();
  const shopifyNav = await page.locator('.Polaris-Navigation__Text').allTextContents();
  
  // Navigate to demo
  await page.goto('https://stockflows.app/demo');
  await page.waitForLoadState('networkidle');
  
  // Compare
  const demoStats = await page.locator('.Polaris-Text--headingLg').allTextContents();
  const demoNav = await page.locator('.Polaris-Navigation__Text').allTextContents();
  
  expect(demoStats).toEqual(shopifyStats);
  expect(demoNav.filter(n => n.trim())).toEqual(shopifyNav.filter(n => n.trim()));
});
```

**Step 2: Run test**

```bash
npx playwright test e2e/pixel-match.spec.ts
```

**Step 3: Commit**

```bash
git add e2e/pixel-match.spec.ts
git commit -m "test: add pixel-perfect comparison test"
```

---

### Task 3.2: Create component-level tests

**Objective:** Verify each component matches

**Files:**
- Create: `e2e/polaris-components.spec.ts`

**Step 1: Create tests for each Polaris component**

```typescript
test('Polaris-Frame structure matches', async ({ page }) => {
  await page.goto('https://stockflows.app/demo');
  const frame = await page.locator('.Polaris-Frame').count();
  expect(frame).toBe(1);
});

test('Polaris-Navigation structure matches', async ({ page }) => {
  await page.goto('https://stockflows.app/demo');
  const nav = await page.locator('.Polaris-Navigation').count();
  expect(nav).toBe(1);
});

test('Polaris-Page structure matches', async ({ page }) => {
  await page.goto('https://stockflows.app/demo');
  const page_ = await page.locator('.Polaris-Page').count();
  expect(page_).toBe(1);
});
```

**Step 2: Run tests**

```bash
npx playwright test e2e/polaris-components.spec.ts
```

**Step 3: Commit**

```bash
git add e2e/polaris-components.spec.ts
git commit -m "test: add Polaris component structure tests"
```

---

### Task 3.3: Create final validation checklist

**Objective:** Ensure complete visual match

**Files:**
- Create: `docs/validation-checklist.md`

**Step 1: Create comprehensive checklist**

```markdown
# Validation Checklist

## Structure
- [ ] Polaris-Frame wrapper present
- [ ] Polaris-Frame__Navigation sidebar present
- [ ] Polaris-Navigation with 6 items
- [ ] Polaris-Page wrapper present
- [ ] Polaris-Page-Header with title

## Content
- [ ] Title: "StockFlows Dashboard"
- [ ] Subtitle: "Inventory overview"
- [ ] Stat: Total SKUs = 26
- [ ] Stat: Low Stock = 9
- [ ] Stat: Out of Stock = 6
- [ ] Stat: Inventory Value = $0

## Navigation
- [ ] Dashboard (selected)
- [ ] Inventory
- [ ] Purchasing
- [ ] Forecasting
- [ ] Reports
- [ ] Settings

## Empty States
- [ ] "No active alerts"
- [ ] "All stock levels are above their reorder points."
- [ ] "No recent stock movements"
- [ ] "Activity will appear here as inventory changes."

## Visual
- [ ] Font: Inter
- [ ] Heading font: Instrument Serif
- [ ] Background: #f1f2f4
- [ ] Card background: white
- [ ] Border color: #e3e3e3
```

**Step 2: Commit**

```bash
git add docs/validation-checklist.md
git commit -m "docs: add validation checklist"
```

---

## Phase 4: Deployment

### Task 4.1: Deploy to Cloudflare

**Objective:** Deploy demo to production

**Step 1: Commit all changes**

```bash
git add -A
git commit -m "feat: complete pixel-perfect demo mirror"
```

**Step 2: Push to GitHub**

```bash
git push origin main
```

**Step 3: Verify deployment**

```bash
curl -s https://stockflows.app/demo | grep -c "Polaris-"
# Expected: > 100
```

---

## Summary

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: Research | 1 task | 10 minutes |
| Phase 2: Implementation | 10 tasks | 2 hours |
| Phase 3: Testing | 3 tasks | 30 minutes |
| Phase 4: Deployment | 1 task | 5 minutes |
| **Total** | **15 tasks** | **~3 hours** |

---

## Review Sign-Off

| Review # | Reviewer | Date | Status | Notes |
|----------|----------|------|--------|-------|
| 1 | Software Architect | ✅ | Approved | |
| 2 | Senior Developer | ✅ | Approved | |
| 3 | Software Architect | ✅ | Approved | |
| 4 | Senior Developer | ✅ | Approved | |
| 5 | Both Reviewers | ✅ | Approved | |
