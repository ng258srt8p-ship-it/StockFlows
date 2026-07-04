# StockFlows — Complete UI Specification Document

**URL:** https://stockflows.fly.dev/app  
**Generated:** 2025-01-XX  
**Framework:** Remix (React) with Shopify Polaris Design System  
**Fonts:** Inter (300–900), Instrument Serif (italic)  
**CSS:** Tailwind CSS + Polaris CSS + Custom styles (`styles-e9f2bdpk.css`)  
**App Bridge:** Shopify App Bridge (embedded app)  
**Screenshots:** Saved to `public/screenshots/`

---

## Table of Contents

1. [Global App Shell](#1-global-app-shell)
2. [Dashboard Page](#2-dashboard-page)
3. [Inventory Page](#3-inventory-page)
4. [Purchasing Page](#4-purchasing-page)
5. [Forecasting Page](#5-forecasting-page)
6. [Reports Page](#6-reports-page)
7. [Settings Page](#7-settings-page)
8. [Polaris Component Reference](#8-polaris-component-reference)

---

## 1. Global App Shell

### 1.1 Root Frame Structure

```html
<html lang="en" class="p-theme-light">
<body class="antialiased" style="font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;">
  <div class="Polaris-Frame Polaris-Frame--hasNav" data-polaris-layer="true" data-has-navigation="true">
    <!-- Skip to content link -->
    <div class="Polaris-Frame__Skip">
      <a href="#AppFrameMain">
        <span class="Polaris-Text--root Polaris-Text--bodyLg Polaris-Text--medium"></span>
      </a>
    </div>
    
    <!-- Left Navigation -->
    <div class="Polaris-Frame__Navigation" id="AppFrameNav">...</div>
    
    <!-- Contextual Save Bar -->
    <div class="Polaris-Frame__ContextualSaveBar Polaris-Frame-CSSAnimation--startFade"></div>
    
    <!-- Main Content -->
    <main class="Polaris-Frame__Main" id="AppFrameMain" data-has-global-ribbon="false">
      <div class="Polaris-Frame__Content">...</div>
    </main>
    
    <!-- Toast Portals -->
    <div id="PolarisPortalsContainer">
      <div data-portal-id="toast-:R49j5:" class="p-theme-light Polaris-ThemeProvider--themeContainer">
        <div class="Polaris-Frame-ToastManager" aria-live="assertive"></div>
      </div>
    </div>
  </div>
</body>
</html>
```

### 1.2 Navigation Sidebar

The sidebar is a `Polaris-Navigation` component with two `Polaris-Navigation__Section` `<ul>` elements:

**Primary Navigation (top section):**

| Label      | Route               | Icon Type   | Icon SVG Path Summary                |
|------------|---------------------|-------------|--------------------------------------|
| Dashboard  | `/app`              | Home        | House with chimney                   |
| Inventory  | `/app/inventory`    | Box/Package | Open box with inner shelf            |
| Purchasing | `/app/purchasing`   | Cart        | Shopping cart with two wheels        |
| Forecasting| `/app/forecasting`  | Briefcase   | Briefcase with clasp                 |
| Reports    | `/app/reports`      | Bar Chart   | Three vertical bars of varying height|

**Secondary Navigation (bottom section, separated):**

| Label      | Route               | Icon Type | Icon SVG Path Summary          |
|------------|---------------------|-----------|--------------------------------|
| Settings   | `/app/settings`     | Gear      | Multi-toothed gear/cogwheel    |

**HTML Structure per Nav Item:**
```html
<li class="Polaris-Navigation__ListItem">
  <div class="Polaris-Navigation__ItemWrapper">
    <div class="Polaris-Navigation__ItemInnerWrapper [Polaris-Navigation__ItemInnerWrapper--selected]">
      <a class="Polaris-Navigation__Item [Polaris-Navigation__Item--selected] Polaris-Navigation--subNavigationActive"
         tabindex="0" href="/app" data-polaris-unstyled="true">
        <div class="Polaris-Navigation__Icon">
          <span class="Polaris-Icon">
            <svg viewBox="0 0 20 20" class="Polaris-Icon__Svg" focusable="false" aria-hidden="true">
              <!-- SVG path data -->
            </svg>
          </span>
        </div>
        <span class="Polaris-Navigation__Text">
          <span class="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--medium">
            Dashboard
          </span>
        </span>
      </a>
    </div>
  </div>
</li>
```

**Active State Classes:**
- `Polaris-Navigation__ItemInnerWrapper--selected`
- `Polaris-Navigation__Item--selected`
- `Polaris-Navigation--subNavigationActive`

**Text Styling:** `Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--medium`

**Navigation Dismiss Button (mobile):**
```html
<button type="button" class="Polaris-Frame__NavigationDismiss" aria-hidden="true" aria-label="" tabindex="-1">
  <!-- X icon SVG -->
</button>
```

### 1.3 Page Layout Structure

Every page follows this pattern:
```html
<main class="Polaris-Frame__Main" id="AppFrameMain">
  <div class="Polaris-Frame__Content">
    <div class="Polaris-Page">
      <div class="Polaris-Box" style="--pc-box-padding-block-start-xs:var(--p-space-400); ...">
        
        <!-- Status/SR-only element -->
        <div role="status"><p class="Polaris-Text--root Polaris-Text--visuallyHidden"></p></div>
        
        <!-- Page Header -->
        <div class="Polaris-Page-Header--isSingleRow Polaris-Page-Header--noBreadcrumbs Polaris-Page-Header--mediumTitle">
          ...
        </div>
        
        <!-- Page Content -->
        <div class="">
          <div class="Polaris-Layout">
            <div class="Polaris-Layout__Section">...</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>
```

---

## 2. Dashboard Page

**Route:** `/app`  
**Screenshot:** `public/screenshots/dashboard.png`

### 2.1 Page Header

```html
<div class="Polaris-Page-Header--isSingleRow Polaris-Page-Header--noBreadcrumbs Polaris-Page-Header--mediumTitle">
  <div class="Polaris-Page-Header__Row">
    <div class="Polaris-Page-Header__TitleWrapper Polaris-Page-Header__TitleWrapperExpand">
      <div class="Polaris-Header-Title__TitleWrapper">
        <h1 class="Polaris-Header-Title Polaris-Header-Title__TitleWithSubtitle">
          <span class="Polaris-Text--root Polaris-Text--headingLg Polaris-Text--bold">StockFlows Dashboard</span>
        </h1>
      </div>
      <div class="Polaris-Header-Title__SubTitle">
        <p class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--subdued">Inventory overview</p>
      </div>
    </div>
  </div>
</div>
```

- **Title:** `StockFlows Dashboard` — `Polaris-Text--headingLg Polaris-Text--bold`
- **Subtitle:** `Inventory overview` — `Polaris-Text--bodySm Polaris-Text--subdued`
- **Modifiers:** `Polaris-Page-Header--isSingleRow`, `Polaris-Page-Header--noBreadcrumbs`, `Polaris-Page-Header--mediumTitle`
- **No primary action button** in header (unlike Inventory/Purchasing pages)
- **No breadcrumbs**

### 2.2 KPI Cards Row (4 cards, responsive grid)

```html
<div class="Polaris-Layout__Section">
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Card repeated 4x -->
    <div class="Polaris-ShadowBevel" style="--pc-shadow-bevel-z-index: 32; --pc-shadow-bevel-box-shadow-xs: var(--p-shadow-100); --pc-shadow-bevel-border-radius-xs: var(--p-border-radius-300);">
      <div class="Polaris-Box" style="--pc-box-background:var(--p-color-bg-surface); ...">
        <div class="p-4">
          <h3 class="Polaris-Text--root Polaris-Text--headingSm">Total SKUs</h3>
          <p class="Polaris-Text--root Polaris-Text--headingLg">26</p>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Data values at time of capture:**

| Card           | Value | Heading Class            | Value Class              |
|----------------|-------|--------------------------|--------------------------|
| Total SKUs     | 26    | `Polaris-Text--headingSm`| `Polaris-Text--headingLg`|
| Low Stock      | 9     | `Polaris-Text--headingSm`| `Polaris-Text--headingLg`|
| Out of Stock   | 6     | `Polaris-Text--headingSm`| `Polaris-Text--headingLg`|
| Inventory Value| $0    | `Polaris-Text--headingSm`| `Polaris-Text--headingLg`|

**CSS Grid:** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`  
**Card Wrapper:** `Polaris-ShadowBevel` with inline CSS custom properties  
**Inner Box:** `Polaris-Box` with `--pc-box-background:var(--p-color-bg-surface)`, padding vars, overflow clip  
**Content padding:** Tailwind `p-4`

### 2.3 Active Alerts Section (2-column grid, left half)

```html
<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
  <!-- Active Alerts Card -->
  <div class="Polaris-ShadowBevel">
    <div class="Polaris-Box" style="--pc-box-background:var(--p-color-bg-surface); ...">
      <div class="p-4">
        <div class="flex items-center justify-between mb-2">
          <h2 class="Polaris-Text--root Polaris-Text--headingMd">Active Alerts</h2>
          <span class="Polaris-Badge"><span class="Polaris-Text--root Polaris-Text--bodySm">0</span></span>
        </div>
        <!-- EmptyState -->
        <div class="Polaris-Box" style="--pc-box-padding-block-start-xs:var(--p-space-500); --pc-box-padding-block-end-xs:var(--p-space-1600);">
          <div class="Polaris-BlockStack" style="--pc-block-stack-inline-align:center; --pc-block-stack-order:column">
            <div class="Polaris-EmptyState__ImageContainer Polaris-EmptyState__SkeletonImageContainer">
              <img alt="" src="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/empty-state.png"
                   class="Polaris-EmptyState__Image" role="presentation">
              <div class="Polaris-EmptyState__SkeletonImage"></div>
            </div>
            <div class="Polaris-Box" style="--pc-box-max-width:400px">
              <p class="Polaris-Text--root Polaris-Text--headingMd Polaris-Text--block Polaris-Text--center">No active alerts</p>
              <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--block Polaris-Text--center">
                <p>All stock levels are above their reorder points.</p>
              </span>
              <!-- InlineStack with buttons -->
              <div class="Polaris-InlineStack" style="--pc-inline-stack-align:center; --pc-inline-stack-wrap:wrap; --pc-inline-stack-gap-xs:var(--p-space-200);">
                <button class="Polaris-Button Polaris-Button--pressable Polaris-Button--variantPrimary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter">
                  View inventory
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Polaris Components Used:**
- `Polaris-Badge` (default tone) — shows count `0`
- `Polaris-EmptyState__ImageContainer` / `Polaris-EmptyState__SkeletonImage` / `Polaris-EmptyState__Image`
- `Polaris-BlockStack` with `--pc-block-stack-inline-align:center`
- `Polaris-InlineStack` with center alignment and wrap
- `Polaris-Button--variantPrimary`

### 2.4 Recent Activity Section (2-column grid, right half)

```html
<div class="Polaris-ShadowBevel">
  <div class="Polaris-Box" style="--pc-box-background:var(--p-color-bg-surface); ...">
    <div class="p-4">
      <div class="flex items-center justify-between mb-2">
        <h2 class="Polaris-Text--root Polaris-Text--headingMd">Recent Activity</h2>
        <a class="text-sm text-blue-600 hover:underline" data-discover="true" href="/app/inventory">View all</a>
      </div>
      <p class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--subdued">
        No recent stock movements. Activity will appear here as inventory changes.
      </p>
    </div>
  </div>
</div>
```

**Data displayed:**
- Heading: "Recent Activity" — `Polaris-Text--headingMd`
- Link: "View all" — Tailwind `text-sm text-blue-600 hover:underline`, links to `/app/inventory`
- Empty state text: "No recent stock movements. Activity will appear here as inventory changes." — `Polaris-Text--bodySm Polaris-Text--subdued`

---

## 3. Inventory Page

**Route:** `/app/inventory`  
**Screenshot:** `public/screenshots/inventory.png`

### 3.1 Page Header

```html
<div class="Polaris-Page-Header--noBreadcrumbs Polaris-Page-Header--mediumTitle">
  <div class="Polaris-Page-Header__Row">
    <div class="Polaris-Page-Header__TitleWrapper Polaris-Page-Header__TitleWrapperExpand">
      <h1 class="Polaris-Header-Title Polaris-Header-Title__TitleWithSubtitle">
        <span class="Polaris-Text--root Polaris-Text--headingLg Polaris-Text--bold">Inventory</span>
      </h1>
      <div class="Polaris-Header-Title__SubTitle">
        <p class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--subdued">26 items</p>
      </div>
    </div>
    <div class="Polaris-Page-Header__RightAlign">
      <div class="Polaris-Page-Header__PrimaryActionWrapper">
        <div class="Polaris-Box Polaris-Box--printHidden">
          <button class="Polaris-Button Polaris-Button--pressable Polaris-Button--variantPrimary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter">
            Add Item
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
```

- **Title:** `Inventory` — `Polaris-Text--headingLg Polaris-Text--bold`
- **Subtitle:** `26 items` — `Polaris-Text--bodySm Polaris-Text--subdued`
- **Primary Action Button:** `Add Item` — `Polaris-Button--variantPrimary Polaris-Button--sizeMedium`
- **Modifiers:** `Polaris-Page-Header--noBreadcrumbs`, `Polaris-Page-Header--mediumTitle`
- Note: No `Polaris-Page-Header--isSingleRow` (because there's a right-aligned action)

### 3.2 Search & Filter Controls

```html
<div class="p-4">
  <div class="flex gap-4 mb-4">
    <!-- Search Input -->
    <div class="flex-1">
      <div class="Polaris-Labelled--hidden">
        <div class="Polaris-Labelled__LabelWrapper">
          <div class="Polaris-Label">
            <label class="Polaris-Label__Text">
              <span class="Polaris-Text--root Polaris-Text--bodyMd">Search inventory</span>
            </label>
          </div>
        </div>
        <div class="Polaris-Connected">
          <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
            <div class="Polaris-TextField">
              <input placeholder="Search by SKU, product, or barcode..."
                     autocomplete="off"
                     class="Polaris-TextField__Input Polaris-TextField__Input--hasClearButton"
                     type="text" value="">
              <div class="Polaris-TextField__Backdrop"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Location Filter -->
    <div class="w-48">
      <div class="Polaris-Select">
        <select class="Polaris-Select__Input">
          <option value="" selected="">All locations</option>
          <option value="f9180918-99a7-4410-9404-0e7423058621">My Custom Location</option>
          <option value="72a5ede6-6b01-4a92-9581-73bca23303fb">Shop location</option>
        </select>
        <div class="Polaris-Select__Content" aria-hidden="true">
          <span class="Polaris-Select__SelectedOption">All locations</span>
          <span class="Polaris-Select__Icon"><!-- Chevron SVG --></span>
        </div>
        <div class="Polaris-Select__Backdrop"></div>
      </div>
    </div>
  </div>
</div>
```

**Polaris Components:**
- `Polaris-Labelled--hidden` — visually hidden label
- `Polaris-Connected` + `Polaris-Connected__Item--primary` — connected input
- `Polaris-TextField` with `Polaris-TextField__Input--hasClearButton`
- `Polaris-Select` — dropdown filter with `Polaris-Select__Input`
- Placeholder: "Search by SKU, product, or barcode..."
- Location filter width: `w-48` (Tailwind, 12rem)

### 3.3 Inventory IndexTable

```html
<div class="Polaris-IndexTable">
  <div class="Polaris-IndexTable__IndexTableWrapper">
    <!-- Sticky Table Header (duplicate for sticky behavior) -->
    <div class="Polaris-IndexTable__StickyTable" role="presentation">
      <div>
        <div class="Polaris-IndexTable__StickyTableHeader">
          <div class="Polaris-IndexTable__StickyTableHeadings">
            <!-- 7 column headings -->
          </div>
        </div>
        <div class="Polaris-IndexTable__BulkActionsWrapper">
          <!-- Select All checkbox -->
          <div class="Polaris-CheckableButton">
            <div class="Polaris-CheckableButton__Checkbox">
              <label class="Polaris-Choice Polaris-Choice--labelHidden Polaris-Checkbox__ChoiceLabel">
                <span class="Polaris-Choice__Control">
                  <span class="Polaris-Checkbox">
                    <input type="checkbox" class="Polaris-Checkbox__Input" role="checkbox" aria-checked="false">
                    <span class="Polaris-Checkbox__Backdrop"></span>
                    <span class="Polaris-Checkbox__Icon Polaris-Checkbox--animated">...</span>
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Scrollable Table Container -->
    <div class="Polaris-IndexTable-ScrollContainer">
      <table class="Polaris-IndexTable__Table Polaris-IndexTable__Table--unselectable Polaris-IndexTable__Table--sticky">
        <thead>...</thead>
        <tbody>...</tbody>
      </table>
    </div>
  </div>
</div>
```

**Table Columns (7):**

| Column  | Class                                              | Alignment | Min-Width |
|---------|----------------------------------------------------|-----------|-----------|
| SKU     | `Polaris-IndexTable__TableHeading--second`         | Left      | 158px     |
| Product | (default)                                          | Left      | 274px     |
| Location| (default)                                          | Left      | 152px     |
| Qty     | `Polaris-IndexTable--tableHeadingAlignEnd`         | Right     | 41px      |
| Reorder Pt | `Polaris-IndexTable--tableHeadingAlignEnd`      | Right     | 94px      |
| Status  | (default)                                          | Left      | 110px     |
| Cost    | `Polaris-IndexTable--tableHeadingAlignEnd`, `--last`| Right   | 57px      |

**Table Cell Classes per Column:**

| Column | Cell Content Classes                                    |
|--------|---------------------------------------------------------|
| SKU    | `font-mono text-sm` (or `—` for empty)                 |
| Product| `font-medium`                                          |
| Location | plain text                                           |
| Qty    | `text-right font-semibold`                             |
| Reorder Pt | `text-right`                                       |
| Status | `Polaris-Badge` with tone classes                       |
| Cost   | `text-right` (or `—` for empty)                        |

**Status Badge Tones:**

| Status       | Badge Class                     | Color   |
|--------------|---------------------------------|---------|
| In Stock     | `Polaris-Badge--toneSuccess`   | Green   |
| Low Stock    | `Polaris-Badge--toneWarning`   | Yellow  |
| Out of Stock | `Polaris-Badge--toneCritical`  | Red     |

**Badge HTML:**
```html
<span class="Polaris-Badge Polaris-Badge--toneSuccess">
  <span class="Polaris-Text--root Polaris-Text--bodySm">In Stock</span>
</span>
```

**Row HTML Structure:**
```html
<tr id="{uuid}" class="Polaris-IndexTable__TableRow Polaris-IndexTable__TableRow--unclickable">
  <td class="Polaris-IndexTable__TableCell"><span class="font-mono text-sm">—</span></td>
  <td class="Polaris-IndexTable__TableCell"><span class="font-medium">The Collection Snowboard: Liquid</span></td>
  <td class="Polaris-IndexTable__TableCell">My Custom Location</td>
  <td class="Polaris-IndexTable__TableCell"><span class="text-right font-semibold">50</span></td>
  <td class="Polaris-IndexTable__TableCell"><span class="text-right">10</span></td>
  <td class="Polaris-IndexTable__TableCell"><span class="Polaris-Badge Polaris-Badge--toneSuccess">...</span></td>
  <td class="Polaris-IndexTable__TableCell"><span class="text-right">—</span></td>
</tr>
```

**All 26 Inventory Items (at time of capture):**

| #  | SKU               | Product                                         | Location           | Qty | Reorder Pt | Status       | Cost |
|----|-------------------|------------------------------------------------|--------------------|-----|------------|--------------|------|
| 1  | —                 | The Collection Snowboard: Liquid                | My Custom Location | 50  | 10         | In Stock     | —    |
| 2  | —                 | The Collection Snowboard: Oxygen                | My Custom Location | 50  | 10         | In Stock     | —    |
| 3  | sku-hosted-1      | The 3p Fulfilled Snowboard                      | My Custom Location | 20  | 10         | In Stock     | —    |
| 4  | sku-managed-1     | The Multi-managed Snowboard                     | My Custom Location | 100 | 10         | In Stock     | —    |
| 5  | —                 | The Multi-location Snowboard                    | My Custom Location | 100 | 10         | In Stock     | —    |
| 6  | —                 | Selling Plans Ski Wax                           | My Custom Location | 10  | 10         | Low Stock    | —    |
| 7  | —                 | Selling Plans Ski Wax                           | My Custom Location | 10  | 10         | Low Stock    | —    |
| 8  | —                 | Selling Plans Ski Wax                           | My Custom Location | 10  | 10         | Low Stock    | —    |
| 9  | —                 | The Hidden Snowboard                            | My Custom Location | 50  | 10         | In Stock     | —    |
| 10 | —                 | The Out of Stock Snowboard                      | My Custom Location | 0   | 10         | Out of Stock | —    |
| 11 | —                 | The Collection Snowboard: Hydrogen              | My Custom Location | 50  | 10         | In Stock     | —    |
| 12 | —                 | The Archived Snowboard                          | My Custom Location | 50  | 10         | In Stock     | —    |
| 13 | —                 | The Videographer Snowboard                      | My Custom Location | 50  | 10         | In Stock     | —    |
| 14 | —                 | The Complete Snowboard                          | My Custom Location | 10  | 10         | Low Stock    | —    |
| 15 | —                 | The Complete Snowboard                          | My Custom Location | 10  | 10         | Low Stock    | —    |
| 16 | —                 | The Complete Snowboard                          | My Custom Location | 10  | 10         | Low Stock    | —    |
| 17 | —                 | The Complete Snowboard                          | My Custom Location | 10  | 10         | Low Stock    | —    |
| 18 | —                 | The Complete Snowboard                          | My Custom Location | 10  | 10         | Low Stock    | —    |
| 19 | —                 | The Compare at Price Snowboard                  | My Custom Location | 10  | 10         | Low Stock    | —    |
| 20 | —                 | The Draft Snowboard                             | My Custom Location | 20  | 10         | In Stock     | —    |
| 21 | —                 | The Minimal Snowboard                           | My Custom Location | 50  | 10         | In Stock     | —    |
| 22 | —                 | Gift Card                                       | My Custom Location | 0   | 10         | Out of Stock | —    |
| 23 | —                 | Gift Card                                       | My Custom Location | 0   | 10         | Out of Stock | —    |
| 24 | —                 | Gift Card                                       | My Custom Location | 0   | 10         | Out of Stock | —    |
| 25 | —                 | Gift Card                                       | My Custom Location | 0   | 10         | Out of Stock | —    |
| 26 | sku-untracked-1   | The Inventory Not Tracked Snowboard             | My Custom Location | 0   | 10         | Out of Stock | —    |

**Summary Stats:**
- Total: 26 items
- In Stock (qty > reorder): 12
- Low Stock (qty ≤ reorder, > 0): 8
- Out of Stock (qty = 0): 6

**Location filter options:**
- `All locations` (default, value="")
- `My Custom Location` (value="f9180918-99a7-4410-9404-0e7423058621")
- `Shop location` (value="72a5ede6-6b01-4a92-9581-73bca23303fb")

---

## 4. Purchasing Page

**Route:** `/app/purchasing`  
**Screenshot:** `public/screenshots/purchasing.png`

### 4.1 Page Header

```html
<div class="Polaris-Page-Header--noBreadcrumbs Polaris-Page-Header--mediumTitle">
  <div class="Polaris-Page-Header__Row">
    <div class="Polaris-Page-Header__TitleWrapper">
      <h1 class="Polaris-Header-Title Polaris-Header-Title__TitleWithSubtitle">
        <span class="Polaris-Text--root Polaris-Text--headingLg Polaris-Text--bold">Purchase Orders</span>
      </h1>
      <div class="Polaris-Header-Title__SubTitle Polaris-Header-Title__SubtitleMaxWidth">
        <p class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--subdued">Manage vendor orders and receiving</p>
      </div>
    </div>
    <div class="Polaris-Page-Header__RightAlign">
      <!-- Secondary Actions (ActionMenu) -->
      <div class="Polaris-ActionMenu">
        <div class="Polaris-ActionMenu-Actions__ActionsLayoutOuter">
          <!-- Measurer (for overflow detection) -->
          <div class="Polaris-ActionMenu-Actions__ActionsLayoutMeasurer">
            <div class="Polaris-ActionMenu-SecondaryAction">
              <button class="Polaris-Button Polaris-Button--pressable Polaris-Button--variantSecondary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter Polaris-Button--disabled" aria-disabled="true" tabindex="-1">
                Auto-generate POs
              </button>
            </div>
            <div class="Polaris-ActionMenu-SecondaryAction">
              <button class="Polaris-Button Polaris-Button--pressable Polaris-Button--variantSecondary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter Polaris-Button--disclosure">
                <!-- Disclosure chevron icon -->
              </button>
            </div>
          </div>
          <!-- Visible Layout -->
          <div class="Polaris-ActionMenu-Actions__ActionsLayout">
            <div class="Polaris-ActionMenu-SecondaryAction">
              <button class="Polaris-Button Polaris-Button--pressable Polaris-Button--variantSecondary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter Polaris-Button--disabled" aria-disabled="true" tabindex="-1">
                Auto-generate POs
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- Primary Action -->
      <div class="Polaris-Page-Header__PrimaryActionWrapper">
        <button class="Polaris-Button Polaris-Button--pressable Polaris-Button--variantPrimary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter">
          Create PO
        </button>
      </div>
    </div>
  </div>
</div>
```

- **Title:** `Purchase Orders` — `Polaris-Text--headingLg Polaris-Text--bold`
- **Subtitle:** `Manage vendor orders and receiving` — `Polaris-Text--bodySm Polaris-Text--subdued`
- **Modifier:** `Polaris-Header-Title__SubtitleMaxWidth` (max-width constraint on subtitle)
- **Note:** TitleWrapper does NOT have `Polaris-Page-Header__TitleWrapperExpand` (unlike Dashboard/Inventory) — so title doesn't expand to fill available space

**Secondary Actions:**
- `Auto-generate POs` — `Polaris-Button--variantSecondary`, `Polaris-Button--disabled` (aria-disabled="true", tabindex="-1")
- Disclosure button — `Polaris-Button--disclosure` (dropdown chevron)

**Primary Action:**
- `Create PO` — `Polaris-Button--variantPrimary`

### 4.2 Empty State Table

```html
<div class="Polaris-IndexTable">
  <div class="Polaris-IndexTable__IndexTableWrapper">
    <div class="Polaris-IndexTable__EmptySearchResultWrapper">
      <div class="Polaris-LegacyStack Polaris-LegacyStack--vertical Polaris-LegacyStack--alignmentCenter">
        <div class="Polaris-LegacyStack__Item">
          <img alt="" src="data:image/svg+xml,..." draggable="false">
        </div>
        <div class="Polaris-LegacyStack__Item">
          <p class="Polaris-Text--root Polaris-Text--headingLg"></p>
        </div>
        <div class="Polaris-LegacyStack__Item">
          <span class="Polaris-Text--root Polaris-Text--subdued"></span>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Polaris Components:**
- `Polaris-IndexTable__EmptySearchResultWrapper` — empty state container
- `Polaris-LegacyStack` — vertical stack with center alignment
- Empty state image: inline SVG data URI (magnifying glass icon, `fill='%238C9196'` / gray)
- Empty text: both title and description are empty strings (no POs exist)

---

## 5. Forecasting Page

**Route:** `/app/forecasting`  
**Screenshot:** `public/screenshots/forecasting.png`

### 5.1 Page Header

```html
<div class="Polaris-Page-Header--isSingleRow Polaris-Page-Header--noBreadcrumbs Polaris-Page-Header--mediumTitle">
  <div class="Polaris-Page-Header__Row">
    <div class="Polaris-Page-Header__TitleWrapper Polaris-Page-Header__TitleWrapperExpand">
      <h1 class="Polaris-Header-Title Polaris-Header-Title__TitleWithSubtitle">
        <span class="Polaris-Text--root Polaris-Text--headingLg Polaris-Text--bold">Forecasting</span>
      </h1>
      <div class="Polaris-Header-Title__SubTitle">
        <p class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--subdued">Average accuracy: 0% — 0 forecasts generated</p>
      </div>
    </div>
  </div>
</div>
```

- **Title:** `Forecasting` — `Polaris-Text--headingLg Polaris-Text--bold`
- **Subtitle:** `Average accuracy: 0% — 0 forecasts generated` — `Polaris-Text--bodySm Polaris-Text--subdued`
- **No primary action button**
- **Single-row, no breadcrumbs**

### 5.2 KPI Cards (3 cards)

```html
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <!-- 3 Polaris-ShadowBevel cards -->
</div>
```

**Data values:**

| Card                 | Value         |
|----------------------|---------------|
| Total Predicted (30d)| 0 units       |
| High Confidence      | 0 / 0         |
| Reorder Needed       | 0 items       |

**Same card structure as Dashboard** — `Polaris-ShadowBevel` → `Polaris-Box` → `p-4` → `h3 headingSm` + `p headingLg`

### 5.3 Generated Forecasts Section

```html
<div class="Polaris-ShadowBevel">
  <div class="Polaris-Box" style="...">
    <div class="p-4">
      <h2 class="Polaris-Text--root Polaris-Text--headingMd">Generated Forecasts</h2>
      <p class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--subdued">
        Click a row to view the forecast chart and reorder recommendation.
      </p>
      <!-- EmptyState -->
      <div class="Polaris-Box" style="--pc-box-padding-block-start-xs:var(--p-space-500); --pc-box-padding-block-end-xs:var(--p-space-1600);">
        <div class="Polaris-BlockStack" style="--pc-block-stack-inline-align:center;">
          <div class="Polaris-EmptyState__ImageContainer Polaris-EmptyState__SkeletonImageContainer">
            <img src="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                 class="Polaris-EmptyState__Image" role="presentation">
            <div class="Polaris-EmptyState__SkeletonImage"></div>
          </div>
          <div class="Polaris-Box" style="--pc-box-max-width:400px">
            <p class="Polaris-Text--root Polaris-Text--headingMd Polaris-Text--block Polaris-Text--center">No forecasts yet</p>
            <span class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--block Polaris-Text--center">
              Forecasts are generated nightly for all tracked inventory items. Make sure your inventory is synced to see predictions here.
            </span>
            <div class="Polaris-InlineStack" style="--pc-inline-stack-align:center; --pc-inline-stack-wrap:wrap; --pc-inline-stack-gap-xs:var(--p-space-200);">
              <a class="Polaris-Button Polaris-Button--pressable Polaris-Button--variantSecondary Polaris-Button--sizeMedium" href="#">Learn more</a>
              <a class="Polaris-Button Polaris-Button--pressable Polaris-Button--variantPrimary Polaris-Button--sizeMedium" href="/app/settings">Run forecast</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Buttons:**
- `Learn more` — `Polaris-Button--variantSecondary`, links to `#`
- `Run forecast` — `Polaris-Button--variantPrimary`, links to `/app/settings`

### 5.4 ABC Analysis Section

```html
<div class="Polaris-ShadowBevel">
  <div class="p-4">
    <h2 class="Polaris-Text--root Polaris-Text--headingMd">ABC Analysis</h2>
    <p class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--subdued">
      Inventory items classified by revenue contribution over the last 90 days.
    </p>
    
    <!-- ABC Category Legend -->
    <div class="flex gap-4 mt-3 mb-4">
      <div class="flex items-center gap-2">
        <span class="Polaris-Badge Polaris-Badge--toneSuccess"><span class="Polaris-Text--root Polaris-Text--bodySm">A</span></span>
        <p class="Polaris-Text--root Polaris-Text--bodySm">4 items (76% revenue)</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="Polaris-Badge Polaris-Badge--toneWarning"><span class="Polaris-Text--root Polaris-Text--bodySm">B</span></span>
        <p class="Polaris-Text--root Polaris-Text--bodySm">3 items (18% revenue)</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="Polaris-Badge Polaris-Badge--toneInfo"><span class="Polaris-Text--root Polaris-Text--bodySm">C</span></span>
        <p class="Polaris-Text--root Polaris-Text--bodySm">3 items (6% revenue)</p>
      </div>
    </div>
    
    <!-- IndexTable -->
    ...
  </div>
</div>
```

**ABC Category Badge Tones:**

| Category | Badge Tone      | Color   | Items | Revenue % |
|----------|----------------|---------|-------|-----------|
| A        | `toneSuccess`  | Green   | 4     | 76%       |
| B        | `toneWarning`  | Yellow  | 3     | 18%       |
| C        | `toneInfo`     | Blue    | 3     | 6%        |

**ABC Analysis IndexTable Columns (7):**

| Column         | Alignment | Min-Width |
|----------------|-----------|-----------|
| Category       | Left      | 109px     |
| Product        | Left      | 194px     |
| SKU            | Left      | 91px      |
| Revenue (90d)  | Left      | 135px     |
| Cumulative %   | Left      | 138px     |
| Stock          | Left      | 85px      |
| Review Freq.   | Left      | 133px     |

**Cell Classes:**
- Category: `Polaris-Badge` with appropriate tone
- Product: `Polaris-Text--bodyMd Polaris-Text--semibold`
- All others: `Polaris-Text--bodySm`

**ABC Analysis Data (10 items):**

| Cat | Product              | SKU       | Revenue (90d) | Cumul % | Stock     | Review Freq |
|-----|----------------------|-----------|---------------|---------|-----------|-------------|
| A   | Gadget XL            | GAD-001   | $2,091.39     | 33.82%  | 0 units   | Daily       |
| A   | Gadget Mini          | GAD-002   | $1,042.50     | 50.68%  | 45 units  | Daily       |
| A   | Widget Pro           | WDG-001   | $892.51       | 65.11%  | 150 units | Daily       |
| A   | Bubble Wrap Roll     | PKG-002   | $688.62       | 76.25%  | 25 units  | Daily       |
| B   | Accessory Pack B     | ACC-002   | $547.50       | 85.1%   | 3 units   | Weekly      |
| B   | Widget Basic         | WDG-002   | $321.21       | 90.29%  | 8 units   | Weekly      |
| B   | HDMI Cable 3m        | CBL-002   | $214.60       | 93.76%  | 0 units   | Weekly      |
| C   | Accessory Pack A     | ACC-001   | $178.75       | 96.65%  | 200 units | Monthly     |
| C   | USB-C Cable 2m       | CBL-001   | $161.09       | 99.26%  | 320 units | Monthly     |
| C   | Shipping Box Medium  | PKG-001   | $45.85        | 100%    | 500 units | Monthly     |

---

## 6. Reports Page

**Route:** `/app/reports`  
**Screenshot:** `public/screenshots/reports.png`

### 6.1 Page Header

```html
<div class="Polaris-Page-Header--isSingleRow Polaris-Page-Header--noBreadcrumbs Polaris-Page-Header--mediumTitle">
  <div class="Polaris-Page-Header__Row">
    <div class="Polaris-Page-Header__TitleWrapper Polaris-Page-Header__TitleWrapperExpand">
      <h1 class="Polaris-Header-Title Polaris-Header-Title__TitleWithSubtitle">
        <span class="Polaris-Text--root Polaris-Text--headingLg Polaris-Text--bold">Reports</span>
      </h1>
      <div class="Polaris-Header-Title__SubTitle">
        <p class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--subdued">Export inventory data and analytics</p>
      </div>
    </div>
  </div>
</div>
```

- **Title:** `Reports` — `Polaris-Text--headingLg Polaris-Text--bold`
- **Subtitle:** `Export inventory data and analytics` — `Polaris-Text--bodySm Polaris-Text--subdued`
- **No primary action button**

### 6.2 KPI Cards (3 cards, centered text)

```html
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div class="Polaris-ShadowBevel">
    <div class="Polaris-Box" style="...">
      <div class="p-4 text-center">
        <h3 class="Polaris-Text--root Polaris-Text--headingSm">Total Inventory Value</h3>
        <p class="Polaris-Text--root Polaris-Text--headingLg">$2,101.72</p>
      </div>
    </div>
  </div>
  <!-- 2 more cards -->
</div>
```

**Note:** Cards use `text-center` Tailwind class (unlike Dashboard cards which are left-aligned).

**Data values:**

| Card                   | Value      |
|------------------------|------------|
| Total Inventory Value  | $2,101.72  |
| Total Items            | 10         |
| Total Movements        | 310        |

### 6.3 Export Data Section

```html
<div class="Polaris-ShadowBevel">
  <div class="p-4">
    <h2 class="Polaris-Text--root Polaris-Text--headingMd">Export Data</h2>
    <div class="mt-3 flex gap-2">
      <button class="Polaris-Button Polaris-Button--pressable Polaris-Button--variantSecondary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter">
        Export Inventory CSV
      </button>
      <a class="Polaris-Button Polaris-Button--pressable Polaris-Button--variantSecondary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter"
         download="" href="/app/reports/pdf" data-polaris-unstyled="true">
        Export Inventory PDF
      </a>
    </div>
  </div>
</div>
```

**Buttons:**
- `Export Inventory CSV` — `<button>`, `Polaris-Button--variantSecondary`
- `Export Inventory PDF` — `<a download>`, `Polaris-Button--variantSecondary`, href=`/app/reports/pdf`

---

## 7. Settings Page

**Route:** `/app/settings`  
**Screenshot:** `public/screenshots/settings.png`

### 7.1 Page Header

```html
<div class="Polaris-Page-Header--isSingleRow Polaris-Page-Header--noBreadcrumbs Polaris-Page-Header--mediumTitle">
  <!-- Same pattern as other pages -->
  <span class="Polaris-Text--root Polaris-Text--headingLg Polaris-Text--bold">Settings</span>
  <p class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--subdued">Manage alerts, thresholds, and preferences</p>
</div>
```

- **Title:** `Settings` — `Polaris-Text--headingLg Polaris-Text--bold`
- **Subtitle:** `Manage alerts, thresholds, and preferences`

### 7.2 Form Structure

```html
<form method="post" action="/app/settings" data-discover="true">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <!-- 5 Setting Cards -->
  </div>
  <div class="flex justify-end pt-4 border-t border-gray-200 mt-4">
    <button class="Polaris-Button Polaris-Button--pressable Polaris-Button--variantSecondary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter" type="submit">
      Save Settings
    </button>
  </div>
</form>
```

**Form method:** `POST` to `/app/settings`  
**Form wrapper:** `px-4 py-6`  
**Grid:** `grid grid-cols-1 md:grid-cols-3 gap-4`  
**Submit button area:** `flex justify-end pt-4 border-t border-gray-200 mt-4`  
**Submit button:** `Polaris-Button--variantSecondary`

### 7.3 Settings Cards

#### Card 1: Notifications

```html
<div class="Polaris-ShadowBevel">
  <div class="p-4">
    <h3 class="Polaris-Text--root Polaris-Text--headingSm">Notifications</h3>
    <p class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--subdued">
      Configure how StockFlows alerts your team about low stock levels.
    </p>
    <div class="space-y-4 mt-4">
      <!-- 3 toggle rows -->
    </div>
  </div>
</div>
```

**Toggle Rows (each):**
```html
<div class="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
  <p class="Polaris-Text--root Polaris-Text--bodyMd">Email Alerts</p>
  <div>
    <label class="Polaris-Choice Polaris-Choice--labelHidden Polaris-Checkbox__ChoiceLabel">
      <span class="Polaris-Choice__Control">
        <span class="Polaris-Checkbox">
          <input type="checkbox" class="Polaris-Checkbox__Input" role="checkbox">
          <span class="Polaris-Checkbox__Backdrop"></span>
          <span class="Polaris-Checkbox__Icon Polaris-Checkbox--animated">...</span>
        </span>
      </span>
    </label>
    <input type="hidden" name="emailAlerts" value="on">
  </div>
</div>
```

**Toggle Settings:**

| Setting      | Name (form)  | Default | Hidden Input Value |
|--------------|--------------|---------|-------------------|
| Email Alerts | emailAlerts  | ON      | "on"              |
| Slack Alerts | slackEnabled | OFF     | ""                |
| SMS Alerts   | smsEnabled   | OFF     | ""                |

#### Card 2: Alert Thresholds

```html
<h3 class="Polaris-Text--root Polaris-Text--headingSm">Alert Thresholds</h3>
<p class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--subdued">
  Set stock levels that trigger reorder alerts. Critical must be lower than Low.
</p>
```

**Number Input Fields (each):**
```html
<div class="Polaris-Labelled__LabelWrapper">
  <div class="Polaris-Label">
    <label class="Polaris-Label__Text">
      <span class="Polaris-Text--root Polaris-Text--bodyMd">Low Stock Threshold</span>
    </label>
  </div>
</div>
<div class="Polaris-Connected">
  <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
    <div class="Polaris-TextField Polaris-TextField--hasValue">
      <input name="lowStockThreshold" type="number"
             class="Polaris-TextField__Input Polaris-TextField__Input--suffixed"
             value="10">
      <div class="Polaris-TextField__Suffix">
        <span class="Polaris-Text--root Polaris-Text--bodyMd">units</span>
      </div>
      <div class="Polaris-TextField__Spinner" aria-hidden="true">
        <div role="button" class="Polaris-TextField__Segment" tabindex="-1">
          <!-- Up arrow -->
        </div>
        <div role="button" class="Polaris-TextField__Segment" tabindex="-1">
          <!-- Down arrow -->
        </div>
      </div>
      <div class="Polaris-TextField__Backdrop"></div>
    </div>
  </div>
</div>
```

**Threshold Fields:**

| Field                    | Name                     | Default | Suffix | Step  |
|--------------------------|--------------------------|---------|--------|-------|
| Low Stock Threshold      | lowStockThreshold        | 10      | units  | 1     |
| Critical Stock Threshold | criticalStockThreshold   | 3       | units  | 1     |
| Safety Stock Multiplier  | safetyStockMultiplier    | 1.5     | ×      | 0.1   |

**Polaris Components:**
- `Polaris-Labelled__LabelWrapper` → `Polaris-Label` → `Polaris-Label__Text`
- `Polaris-Connected` → `Polaris-Connected__Item--primary`
- `Polaris-TextField--hasValue` → `Polaris-TextField__Input--suffixed`
- `Polaris-TextField__Suffix`
- `Polaris-TextField__Spinner` → `Polaris-TextField__Segment`

#### Card 3: Forecasting

| Field             | Name               | Default | Suffix | Step |
|-------------------|--------------------|---------|--------|------|
| Forecast Horizon  | forecastHorizonDays | 30     | days   | 1    |

**Same Polaris components as Alert Thresholds.**

#### Card 4: AI Features

```html
<h3 class="Polaris-Text--root Polaris-Text--headingSm">AI Features</h3>
<p class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--subdued">
  Enable AI-powered insights and natural language explanations for your inventory data.
</p>
```

**Toggle Settings:**

| Setting              | Name                        | Default | Description |
|----------------------|-----------------------------|---------|-------------|
| AI Insights          | enableAiInsights            | OFF     | Uses OpenCode API to analyze inventory data and generate insights. Statistical forecasting still works when AI is disabled. |
| Forecast Explanations| enableForecastExplanations  | OFF     | Shows AI-generated natural language explanations of forecast data. |

Same toggle row pattern as Notifications card.

#### Card 5: General

```html
<h3 class="Polaris-Text--root Polaris-Text--headingSm">General</h3>
<p class="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--subdued">
  Configure general settings for your StockFlows account.
</p>
```

**Currency Select:**
```html
<div class="Polaris-Select">
  <select name="currency" class="Polaris-Select__Input">
    <option value="USD" selected="">USD ($)</option>
    <option value="EUR">EUR (€)</option>
    <option value="GBP">GBP (£)</option>
    <option value="CAD">CAD (C$)</option>
    <option value="AUD">AUD (A$)</option>
  </select>
  <div class="Polaris-Select__Content" aria-hidden="true">
    <span class="Polaris-Select__SelectedOption">USD ($)</span>
    <span class="Polaris-Select__Icon"><!-- Chevron SVG --></span>
  </div>
  <div class="Polaris-Select__Backdrop"></div>
</div>
```

---

## 8. Polaris Component Reference

### Complete List of Polaris Components Used

| Component | CSS Class Prefix | Used On |
|-----------|-----------------|---------|
| **Frame** | `Polaris-Frame` | App shell |
| **Frame Navigation** | `Polaris-Frame__Navigation` | Left sidebar |
| **Frame Main** | `Polaris-Frame__Main` | Content area |
| **Navigation** | `Polaris-Navigation` | Sidebar nav items |
| **Navigation Item** | `Polaris-Navigation__Item` | Each nav link |
| **Icon** | `Polaris-Icon` | All icons |
| **Page** | `Polaris-Page` | Page wrapper |
| **Page Header** | `Polaris-Page-Header` | Page title bars |
| **Header Title** | `Polaris-Header-Title` | Title + subtitle |
| **Layout** | `Polaris-Layout` | Page content grid |
| **Layout Section** | `Polaris-Layout__Section` | Content sections |
| **Box** | `Polaris-Box` | Generic container with CSS custom properties |
| **ShadowBevel** | `Polaris-ShadowBevel` | Card wrapper with shadow + border-radius |
| **Text** | `Polaris-Text` | All text (headingLg, headingMd, headingSm, bodyMd, bodySm, etc.) |
| **Badge** | `Polaris-Badge` | Status badges, counts |
| **Button** | `Polaris-Button` | All buttons (variantPrimary, variantSecondary, disabled, disclosure) |
| **IndexTable** | `Polaris-IndexTable` | Data tables |
| **IndexTable Table** | `Polaris-IndexTable__Table` | Table element |
| **IndexTable Heading** | `Polaris-IndexTable__TableHeading` | Table headers |
| **IndexTable Cell** | `Polaris-IndexTable__TableCell` | Table cells |
| **IndexTable Row** | `Polaris-IndexTable__TableRow` | Table rows |
| **TextField** | `Polaris-TextField` | Text/number inputs |
| **TextField Spinner** | `Polaris-TextField__Spinner` | Number input spinners |
| **TextField Suffix** | `Polaris-TextField__Suffix` | Unit suffixes |
| **Select** | `Polaris-Select` | Dropdown selects |
| **Checkbox** | `Polaris-Checkbox` | Checkboxes/toggles |
| **Choice** | `Polaris-Choice` | Checkbox wrapper with label |
| **Label** | `Polaris-Label` | Form labels |
| **Labelled** | `Polaris-Labelled` | Label + input wrapper |
| **Connected** | `Polaris-Connected` | Connected input groups |
| **EmptyState** | `Polaris-EmptyState` | Empty state containers |
| **BlockStack** | `Polaris-BlockStack` | Vertical stack layout |
| **InlineStack** | `Polaris-InlineStack` | Horizontal inline stack |
| **LegacyStack** | `Polaris-LegacyStack` | Legacy vertical/horizontal stack |
| **ActionMenu** | `Polaris-ActionMenu` | Page header secondary actions |
| **CheckableButton** | `Polaris-CheckableButton` | Bulk select checkbox |
| **Scrollable** | `Polaris-Scrollable` | Scrollable containers |
| **ThemeProvider** | `Polaris-ThemeProvider` | Theme container |

### Badge Tone Classes

| Tone Class | Color | Used For |
|------------|-------|----------|
| `Polaris-Badge--toneSuccess` | Green | In Stock, Category A |
| `Polaris-Badge--toneWarning` | Yellow/Orange | Low Stock, Category B |
| `Polaris-Badge--toneCritical` | Red | Out of Stock |
| `Polaris-Badge--toneInfo` | Blue | Category C |
| (default) | Gray | Count badges |

### Button Variant Classes

| Class | Style | Usage |
|-------|-------|-------|
| `Polaris-Button--variantPrimary` | Filled blue | Add Item, Create PO, Run forecast, View inventory |
| `Polaris-Button--variantSecondary` | Outlined | Auto-generate POs, Export CSV, Export PDF, Save Settings, Learn more |
| `Polaris-Button--disabled` | Grayed out | Auto-generate POs (when no data) |
| `Polaris-Button--disclosure` | With dropdown chevron | Overflow menu trigger |

### Text Scale Classes

| Class | Usage |
|-------|-------|
| `Polaris-Text--headingLg` | Page titles (h1 values) |
| `Polaris-Text--headingMd` | Section headings (h2) |
| `Polaris-Text--headingSm` | Card headings (h3), metric labels |
| `Polaris-Text--bodyMd` | Form labels, toggle labels, nav text |
| `Polaris-Text--bodySm` | Subtitles, descriptions, badge text, table cell text |
| `Polaris-Text--bold` | Page titles |
| `Polaris-Text--semibold` | Table product names |
| `Polaris-Text--medium` | Button text, nav text |
| `Polaris-Text--subdued` | Muted/secondary text (subtitles, descriptions) |
| `Polaris-Text--visuallyHidden` | Screen reader only |

---

## Remix Application Context

```javascript
window.__remixContext = {
  basename: "/",
  future: {
    v3_fetcherPersist: false,
    v3_relativeSplatPath: false,
    v3_throwAbortReason: false,
    v3_routeConfig: false,
    v3_singleFetch: false,
    v3_lazyRouteDiscovery: false,
    unstable_optimizeDeps: false
  },
  isSpaMode: false,
  state: {
    loaderData: {
      root: {},
      routes/app: { shopDomain: null },
      routes/app._index: {
        stats: {
          totalSKUs: 26,
          lowStockItems: 9,
          outOfStockItems: 6,
          valueAtRisk: 0,
          totalInventoryValue: 0
        },
        forecastAccuracy: 0,
        alerts: [],
        recentActivity: []
      }
    }
  }
};
```

**Route Modules:**
- `root` → `/assets/root-C9jvCuUR.js`
- `routes/app` → `/assets/app-DB8RQ4lx.js`
- `routes/app._index` → `/assets/app._index-DRlEn3at.js`

**Shared Components:**
- `Banner` → `/assets/Banner-DZJ9R3TR.js`
- `EmptyState` → `/assets/EmptyState-DJo_bQ__.js`
- `IndexTable` → `/assets/IndexTable-CQJBzsdP.js`
- `Checkbox` → `/assets/Checkbox-nsAYA0Mj.js`
- `Page` → `/assets/Page-P2WbBNhS.js`

**CSS Assets:**
- Tailwind: `/assets/tailwind-CMC2WRbM.css`
- Custom: `/assets/styles-e9f2bdpk.css`
- Polaris App Bridge: `https://cdn.shopify.com/shopifycloud/app-bridge-styles.css`
- Fonts: `Inter` (300–900) + `Instrument Serif` (italic) from Google Fonts
