# Dashboard — StockFlows v7

## Overview

The Dashboard is the primary landing screen after login. It provides an at-a-glance view of inventory health, active alerts, and recent activity. The layout follows a persistent sidebar + main content pattern with a top header bar.

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [Top Header Bar]                                           │
├──────────┬──────────────────────────────────────────────────┤
│          │  [Page Title]              [Actions]             │
│ Sidebar  │                                                  │
│ (240px)  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│          │  │ KPI Card │ │ KPI Card │ │ KPI Card │ │ KPI Card │ │
│          │  │  1       │ │  2       │ │  3       │ │  4       │ │
│          │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│          │                                                  │
│          │  ┌─────────────────────┐ ┌─────────────────────┐ │
│          │  │   Active Alerts     │ │  Recent Activity    │ │
│          │  │   (scrollable)      │ │  (scrollable)       │ │
│          │  └─────────────────────┘ └─────────────────────┘ │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

---

## 1. Top Header Bar

| Property | Value |
|----------|-------|
| Height | 56px |
| Background | `#0A0B0E` |
| Border-bottom | 1px solid `#2A2D35` |
| Padding | 0 24px |
| Position | Fixed top, full width |

### Contents (Left to Right)

| Element | Style | Details |
|---------|-------|---------|
| Logo (StockFlows) | Fira Code, 18px, weight 700, `#C7FB33` | 240px from left (sidebar width) |
| Search bar | Inter, 14px, `#A0A3AB` placeholder | Width: 320px, bg: `#14161B`, border: `#2A2D35`, radius: `6px` |
| Notification bell | Material Symbols, 20px, `#A0A3AB` | Right-aligned, with red dot badge (8px circle, `#F87171`) |
| Avatar circle | 32px diameter, bg: `#252830` | Contains initials in 14px Inter, `#FFFFFF` |
| Store selector dropdown | Inter, 13px, `#FFFFFF` | Arrow icon, right-aligned |

---

## 2. Sidebar Navigation

| Property | Value |
|----------|-------|
| Width | 240px |
| Background | `#0A0B0E` |
| Border-right | 1px solid `#2A2D35` |
| Position | Fixed left, full height |
| Padding | 16px 0 |
| Scrollable | Yes (vertical overflow) |

### Navigation Items

| Icon (Material Symbols) | Label | Active State |
|-------------------------|-------|--------------|
| `dashboard` | Dashboard | **ACTIVE** — left border: 3px `#C7FB33`, bg: `rgba(199,251,51,0.1)`, text: `#C7FB33` |
| `inventory_2` | Inventory | Inactive — text: `#A0A3AB` |
| `shopping_cart` | Purchase Orders | Inactive — text: `#A0A3AB` |
| `local_shipping` | Suppliers | Inactive — text: `#A0A3AB` |
| `analytics` | Reports | Inactive — text: `#A0A3AB` |
| `settings` | Settings | Inactive — text: `#A0A3AB` |

### Navigation Item Specs

| Property | Default | Hover | Active |
|----------|---------|-------|--------|
| Height | 40px | 40px | 40px |
| Padding | 0 20px | 0 20px | 0 20px |
| Background | transparent | `rgba(199,251,51,0.05)` | `rgba(199,251,51,0.1)` |
| Left border | 3px transparent | 3px transparent | 3px `#C7FB33` |
| Text color | `#A0A3AB` | `#FFFFFF` | `#C7FB33` |
| Icon color | `#A0A3AB` | `#FFFFFF` | `#C7FB33` |
| Font size | 14px | 14px | 14px |
| Font weight | 400 | 500 | 500 |
| Border-radius | 0 8px 8px 0 | 0 8px 8px 0 | 0 8px 8px 0 |
| Transition | 150ms ease | — | — |

### Sidebar Section Dividers

- **Location**: Between main nav and settings
- **Style**: 1px `#2A2D35` horizontal line
- **Margin**: 12px 20px

---

## 3. Main Content Area

| Property | Value |
|----------|-------|
| Padding | 32px |
| Background | `#0A0B0E` |
| Max-width | 1280px (with 32px padding) |
| Scrollable | Yes (vertical overflow) |

### Page Title Section

| Element | Value |
|---------|-------|
| Title | "Dashboard" — Inter, 28px, weight 600, `#FFFFFF` |
| Subtitle | "Overview of your inventory health" — Inter, 14px, weight 400, `#A0A3AB` |
| Gap between title and subtitle | 4px |
| Right-aligned actions | "Last synced: 2 min ago" — Inter, 12px, `#6B6F78` |

