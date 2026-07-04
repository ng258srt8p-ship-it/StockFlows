# StockFlows Demo → Shopify App Diff Document

**Source (Demo):** `https://stockflows.app/demo` (snapshot saved: `demo-html-snapshot.html`)  
**Target (Shopify App):** `https://stockflows.fly.dev/app` (live Remix/React app)  
**UI Spec:** `./stockflows-ui-spec.md`  
**Generated:** Current session via MiMo-v2.5

---

## Executive Summary

The demo at `stockflows.app/demo` is a **static HTML mockup** that uses hash-based page switching. Of 6 pages, **only the Dashboard has any content**. The remaining 5 pages (Inventory, Purchasing, Forecasting, Reports, Settings) are **empty shells containing only their page header** — no tables, no forms, no buttons, no data, no interactive elements whatsoever. The Dashboard page itself is also missing one critical UI element present in the real app.

**Total differences found: 47**

| Severity | Count |
|----------|-------|
| 🔴 CRITICAL — Missing entire page content | 5 pages |
| 🟡 MODERATE — Missing individual components | 13 components |
| 🟠 MINOR — Text/class/structural mismatches | 29 discrepancies |

---

## 1. PAGE: Dashboard

### 1.1 Missing Component: "VIEW INVENTORY" Button
| Attribute | Demo | Real App / UI Spec |
|-----------|------|--------------------|
| **Element** | ❌ Not present | `<button class="Polaris-Button ...">View inventory</button>` |
| **Location** | — | Inside Active Alerts empty state, below the description text |
| **Style** | — | Primary variant, medium size |
| **Function** | — | Navigates to Inventory page |
| **Spec says** | — | `"VIEW INVENTORY" — Primary Button, navigates to Inventory page` |

**Verdict:** 🔴 **CRITICAL** — The primary CTA for the dashboard's empty alerts state is missing.

### 1.2 Missing EmptyState Image in Active Alerts
| Attribute | Demo | Real App |
|-----------|------|----------|
| **Empty state image** | ❌ Not present | `<img src="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/empty-state.png">` |
| **Skeleton overlay** | ❌ Not present | `<div class="Polaris-EmptyState__SkeletonImage"></div>` |
| **Container** | Simple text-only `<div>` | Full `Polaris-EmptyState` with `ImageContainer`, `BlockStack`, `InlineStack` |

**Verdict:** 🟡 MODERATE — The visual empty state illustration is missing.

### 1.3 Structural/Class Differences
| Aspect | Demo | Real App |
|--------|------|----------|
| **Page wrapper** | `<div class="Polaris-Page">` wraps content | `<div class="Polaris-Page"><div class="Polaris-Box" style="--pc-box-padding-block-start-xs:var(--p-space-400)...">` |
| **Layout container** | Raw Tailwind grid `margin:8px 16px 16px` | Polaris `Layout` → `Layout__Section` wrapping the same Tailwind grid |
| **Alerts section inner** | Plain `<div class="Polaris-EmptyState">` | Full `Polaris-EmptyState` → `ImageContainer` → `BlockStack` hierarchy |
| **`data-polaris-layer`** | ❌ Missing on frame | ✅ Present: `data-polaris-layer="true"` |
| **`data-has-navigation`** | ❌ Missing on frame | ✅ Present: `data-has-navigation="true"` |
| **Skip link** | ❌ Missing | ✅ Present: `<div class="Polaris-Frame__Skip"><a href="#AppFrameMain">` |
| **Status element** | ❌ Missing | ✅ Present: `<div role="status"><p class="Polaris-Text--root Polaris-Text--visuallyHidden"></p></div>` |
| **Box overflow** | ❌ Missing `overflow-x/y: clip` | ✅ Present on all Polaris-Box elements |
| **ContextualSaveBar** | ❌ Missing | ✅ Present: `<div class="Polaris-Frame__ContextualSaveBar ...">` |
| **ToastManager** | ❌ Missing | ✅ Present: `<div class="Polaris-Frame-ToastManager" aria-live="assertive">` |
| **Navigation dismiss button** | ❌ Missing | ✅ Present: `<button class="Polaris-Frame__NavigationDismiss">` |
| **Scrollable nav** | ❌ Missing | ✅ Present: `Polaris-Scrollable--vertical Polaris-Scrollable--horizontal` |

**Verdict:** 🟠 MINOR — CSS class / DOM hierarchy differences. The demo uses static HTML approximations instead of live Polaris components.

