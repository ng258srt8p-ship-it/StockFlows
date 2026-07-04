# StockFlows Demo Refactor Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Completely refactor the demo at stockflows.app to look and function exactly like the Shopify app at stockflows.fly.dev/app, using dummy data to show the full experience before customers buy.

**Architecture:** The demo is a single static HTML file (demo.html) that loads Polaris CSS from stockflows.fly.dev/assets/ and uses JavaScript to switch between pages. The refactor will:
1. Extract the exact HTML structure from each page of the Shopify app
2. Replace all custom CSS with proper Polaris CSS variables
3. Add complete dummy data for all pages
4. Fix all navigation and page switching behavior

**Tech Stack:** HTML5, CSS (Polaris via CDN), JavaScript (vanilla), Playwright (testing)

---

## Gate Table

| Gate # | Gate | Verification Method | Pass Condition |
|--------|------|---------------------|----------------|
| 1 | Demo loads without errors | `curl -s stockflows.app/demo` | HTTP 200 |
| 2 | All 6 pages render | Playwright screenshot comparison | All pages visible |
| 3 | Navigation works | Playwright click test | Hash links work |
| 4 | Stats match exactly | `grep -o "headingLg" demo.html | wc -l` | Same count |
| 5 | Colors match Polaris | Computed style comparison | No differences |
| 6 | All E2E tests pass | `npx playwright test e2e/pixel-comparison.spec.ts` | 15 passed |

---

## Phase 1: Research & Analysis

### Task 1.1: Extract exact Shopify app HTML

**Objective:** Save the complete HTML structure of each page from the Shopify app

**Files:**
- Create: `docs/shopify-app-reference/dashboard.html`
- Create: `docs/shopify-app-reference/inventory.html`
- Create: `docs/shopify-app-reference/purchasing.html`
- Create: `docs/shopify-app-reference/forecasting.html`
- Create: `docs/shopify-app-reference/reports.html`
- Create: `docs/shopify-app-reference/settings.html`

**Step 1: Create reference directory**

```bash
mkdir -p docs/shopify-app-reference
```

**Step 2: Extract dashboard HTML**

```bash
curl -s https://stockflows.fly.dev/app | sed -n '/<main/,/<\/main>/p' > docs/shopify-app-reference/dashboard.html
```

**Step 3: Extract navigation HTML**

```bash
curl -s https://stockflows.fly.dev/app | sed -n '/<nav/,/<\/nav>/p' > docs/shopify-app-reference/navigation.html
```

**Step 4: Document all Polaris components used**

Create `docs/shopify-app-reference/component-list.md` with:
- All Polaris class names found
- Their hierarchy and nesting
- CSS custom properties used

**Step 5: Commit**

```bash
git add docs/shopify-app-reference/
git commit -m "docs: extract exact Shopify app HTML structure"
```

---

### Task 1.2: Document all visual differences

**Objective:** Create a complete diff of every visual difference between demo and app

**Files:**
- Create: `docs/visual-diff.md`

**Step 1: Extract computed styles from both apps**

```bash
# Extract from Shopify app
curl -s https://stockflows.fly.dev/app | grep -o 'class="Polaris[^"]*"' | sort | uniq > /tmp/shopify-classes.txt

# Extract from demo
curl -s https://stockflows.app/demo | grep -o 'class="Polaris[^"]*"' | sort | uniq > /tmp/demo-classes.txt

# Compare
diff /tmp/shopify-classes.txt /tmp/demo-classes.txt > docs/visual-diff.txt
```

**Step 2: Document color differences**

```bash
# Extract CSS variables from both
curl -s https://stockflows.fly.dev/assets/styles-e9f2bdpk.css | grep -o '\-\-p-color[^:]*:[^;]*;' | sort > /tmp/shopify-colors.txt
curl -s https://stockflows.app/polaris-styles.css | grep -o '\-\-p-color[^:]*:[^;]*;' | sort > /tmp/demo-colors.txt
diff /tmp/shopify-colors.txt /tmp/demo-colors.txt > docs/color-diff.txt
```

**Step 3: Commit**

```bash
git add docs/visual-diff.md
git commit -m "docs: document all visual differences"
```

---

