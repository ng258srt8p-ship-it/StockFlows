# StockFlows v7 — @stockflows/ui Component API Contract

## Overview

The `@stockflows/ui` package provides the shared component library for all three StockFlows v7 subprojects: Shopify App, Public Website, and Interactive Demo. All components follow the brutalist design system (dark theme, hard-offset shadows, neon green accent).

---

## Section 1: Component Inventory

### SHARED (used across app, website, demo)

| Component | Export | Notes |
|-----------|--------|-------|
| Button | `Button` | Primary CTA, form actions |
| Badge | `Badge` | Status indicators |
| Card | `Card`, `ShadowBevel`, `Box` | Container primitives |
| KpiCard | `KpiCard` | Dashboard metrics |
| PageHeader | `PageHeader` | Page titles + actions |
| EmptyState | `EmptyState` | No-data states |
| ForecastCard | `ForecastCard` | Forecast display |
| StatCard | `StatCard` | **NEW** — simple stat display |
| LoadingSkeleton | `LoadingSkeleton` | **NEW** — loading placeholder |
| StockBadge | `StockBadge` | **NEW** — stock level indicator |
| Toast | `Toast` | Notifications |
| Spinner | `Spinner` | Loading indicator |
| Divider | `Divider` | Visual separator |
| ProgressBar | `ProgressBar` | Progress indicator |
| Tooltip | `Tooltip` | Hover info |
| Modal | `Modal` | Dialog overlays |
| TextField | `TextField` | Text input |
| Select | `Select` | Dropdown select |
| Checkbox | `Checkbox` | Boolean toggle |
| Tabs | `Tabs` | Tab navigation |
| Avatar | `Avatar` | User avatars |

### APP-ONLY (Shopify admin)

| Component | Notes |
|-----------|-------|
| Navigation | Polaris-based sidebar navigation |
| IndexTable | Polaris data table wrapper |
| Layout | Shopify admin layout (annotated sections) |
| Dropdown | Polaris dropdown menu |
| Popover | Polaris popover |
| TourStep | Onboarding tour steps |
| TourProvider | Tour context provider |
| TourOverlay | Tour overlay |
| AbcLegend | ABC analysis legend |
| SettingsCard | Settings form card |

### WEBSITE-ONLY (marketing)

| Component | Notes |
|-----------|-------|
| HeroSection | **NEW** — landing page hero |
| FeatureCards | **NEW** — feature grid |
| ComparisonMatrix | **NEW** — competitor comparison |
| CustomerLogos | **NEW** — social proof strip |
| Footer | **NEW** — site footer |
| StickyHeader | **NEW** — marketing nav |

### DEMO-ONLY (interactive)

| Component | Notes |
|-----------|-------|
| MockDataProvider | Demo data context |
| DemoSidebar | Demo navigation |
| DemoToolbar | Demo controls (reset, speed) |

---

## Section 2: Shared Component API Specs

### Button