### 1.4 Sidebar: Missing `Polaris-Navigation--subNavigationActive` Class
| Element | Demo | Real App |
|---------|------|----------|
| Dashboard `<a>` | `Polaris-Navigation__Item--selected` only | `Polaris-Navigation__Item--selected Polaris-Navigation--subNavigationActive` |

---

## 2. PAGE: Inventory — 🔴 COMPLETELY EMPTY

### 2.1 Demo Content (entire page)
```html
<h1>Inventory</h1>
<p>26 products across 4 locations</p>
<!-- NOTHING ELSE -->
```

### 2.2 What Should Be Present (per UI Spec + Real App)

| Missing Element | Priority | Description |
|-----------------|----------|-------------|
| **Page subtitle** | 🟡 | Spec says "26 items"; demo says "26 products across 4 locations" |
| **"ADD ITEM" button** | 🔴 | Primary button, top-right of page header |
| **Search TextField** | 🔴 | "Search inventory" / "Search SKU or product name" |
| **Location Combobox** | 🔴 | "All locations" / "My Custom Location" / "Shop location" |
| **Inventory Table** | 🔴 | Full HTML `<table>` with 7 columns and 17+ data rows |
| **Table: SKU column** | 🔴 | SKU codes (e.g., "sku-hosted-1", "sku-managed-1", or "—") |
| **Table: Product column** | 🔴 | Product names (26 products from Shopify catalog) |
| **Table: Location column** | 🔴 | "My Custom Location" / "Shop location" |
| **Table: Qty column** | 🔴 | Numeric quantities (0–500) |
| **Table: Reorder Pt column** | 🔴 | Reorder point thresholds (typically 10) |
| **Table: Status column** | 🔴 | Badge: "In Stock" (green), "Low Stock" (yellow), "Out of Stock" (red) |
| **Table: Cost column** | 🔴 | Cost values or "—" |
| **Status Badges** | 🔴 | ~14 In Stock, ~9 Low Stock, ~6 Out of Stock |

**Missing data rows (sample from spec):**
| SKU | Product | Location | Qty | Status |
|-----|---------|----------|-----|--------|
| — | The Collection Snowboard: Liquid | My Custom Location | 50 | In Stock |
| sku-hosted-1 | The 3p Fulfilled Snowboard | My Custom Location | 20 | In Stock |
| sku-managed-1 | The Multi-managed Snowboard | My Custom Location | 100 | In Stock |
| — | Selling Plans Ski Wax | My Custom Location | 10 | Low Stock |
| — | The Out of Stock Snowboard | My Custom Location | 0 | Out of Stock |
| sku-untracked-1 | The Inventory Not Tracked Snowboard | My Custom Location | 0 | Out of Stock |
| *(...17 more rows)* | | | | |

**Verdict:** 🔴 **CRITICAL** — The most content-rich page in the app is a completely empty header-only shell.

---

## 3. PAGE: Purchasing — 🔴 COMPLETELY EMPTY

### 3.1 Demo Content (entire page)
```html
<h1>Purchase Orders</h1>
<p>3 open, 1 received</p>
<!-- NOTHING ELSE -->
```

### 3.2 What Should Be Present

| Missing Element | Priority | Description |
|-----------------|----------|-------------|
| **Subtitle text** | 🟠 | Spec says "Manage vendor orders and receiving"; demo says "3 open, 1 received" |
| **"Auto-generate POs" button** | 🔴 | Secondary button, disabled state |
| **"CREATE PO" button** | 🔴 | Primary button, top-right |
| **Empty state content** | 🟡 | Visual empty state message indicating no POs exist |

**Verdict:** 🔴 **CRITICAL** — All interactive elements and the page body are missing.

---

## 4. PAGE: Forecasting — 🔴 COMPLETELY EMPTY

### 4.1 Demo Content (entire page)
```html
<h1>Demand Forecasting</h1>
<p>AI-powered predictions</p>
<!-- NOTHING ELSE -->
```

### 4.2 What Should Be Present

| Missing Element | Priority | Description |
|-----------------|----------|-------------|
| **Page title** | 🟠 | Spec says "Forecasting"; demo says "Demand Forecasting" |
| **Subtitle text** | 🟠 | Spec says "Average accuracy: 0% — 0 forecasts generated"; demo says "AI-powered predictions" |
| **Stat cards (×3)** | 🔴 | "Total Predicted (30d)", "High Confidence", "Reorder Needed" |
| **Generated Forecasts card** | 🔴 | Section with empty state, "Learn more" link, "RUN FORECAST" button |
| **ABC Analysis card** | 🔴 | Full section with category legend (A/B/C badges) |
| **ABC Analysis table** | 🔴 | 7-column table with 10 product rows (revenue, cumulative %, stock, review freq) |
| **"RUN FORECAST" button** | 🔴 | Primary action to trigger forecast generation |
| **"Learn more" link** | 🔴 | Secondary link to documentation |