## Phase 2: Core Infrastructure

### Task 2.1: Create clean demo.html skeleton

**Objective:** Start fresh with proper Polaris structure

**Files:**
- Modify: `public/demo.html`

**Step 1: Create the base HTML structure**

```html
<!DOCTYPE html>
<html lang="en" class="p-theme-light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StockFlows — Live Demo</title>
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200">
  <link rel="stylesheet" href="polaris-styles.css">
  <link rel="stylesheet" href="tailwind-styles.css">
</head>
<body>
  <!-- Navigation will go here -->
  <!-- Main content will go here -->
</body>
</html>
```

**Step 2: Verify it loads**

```bash
curl -s http://localhost:3000/demo.html | head -10
```

**Step 3: Commit**

```bash
git add public/demo.html
git commit -m "feat: create clean demo.html skeleton"
```

---

### Task 2.2: Add navigation structure

**Objective:** Add the exact navigation structure from the Shopify app

**Files:**
- Modify: `public/demo.html`

**Step 1: Copy navigation HTML from Shopify app**

The navigation structure from the Shopify app is:
```html
<div class="Polaris-Frame__Navigation" id="AppFrameNav">
  <nav class="Polaris-Navigation">
    <div class="Polaris-Navigation__PrimaryNavigation">
      <ul class="Polaris-Navigation__Section">
        <!-- Dashboard item -->
        <li class="Polaris-Navigation__ListItem">
          <div class="Polaris-Navigation__ItemWrapper">
            <div class="Polaris-Navigation__ItemInnerWrapper">
              <a class="Polaris-Navigation__Item" href="#dashboard">
                <div class="Polaris-Navigation__Icon">
                  <span class="Polaris-Icon">
                    <!-- SVG icon here -->
                  </span>
                </div>
                <span class="Polaris-Navigation__Text">
                  <span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--semibold">Dashboard</span>
                </span>
              </a>
            </div>
          </div>
        </li>
        <!-- More items... -->
      </ul>
    </div>
  </nav>
</div>
```

**Step 2: Add all 6 navigation items with exact SVG icons**

**Step 3: Add hash-based page switching JavaScript**

```html
<script>
  function showPage(page) {
    document.querySelectorAll('.demo-page').forEach(p => p.style.display = 'none');
    document.getElementById('page-' + page).style.display = 'block';
    // Update nav active state
    document.querySelectorAll('.Polaris-Navigation__Item').forEach(item => {
      item.classList.remove('Polaris-Navigation__Item--selected');
    });
    document.querySelector('[href="#' + page + '"]').classList.add('Polaris-Navigation__Item--selected');
  }
  
  // Handle hash changes
  function hashHandler() {
    var hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById('page-' + hash)) {
      showPage(hash);
    }
  }
  window.addEventListener('hashchange', hashHandler);
  document.addEventListener('DOMContentLoaded', hashHandler);
</script>
```

**Step 4: Commit**

```bash
git add public/demo.html
git commit -m "feat: add navigation structure with page switching"
```

---

### Task 2.3: Add CSS variable overrides

**Objective:** Override StockFlows custom variables to match Polaris

**Files:**
- Modify: `public/demo.html`

**Step 1: Add style block with overrides**

```html
<style>
  :root {
    --p-color-bg: rgba(241, 241, 241, 1) !important;
    --p-color-text: rgba(48, 48, 48, 1) !important;
    --p-color-text-secondary: rgba(97, 97, 97, 1) !important;
    --p-color-bg-surface: rgba(255, 255, 255, 1) !important;
    --p-color-border: rgba(227, 227, 227, 1) !important;
    --p-color-nav-bg: rgba(235, 235, 235, 1) !important;
    --p-color-nav-bg-surface-hover: rgba(241, 241, 241, 1) !important;
    --p-color-nav-bg-surface-active: rgba(250, 250, 250, 1) !important;
    --p-color-bg-fill-brand: rgba(48, 48, 48, 1) !important;
  }
  
  body { background-color: #f1f1f1 !important; }
  .Polaris-Frame__Content { background: #f1f1f1 !important; }
  .Polaris-Frame__Navigation { background: #ebebeb !important; }
  
  /* Override hover effects */
  .Polaris-Navigation__Item:hover { background: transparent !important; }
  .Polaris-Navigation__ItemInnerWrapper:hover { background: transparent !important; }
</style>
```

