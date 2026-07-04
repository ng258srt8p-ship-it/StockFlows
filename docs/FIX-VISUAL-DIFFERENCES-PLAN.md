# StockFlows Demo — Fix All Visual Differences Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Fix every visual difference between `stockflows.app/demo` and `stockflows.fly.dev/app` until they are pixel-perfect.

**Architecture:** The demo currently uses simplified HTML with custom CSS classes. It must be rewritten to use the exact Polaris component structure with all inline CSS custom properties from the Shopify app.

---

## Root Cause

The demo is a **simplified mockup** while the Shopify app uses the **full Polaris component system** with:
- `Polaris-ShadowBevel` with inline `--pc-*` CSS custom properties
- `Polaris-Box` with inline `--pc-box-*` CSS custom properties
- `Polaris-Text` with specific typography classes
- `Polaris-Badge` with tone classes
- `Polaris-Button` with variant classes
- `Polaris-EmptyState` for empty states
- Tailwind CSS utilities for responsive grid

---

## Phase 1: Copy Exact HTML from Shopify App

### Task 1.1: Copy the exact dashboard HTML structure

**Objective:** Replace the demo's simplified dashboard with the exact Polaris structure

**Files:**
- Modify: `public/demo.html`

**What to copy from the Shopify app:**

The Shopify app's dashboard HTML structure is:
```
Polaris-Frame
  └── Polaris-Frame__Navigation
       └── Polaris-Navigation
            └── Polaris-Navigation__PrimaryNavigation
                 └── Polaris-Navigation__Section
                      └── Polaris-Navigation__ListItem (×6)
                           └── Polaris-Navigation__ItemWrapper
                                └── Polaris-Navigation__ItemInnerWrapper
                                     └── Polaris-Navigation__Item
                                          ├── Polaris-Navigation__Icon
                                          └── Polaris-Navigation__Text
  └── Polaris-Frame__Main
       └── Polaris-Frame__Content
            └── Polaris-Page
                 └── Polaris-Page-Header
                      └── Polaris-Text--headingLg "StockFlows Dashboard"
                 └── Polaris-Layout
                      └── Polaris-Layout__Section
                           └── grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4
                                └── Polaris-ShadowBevel (×4 stat cards)
                                     └── Polaris-Box
                                          └── p-4
                                               ├── Polaris-Text--headingSm "Total SKUs"
                                               └── Polaris-Text--headingLg "26"
```

**Step 1:** Copy the exact `<div class="Polaris-Frame">` structure from the Shopify app

**Step 2:** Copy the exact navigation with all SVG icons

**Step 3:** Copy the exact page header with `Polaris-Page-Header`

**Step 4:** Copy the exact stat cards with `Polaris-ShadowBevel` and all inline styles

**Step 5:** Copy the exact alerts/activity sections with `Polaris-EmptyState`

**Step 6:** Commit

---

### Task 1.2: Copy exact stat card HTML with all inline styles

**Objective:** Match stat cards pixel-for-pixel

**The exact HTML for one stat card from the Shopify app:**

```html
<div class="Polaris-ShadowBevel" style="--pc-shadow-bevel-z-index:32;--pc-shadow-bevel-content-xs:&quot;&quot;;--pc-shadow-bevel-box-shadow-xs:var(--p-shadow-100);--pc-shadow-bevel-border-radius-xs:var(--p-border-radius-0)">
  <div class="Polaris-Box" style="--pc-box-background:var(--p-color-bg-surface);--pc-box-min-height:100%;--pc-box-overflow-x:clip;--pc-box-overflow-y:clip;--pc-box-padding-block-start-xs:var(--p-space-400);--pc-box-padding-block-end-xs:var(--p-space-400);--pc-box-padding-inline-start-xs:var(--p-space-400);--pc-box-padding-inline-end-xs:var(--p-space-400)">
    <div class="p-4">
      <h3 class="Polaris-Text--root Polaris-Text--headingSm">Total SKUs</h3>
      <p class="Polaris-Text--root Polaris-Text--headingLg">26</p>
    </div>
  </div>
</div>
```