**ABC Table rows that should exist (from spec):**
| Category | Product | SKU | Revenue (90d) | Cumul % | Stock | Review Freq |
|----------|---------|-----|---------------|---------|-------|-------------|
| A | Gadget XL | GAD001 | $2,091.39 | 33.82% | 0 | Daily |
| A | Gadget Mini | GAD002 | $1,042.50 | 50.68% | 45 | Daily |
| A | Widget Pro | WDG001 | $892.51 | 65.11% | 150 | Daily |
| A | BubbleWrap | PKG002 | $688.62 | 76.25% | 25 | Daily |
| B | Accessory Pack B | ACC002 | $547.50 | 85.10% | 3 | Weekly |
| B | Widget Basic | WDG002 | $321.21 | 90.29% | 8 | Weekly |
| B | HDMI Cable 3m | CBL002 | $214.60 | 93.76% | 0 | Weekly |
| C | Accessory Pack A | ACC001 | $178.75 | 96.65% | 200 | Monthly |
| C | USB-C Cable 2m | CBL001 | $161.09 | 99.26% | 320 | Monthly |
| C | Shipping Box Med | PKG001 | $45.85 | 100% | 500 | Monthly |

**Verdict:** 🔴 **CRITICAL** — One of the most complex pages in the app is entirely absent.

---

## 5. PAGE: Reports — 🔴 COMPLETELY EMPTY

### 5.1 Demo Content (entire page)
```html
<h1>Reports</h1>
<p>Inventory valuation and stock movement summaries</p>
<!-- NOTHING ELSE -->
```

### 5.2 What Should Be Present

| Missing Element | Priority | Description |
|-----------------|----------|-------------|
| **Subtitle text** | 🟠 | Spec says "Export inventory data and analytics"; demo says "Inventory valuation and stock movement summaries" |
| **Stat cards (×3)** | 🔴 | "Total Inventory Value" ($2,101.72), "Total Items" (10), "Total Movements" (310) |
| **Export Data section** | 🔴 | Card with title "Export Data" |
| **"Export Inventory CSV" button** | 🔴 | Primary button |
| **"Export Inventory PDF" button** | 🔴 | Secondary link/button |

**Verdict:** 🔴 **CRITICAL** — Summary metrics and export functionality are completely missing.

---

## 6. PAGE: Settings — 🔴 COMPLETELY EMPTY

### 6.1 Demo Content (entire page)
```html
<h1>Settings</h1>
<p>Configure your store preferences</p>
<!-- NOTHING ELSE -->
```

### 6.2 What Should Be Present

| Missing Element | Priority | Description |
|-----------------|----------|-------------|
| **Subtitle text** | 🟠 | Spec says "Manage alerts, thresholds, and preferences"; demo says "Configure your store preferences" |
| **`<form>` wrapper** | 🔴 | Entire settings form |

**Section: Notifications (3 fields)**
| Missing Field | Default | Component |
|---------------|---------|-----------|
| Email Alerts | ✅ Checked | Checkbox/toggle |
| Slack Alerts | ☐ Unchecked | Checkbox/toggle |
| SMS Alerts | ☐ Unchecked | Checkbox/toggle |

**Section: Alert Thresholds (3 fields)**
| Missing Field | Default | Unit |
|---------------|---------|------|
| Low Stock Threshold | 10 | units |
| Critical Stock Threshold | 3 | units |
| Safety Stock Multiplier | 1.5 | × |

**Section: Forecasting (1 field)**
| Missing Field | Default | Unit |
|---------------|---------|------|
| Forecast Horizon | 30 | days |

**Section: AI Features (2 fields)**
| Missing Field | Default |
|---------------|---------|
| AI Insights | ☐ Unchecked |
| Forecast Explanations | ☐ Unchecked |

**Section: General (1 field)**
| Missing Field | Default | Options |
|---------------|---------|---------|
| Currency | USD ($) | USD, EUR, GBP, CAD, AUD |

**Missing Action:** `"Save Settings"` — Primary button

**Total missing form fields: 10**  
**Total missing sections: 5**  
**Missing submit button: 1**

