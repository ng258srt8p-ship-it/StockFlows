# StockFlows — Visual Alignment Report

**Date:** 2026-07-08
**Commit:** `781e3fd`
**Fly.io App:** https://stockflows.fly.dev
**Demo:** https://stockflows.app/demo

---

## Summary

The Fly.io Shopify app has been visually aligned with the demo app. All main pages now share the same layout, component style, color tokens, and navigation structure as the demo.

**Key changes:** Custom sidebar (replacing Polaris Frame + Navigation), CSS variable styling throughout, Material Symbols icons, consistent card/page layouts, custom toggle switches, filter pills, and status/velocity badges.

---

## Sidebar — Before vs After

| Before (Polaris Frame + Navigation) | After (Custom Sidebar) |
|---|---|
| Polaris Navigation component | Custom `<aside>` nav matching demo |
| No branding | `StockFlows v7` branding header |
| No section headers | Section-grouped nav (Core, Settings) |
| Polaris icons | Material Symbols icons |
| Shopify-blue active state | Accent-colored active state |
| No mobile support | Mobile hamburger menu |
| No footer | Shop name in footer |

**Files changed:**
- `app/routes/app.tsx` — Complete rewrite of layout

---

## Page-by-Page Comparison

### 1. Dashboard

| Aspect | Demo | Fly.io (After) |
|---|---|---|
| Page title | `Dashboard` | `Dashboard` |
| Subtitle | `Overview of your inventory operations` | `Overview of your inventory operations` |
| Stat cards | 4 grid cards (Total Items, Locations, POs, Vendors) | 4 grid cards (same) |
| Card style | `rounded-lg border p-5` with `bg-secondary` | Same |
| Alerts card | Items with urgency + stock info | Same |
| Recent Activity | Movement type icon + title + quantity | Same |

**Screenshots:** `fly-dashboard.png` | `demo-dashboard.png`

### 2. Inventory

| Aspect | Demo | Fly.io (After) |
|---|---|---|
| Page title | `Inventory` | `Inventory` |
| Search | Text input with search icon | Same |
| Category filters | Pill buttons (All, Footwear, Apparel, etc.) | Same dynamic pill buttons |
| Table columns | Product, SKU, Category, Qty, Reorder Pt, Status, Velocity, Location | Same |
| Stock badges | `In Stock` / `Low Stock` / `Out of Stock` with colored backgrounds | Same |
| Velocity badges | `High` / `Medium` / `Low` with colored backgrounds | Same |
| Empty state | "No items match" centered message | Same |

**Screenshots:** `fly-inventory.png` | `demo-inventory.png`

### 3. Purchasing

| Aspect | Demo | Fly.io (After) |
|---|---|---|
| Page title | `Purchase Orders` | `Purchase Orders` |
| Status filters | Pill buttons (All, Draft, Waiting, Ready, Done) | Same |
| PO cards | Vendor name, PO #, status badge, total, items count, created date | Same card layout with total from lineItems |
| Action buttons | Auto-reorder button (conditional) | Same |
| New PO button | Accent-colored | Same |
| Empty state | Shopping cart icon + message | Same |

**Screenshots:** `fly-purchasing.png` | `demo-purchasing.png`

### 4. Forecasting

| Aspect | Demo | Fly.io (After) |
|---|---|---|
| Page title | `Forecasting` | `Forecasting` |
| Summary cards | Total predicted, High confidence, Reorder needed | Same stat cards |
| Forecast grid | Cards with ABC badge, model, trend indicator, confidence, predicted vs current | Same layout |
| ABC badges | Green `A`, Yellow `B`, Blue `C` | Same colors |
| Trend indicators | ↑ Up (green) / ↓ Down (red) / → Stable (blue) | Same |
| Forecast table | Product, Location, Model, Confidence badge, 30-day Pred, Stock status, Date | Same table layout |
| ABC Analysis | A/B/C summary badges, revenue table, review frequency | Same |

**Screenshots:** `fly-forecasting.png` | `demo-forecasting.png`

### 5. Reports

| Aspect | Demo | Fly.io (After) |
|---|---|---|
| Page title | `Reports & Analytics` | `Reports & Analytics` |
| Date range | Select dropdown and Export CSV button | Same |
| Charts | 4-chart grid (Area, Bar, Line, Pie) | Same recharts (Area, Bar, Line, Pie) |
| Chart styling | Custom tooltip, brand colors, CSS-variable grid lines | Same CustomTooltip, same colors |
| Empty state | "No data available" info banner | Same |

**Screenshots:** `fly-reports.png` | `demo-reports.png`

### 6. Settings

| Aspect | Demo | Fly.io (After) |
|---|---|---|
| Page title | `Settings` | `Settings` |
| Card layout | Polaris Card | Custom-styled card with CSS variables |
| Notifications | Custom toggle switches | Custom toggle switches matching demo |
| AI features | Custom toggle switches for AI Insights + Forecast Explanations | Same toggle switches |
| Thresholds | Text inputs for stock thresholds | Polaris TextField inputs (preserved) |
| Save button | Accent-colored | Same style |

**Screenshots:** `fly-settings.png` | `demo-settings.png`

---

## Files Modified

| File | Changes |
|---|---|
| `app/routes/app.tsx` | Complete rewrite — custom sidebar, branding, nav sections, mobile menu |
| `app/routes/app._index.tsx` | Replaced Polaris Page/Card/Layout with CSS-variable styled dashboard |
| `app/routes/app.inventory.tsx` | Replaced Polaris IndexTable with custom table + filter pills + badges |
| `app/routes/app.purchasing.tsx` | Replaced Polaris IndexTable with card-based PO list + status pills |
| `app/routes/app.forecasting.tsx` | Replaced Polaris Page/Card/Text with custom forecast UI + ABC table |
| `app/routes/app.reports.tsx` | Replaced Polaris Page wrapper, custom-styled chart containers |
| `app/routes/app.settings.tsx` | Custom outer layout, toggle switches, success banners |
| `app/components/ui/StatCard.tsx` | Removed Polaris Card dependency, pure CSS variable styling |
| `app/components/settings/SettingsCard.tsx` | Removed Polaris Card, custom card layout |
| `app/components/settings/NotificationToggle.tsx` | Removed Polaris Checkbox, custom toggle switch |

## Verification

- **25/25 live e2e tests passing**
- All app routes return 200 (dashboard, inventory, purchasing, reports, settings, forecasting, migration)
- Fly.io deployed successfully (`781e3fd`)
- Cloudflare Pages deployed (website + demo)
- GitHub pushed

## Screenshots Location

All screenshots are in `e2e/screenshots/`:

| Page | Fly.io | Demo |
|---|---|---|
| Dashboard | `fly-dashboard.png` | `demo-dashboard.png` |
| Inventory | `fly-inventory.png` | `demo-inventory.png` |
| Purchasing | `fly-purchasing.png` | `demo-purchasing.png` |
| Forecasting | `fly-forecasting.png` | `demo-forecasting.png` |
| Reports | `fly-reports.png` | `demo-reports.png` |
| Settings | `fly-settings.png` | `demo-settings.png` |
