# StockFlows v7 — Architecture Documentation & Implementation Plan

> **Generated:** 2026-07-06
> **Base Version:** v30.x (current deployed state)
> **Vision Reference:** https://www.wiz.io/ (design system inspiration)

---

## Executive Summary: What Was Overlooked

The initial StockFlows implementation (v30.x) focused exclusively on **the Shopify app internals** — the embedded admin experience. It completely overlooked the three critical external-facing pillars that drive merchant adoption, conversion, and retention:

| Overlooked Pillar | Current State (v30.x) | Required State (v7) |
|-------------------|----------------------|--------------------|
| **Public Landing Website** | `packages/website` exists but is a static brutalist mockup. No interactive demo, no tour, no conversion funnel. | Full marketing site with hero, features, comparison matrix, live demo CTA — inspired by Wiz.io's dark-theme design system. |
| **Interactive Demo App** | `demo/` exists with basic stock levels, but it's a single-page React app. No route mirroring, no populated data, no tour, no "try before you buy" experience. | Complete mirror of the Shopify app with all routes, populated mock data, guided tour system, and interactive features. |
| **Design System & Brand Identity** | Brutalist green/black theme from an early iteration. No design tokens, no visual consistency across surfaces, no professional brand identity. | Professional design system inspired by Wiz.io: dark theme with accent colors, card-based layouts, smooth transitions, visual hierarchy. |

Additionally, the following **cross-cutting concerns** were never addressed in any version:

1. **Conversion funnel** — No path from website → demo → Shopify app install
2. **Onboarding flow** — Merchants have no guided introduction to features
3. **Feature tour system** — No way to walk new users through core functionality
4. **Mobile-responsive design** — Only Polaris handles responsiveness; website and demo are desktop-first only
5. **SEO & discoverability** — No meta tags, structured data, or content marketing strategy
6. **Analytics & tracking** — No conversion funnel metrics, no user journey tracking

---

## The Three Major Subprojects

### 1. StockFlows Shopify App (Existing, Needs Upgrade)

**Current location:** `stockflows/app/` — Remix v2.17.5 + React 18 + TypeScript

**What it does:** Embedded Shopify admin application for inventory management, demand forecasting, purchasing, and reporting.

**Current state:** 31 routes, ~100 TypeScript/TSX files, Prisma 17 models, BullMQ background workers, SSE real-time updates.

**What v7 upgrades:**
- **Design overhaul** — Replace brutalist green/black with professional dark theme (Wiz.io-inspired)
- **Polish existing features** — Dashboard, Inventory, Forecasting, Purchasing, Reports, Settings
- **Material Symbols icons** — Replace Lucide with Google Material Symbols for visual consistency
- **Polish onboarding flow** — Enhanced from current `app.onboarding.tsx`

---

### 2. Public Landing Website (NEW — Major Component)

**Current state:** `packages/website/src/App.tsx` — Single static React file (375 lines), brutalist theme, no interactivity.

**v7 Requirements:**

| Section | Description | Wiz.io Element Copied |
|---------|-------------|----------------------|
| **Hero** | Full-viewport dark hero with bold headline, subcopy, CTA buttons | "Protect Everything You Build and Run" hero section |
| **Problem Statement** | Stocky sunset announcement, urgency messaging | "A new development reality" / "A new challenge for security" narrative arc |
| **Feature Showcase** | Grid of feature cards with mock UI previews | Feature card grid (Code/Cloud/Defend tabs) |
| **Comparison Matrix** | Stocky vs StockFlows feature comparison table | Hard matrix comparison section |
| **Social Proof** | Partner logos, customer testimonials (realistic) | Customer logo carousel + G2 review badges |
| **Live Demo CTA** | Prominent buttons to launch interactive demo | "Get a demo" / "Explore the platform" CTAs |
| **Navigation** | Sticky header with smooth scroll, dropdown menus | Main navigation with Platform/Solutions/Resources dropdowns |
| **Footer** | Links, legal, branding | Clean muted footer with minimal links |

**Technical requirements:**
- React 19 + Vite (matching current website package)
- Tailwind CSS v4 with custom design tokens (dark theme palette)
- Smooth scroll navigation, intersection observer animations
- Responsive (mobile-first)
- Deploy target: Cloudflare Pages (`stockflows.pages.dev`)

---

### 3. Interactive Demo App (NEW — Mirror of Shopify App)

**Current state:** `demo/` — Single-page React app with 5 tabs (dashboard, transfers, replenishment, stocky import, barcode).