**Verdict:** 🔴 **CRITICAL** — The most form-heavy page in the app is entirely absent.

---

## 7. GLOBAL / CROSS-CUTTING DIFFERENCES

### 7.1 Architecture
| Aspect | Demo | Real App |
|--------|------|----------|
| **Type** | Static HTML with inline JS | Remix/React SPA with server-side rendering |
| **Routing** | Hash-based (`#dashboard`, `#inventory`) | File-based (`/app`, `/app/inventory`) |
| **Navigation** | `onclick="showPage('dashboard');return false;"` | React Router / Remix `<Link href="/app">` |
| **Styling** | Static `polaris-styles.css` + `tailwind-styles.css` + massive inline `<style>` overrides | Build-bundled `tailwind-CMC2WRbM.css` + `styles-e9f2bdpk.css` + live Polaris CSS variables |
| **Scripts** | Single inline `<script>` block (~30 lines) | Multiple module-preloaded JS bundles (12+ files) |
| **Data** | Hardcoded static values | Dynamic loader data via `window.__remixContext` from API |

### 7.2 Navigation: Missing `href` Targets
| Nav Item | Demo `href` | Real App `href` |
|----------|-------------|-----------------|
| Dashboard | `#dashboard` | `/app` |
| Inventory | `#inventory` | `/app/inventory` |
| Purchasing | `#purchasing` | `/app/purchasing` |
| Forecasting | `#forecasting` | `/app/forecasting` |
| Reports | `#reports` | `/app/reports` |
| Settings | `#settings` | `/app/settings` |

### 7.3 Missing External Resources
| Resource | Demo | Real App |
|----------|------|----------|
| App Bridge styles | ❌ Not loaded | ✅ `https://cdn.shopify.com/shopifycloud/app-bridge-styles.css` |
| Instrument Serif font | ❌ Not loaded | ✅ Loaded alongside Inter |
| Remix context script | ❌ Not present | ✅ `window.__remixContext` with loader data |
| Module preloads | ❌ Not present | ✅ 12+ `<link rel="modulepreload">` tags |

### 7.4 Missing Meta / SEO
| Tag | Demo | Real App |
|-----|------|----------|
| `<title>` | "StockFlows — Live Demo" | "StockFlows - Inventory Management" |
| `<meta name="description">` | ❌ Missing | ✅ "Smart inventory management for Shopify" |

---

## 8. DIFF SUMMARY TABLE

