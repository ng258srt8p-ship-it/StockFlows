# Inventory List — StockFlows v7

## Overview

The Inventory List page displays all SKUs in a searchable, filterable data table. It supports bulk actions, inline status badges, and quick-edit capabilities. The layout uses a persistent sidebar with a full-width data table.

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [Top Header Bar]                                           │
├──────────┬──────────────────────────────────────────────────┤
│          │  [Page Title]              [Actions]             │
│ Sidebar  │                                                  │
│ (240px)  │  ┌────────────────────────────────────────────┐ │
│          │  │  [Search Bar]  [Filters]  [Bulk Actions]   │ │
│          │  └────────────────────────────────────────────┘ │
│          │                                                  │
│          │  ┌────────────────────────────────────────────┐ │
│          │  │  [Data Table]                              │ │
│          │  │  ┌─────┬──────┬─────┬──────┬─────┬────┬──┐ │ │
│          │  │  │ ☐   │ SKU  │Title│ Qty  │ ... │ .. │  │ │ │
│          │  │  ├─────┼──────┼─────┼──────┼─────┼────┼──┤ │ │
│          │  │  │     │      │     │      │     │    │  │ │ │
│          │  │  └─────┴──────┴─────┴──────┴─────┴────┴──┘ │ │
│          │  └────────────────────────────────────────────┘ │
│          │                                                  │
│          │  [Pagination]                 [Results Count]    │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

---

## 1. Page Header

| Property | Value |
|----------|-------|
| Title | "Inventory" — Inter, 28px, weight 600, `#FFFFFF` |
| Subtitle | "Manage your product stock levels" — Inter, 14px, weight 400, `#A0A3AB` |
| Gap | 4px |
| Right-aligned actions | Row of buttons |

### Action Buttons (Right-aligned)

| Button | Style | Icon |
|--------|-------|------|
| "Export CSV" | Secondary — bg: transparent, border: 1px `#2A2D35`, text: `#A0A3AB`, hover: bg `#1C1E24`, border: `#3A3D45` | `download` (20px) |
| "Import CSV" | Secondary — same as above | `upload` (20px) |
| "Add Product" | Primary — bg: `#C7FB33`, text: `#0A0B0E`, hover: bg `#D4FF5C` | `add` (20px) |

### Button Specs

| Property | Primary | Secondary |
|----------|---------|-----------|
| Height | 36px | 36px |
| Padding | 0 16px | 0 16px |
| Border-radius | 6px | 6px |
| Font | Inter, 13px, weight 500 | Inter, 13px, weight 500 |
| Transition | 150ms ease | 150ms ease |
| Disabled state | opacity: 0.5, cursor: not-allowed | opacity: 0.5, cursor: not-allowed |

---

## 2. Search & Filter Bar

| Property | Value |
|----------|-------|
| Layout | Flex row, gap: 12px, items: center |
| Margin-bottom | 16px |
| Background | `#14161B` |
| Border | 1px solid `#2A2D35` |
| Border-radius | `8px` |
| Padding | `12px 16px` |

### Search Input

| Property | Value |
|----------|-------|
| Placeholder | "Search by SKU, product name, or barcode..." |
| Font | Inter, 14px, weight 400 |
| Placeholder color | `#6B6F78` |
| Text color | `#FFFFFF` |
| Background | transparent |
| Border | none |
| Width | Flex: 1 (fills available space) |
| Icon | `search` — Material Symbols, 20px, `#A0A3AB`, positioned left |
| Padding-left | 36px (to accommodate icon) |

### Filter Buttons

| Filter | Style | Badge |
|--------|-------|-------|
| "Status" | Dropdown — bg: `#1C1E24`, border: 1px `#2A2D35`, text: `#A0A3AB` | None |
| "Location" | Same as Status | None |
| "Supplier" | Same as Status | None |
| "Date Range" | Same as Status | None |

### Filter Dropdown Specs

| Property | Value |
|----------|-------|
| Height | 36px |
| Padding | 0 12px |
| Border-radius | 6px |
| Font | Inter, 13px, weight 400 |
| Icon | `expand_more` — Material Symbols, 16px |
| Hover | bg: `#252830`, border: `#3A3D45` |
| Active/Selected | bg: `rgba(199,251,51,0.1)`, border: `#C7FB33`, text: `#C7FB33` |
| Dropdown menu | bg: `#1C1E24`, border: 1px `#2A2D35`, border-radius: `6px`, shadow: `0 8px 24px rgba(0,0,0,0.5)` |