**v7 Requirements:**

| Requirement | Description |
|-------------|-------------|
| **Complete Route Mirroring** | Mirror ALL 31+ routes from the Shopify app (dashboard, inventory list, inventory detail, stock transfers, purchasing, receiving, vendors, forecasting, reports, settings, onboarding, migration) |
| **Populated Mock Data** | Rich sample data for every route: 50+ SKUs, 100+ POs, forecast data, vendor records, transfer history |
| **Guided Tour System** | Step-by-step interactive tour highlighting core features (existing `Tour` component exists but needs expansion) |
| **Interactive Features** | Every action from the real app must work: create/edit/delete items, create POs, receive shipments, run forecasts, export reports |
| **Data Population** | Seed script generates realistic sample data across all 17 Prisma models |
| **Visual Parity** | Must match the upgraded Shopify app's UI exactly (new design system) |
| **No Backend Required** | 100% client-side with mock data, no API calls, no auth |

**Technical requirements:**
- React 19 + Vite (matching demo package)
- Tailwind CSS v4 with same design tokens as website
- Full mock data layer (JSON seed files)
- Tour system with step navigation
- Deploy target: Cloudflare Pages (`stockflows.pages.dev/demo`)

---

## Proposed Project Structure (v7)

```
stockflows-v7/                          # New subproject folder
├── .git/                               # Version control
│
├── app/                                # SHOPIFY APP (existing, upgraded)
│   ├── components/                     # ~15 domain-specific component folders
│   │   ├── dashboard/                  # Dashboard page + KPI cards
│   │   ├── inventory/                  # Inventory list, detail, transfers
│   │   ├── purchasing/                # POs, receiving, vendors
│   │   ├── forecasting/              # Forecast charts, recommendations
│   │   ├── reports/                  # Report generation, exports
│   │   ├── settings/                 # Per-shop configuration
│   │   ├── shared/                   # StockBadge, LoadingSkeleton, EmptyState
│   │   └── ui/                       # Polaris wrappers, Material Symbols icons
│   ├── hooks/                          # useForecast, useInventory, useSSE
│   ├── lib/                            # Domain logic (auth, db, shopify, inventory, purchasing, forecasting, AI, reports, notifications, jobs, export)
│   ├── routes/                         # 31+ Remix file-based routes
│   ├── stores/                         # Zustand store (inventory.ts)
│   ├── emails/                         # React Email templates
│   ├── root.tsx                        # Root layout (error boundaries, auth)
│   └── entry.server.tsx              # SSR entry
│
├── packages/                           # Workspace packages (NEW structure)
│   │
│   ├── stockflows-ui/                  # SHARED UI LIBRARY (existing → upgraded)
│   │   └── src/
│   │       ├── components/           # Shared components (Button, Badge, Tour, Popover)
│   │       ├── styles/               # Design tokens (tokens-v7.css, variables.css)
│   │       ├── hooks/               # useTour, useMediaQuery, etc.
│   │       └── index.ts            # Package barrel export
│   │
│   ├── website/                        # PUBLIC LANDING WEBSITE (existing → rewritten)
│   │   └── src/
│   │       ├── App.tsx               # Main landing page (fully rewritten)
│   │       ├── components/           # Landing-specific components
│   │       │   ├── Hero.tsx          # Full-viewport hero section
│   │       │   ├── FeatureCards.tsx  # Grid of feature showcase cards
│   │       │   ├── ComparisonMatrix.tsx  # Stocky vs StockFlows table
│   │       │   ├── CustomerLogos.tsx # Partner logo carousel
│   │       │   ├── Navigation.tsx    # Sticky header with dropdowns
│   │       │   └── Footer.tsx        # Clean footer
│   │       ├── data/                 # Static content, feature copy
│   │       └── index.css            # Tailwind config with design tokens
│   │
│   └── demo/                           # INTERACTIVE DEMO APP (existing → rewritten)
│       └── src/
│           ├── App.tsx                # Main demo app (fully rewritten)
│           ├── routes/               # Mirror of all Shopify app routes
│           │   ├── dashboard.tsx     # Dashboard with KPIs + alerts
│           │   ├── inventory/        # List, detail, transfer, adjust pages
│           │   ├── purchasing/       # PO list, detail, receive, vendors
│           │   ├── forecasting/      # Forecast dashboard + charts
│           │   ├── reports/         # Reports hub with exports
│           │   └── settings/        # Settings page (read-only)
│           ├── data/                 # Mock data files (inventory.json, po.json, etc.)
│           │   ├── inventory.json    # 50+ realistic SKUs with all fields
│           │   ├── purchase-orders.json  # 100+ PO records
│           │   ├── forecasts.json    # Forecast results with confidence intervals
│           │   ├── vendors.json      # Vendor directory
│           │   └── transfers.json    # Transfer history
│           ├── components/           # Demo-specific UI components
│           │   ├── Tour/             # Step-by-step guided tour
│           │   ├── Sidebar/          # Navigation sidebar (read-only)
│           │   └── MockDataProvider.tsx  # Context for all mock data
│           └── index.css            # Tailwind config with design tokens
│
├── prisma/                             # Database schema (existing, unchanged)
│   └── schema.prisma                  # 17 models, 13 enums
│
├── e2e/                                # E2E test suite (existing, expanded)
│   ├── website.spec.ts                # New: Landing page E2E tests
│   ├── demo.spec.ts                   # New: Demo app E2E tests
│   ├── app.spec.ts                    # Existing: Shopify app tests
│   └── ...                            # 35+ existing test files
│
├── scripts/                            # Build & seed scripts
│   ├── build-pages.sh                 # Existing: Cloudflare Pages build
│   ├── seed-demo-data.ts              # NEW: Generate mock JSON data files
│   └── deploy.sh                      # Existing: Full deployment pipeline
│
├── turbo.json                          # Turborepo config (unchanged)
├── pnpm-workspace.yaml                 # Workspace config (updated for v7)
└── package.json                        # Root config (updated scripts)
```