| # | Page | Element/Aspect | Severity | Demo State | Expected State |
|---|------|---------------|----------|------------|----------------|
| 1 | Dashboard | "VIEW INVENTORY" button | 🔴 CRITICAL | Missing | Primary button in alerts empty state |
| 2 | Dashboard | EmptyState illustration | 🟡 MODERATE | Text only | Image + skeleton + full EmptyState |
| 3 | Dashboard | Polaris layout wrapper | 🟠 MINOR | Raw grid | Polaris Layout → Section |
| 4 | Dashboard | `data-polaris-layer` attr | 🟠 MINOR | Missing | Present on frame div |
| 5 | Dashboard | Skip link | 🟠 MINOR | Missing | Present |
| 6 | Dashboard | Status/visually-hidden element | 🟠 MINOR | Missing | Present |
| 7 | Dashboard | Box overflow-clip | 🟠 MINOR | Missing | On all Polaris-Box |
| 8 | Dashboard | ContextualSaveBar | 🟠 MINOR | Missing | Present (empty) |
| 9 | Dashboard | ToastManager | 🟠 MINOR | Missing | Present |
| 10 | Dashboard | Nav dismiss button | 🟠 MINOR | Missing | Present |
| 11 | Dashboard | Scrollable nav classes | 🟠 MINOR | Missing | Scrollable classes on nav |
| 12 | Dashboard | `subNavigationActive` class | 🟠 MINOR | Missing | On Dashboard nav item |
| 13 | Sidebar | Nav links use `href="#..."` | 🟠 MINOR | Hash-based | `/app/...` routes |
| 14 | Sidebar | Nav `onclick` handlers | 🟠 MINOR | Inline JS | React Router |
| 15 | Global | Title tag | 🟠 MINOR | "Live Demo" | "Inventory Management" |
| 16 | Global | Meta description | 🟠 MINOR | Missing | Present |
| 17 | Global | App Bridge CSS | 🟠 MINOR | Missing | Loaded |
| 18 | Global | Instrument Serif font | 🟠 MINOR | Missing | Loaded |
| 19 | Global | Remix context | 🟠 MINOR | Missing | Present with data |
| 20 | Global | Module preloads | 🟠 MINOR | Missing | 12+ preloads |
| 21 | Global | Navigation routing | 🟠 MINOR | Hash | Server routes |
| 22 | Global | Styling architecture | 🟠 MINOR | Static CSS + overrides | Bundled + Polaris vars |
| 23 | **Inventory** | **Entire page body** | 🔴 **CRITICAL** | **Header only** | **Full content** |
| 24 | Inventory | Subtitle text | 🟠 MINOR | "26 products across 4 locations" | "26 items" |
| 25 | Inventory | ADD ITEM button | 🔴 CRITICAL | Missing | Primary button |
| 26 | Inventory | Search TextField | 🔴 CRITICAL | Missing | "Search inventory" |
| 27 | Inventory | Location Combobox | 🔴 CRITICAL | Missing | Location filter dropdown |
| 28 | Inventory | Inventory table | 🔴 CRITICAL | Missing | 7-column table, 17+ rows |
| 29 | Inventory | Status badges | 🔴 CRITICAL | Missing | In Stock / Low Stock / Out of Stock |
| 30 | **Purchasing** | **Entire page body** | 🔴 **CRITICAL** | **Header only** | **Buttons + empty state** |
| 31 | Purchasing | Subtitle text | 🟠 MINOR | "3 open, 1 received" | "Manage vendor orders and receiving" |
| 32 | Purchasing | Auto-generate POs button | 🔴 CRITICAL | Missing | Disabled secondary button |
| 33 | Purchasing | CREATE PO button | 🔴 CRITICAL | Missing | Primary button |
| 34 | **Forecasting** | **Entire page body** | 🔴 **CRITICAL** | **Header only** | **Stat cards + 2 tables** |
| 35 | Forecasting | Page title | 🟠 MINOR | "Demand Forecasting" | "Forecasting" |
| 36 | Forecasting | Subtitle text | 🟠 MINOR | "AI-powered predictions" | "Average accuracy: 0% — 0 forecasts generated" |
| 37 | Forecasting | Stat cards (×3) | 🔴 CRITICAL | Missing | Total Predicted / High Confidence / Reorder Needed |
| 38 | Forecasting | Generated Forecasts section | 🔴 CRITICAL | Missing | Empty state + RUN FORECAST |
| 39 | Forecasting | ABC Analysis section | 🔴 CRITICAL | Missing | Table with 10 rows |
| 40 | **Reports** | **Entire page body** | 🔴 **CRITICAL** | **Header only** | **Stat cards + export** |
| 41 | Reports | Subtitle text | 🟠 MINOR | "Inventory valuation and stock movement summaries" | "Export inventory data and analytics" |
| 42 | Reports | Stat cards (×3) | 🔴 CRITICAL | Missing | Total Inv Value / Total Items / Total Movements |
| 43 | Reports | Export buttons (×2) | 🔴 CRITICAL | Missing | CSV + PDF export |
| 44 | **Settings** | **Entire page body** | 🔴 **CRITICAL** | **Header only** | **Full settings form** |
| 45 | Settings | Subtitle text | 🟠 MINOR | "Configure your store preferences" | "Manage alerts, thresholds, and preferences" |
| 46 | Settings | Form sections (×5) | 🔴 CRITICAL | Missing | Notifications, Thresholds, Forecasting, AI, General |
| 47 | Settings | Form fields (×10) | 🔴 CRITICAL | Missing | 3 checkboxes + 4 number inputs + 1 dropdown + 2 AI toggles |
| 48 | Settings | Save Settings button | 🔴 CRITICAL | Missing | Primary button |

---

## 9. PRIORITY FIX ORDER

### Phase 1 — Fill Empty Pages (47 of 48 differences)
Build out the complete page bodies for Inventory, Purchasing, Forecasting, Reports, and Settings per the UI spec. This resolves ~95% of all differences.

### Phase 2 — Dashboard Button
Add the "VIEW INVENTORY" primary button to the Active Alerts empty state, and the Polaris EmptyState illustration.

### Phase 3 — Polaris Accuracy
Update the demo's CSS classes, DOM hierarchy, and structural markup to better match live Polaris components (overflow-clip, skip link, status element, ToastManager, etc.).

### Phase 4 — Routing & Architecture (Optional)
Convert from hash-based SPA to proper URL routing if the demo needs to match the real app's URL structure.