### Filter Dropdown Menu Items

| Property | Default | Hover | Selected |
|----------|---------|-------|----------|
| Padding | 8px 12px | 8px 12px | 8px 12px |
| Background | transparent | `#252830` | `rgba(199,251,51,0.1)` |
| Text color | `#A0A3AB` | `#FFFFFF` | `#C7FB33` |
| Font | Inter, 13px, weight 400 | Inter, 13px, weight 400 | Inter, 13px, weight 500 |
| Checkmark icon | Hidden | Hidden | `check` — 16px, `#C7FB33` |

### Bulk Actions Bar (Appears when rows selected)

| Property | Value |
|----------|-------|
| Position | Fixed bottom of table area |
| Background | `#14161B` |
| Border | 1px solid `#C7FB33` |
| Border-radius | `8px` |
| Padding | `12px 16px` |
| Layout | Flex row, gap: 12px, items: center |
| Shadow | `0 -4px 12px rgba(0,0,0,0.3)` |

| Element | Value |
|---------|-------|
| Selected count | "12 items selected" — Inter, 13px, weight 500, `#FFFFFF` |
| Action: "Update Stock" | Primary button |
| Action: "Create PO" | Primary button |
| Action: "Delete" | Danger button — bg: `transparent`, border: 1px `#F87171`, text: `#F87171` |
| Action: "Clear Selection" | Ghost button — text: `#A0A3AB`, hover: `#FFFFFF` |

---

## 3. Data Table

### Table Container

| Property | Value |
|----------|-------|
| Background | `#14161B` |
| Border | 1px solid `#2A2D35` |
| Border-radius | `8px` |
| Overflow | horizontal scroll on mobile |
| Table width | 100% |

### Table Header

| Property | Value |
|----------|-------|
| Background | `#1C1E24` |
| Border-bottom | 2px solid `#2A2D35` |
| Height | 44px |
| Padding | 0 16px |
| Position | sticky top |

### Header Cell Specs

| Element | Value |
|---------|-------|
| Font | Inter, 12px, weight 600, uppercase |
| Letter-spacing | 0.05em |
| Color | `#A0A3AB` |
| Sort icon | `unfold_more` — Material Symbols, 14px, `#6B6F78` |
| Sort active | `arrow_upward` or `arrow_downward` — 14px, `#C7FB33` |
| Hover | color: `#FFFFFF`, cursor: pointer |
| Padding | 0 16px |

### Table Columns

| # | Column | Width | Align | Sortable | Tooltip |
|---|--------|-------|-------|----------|---------|
| 1 | ☐ (checkbox) | 44px | center | No | "Select all" |
| 2 | SKU | 120px | left | Yes | — |
| 3 | Title | flex: 1 | left | Yes | — |
| 4 | Quantity | 100px | right | Yes | — |
| 5 | Reorder Point | 100px | right | Yes | — |
| 6 | Cost | 100px | right | Yes | — |
| 7 | Location | 120px | left | Yes | — |
| 8 | Status | 120px | left | Yes | — |
| 9 | Actions | 48px | center | No | — |

### Table Row Specs

| Property | Default | Hover | Selected |
|----------|---------|-------|----------|
| Background | transparent | `#1C1E24` | `rgba(199,251,51,0.05)` |
| Border-bottom | 1px solid `#2A2D35` | 1px solid `#2A2D35` | 1px solid `#2A2D35` |
| Height | 48px | 48px | 48px |
| Transition | 100ms ease | — | — |

### Table Cell Specs

| Element | Value |
|---------|-------|
| Padding | 12px 16px |
| Font (data) | Inter, 13px, weight 400, `#FFFFFF` |
| Font (secondary data) | Inter, 12px, weight 400, `#A0A3AB` |
| Truncate | Text overflow: ellipsis, white-space: nowrap, max-width per column |

### Checkbox Specs