---

## Design System (Inspired by Wiz.io)

### Color Palette (Dark Theme)

```css
/* Primary colors */
--color-bg-primary: #0A0B0E;      /* Deep black (page background) */
--color-bg-secondary: #14161B;    /* Card surfaces */
--color-bg-tertiary: #1A1D24;     /* Elevated surfaces */
--color-bg-hover: #1E2128;       /* Interactive hover states */

/* Accent / Brand */
--color-brand-accent: #C7FB33;     /* StockFlows neon green (retained) */
--color-brand-accent-hover: #B0F214;
--color-brand-blue: #4F8FFF;      /* Link/interactive elements */
--color-brand-red: #FF4F4F;       /* Error/alert states */
--color-brand-amber: #FFB84D;     /* Warning states */
--color-brand-emerald: #34D399;   /* Success states */

/* Text */
--color-text-primary: #E4E6EA;    /* Main headings */
--color-text-secondary: #8A8D93;  /* Body text, descriptions */
--color-text-muted: #5C5F66;     /* Placeholders, timestamps */
--color-text-white: #FFFFFF;      /* High-emphasis content */

/* Borders & Dividers */
--color-border-primary: #20232A;  /* Card borders */
--color-border-focus: #C7FB33;   /* Focus rings */
```

### Typography

| Element | Font | Size | Weight | Tracking |
|---------|------|------|--------|----------|
| H1 (Hero) | Inter/Manrope | 48-80px | 800 (ExtraBold) | -1% (tight) |
| H2 (Section) | Inter/Manrope | 32-48px | 700 (Bold) | -0.5% |
| H3 (Card title) | Inter/Manrope | 20-24px | 700 (Bold) | 0% |
| Body | Inter | 14-16px | 400 (Regular) | 0% |
| Mono (labels) | JetBrains Mono | 10-12px | 600 (SemiBold) | +2% (widened) |
| Micro labels | JetBrains Mono | 9-10px | 700 (Bold) | +3% (widened) |

### Layout Patterns (from Wiz.io)

- **Max width containers:** `max-w-7xl` (1280px) with `px-6` padding
- **Section spacing:** `py-20` (80px) vertical sections with `border-b border-[#20232A]` dividers
- **Card style:** `border-2 border-[#20232A]` with `bg-[#14161B]`, hover states change border to accent color
- **Shadow treatment:** `shadow-[8px_8px_0px_#000]` (hard offset shadow, no blur) — brutalist but refined
- **Button styles:** Primary = `bg-brand-accent text-black font-bold uppercase tracking-widest shadow-[4px_4px_0px_#000] border-2 border-black`
- **Grid layouts:** `grid grid-cols-1 lg:grid-cols-3 gap-8` for feature cards

### UI Components (from Wiz.io)

- **Sticky navigation** with backdrop blur (`bg-[#0D0E11]/95 backdrop-blur-sm`)
- **Hero section** with full-viewport height, large typographic headline, form/CTA split
- **Feature cards** with icon, title, description, and mock UI preview inside each card
- **Comparison tables** with bordered cells, status indicators (check/X icons)
- **Customer logo carousel** — horizontally scrolling infinite animation
- **CTA sections** with gradient backgrounds and prominent button pairs