**Step 2: Verify colors match**

```bash
curl -s https://stockflows.app/demo | grep -o "rgba(241, 241, 241"
```

**Step 3: Commit**

```bash
git add public/demo.html
git commit -m "feat: add CSS variable overrides to match Polaris"
```

---

## Phase 3: Dashboard Page

### Task 3.1: Add dashboard stat cards

**Objective:** Add the 4 stat cards with exact Polaris structure

**Files:**
- Modify: `public/demo.html`

**Step 1: Add dashboard page structure**

```html
<div id="page-dashboard" class="demo-page active">
  <div class="Polaris-Page">
    <div class="Polaris-Page-Header--isSingleRow">
      <div class="Polaris-Page-Header__Row">
        <div class="Polaris-Page-Header__TitleWrapper">
          <h1 class="Polaris-Header-Title">
            <span class="Polaris-Text--root Polaris-Text--headingLg Polaris-Text--bold">StockFlows Dashboard</span>
          </h1>
          <div class="Polaris-Header-Title__SubTitle">
            <p class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--subdued">Inventory overview</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Stats Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" style="margin: 8px 16px 16px;">
    <div class="Polaris-ShadowBevel" style="--pc-shadow-bevel-z-index:32;--pc-shadow-bevel-content-xs:'';--pc-shadow-bevel-box-shadow-xs:var(--p-shadow-100);--pc-shadow-bevel-border-radius-xs:var(--p-border-radius-300)">
      <div class="Polaris-Box" style="--pc-box-background:var(--p-color-bg-surface);--pc-box-min-height:100%;--pc-box-padding-block-start-xs:var(--p-space-400);--pc-box-padding-block-end-xs:var(--p-space-400);--pc-box-padding-inline-start-xs:var(--p-space-400);--pc-box-padding-inline-end-xs:var(--p-space-400)">
        <div class="p-4">
          <h3 class="Polaris-Text--root Polaris-Text--headingSm">Total SKUs</h3>
          <p class="Polaris-Text--root Polaris-Text--headingLg">26</p>
        </div>
      </div>
    </div>
    <!-- More stat cards... -->
  </div>
</div>
```

**Step 2: Add all 4 stat cards with exact inline styles**

**Step 3: Commit**

```bash
git add public/demo.html
git commit -m "feat: add dashboard stat cards with exact Polaris structure"
```

---

### Task 3.2: Add alerts and activity sections

**Objective:** Add empty state alerts and recent activity

**Files:**
- Modify: `public/demo.html`

**Step 1: Add alerts section with Polaris-EmptyState**

```html
<div class="Polaris-ShadowBevel" style="--pc-shadow-bevel-z-index:32;...">
  <div class="Polaris-Box" style="...">
    <div class="flex items-center justify-between mb-2">
      <h2 class="Polaris-Text--root Polaris-Text--headingMd">Active Alerts</h2>
      <span class="Polaris-Badge">
        <span class="Polaris-Text--root Polaris-Text--bodySm">0</span>
      </span>
    </div>
    <div class="Polaris-EmptyState">
      <div class="Polaris-EmptyState__Section">
        <p class="Polaris-Text--root Polaris-Text--headingMd Polaris-Text--center">No active alerts</p>
        <p class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--center">All stock levels are above their reorder points.</p>
      </div>
    </div>
  </div>
</div>
```

**Step 2: Add recent activity section**

**Step 3: Commit**

```bash
git add public/demo.html
git commit -m "feat: add alerts and activity sections"
```

---

## Phase 4: Other Pages

### Task 4.1: Add inventory page

**Objective:** Add inventory table with dummy data

**Files:**
- Modify: `public/demo.html`

**Step 1: Add inventory page structure**

**Step 2: Add table with 10 inventory items**

**Step 3: Add search and filter inputs**

**Step 4: Commit**

```bash
git add public/demo.html
git commit -m "feat: add inventory page with dummy data"
```

---

### Task 4.2: Add purchasing page

**Objective:** Add purchase orders table