| Property | Default | Hover | Checked |
|----------|---------|-------|---------|
| Size | 16x16px | 16x16px | 16x16px |
| Border | 2px solid `#3A3D45` | 2px solid `#A0A3AB` | 2px solid `#C7FB33` |
| Background | transparent | transparent | `#C7FB33` |
| Check icon | Hidden | Hidden | `check` — 12px, `#0A0B0E` |
| Radius | 4px | 4px | 4px |
| Transition | 100ms ease | — | — |

---

## 4. Status Badges

### Badge Container

| Property | Value |
|----------|-------|
| Display | Inline-flex |
| Padding | 4px 10px |
| Border-radius | 9999px (pill) |
| Font | Inter, 11px, weight 600 |
| Letter-spacing | 0.02em |
| Gap between icon and text | 4px |

### Status Variants

| Status | Background | Text Color | Icon | Icon Size |
|--------|-----------|------------|------|-----------|
| In Stock | `rgba(52,211,153,0.15)` | `#34D399` | `check_circle` | 12px |
| Low Stock | `rgba(251,191,36,0.15)` | `#FBBF24` | `warning` | 12px |
| Out of Stock | `rgba(248,113,113,0.15)` | `#F87171` | `error` | 12px |
| Discontinued | `rgba(107,111,120,0.15)` | `#6B6F78` | `block` | 12px |

### Badge Hover

| Property | Value |
|----------|-------|
| Transform | none |
| Cursor | pointer |
| Opacity | 0.85 |
| Tooltip | Shows detailed status info on hover |

---

## 5. Table Data Examples

### Row 1 — In Stock

```
☐  SKU-4821   Running Water Bottle (32oz)   245   50   $8.50   Warehouse A   [In Stock]   ⋮
```

### Row 2 — Low Stock

```
☐  SKU-1203   Trail Mix Sampler Pack         8    15   $12.00  Warehouse A   [Low Stock]  ⋮
```

### Row 3 — Out of Stock

```
☐  SKU-7744   Organic Honey Jar (16oz)       0    20   $15.75  Warehouse B   [Out of Stock] ⋮
```

### Row 4 — In Stock

```
☐  SKU-2299   Bamboo Cutting Board Set       156   30   $22.00  Warehouse A   [In Stock]   ⋮
```

### Row 5 — Low Stock

```
☐  SKU-3311   Ceramic Mug 12oz               12   25   $6.50   Warehouse C   [Low Stock]  ⋮
```

---

## 6. Row Actions Menu

### Trigger

| Property | Value |
|----------|-------|
| Icon | `more_vert` — Material Symbols, 18px, `#A0A3AB` |
| Button size | 32x32px |
| Hover | bg: `#252830`, icon: `#FFFFFF` |

### Dropdown Menu

| Property | Value |
|----------|-------|
| Position | Absolute, right-aligned to button |
| Background | `#1C1E24` |
| Border | 1px solid `#2A2D35` |
| Border-radius | `6px` |
| Shadow | `0 8px 24px rgba(0,0,0,0.5)` |
| Min-width | 160px |
| Padding | 4px 0 |
| z-index | 100 |

### Menu Items

| Icon | Label | Action |
|------|-------|--------|
| `edit` | Edit Product | Opens edit modal |
| `visibility` | View Details | Navigates to product detail |
| `content_copy` | Duplicate | Creates copy of product |
| `local_shipping` | Create PO | Opens new purchase order |
| `archive` | Archive | Archives product |
| — | divider | 1px `#2A2D35` |
| `delete` | Delete | Confirmation modal — text: `#F87171` |

### Menu Item Specs

| Property | Default | Hover |
|----------|---------|-------|
| Padding | 8px 12px | 8px 12px |
| Background | transparent | `#252830` |
| Text color | `#A0A3AB` | `#FFFFFF` |
| Icon color | `#A0A3AB` | `#FFFFFF` |
| Font | Inter, 13px, weight 400 | Inter, 13px, weight 500 |
| Gap (icon to text) | 8px | 8px |
| Border-radius | 4px | 4px |

---

## 7. Pagination

| Property | Value |
|----------|-------|
| Layout | Flex row, justify: space-between, items: center |
| Padding | 16px 0 |
| Position | Below table |

### Left Side — Results Info

