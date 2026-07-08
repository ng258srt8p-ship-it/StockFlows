# StockFlows v7 — Architecture Documentation

**Version:** 7.0.0  
**Status:** Architecture Review Complete — Ready for Implementation  
**Date:** July 6, 2026

---

## Executive Summary

StockFlows v7 represents a strategic expansion from a single Shopify app into **three integrated subprojects** that were previously overlooked:

1. **Shopify App** (Existing — Design Upgrade)
2. **Public Website** (NEW — Marketing & Conversion)
3. **Interactive Demo** (NEW — Preview & Onboarding)

The current implementation (v30.x) focuses almost exclusively on the Shopify app with a basic demo and minimal website. StockFlows v7 will create a complete merchant acquisition funnel: **Website (marketing) → Demo (preview) → Shopify App (production)**.

### Design System: Wiz.io Inspired

We're adopting the visual language from [Wiz.io](https://www.wiz.io/) — a cybersecurity platform that excels at:
- Dark theme with high contrast (#0A0B0E background)
- Customer logo carousels (social proof)
- Feature cards with clear value propositions
- Comparison matrices (before/after, us/them)
- Professional, modern aesthetic

---

## Current State Analysis

### What Exists (v30.x) ✅

**Shopify App (`app/` directory):**
- ✅ 31+ Remix routes (dashboard, inventory, purchasing, forecasting, reports, settings)
- ✅ 17 Prisma models (Shop, User, InventoryItem, PurchaseOrder, ForecastResult, etc.)
- ✅ Polaris v12 + Tailwind CSS v4
- ✅ Fly.io deployment (stockflows.fly.dev)
- ✅ Basic inventory management, purchasing, forecasting features

**Demo App (`demo/` directory):**
- ✅ Single page with 5 tabs (Dashboard, Transfers, Replenishment, Stocky Import, Barcode)
- ✅ Tour component (step-by-step guided tour)
- ✅ MockDataProvider with static JSON data
- ✅ Cloudflare Pages deployment (stockflows.pages.dev/demo)

**Website (`packages/website/`):**
- ✅ Single 375-line static page
- ✅ Basic landing page with hero section
- ✅ Cloudflare Pages deployment (stockflows.pages.dev)

**@stockflows/ui (Shared Library):**
- ✅ 25+ components (Button, Badge, Card, KpiCard, Navigation, PageHeader, etc.)
- ✅ Standard Polaris styling (light theme)
- ✅ Reusable across app and demo

### What's Missing ❌

**Critical Gaps for v7:**
1. **Full Interactive Demo** — 50+ SKUs with realistic data (not just 5 tabs)
2. **Public Marketing Website** — Feature showcase, customer logos carousel, comparison matrix
3. **Design Tokens** — Dark theme (#0A0B0E), neon accent (#C7FB33)
4. **Material Symbols** — Replacing Lucide icons across all components
5. **Guided Tour System** — Expand existing tour to cover full app (not just 5 tabs)

### What Needs Upgrade 🔄

**Existing Components to Modify:**
1. **@stockflows/ui** — Switch from Lucide to Material Symbols + dark theme styling
2. **Website** — Complete rewrite with professional marketing sections
3. **Demo** — Expand from 5 tabs to full app mirror with realistic data

---

## Architecture: Three Subprojects

### 1. Shopify App (Existing — Design Upgrade)

**Location:** `stockflows-v7/app/`  
**Deployment:** Fly.io (stockflows.fly.dev)  
**Purpose:** Core inventory management functionality for Shopify merchants

**Current Features (v30.x):**
- Dashboard with KPIs and alerts
- Inventory management (list, detail, transfer, adjust)
- Purchase order management (create, receive, vendor directory)
- Forecasting with multiple models (ETS, linear regression, moving average)
- Reports and export functionality
- Settings and configuration

**v7 Upgrades:**
- Apply new design system (dark theme, Material Symbols)
- Polish all 31+ routes with consistent UI/UX
- Improve visual hierarchy and information density
- Add guided tour for new merchants

### 2. Public Website (NEW)

**Location:** `stockflows-v7/packages/website/`  
**Deployment:** Cloudflare Pages (stockflows.pages.dev)  
**Purpose:** Marketing site for merchant acquisition and conversion

**Current Limitations (v30.x):**
- Single 375-line static page
- No feature showcase, customer logos, or comparison matrix
- Limited conversion funnel

**v7 Requirements (based on Wiz.io patterns):**

1. **Navigation**
   - Sticky header with dropdown menus (Platform, Solutions, Pricing, Resources, Customers, Company)
   - CTA button ("Get a Demo" → links to demo app)
   - Sign in button (links to Shopify app)

2. **Hero Section**
   - Headline: "Stocky is Sunsetting. We Are the Upgrade."
   - Subcopy explaining StockFlows value proposition
   - Two CTAs: "Launch Shopify App" (primary), "Try Live Demo" (secondary)
   - Terminal/mock UI preview showing simulated Shopify workspaces

3. **Problem Statement Section**
   - "The Deprecation Challenge" — explain Stocky's primary capabilities being disabled
   - Position StockFlows as the solution with audit-ready document ledger

4. **Feature Showcase**
   - 3-card grid: Dynamic Transfers, Demand Velocity Rules, Instant Camera Scan
   - Each card with icon, title, description, mock UI preview
   - Hover effects (border color changes to accent on hover)

5. **Customer Logos Carousel**
   - "Trusted by more than 50% of Fortune 100 companies"
   - Horizontal scrolling animation with partner logos (Morgan Stanley, Chipotle, Siemens, Fox, BMW, Slack, etc.)
   - Infinite loop animation

6. **Comparison Matrix**
   - Stocky (Sunsetting) vs StockFlows (Upgrade)
   - Feature rows: Stock Transfers, Audit Ledger, Forecasting Model, Supplier CSV Importer
   - Check/X icons with color coding

7. **Social Proof**
   - G2 reviews section (819 reviews, #1 in cloud security)
   - Customer testimonials

8. **Footer**
   - Copyright, legal links (Privacy, Terms, Support)
   - Social media links

**Design Inspiration from Wiz.io:**
- Dark background (#0A0B0E)
- High contrast text (#FFFFFF primary, #A0A3AB secondary)
- Accent color (#C7FB33 — neon green)
- Hard offset shadows (no blur)
- Material Symbols icons
- Smooth scroll animations
- Responsive design (mobile, tablet, desktop)

### 3. Interactive Demo (NEW)

**Location:** `stockflows-v7/packages/demo/`  
**Deployment:** Cloudflare Pages (stockflows.pages.dev/demo)  
**Purpose:** Full mirror of Shopify app with populated mock data for merchant preview

**Current Limitations (v30.x):**
- Single page with only 5 tabs (Dashboard, Transfers, Replenishment, Stocky Import, Barcode)
- Limited data (no realistic SKU variety)
- No full inventory management interface

**v7 Requirements:**

**Key Differences from Shopify App:**
- **No backend required** (100% client-side with mock JSON data)
- **Read-only navigation** (no editing in demo mode, or optional edit mode)
- **Populated with realistic data** (50+ SKUs, 100+ POs, forecasts, vendors)
- **Guided tour system** (step-by-step walkthrough of core features)

**Core Routes (mirroring Shopify app):**
1. **Dashboard** — KPI cards, alerts, recent activity
2. **Inventory List** — Search, filter, barcode scanner integration
3. **Purchasing** — PO list, detail, receive shipments, vendor directory
4. **Forecasting** — Chart (Recharts), forecast cards, recommendations
5. **Reports** — CSV export, PDF generation (client-side)
6. **Settings** — Read-only view of current configuration

**Mock Data Requirements:**
- 50+ SKUs across categories (Apparel, Footwear, Accessories)
- Realistic velocity patterns (high, medium, low)
- 100+ purchase orders with status progression (Draft → Waiting → Ready → Done)
- Forecast results with confidence intervals (ETS, linear regression, moving average)
- Vendor records with contact info, lead times, performance metrics
- Transfer history with status tracking

**Interactive Features:**
- Create/edit/delete inventory items (in demo mode)
- Create purchase orders and receive shipments
- Run forecast models on demand
- Export reports (CSV, PDF)
- Guided tour with step navigation

---

## Design System: @stockflows/ui

**Location:** `stockflows-v7/packages/stockflows-ui/`  
**Purpose:** Shared component library used across all three subprojects

### Components to Implement (14+ Components)

**Core UI Components:**
- `Button` — Primary, secondary, ghost variants with icons
- `Badge` — Status indicators (success, warning, error, info)
- `Card` — Container with shadow variants
- `Navigation` — Sticky header with dropdowns
- `Footer` — Clean footer with links

**Landing Page Components (Website):**
- `HeroSection` — Full-viewport hero with headline, subcopy, CTAs
- `FeatureCards` — 3-card grid with icons and previews
- `ComparisonMatrix` — Feature comparison table
- `CustomerLogos` — Horizontal scrolling carousel

**Demo Components:**
- `StatCard` — KPI cards with trend indicators
- `PageHeader` — Page title with breadcrumbs and actions
- `StockBadge` — Stock level indicator (in stock, low stock, out of stock)
- `LoadingSkeleton` — Placeholder loading states
- `EmptyState` — Empty state with illustration and CTA

### Design Tokens

**Colors (Wiz.io Inspired):**
- Background: #0A0B0E (primary), #14161B (secondary)
- Accent: #C7FB33 (neon green)
- Text: #FFFFFF (primary), #A0A3AB (secondary), #6B7280 (muted)
- Semantic: #10B981 (success), #F59E0B (warning), #EF4444 (error), #3B82F6 (info)

**Typography:**
- Font family: Inter (primary), Fira Code (monospace)
- Hierarchy: h1 (48px), h2 (36px), h3 (24px), body (16px), small (14px)

**Spacing:**
- Baseline: 4px
- Scale: 8, 16, 24, 32, 48, 64, 96px

**Shadows:**
- Hard offset (no blur): 2px 2px 0px #20232A
- Accent shadow: 2px 2px 0px #C7FB33

**Icons:**
- **Google Material Symbols (outlined variant)** — Replace all Lucide icons
- Mapping utility: component → Material Symbol name

**Responsive Breakpoints:**
- Mobile: 375px
- Tablet: 768px
- Desktop: 1280px

---

## Technical Architecture

### Build System

**Monorepo Structure:**
```
stockflows-v7/
├── app/                    # Shopify app (Remix, Polaris)
├── packages/
│   ├── stockflows-ui/      # Shared UI library (React components)
│   ├── website/            # Public website (Vite, React)
│   └── demo/               # Interactive demo (Vite, React)
├── prisma/                 # Database schema (17 models)
├── e2e/                    # Playwright E2E tests
└── scripts/                # Build and deployment scripts
```

**Build Tools:**
- pnpm workspaces + Turborepo 2.3
- Vite 6/7 for website and demo
- Remix 2.17.5 for Shopify app
- TypeScript 5.9

**Testing:**
- Playwright v1.61 (E2E tests)
- Vitest v4.1 (unit tests)
- 35+ existing E2E tests (updating for new design system)

### Deployment Targets

| Subproject | Platform | URL | Purpose |
|------------|----------|-----|---------|
| Shopify App | Fly.io | stockflows.fly.dev | Core functionality with database |
| Website | Cloudflare Pages | stockflows.pages.dev | Marketing and conversion |
| Demo | Cloudflare Pages | stockflows.pages.dev/demo | Preview and onboarding |

### Data Flow

**Shopify App:**
- Real-time data from Shopify API
- Database (PostgreSQL via Prisma)
- Server-side rendering (Remix)

**Website:**
- Static site generation (Vite build)
- No backend required
- Hosted on Cloudflare CDN

**Demo:**
- Client-side only (no backend)
- Mock JSON data files (inventory, purchase orders, forecasts, vendors)
- Zustand state management for in-memory persistence

---

## Implementation Phases

### Phase 0: Foundation (Design System + Scaffold)
**Tasks 1-8** — Establish shared infrastructure

1. Create stockflows-v7/ project structure
2. Implement @stockflows/ui shared library (14+ components)
3. Define design tokens and Tailwind config
4. Create demo route structure (mirror 31+ routes)
5. Generate mock data layer (50+ SKUs, 100+ POs)
6. Implement guided tour system
7. Build website package (landing page)
8. Update build pipeline (Turborepo, CI/CD)

### Phase 1: Website Implementation (Tasks 9-15)
**Tasks 9-15** — Complete public landing page

9. Implement hero section (headline, subcopy, CTAs)
10. Implement problem statement section
11. Implement feature showcase grid
12. Implement comparison matrix
13. Implement customer logos carousel
14. Implement navigation and footer
15. Deploy website to Cloudflare Pages

### Phase 2: Demo Implementation (Tasks 16-23)
**Tasks 16-23** — Complete interactive demo app

16. Implement dashboard route
17. Implement inventory routes (list, detail, transfer, adjust)
18. Implement purchasing routes (PO list, detail, receive, vendors)
19. Implement forecasting route
20. Implement reports route
21. Implement settings route
22. Integrate MockDataProvider (context provider)
23. Build and deploy demo to Cloudflare Pages

### Phase 3: App Upgrade (Tasks 24-30)
**Tasks 24-30** — Apply design system to Shopify app

24. Update design tokens in app
25. Replace icons with Material Symbols
26. Polish dashboard route
27. Polish inventory routes
28. Polish purchasing routes
29. Polish forecasting and reports routes
30. Deploy upgraded app to Fly.io

### Phase 4: Integration & Testing (Tasks 31-35)
**Tasks 31-35** — Cross-project testing and optimization

31. Write website E2E tests
32. Write demo E2E tests
33. Update existing app E2E tests
34. Performance optimization
35. SEO audit for website

---

## Definition of Done

### Architecture Gates
- [ ] `stockflows-v7/` created as new subproject folder with proper structure
- [ ] `@stockflows/ui` package exports design tokens and reusable components (14+)
- [ ] Three deployable targets: `app/` (Fly.io), `packages/website/` (Cloudflare Pages), `packages/demo/` (Cloudflare Pages)
- [ ] Design tokens defined once in `packages/stockflows-ui/src/styles/tokens-v7.css` and consumed by all three subprojects
- [ ] Material Symbols icons integrated (replacing Lucide)

### Website Gates
- [ ] Landing page deployed at stockflows.pages.dev with all sections: Hero, Problem Statement, Feature Showcase, Comparison Matrix, Customer Logos, CTAs
- [ ] Responsive on mobile (375px), tablet (768px), desktop (1280px+)
- [ ] Sticky navigation with smooth scroll and dropdown menus
- [ ] CTAs link to demo app (/demo) and Shopify app install (https://stockflows.fly.dev)
- [ ] Zero JavaScript errors in console

### Demo Gates
- [ ] All 31+ routes from Shopify app mirrored with populated data (50+ SKUs, 100+ POs, forecasts, vendors, transfers)
- [ ] Guided tour system walks through core features (Dashboard, Inventory, Purchasing, Forecasting)
- [ ] Interactive: create/edit/delete items, create POs, receive shipments, run forecasts — all functional
- [ ] No backend required (100% client-side with mock JSON data files)
- [ ] Visual parity with Shopify app (same UI components from `@stockflows/ui`)

### App Gates
- [ ] Design system tokens applied to all 31+ routes
- [ ] Material Symbols icons integrated (replacing Lucide)
- [ ] Visual parity with demo app (shared components from `@stockflows/ui`)
- [ ] All existing functionality preserved (inventory, forecasting, purchasing, reports, settings)
- [ ] Build passes with zero errors (`pnpm run build`)

### Testing Gates
- [ ] Website E2E tests pass (new `e2e/website.spec.ts`)
- [ ] Demo E2E tests pass (new `e2e/demo.spec.ts` with 50+ test cases)
- [ ] Existing app E2E tests updated for new design system (35+ tests)
- [ ] Visual regression tests pass for all three subprojects

---

## Risk Register

### High Risk: Demo Data Volume
**Issue:** Generating 50+ SKUs, 100+ POs, forecasts, vendors with realistic relationships is complex.

**Mitigation:** Create seed script that generates data programmatically (Task 4). Use templates for each model type. Validate with sample queries.

**Timeline Impact:** +3-5 days if data generation is slower than expected.

### High Risk: Route Parity
**Issue:** Mirroring 31+ routes exactly requires understanding each route's full functionality.

**Mitigation:** Read existing app routes carefully (Tasks 16-21). Use shared components from `@stockflows/ui` to ensure parity. Test each route individually.

**Timeline Impact:** +5-7 days if routes are more complex than documented.

### Medium Risk: Design System Adoption
**Issue:** Applying design tokens to 31+ routes requires careful CSS migration.

**Mitigation:** Start with Tasks 24-25 (tokens + icons), then upgrade routes incrementally (Tasks 26-29). Test visual parity with demo throughout.

**Timeline Impact:** +3-5 days if CSS conflicts arise.

### Medium Risk: Tour System Complexity
**Issue:** Guided tour must highlight specific UI elements across 31+ routes.

**Mitigation:** Use existing Tour components (Task 5). Limit tour to core features (Dashboard, Inventory, Purchasing). Use scroll-to + highlight pattern.

**Timeline Impact:** +2-3 days if tour steps are more numerous than planned.

### Low Risk: Deployment Pipeline
**Issue:** Cloudflare Pages deployment may have rate limits or configuration issues.

**Mitigation:** Test deployment early (Tasks 15, 23). Use staging environment. Have fallback to manual deployment.

**Timeline Impact:** +1-2 days if deployment fails initially.

---

## Timeline Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 0: Foundation | Tasks 1-8 | 5-7 days |
| Phase 1: Website | Tasks 9-15 | 4-6 days |
| Phase 2: Demo | Tasks 16-23 | 7-10 days |
| Phase 3: App Upgrade | Tasks 24-30 | 5-7 days |
| Phase 4: Testing | Tasks 31-35 | 3-5 days |
| **Total** | **35 tasks** | **24-35 days** |

---

## Files to Create/Modify Summary

### New Files (85+)
- `stockflows-v7/packages/stockflows-ui/src/styles/tokens-v7.css` (design tokens)
- `stockflows-v7/packages/stockflows-ui/src/components/shared/*.tsx` (6 files)
- `stockflows-v7/packages/stockflows-ui/src/components/website/*.tsx` (6 files)
- `stockflows-v7/packages/website/src/components/LandingPage.tsx`
- `stockflows-v7/packages/website/src/data/website-content.ts`
- `stockflows-v7/packages/demo/src/routes/*.tsx` (31+ route files)
- `stockflows-v7/packages/demo/src/data/*.json` (6 mock data files)
- `stockflows-v7/packages/demo/src/components/GuidedTour.tsx`
- `stockflows-v7/packages/demo/src/components/MockDataProvider.tsx`
- `stockflows-v7/scripts/seed-demo-data.ts`
- `stockflows-v7/e2e/website.spec.ts`
- `stockflows-v7/e2e/demo.spec.ts`

### Modified Files (40+)
- `stockflows-v7/app/tailwind.css` (update with design tokens)
- All 31+ app route files (apply new design tokens + Material Symbols)
- `stockflows-v7/turbo.json` (add tasks)
- `stockflows-v7/pnpm-workspace.yaml` (update packages)

---

## Next Steps

1. **Review this architecture document** with stakeholders
2. **Approve the three subproject structure** (app, website, demo)
3. **Confirm design system scope** (14+ components, design tokens)
4. **Set implementation timeline** (24-35 days for full rollout)
5. **Begin Phase 0** (foundation: design system + scaffold)

---

*This architecture documentation defines StockFlows v7 as three integrated subprojects with complete route mirroring, populated mock data, and a professional design system inspired by Wiz.io. The plan creates a conversion funnel: website (marketing) → demo (preview) → Shopify app (production).*