**Step 1:** Replace all 4 stat cards with exact Polaris structure

**Step 2:** Add all inline CSS custom properties

**Step 3:** Commit

---

### Task 1.3: Copy exact alerts section with Polaris-EmptyState

**Objective:** Match alerts section pixel-for-pixel

**The exact HTML for the alerts section:**

```html
<div class="Polaris-ShadowBevel" style="...">
  <div class="Polaris-Box" style="...">
    <div class="flex items-center justify-between mb-2">
      <h2 class="Polaris-Text--root Polaris-Text--headingMd">Active Alerts</h2>
      <span class="Polaris-Badge">
        <span class="Polaris-Text--root Polaris-Text--bodySm">0</span>
      </span>
    </div>
    <div class="Polaris-Box" style="...">
      <div class="Polaris-BlockStack" style="...">
        <div class="Polaris-EmptyState__ImageContainer Polaris-EmptyState__SkeletonImageContainer">
          <img alt="" src="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/empty-state.png" class="Polaris-EmptyState__Image" role="presentation"/>
        </div>
        <div class="Polaris-Box" style="...">
          <div class="Polaris-BlockStack" style="...">
            <p class="Polaris-Text--root Polaris-Text--headingMd Polaris-Text--block Polaris-Text--center">No active alerts</p>
            <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--block Polaris-Text--center">
              <p>All stock levels are above their reorder points.</p>
            </span>
            <div class="Polaris-InlineStack" style="...">
              <button class="Polaris-Button Polaris-Button--pressable Polaris-Button--variantPrimary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter">
                <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--semibold">View inventory</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Step 1:** Replace the alerts section with exact Polaris structure

**Step 2:** Add the Shopify CDN empty state image

**Step 3:** Add all inline styles

**Step 4:** Commit

---

### Task 1.4: Copy exact navigation with all SVG icons

**Objective:** Match navigation pixel-for-pixel

**What to copy:**
- All 6 navigation items with exact SVG path data
- `Polaris-Navigation__Item--selected` class for active state
- All inline styles and classes

**Step 1:** Copy exact navigation HTML from Shopify app

**Step 2:** Add all SVG icons with exact path data

**Step 3:** Commit

---

### Task 1.5: Add missing Polaris classes and CSS

**Objective:** Ensure all Polaris classes render correctly

**Step 1:** Add any missing CSS from `polaris-styles.css`

**Step 2:** Ensure `tailwind-styles.css` provides responsive grid utilities

**Step 3:** Commit

---

## Phase 2: Fix All Other Pages

### Task 2.1: Fix Inventory page to use exact Polaris structure

**Step 1:** Copy inventory page HTML from Shopify app

**Step 2:** Replace simplified table with Polaris structure

**Step 3:** Commit

---

### Task 2.2: Fix Purchasing page

**Step 1:** Copy purchasing page HTML from Shopify app

**Step 2:** Commit

---

### Task 2.3: Fix Forecasting page

**Step 1:** Copy forecasting page HTML from Shopify app

**Step 2:** Commit

---

### Task 2.4: Fix Reports page

**Step 1:** Copy reports page HTML from Shopify app

**Step 2:** Commit

---

### Task 2.5: Fix Settings page

**Step 1:** Copy settings page HTML from Shopify app

**Step 2:** Commit

---

## Phase 3: Testing & Validation

### Task 3.1: Run visual comparison tests

**Step 1:** Take screenshots of both pages

**Step 2:** Compare pixel-by-pixel

**Step 3:** Fix any remaining differences

**Step 4:** Commit

---

### Task 3.2: Run all E2E tests

**Step 1:** Run `npx playwright test`

**Step 2:** Fix any failures

**Step 3:** Commit

---

## Summary

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: Dashboard | 5 tasks | 1 hour |
| Phase 2: Other pages | 5 tasks | 2 hours |
| Phase 3: Testing | 2 tasks | 30 minutes |
| **Total** | **12 tasks** | **~3.5 hours** |