---

## 4. KPI Cards Row

| Property | Value |
|----------|-------|
| Layout | CSS Grid, `grid-template-columns: repeat(4, 1fr)` |
| Gap | 16px |
| Margin-bottom | 24px |

### Card Specs (Applied to All 4)

| Property | Value |
|----------|-------|
| Background | `#14161B` |
| Border | 1px solid `#2A2D35` |
| Border-radius | `8px` |
| Padding | `20px` |
| Hover | Border-color: `#3A3D45`, box-shadow: `0 4px 12px rgba(0,0,0,0.4)` |
| Transition | 150ms ease |

### Card 1: Total SKUs

| Element | Value |
|---------|-------|
| Icon | `inventory_2` — Material Symbols, 20px, `#C7FB33` |
| Icon background | `rgba(199,251,51,0.1)`, 32x32px, radius `6px` |
| Label | "Total SKUs" — Inter, 13px, weight 500, `#A0A3AB` |
| Value | "2,847" — Inter, 32px, weight 700, `#FFFFFF` |
| Change | "+12 this week" — Inter, 12px, `#34D399` (green for positive) |
| Layout | Flex column, gap: 8px |
| Icon + label row | Flex row, gap: 8px, items: center |
| Vertical spacing | Icon row → Value: 12px, Value → Change: 4px |

### Card 2: Low Stock Items

| Element | Value |
|---------|-------|
| Icon | `warning` — Material Symbols, 20px, `#FBBF24` |
| Icon background | `rgba(251,191,36,0.1)`, 32x32px, radius `6px` |
| Label | "Low Stock Items" — Inter, 13px, weight 500, `#A0A3AB` |
| Value | "47" — Inter, 32px, weight 700, `#FBBF24` |
| Change | "+5 since yesterday" — Inter, 12px, `#F87171` (red for negative) |
| Layout | Same as Card 1 |

### Card 3: Out of Stock

| Element | Value |
|---------|-------|
| Icon | `error` — Material Symbols, 20px, `#F87171` |
| Icon background | `rgba(248,113,113,0.1)`, 32x32px, radius `6px` |
| Label | "Out of Stock" — Inter, 13px, weight 500, `#A0A3AB` |
| Value | "12" — Inter, 32px, weight 700, `#F87171` |
| Change | "3 critical items" — Inter, 12px, `#F87171` |
| Layout | Same as Card 1 |

### Card 4: Inventory Value

| Element | Value |
|---------|-------|
| Icon | `attach_money` — Material Symbols, 20px, `#C7FB33` |
| Icon background | `rgba(199,251,51,0.1)`, 32x32px, radius `6px` |
| Label | "Inventory Value" — Inter, 13px, weight 500, `#A0A3AB` |
| Value | "$847,293" — Inter, 32px, weight 700, `#FFFFFF` |
| Change | "+$12,400 this month" — Inter, 12px, `#34D399` |
| Layout | Same as Card 1 |

---

## 5. Active Alerts Section

| Property | Value |
|----------|-------|
| Background | `#14161B` |
| Border | 1px solid `#2A2D35` |
| Border-radius | `8px` |
| Padding | `20px` |
| Width | 60% of main content area |
| Margin-bottom | 24px |
| Max-height | 320px |
| Scrollable | Yes (vertical overflow) |

### Section Header

| Element | Value |
|---------|-------|
| Title | "Active Alerts" — Inter, 18px, weight 600, `#FFFFFF` |
| Badge | Count badge: Inter, 12px, weight 500, `#F87171`, bg: `rgba(248,113,113,0.15)`, padding: 2px 8px, radius: `9999px` |
| Action link | "View All" — Inter, 13px, `#C7FB33`, hover: `#D4FF5C` |
| Layout | Flex row, justify: space-between, items: center |
| Margin-bottom | 16px |

### Alert Item

| Property | Default | Hover |
|----------|---------|-------|
| Padding | 12px 16px | 12px 16px |
| Background | transparent | `#1C1E24` |
| Border-radius | 6px | 6px |
| Border-bottom | 1px solid `#2A2D35` | 1px solid `#2A2D35` |
| Layout | Flex row, gap: 12px, items: start | — |

### Alert Item Contents