---

## Major Parts That Were Overlooked (Detailed)

### 1. No Public-Facing Marketing Website
The Shopify app had no external presence. Merchants discover apps through the Shopify App Store, but a compelling landing page is critical for:
- SEO-driven organic discovery
- Social media sharing links
- Email campaign landing pages
- Partner/integrator reference material

### 2. No "Try Before You Buy" Experience
The demo was a single static page with minimal interactivity. Merchants evaluating inventory software need to see:
- Realistic sample data (not just 5 SKUs)
- Every feature working end-to-end
- A guided tour showing where to start
- Confidence that the app handles their scale

### 3. No Design System
The app bounces between Polaris (Shopify) and custom brutalist styling. A unified design system ensures:
- Visual consistency across all three subprojects (app, website, demo)
- Efficient component reuse between website and demo
- Clear brand identity for the Shopify App Store listing

### 4. No Conversion Funnel Architecture
There's no designed path from:
`Website visitor → Demo engagement → App install → Activation → Retention`

Each stage needs specific UX patterns that weren't addressed.

### 5. No Content Strategy
The website needs:
- Feature descriptions that sell benefits, not just features
- Comparison content (Stocky sunset urgency)
- SEO-optimized page structure
- Social proof (testimonials, usage stats)

---

## Implementation Approach: Goal-Driven

**Goal:** Build StockFlows v7 as three integrated subprojects under a single monorepo, with a professional design system that matches the quality of Wiz.io's public-facing presence, while maintaining full parity between the Shopify app and its interactive demo.

### Phase 0: Foundation (Design System + Scaffold)
- Create shared design tokens (CSS variables, Tailwind config)
- Set up `stockflows-v7/` project structure
- Create `@stockflows/ui` package with design tokens + shared components
- Establish build pipeline (Turborepo) for all three targets

### Phase 1: Public Website (Marketing Site)
- Rewrite `packages/website/` as a complete landing page
- Hero section with Stocky sunset messaging
- Feature showcase grid
- Comparison matrix (Stocky vs StockFlows)
- Customer logos + social proof section
- Deploy to Cloudflare Pages

### Phase 2: Demo App (Interactive Mirror)
- Rewrite `packages/demo/` with complete route mirroring
- Create mock data layer (seed all 17 models)
- Implement guided tour system
- Build all pages: dashboard, inventory, purchasing, forecasting, reports, settings
- Deploy to Cloudflare Pages (subpath)

### Phase 3: Shopify App Upgrade (Design Overhaul)
- Apply new design system to `app/` components
- Migrate icons to Material Symbols
- Polish all 31 routes with new visual treatment
- Ensure parity with demo app (same components from `@stockflows/ui`)

### Phase 4: Integration & Testing
- Cross-project E2E tests (website, demo, app)
- Visual regression testing (new design system)
- Performance optimization (Lighthouse targets)
- SEO audit for website

---

## Definition of Done (High Level)

### Website
- [ ] Full landing page deployed at stockflows.pages.dev
- [ ] All Wiz.io-inspired sections present (hero, features, comparison, social proof)
- [ ] Responsive on mobile (375px), tablet (768px), desktop (1280px+)
- [ ] Navigation with smooth scroll and dropdown menus
- [ ] CTAs link to demo app and Shopify app install

### Demo App
- [ ] All 31+ routes from Shopify app mirrored with populated data
- [ ] Guided tour system walks through core features
- [ ] Interactive: create, edit, delete, transfer, receive, forecast — all functional
- [ ] 50+ SKUs, 100+ POs, complete sample data across all models
- [ ] No backend required (100% client-side)

### Shopify App
- [ ] Design system tokens applied to all components
- [ ] Material Symbols icons replace Lucide
- [ ] Visual parity with demo app (same UI components from shared library)
- [ ] All existing functionality preserved and polished

### Cross-Cutting
- [ ] Shared `@stockflows/ui` package exports components used across all three subprojects
- [ ] Design tokens defined once, consumed by all three targets
- [ ] Build pipeline produces deployable artifacts for all three subprojects

---

*This architecture documentation identifies the major parts overlooked in v30.x and provides the blueprint for StockFlows v7 as three integrated subprojects: a professional Shopify app, a public-facing marketing website, and an interactive demo app — unified by a single design system.*
