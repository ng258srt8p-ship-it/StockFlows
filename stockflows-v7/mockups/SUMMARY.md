# StockFlows v7 — Design System & Mockup Summary

## Overview

StockFlows v7 is a Shopify inventory management app with a dark-mode UI inspired by Wiz.io's clean typography, generous spacing, card-based layouts, and modern interactive patterns. The design adapts Wiz.io's light-theme elegance into a premium dark theme with neon green accents.

---

## Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#0A0B0E` | Main app background |
| `--bg-secondary` | `#14161B` | Cards, panels, sidebar |
| `--bg-tertiary` | `#1C1E24` | Hover states, elevated surfaces |
| `--bg-quaternary` | `#252830` | Active/selected states |
| `--accent-primary` | `#C7FB33` | Neon green — primary CTA, highlights |
| `--accent-hover` | `#D4FF5C` | Hover state for accent elements |
| `--accent-muted` | `rgba(199, 251, 51, 0.15)` | Background tint for badges/tags |
| `--text-primary` | `#FFFFFF` | Headings, primary text |
| `--text-secondary` | `#A0A3AB` | Body text, labels, descriptions |
| `--text-tertiary` | `#6B6F78` | Muted text, placeholders |
| `--border-default` | `#2A2D35` | Subtle borders on cards, inputs |
| `--border-hover` | `#3A3D45` | Hover state borders |
| `--success` | `#34D399` | In Stock badge |
| `--warning` | `#FBBF24` | Low Stock badge |
| `--danger` | `#F87171` | Out of Stock badge, errors |
| `--info` | `#60A5FA` | Informational badges |

### Typography

| Element | Font | Size | Weight | Line Height | Letter Spacing |
|---------|------|------|--------|-------------|----------------|
| Display | Inter | 48px | 700 | 1.1 | -0.02em |
| H1 | Inter | 36px | 700 | 1.2 | -0.01em |
| H2 | Inter | 28px | 600 | 1.3 | 0 |
| H3 | Inter | 22px | 600 | 1.4 | 0 |
| H4 | Inter | 18px | 600 | 1.4 | 0 |
| Body Large | Inter | 16px | 400 | 1.6 | 0 |
| Body | Inter | 14px | 400 | 1.5 | 0 |
| Body Small | Inter | 12px | 400 | 1.5 | 0.01em |
| Caption | Inter | 11px | 500 | 1.4 | 0.02em |
| Code / Terminal | Fira Code | 13px | 400 | 1.6 | 0 |

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight gaps (icon + text) |
| `--space-2` | 8px | Small gaps, compact padding |
| `--space-3` | 12px | Default inner padding |
| `--space-4` | 16px | Standard padding, card gaps |
| `--space-5` | 20px | Section padding |
| `--space-6` | 24px | Card padding, section gaps |
| `--space-8` | 32px | Large section padding |
| `--space-10` | 40px | Page-level spacing |
| `--space-12` | 48px | Major section breaks |
| `--space-16` | 64px | Hero/top-level spacing |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Badges, small elements |
| `--radius-md` | 6px | Buttons, inputs |
| `--radius-lg` | 8px | Cards, panels |
| `--radius-xl` | 12px | Modals, large cards |
| `--radius-full` | 9999px | Pills, avatars, toggles |

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` | Subtle card elevation |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.4)` | Card hover, dropdowns |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.5)` | Modals, overlays |
| `--shadow-glow` | `0 0 20px rgba(199,251,51,0.2)` | Accent glow effect |

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | 375px – 767px | Single column, collapsed sidebar, stacked cards |
| Tablet | 768px – 1279px | 2-column grid, collapsible sidebar |
| Desktop | 1280px+ | Full sidebar, 4-column grid, multi-column tables |

---

## Key Design Decisions

1. **Dark-first design** — Primary background `#0A0B0E` with secondary surfaces `#14161B` create depth through subtle contrast
2. **Neon green accent** — `#C7FB33` used sparingly for primary actions, active states, and status highlights
3. **Sidebar navigation** — Persistent left sidebar (240px) for app pages, collapsible on mobile
4. **Card-based layout** — All content surfaces use `--bg-secondary` cards with `--border-default` borders
5. **Terminal aesthetic** — Marketing site hero uses monospace code blocks for demo previews
6. **Minimal decoration** — Clean lines, generous whitespace, focus on data readability
7. **Status-driven colors** — Inventory status uses semantic colors (green/yellow/red) on dark backgrounds
8. **Fira Code for data** — SKUs, quantities, and terminal outputs use monospace for alignment

---

## Animation & Interaction Notes

### Transitions
- **Duration**: 150ms for micro-interactions, 250ms for page transitions
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` — standard Material easing
- **Properties**: `background-color`, `color`, `border-color`, `box-shadow`, `transform`, `opacity`

### Hover States
- Card surfaces: background shifts from `--bg-secondary` to `--bg-tertiary`
- Buttons: accent background brightens to `--accent-hover`, slight scale(1.02)
- Table rows: background shifts to `--bg-tertiary`
- Sidebar links: left border accent appears, text brightens

### Micro-interactions
- **Toggle switches**: 200ms ease-out slide with color transition
- **Dropdown menus**: 150ms fade-in + slight translateY(-4px) animation
- **Toast notifications**: slide-in from right, auto-dismiss after 5s
- **Loading states**: skeleton shimmer animation on placeholder content
- **Status badges**: subtle pulse animation on "Out of Stock" items

### Page Transitions
- Route changes: 200ms fade transition
- Modal open/close: 250ms scale + fade

---

## Page Mockup Index

| # | Page | File | Description |
|---|------|------|-------------|
| 1 | Dashboard | `dashboard.md` | KPI cards, alerts, activity feed, sidebar nav |
| 2 | Inventory List | `inventory-list.md` | Data table, search/filter, bulk actions, status badges |
| 3 | Marketing Website Hero | `website-hero.md` | Terminal demo, headline, CTAs, gradient background |
| 4 | Settings | `settings.md` | Tabbed navigation, toggles, form inputs |
| 5 | Purchase Order Detail | `purchase-order.md` | PO info card, line items, timeline, actions |

---

## Icon System

- **Library**: Google Material Symbols (Outlined)
- **Default size**: 20px
- **Color**: `--text-secondary` (default), `--accent-primary` (active/highlighted)
- **Stroke**: 1.5px weight (outlined style)
- **Spacing**: 8px gap when used with text labels

---

## Component Inventory

| Component | Variants | States |
|-----------|----------|--------|
| Button | Primary, Secondary, Ghost, Danger | Default, Hover, Active, Disabled, Loading |
| Input | Text, Number, Search, Select, Textarea | Default, Focus, Error, Disabled |
| Card | Standard, Elevated, Interactive | Default, Hover |
| Badge | Success, Warning, Danger, Info | Default |
| Toggle | On, Off | Default, Disabled |
| Sidebar Link | Active, Inactive | Default, Hover, Active |
| Table | Default, Compact | Default, Hover row, Selected row |
| Modal | Standard, Confirmation | Open, Closing |
| Toast | Success, Error, Info, Warning | Visible, Dismissing |
| Tab | Horizontal, Vertical | Default, Active, Disabled |