**Files:**
- Modify: `public/demo.html`

**Step 1: Add purchasing page structure**

**Step 2: Add PO table with 4 orders**

**Step 3: Commit**

```bash
git add public/demo.html
git commit -m "feat: add purchasing page with dummy data"
```

---

### Task 4.3: Add forecasting page

**Objective:** Add forecast cards

**Files:**
- Modify: `public/demo.html`

**Step 1: Add forecasting page structure**

**Step 2: Add 5 forecast cards with chart bars**

**Step 3: Commit**

```bash
git add public/demo.html
git commit -m "feat: add forecasting page with dummy data"
```

---

### Task 4.4: Add reports page

**Objective:** Add valuation and movement reports

**Files:**
- Modify: `public/demo.html`

**Step 1: Add reports page structure**

**Step 2: Add valuation table with 10 items**

**Step 3: Add movement summary**

**Step 4: Commit**

```bash
git add public/demo.html
git commit -m "feat: add reports page with dummy data"
```

---

### Task 4.5: Add settings page

**Objective:** Add settings form

**Files:**
- Modify: `public/demo.html`

**Step 1: Add settings page structure**

**Step 2: Add form with inputs and toggles**

**Step 3: Commit**

```bash
git add public/demo.html
git commit -m "feat: add settings page with form elements"
```

---

## Phase 5: Testing & Validation

### Task 5.1: Run visual comparison tests

**Objective:** Verify all visual elements match

**Files:**
- Modify: `e2e/pixel-comparison.spec.ts`

**Step 1: Update test selectors if needed**

**Step 2: Run tests**

```bash
npx playwright test e2e/pixel-comparison.spec.ts
```

**Step 3: Fix any failures**

**Step 4: Commit**

```bash
git add e2e/pixel-comparison.spec.ts
git commit -m "test: verify visual parity with Playwright"
```

---

### Task 5.2: Test navigation behavior

**Objective:** Verify hash links work

**Files:**
- Create: `e2e/navigation.spec.ts`

**Step 1: Create test for each page hash**

```typescript
test('Demo navigation works with hash links', async ({ page }) => {
  await page.goto('https://stockflows.app/demo#inventory');
  await expect(page.locator('#page-inventory')).toBeVisible();
  await expect(page.locator('#page-dashboard')).not.toBeVisible();
});
```

**Step 2: Run tests**

```bash
npx playwright test e2e/navigation.spec.ts
```

**Step 3: Commit**

```bash
git add e2e/navigation.spec.ts
git commit -m "test: verify navigation with hash links"
```

---

## Phase 6: Deployment

### Task 6.1: Deploy to Cloudflare

**Objective:** Deploy updated demo

**Step 1: Commit all changes**

```bash
git add -A
git commit -m "feat: complete demo refactor to match Shopify app"
```

**Step 2: Push to GitHub**

```bash
git push origin main
```

**Step 3: Verify deployment**

```bash
curl -s https://stockflows.app/demo | grep -c "Polaris-ShadowBevel"
```

Expected: > 10

---

## Summary

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: Research | 2 tasks | 30 minutes |
| Phase 2: Infrastructure | 3 tasks | 1 hour |
| Phase 3: Dashboard | 2 tasks | 1 hour |
| Phase 4: Other pages | 5 tasks | 2 hours |
| Phase 5: Testing | 2 tasks | 30 minutes |
| Phase 6: Deployment | 1 task | 10 minutes |
| **Total** | **15 tasks** | **~5 hours** |

---

## Key Differences to Fix

| Element | Current Demo | Target (Shopify App) |
|---------|--------------|----------------------|
| **Body background** | `#fafafa` | `#f1f1f1` |
| **Card border-radius** | `0px` | `12px` |
| **Card shadow** | `none` | `rgba(26,26,26,0.07) 0px 1px 0px 0px` |
| **Nav item font-size** | `13px` | `12px` |
| **Nav item font-weight** | `450` | `700` |
| **Nav item text-transform** | `none` | `uppercase` |
| **Nav item letter-spacing** | `normal` | `0.3px` |
| **Brand color** | `#111` | `rgba(48,48,48,1)` |
| **CSS variable format** | `#hex` | `rgba()` |