```typescript
interface ButtonProps {
  children: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'plain';  // default: 'primary'
  size?: 'micro' | 'slim' | 'medium' | 'large';              // default: 'medium'
  fullWidth?: boolean;        // default: false
  loading?: boolean;          // default: false
  disabled?: boolean;         // default: false
  icon?: IconSource;          // Polaris icon
  url?: string;               // renders as <a>
  external?: boolean;         // open in new tab
  download?: boolean | string;
  submit?: boolean;           // form submit
  pressed?: boolean;          // toggle state
  className?: string;
  onClick?: () => void;
  accessibilityLabel?: string;
  id?: string;
}
```
- **primary**: neon green bg (#C7FB33), dark text
- **secondary**: outlined, border #2A2D34
- **tertiary**: text-only, accent on hover
- **plain**: no border/bg, text-only

### Badge

```typescript
interface BadgeProps {
  children: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'critical' | 'info' | 'attention' | 'new' | 'magic';
  size?: 'small' | 'medium' | 'large';  // default: 'medium'
  tone?: PolarisBadgeProps['tone'];
  progress?: PolarisBadgeProps['progress'];
  icon?: IconSource;
}
```
- **success**: #22C55E bg, dark text
- **warning**: #F59E0B bg, dark text
- **critical**: #EF4444 bg, white text
- **primary**: accent #C7FB33 bg, dark text

### Card / ShadowBevel / Box

```typescript
interface BoxProps {
  children: React.ReactNode;
  padding?: 'none' | '100' | '200' | '300' | '400' | '500' | '600';  // default: '400'
  background?: 'surface' | 'subdued' | 'transparent';  // default: 'surface'
  className?: string;
  as?: React.ElementType;     // polymorphic
}

interface ShadowBevelProps {
  children: React.ReactNode;
  className?: string;
  zIndex?: number;            // default: 32
  borderRadius?: '100' | '200' | '300';  // default: '300'
}

// Card is a combination: ShadowBevel wrapping a Box with default styling
```

### KpiCard

```typescript
interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;            // percentage
    label: string;            // e.g. "vs last month"
    direction: 'up' | 'down';
  };
  icon?: React.ReactNode;     // Material Symbol or custom
  onClick?: () => void;       // makes card clickable
  padding?: '100' | '200' | '300' | '400' | '500' | '600';  // default: '400'
  background?: ColorBackgroundAlias;
}
```

### StatCard (NEW)

```typescript
interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: React.ReactNode;
  accent?: boolean;           // neon green left border
  onClick?: () => void;
}
```

### PageHeader

```typescript
interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: Array<{ content: string; url?: string }>;
  primaryAction?: React.ReactNode;
  secondaryActions?: React.ReactNode;
  actionGroups?: MenuGroupDescriptor[];
  backAction?: { content: string; onAction: () => void };
  children?: React.ReactNode;
  fullWidth?: boolean;        // default: false
  narrowWidth?: boolean;      // default: false
}
```

### EmptyState

```typescript
interface EmptyStateProps {
  heading: string;
  image: string;
  largeImage?: string;
  imageContained?: boolean;
  fullWidth?: boolean;
  action?: ComplexAction;     // { content, onAction }
  secondaryAction?: ComplexAction;
  footerContent?: React.ReactNode;
  children?: React.ReactNode;
}
```

### ForecastCard

```typescript
interface ForecastCardProps {
  forecast: Forecast;         // { productName, sku, accuracy, predictedDemand, currentStock, daysOfStock, reorderPoint, safetyStock }
  onViewDetails?: (forecast: Forecast) => void;
}
```

### LoadingSkeleton (NEW)

```typescript
interface LoadingSkeletonProps {
  type?: 'text' | 'title' | 'avatar' | 'card' | 'table' | 'chart';
  count?: number;             // default: 1
  width?: string | number;
  height?: string | number;
  className?: string;
}
```

### StockBadge (NEW)

```typescript
interface StockBadgeProps {
  quantity: number;
  reorderPoint: number;
  criticalThreshold?: number;  // default: 3
  size?: 'small' | 'medium' | 'large';
}
// Renders: green if > reorderPoint, yellow if <= reorderPoint, red if <= criticalThreshold
```

### Navigation (App-only but SHARED interface)

```typescript
interface NavigationItem {
  label: string;
  url: string;
  icon?: React.ReactNode;
  badge?: string | number;
  new?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

interface NavigationProps {
  items: NavigationItem[];
  activeItem?: string;
  onItemClick?: (item: NavigationItem) => void;
  logo?: React.ReactNode;
  className?: string;
}
```

---

## Section 3: Target-Specific Component Specs

### App-Only Components

| Component | Key Props | Notes |
|-----------|-----------|-------|
| IndexTable | `headings`, `rows`, `sortable`, `selectedKeys` | Polaris IndexTable wrapper |
| Layout | `section`, `secondary` | Polaris annotated layout |
| Dropdown | `activator`, `items`, `open` | Polaris dropdown |
| Popover | `activator`, `children`, `open` | Polaris popover |
| TourStep | `step`, `title`, `content`, `position` | Onboarding step |
| TourProvider | `steps`, `onComplete` | Tour state management |
| AbcLegend | `items` | ABC classification legend |

### Demo-Only Components

| Component | Key Props | Notes |
|-----------|-----------|-------|
| MockDataProvider | `children`, `seed` | Initializes demo data |
| DemoSidebar | `activeTab`, `onTabChange` | Tab navigation |
| DemoToolbar | `onReset`, `onExport` | Demo controls |

---

## Section 4: Design Token Contract

All subprojects MUST consume these CSS custom properties from `tokens-v6.css`:

### Colors

```css
:root {
  /* Core dark palette */
  --sf-bg: #0D0E11;
  --sf-bg-raised: #14161B;
  --sf-bg-raised-2: #1A1D24;
  --sf-border: #20232A;
  --sf-border-light: #2A2D34;

  --sf-text: #E4E6EA;
  --sf-text-primary: #FFFFFF;
  --sf-text-secondary: #8A8D93;
  --sf-text-dim: #5C5F66;

  --sf-accent: #C7FB33;
  --sf-accent-hover: #b0f214;
  --sf-accent-dim: rgba(199, 251, 51, 0.08);

  --sf-critical: #EF4444;
  --sf-warning: #F59E0B;
  --sf-success: #22C55E;

  /* Light surface (for cards in dark mode) */
  --sf-light-bg: #F5F5F7;
  --sf-light-surface: #FFFFFF;
  --sf-light-border: #E5E7EB;
  --sf-light-text: #0F172A;
  --sf-light-text-secondary: #475569;
}
```

### Typography

```css
:root {
  --sf-font-ui: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --sf-font-display: 'Playfair Display', Georgia, 'Times New Roman', serif;
  --sf-font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;

  /* Scale */
  --sf-text-xs: 0.75rem;    /* 12px */
  --sf-text-sm: 0.875rem;   /* 14px */
  --sf-text-base: 1rem;     /* 16px */
  --sf-text-lg: 1.125rem;   /* 18px */
  --sf-text-xl: 1.25rem;    /* 20px */
  --sf-text-2xl: 1.5rem;    /* 24px */
  --sf-text-3xl: 1.875rem;  /* 30px */
  --sf-text-4xl: 2.25rem;   /* 36px */
}
```

### Spacing (4px grid)

```css
:root {
  --sf-space-1: 4px;
  --sf-space-2: 8px;
  --sf-space-3: 12px;
  --sf-space-4: 16px;
  --sf-space-5: 20px;
  --sf-space-6: 24px;
  --sf-space-8: 32px;
  --sf-space-12: 48px;
  --sf-space-16: 64px;
}
```

### Border Radius

```css
:root {
  --sf-radius: 0px;          /* Brutalist: no radius by default */
  --sf-radius-sm: 2px;       /* Subtle rounding */
  --sf-radius-md: 4px;       /* Buttons, inputs */
  --sf-radius-lg: 8px;       /* Cards (optional) */
}
```

### Shadows (Hard Offset — No Blur)

```css
:root {
  --sf-shadow-sm: 3px 3px 0px 0px #000000;
  --sf-shadow-md: 6px 6px 0px 0px #000000;
  --sf-shadow-lg: 8px 8px 0px 0px #000000;
  --sf-shadow-accent: 4px 4px 0px 0px rgba(199, 251, 51, 0.4);
}
```

### Component Sizes

```css
:root {
  --sf-btn-height: 40px;
  --sf-input-height: 40px;
  --sf-header-height: 80px;
}
```

---

## Section 5: Component Usage Patterns

### Composition Rules

```
PageHeader
  └── Button (primaryAction)

Card (ShadowBevel + Box)
  ├── KpiCard (metrics)
  ├── StatCard (simple stats)
  └── ForecastCard (forecast data)

IndexTable
  ├── Badge (status columns)
  ├── StockBadge (stock level)
  └── Button (row actions)
```

### Dark Mode Handling

v7 is **dark-only**. All components render in dark mode:
- Backgrounds: `--sf-bg`, `--sf-bg-raised`
- Text: `--sf-text-primary`, `--sf-text-secondary`
- Borders: `--sf-border`
- No light mode toggle needed

### Responsive Breakpoints

```css
/* Mobile: < 640px */
/* Tablet: 640px - 1024px */
/* Desktop: > 1024px */

/* Use Tailwind classes: sm:, md:, lg: */
/* Or CSS: @media (min-width: 640px) { ... } */
```

### Animation Conventions

- **Transitions**: 150ms ease-out for hover states
- **Transforms**: `translateY(-2px)` for hover lift effect
- **No animations on initial load** — content appears immediately
- **Micro-interactions only**: button hover, card hover, toast slide-in

### Icon Convention

All icons use **Material Symbols** (Google Fonts):
```html
<span class="material-symbols-outlined">inventory_2</span>
```

Icon names follow Google's Material Symbols naming:
- `inventory_2` — inventory
- `local_shipping` — transfers
- `shopping_cart` — purchasing
- `analytics` — forecasting
- `settings` — settings
- `warning` — alerts
- `add` — create
- `search` — search
- `filter_list` — filter
- `sort` — sort