| Element | Value |
|---------|-------|
| Severity indicator | 4px wide vertical bar — Color: `#F87171` (critical), `#FBBF24` (warning) |
| Alert icon | Material Symbols, 18px, color matches severity |
| Alert title | Inter, 14px, weight 500, `#FFFFFF` |
| Alert description | Inter, 13px, weight 400, `#A0A3AB`, max-lines: 2 |
| Timestamp | Inter, 11px, weight 400, `#6B6F78` |
| Action button | "Reorder" — Inter, 12px, weight 500, `#C7FB33`, hover: underline |

### Sample Alert Data

```
[CRITICAL] SKU-4821 — Running Water Bottle (32oz) is out of stock
           "3 units needed to fulfill 3 pending orders"                    12 min ago

[WARNING]  SKU-1203 — Trail Mix Sampler Pack below reorder point
           "Current: 8 units, Reorder point: 15 units"                     1 hr ago

[WARNING]  SKU-7744 — Organic Honey Jar shipment delayed
           "Expected delivery: Jul 10 (was Jul 7)"                         3 hrs ago
```

---

## 6. Recent Activity Feed

| Property | Value |
|----------|-------|
| Background | `#14161B` |
| Border | 1px solid `#2A2D35` |
| Border-radius | `8px` |
| Padding | `20px` |
| Width | 40% of main content area (minus 16px gap from alerts) |
| Max-height | 320px |
| Scrollable | Yes (vertical overflow) |

### Section Header

| Element | Value |
|---------|-------|
| Title | "Recent Activity" — Inter, 18px, weight 600, `#FFFFFF` |
| Action link | "View All" — Inter, 13px, `#C7FB33`, hover: `#D4FF5C` |
| Layout | Flex row, justify: space-between, items: center |
| Margin-bottom | 16px |

### Activity Item

| Property | Value |
|----------|-------|
| Padding | 10px 0 |
| Border-bottom | 1px solid `#2A2D35` |
| Layout | Flex row, gap: 12px, items: start |
| Last item border-bottom | none |

### Activity Item Contents

| Element | Value |
|---------|-------|
| Avatar/Icon | 28px circle, bg: `#252830`, contains icon or initials (12px Inter, `#FFFFFF`) |
| Activity text | Inter, 13px, weight 400, `#A0A3AB` |
| Highlighted text | Inter, 13px, weight 500, `#FFFFFF` (product names, quantities) |
| Timestamp | Inter, 11px, weight 400, `#6B6F78`, margin-top: 2px |
| Layout | Flex column, gap: 2px |

### Sample Activity Data

```
📦  Purchase order #PO-2847 received from "Pacific Supply Co."
    12 minutes ago

🔄  Inventory adjusted: "Trail Mix Sampler Pack" +45 units
    1 hour ago

⚠️  Low stock alert triggered: "Running Water Bottle (32oz)"
    2 hours ago

📤  Order #SH-9182 shipped — 8 items
    3 hours ago

✅  New supplier added: "Mountain Valley Wholesale"
    Yesterday at 4:32 PM
```

---

## 7. Responsive Behavior

### Desktop (≥1280px)

- Full sidebar visible (240px)
- 4-column KPI grid
- Alerts (60%) + Activity (40%) side by side
- Full table with all columns

### Tablet (768px – 1279px)

- Sidebar collapsed (64px icon-only) or hidden
- 2-column KPI grid
- Alerts (100%) above Activity (100%)
- Reduced padding (20px)

### Mobile (< 768px)

- Sidebar hidden (hamburger toggle)
- 1-column KPI grid (stacked)
- Alerts (100%) above Activity (100%)
- Minimal padding (16px)
- KPI card values reduce to 24px font size
- Top header: logo + hamburger + avatar only

---

## 8. Implementation Notes

### CSS Grid Example

```css
.dashboard-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  padding: 32px;
  max-width: 1280px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 1279px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
  .dashboard-columns {
    flex-direction: column;
  }
}

.dashboard-columns {
  display: flex;
  gap: 16px;
}

.alerts-panel { flex: 6; }
.activity-panel { flex: 4; }
```

### Data Fetching

- KPI values: Poll every 60 seconds
- Alerts: Real-time WebSocket updates
- Activity feed: Poll every 30 seconds
- "Last synced" timestamp: Updated on each data refresh

### Accessibility

- All KPI cards: `role="region"` with `aria-label`
- Alerts: `role="log"` with `aria-live="polite"`
- Navigation: `role="navigation"` with `aria-label="Main navigation"`
- Color contrast: All text meets WCAG AA (4.5:1 ratio minimum)
- Focus states: 2px solid `#C7FB33` outline on keyboard focus