| Element | Value |
|---------|-------|
| Text | "Showing 1–25 of 2,847 products" — Inter, 13px, `#A0A3AB` |
| Per-page selector | Dropdown: "25 per page" — same style as filter dropdowns |

### Right Side — Page Controls

| Element | Value |
|---------|-------|
| Previous button | `chevron_left` — 20px, disabled: `#6B6F78`, enabled: `#A0A3AB` |
| Page numbers | Inter, 13px, weight 500 |
| Active page | bg: `#C7FB33`, text: `#0A0B0E`, radius: 6px, width: 32px, height: 32px |
| Inactive page | text: `#A0A3AB`, hover: bg `#1C1E24`, text: `#FFFFFF` |
| Ellipsis | `#6B6F78` |
| Next button | `chevron_right` — 20px, same as Previous |

---

## 8. Empty State

Shown when no products match filters or inventory is empty.

| Property | Value |
|----------|-------|
| Background | `#14161B` |
| Border | 1px solid `#2A2D35` |
| Border-radius | `8px` |
| Padding | 64px 32px |
| Text-align | center |
| Max-height | 400px |

### Empty State Contents

| Element | Value |
|---------|-------|
| Icon | `inventory_2` — Material Symbols, 48px, `#6B6F78` |
| Title | "No products found" — Inter, 18px, weight 600, `#FFFFFF` |
| Description | "Try adjusting your search or filter criteria" — Inter, 14px, `#A0A3AB` |
| Action button | "Clear Filters" — Primary button style |
| Spacing | Icon → Title: 16px, Title → Description: 8px, Description → Button: 24px |

---

## 9. Loading State

Shown while data is being fetched.

### Skeleton Table

| Property | Value |
|----------|-------|
| Animation | Shimmer — `background: linear-gradient(90deg, #1C1E24 25%, #252830 50%, #1C1E24 75%)` |
| Animation duration | 1.5s infinite |
| Background-size | 200% 100% |
| Row count | 10 skeleton rows |
| Cell height | 48px |
| Skeleton height | 12px (text), 8px (secondary) |
| Skeleton radius | 4px |
| Skeleton width | Varies: 60-80% of column width |

---

## 10. Responsive Behavior

### Desktop (≥1280px)

- Full sidebar (240px)
- All columns visible
- Horizontal overflow hidden
- 25 items per page

### Tablet (768px – 1279px)

- Sidebar collapsed (64px icon-only)
- Columns: Checkbox, SKU, Title, Quantity, Status, Actions (hide Reorder, Cost, Location)
- 20 items per page
- Reduced padding (20px)

### Mobile (< 768px)

- Sidebar hidden (hamburger toggle)
- Card-based list instead of table
- Each product shows as a card with key info
- Swipe left for actions
- 15 items per page
- Minimal padding (16px)

### Mobile Card Layout

```
┌────────────────────────────────┐
│ ☐  SKU-4821          [In Stock]│
│ Running Water Bottle (32oz)    │
│ Qty: 245  |  WH-A  |  $8.50   │
│                          [⋮]   │
└────────────────────────────────┘
```

---

## 11. Implementation Notes

### Virtual Scrolling

For large datasets (1000+ rows), implement virtual scrolling:
- Use `react-window` or similar library
- Row height: 48px (fixed)
- Overscan: 5 rows
- Maintain selection state across virtualized rows

### URL State Management

- Search query: `?search=water+bottle`
- Filters: `?status=low_stock&location=warehouse_a`
- Sort: `?sort=quantity&order=desc`
- Page: `?page=3&per_page=25`
- Selection: Not persisted in URL (session only)

### Keyboard Navigation

- `Tab` — Move between interactive elements
- `Space` — Toggle checkbox
- `Enter` — Open row actions menu
- `Arrow Up/Down` — Navigate between rows (when table focused)
- `Escape` — Close dropdowns/modals
- `⌘/Ctrl + A` — Select all visible rows
- `Delete` — Delete selected (with confirmation)

### Performance

- Debounce search input: 300ms
- Filter changes: Immediate (optimistic update)
- Sort changes: Immediate
- Bulk operations: Show loading state on affected rows
- CSV export: Server-side generation, download on complete
