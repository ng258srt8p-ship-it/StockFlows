# StockFlows v7 — Gap Analysis & Implementation Plan

**Created:** 2026-07-08  
**Status:** Active  
**Goal:** Close ALL gaps across app, website, demo, and design system for a unified, high-quality product

---

## Executive Summary

The project has **significant gaps** between what's documented as "complete" and what actually exists. The shared design system was built but **never integrated** into the main app. The demo and website are incomplete. Documentation is contradictory. This plan addresses every gap systematically.

---

## PART 1: GAP ANALYSIS

### 1.1 Critical: App Does NOT Use Shared UI Library

**Finding:** Zero imports of `@stockflows/ui` in `app/` directory. The entire design system was built but never wired into the actual Shopify app.

| What Exists | What's Missing |
|---|---|
| `packages/stockflows-ui/` with 14+ components | App uses its own Polaris components directly |
| `tokens-v7.css` with dark theme tokens | App `tailwind.css` only imports Tailwind, not design tokens |
| Shared Button, Card, StatCard, Badge | App re-implements these locally |

**Impact:** No visual consistency between app and the rest of the product.

### 1.2 Critical: Demo Package Missing Core Features

| Feature | Status | Spec Requirement |
|---|---|---|
| 31 demo routes | ✅ 31 files exist | 31 routes |
| MockDataProvider | ❌ Missing | Required for mock data |
| GuidedTour component | ❌ Missing | Interactive tour |
| Zustand state store | ❌ Missing | Client-side state |
| 50+ SKUs in mock data | ❌ Only 10 SKUs | 50+ products |
| Social proof section | ❌ Missing | G2 reviews, testimonials |

### 1.3 Critical: Website Missing Key Sections

| Section | Status |
|---|---|
| Hero with terminal demo | ✅ Exists |
| Problem statement ("The Hidden Cost...") | ⚠️ Partial — text exists but not as a distinct section |
| Customer logos carousel | ⚠️ Text placeholders only (no actual logo images) |
| Feature cards | ✅ Exists |
| Social proof / G2 reviews | ❌ Missing |
| CTA / Pricing | ⚠️ Partial |

### 1.4 High: Design System Has Duplicate Components

`packages/stockflows-ui/src/components/` has conflicting versions:
- `Button.tsx` vs `shared/Button.tsx`
- `Card.tsx` vs `shared/Card.tsx`
- `Badge.tsx` vs `shared/Badge.tsx`
- `StatCard.tsx` vs `shared/StatCard.tsx`
- `FeatureCards.tsx` vs `website/FeatureCards.tsx`
- `ComparisonMatrix.tsx` vs `website/ComparisonMatrix.tsx`
- `CustomerLogos.tsx` vs `website/CustomerLogos.tsx`

**Impact:** Confusion about which version to import, potential inconsistencies.

### 1.5 High: No E2E Tests for Website or Demo

- 83 Playwright spec files — **all test the Shopify app only**
- Zero tests for `packages/website/`
- Zero tests for `packages/demo/`
- No visual regression tests comparing app ↔ demo ↔ website

### 1.6 High: Documentation Contradictions

| Document | Claims | Reality |
|---|---|---|
| PROGRESS.md | "100% COMPLIANT", 83 E2E tests, 307 files | Contradicts IMPLEMENTATION-SUMMARY.md |
| IMPLEMENTATION-SUMMARY.md | "30% complete", demo has 4 routes | More accurate but outdated |
| SPEC.md | Detailed requirements | Many unimplemented |

### 1.7 Medium: App Routes Need Design System Upgrade

Per ARCHITECTURE-V7.md, app routes should have:
- Material Symbols icons (replacing Lucide) — ❌ Not done
- Dark theme design tokens applied — ❌ Not done
- Visual parity with demo — ❌ Not done

### 1.8 Medium: UI/UX Quality Issues

- No unified navigation experience across app/website/demo
- No responsive design testing across breakpoints
- No accessibility (WCAG) compliance verification
- No performance benchmarks
- No loading state consistency
- No error state consistency

---

## PART 2: IMPLEMENTATION PLAN

### Phase 1: Foundation (Days 1-2)
**Goal:** Clean up duplicates, establish single source of truth

| # | Task | Files | Priority |
|---|---|---|---|
| 1.1 | Remove duplicate components in stockflows-ui (keep one canonical version) | `packages/stockflows-ui/src/components/` | Critical |
| 1.2 | Consolidate shared/ vs root component versions | `packages/stockflows-ui/src/components/` | Critical |
| 1.3 | Update `index.ts` exports to point to canonical versions | `packages/stockflows-ui/src/index.ts` | Critical |
| 1.4 | Reconcile PROGRESS.md with actual state | `PROGRESS.md` | High |
| 1.5 | Add `@stockflows/ui` as dependency to app `package.json` | `app/package.json` | Critical |

### Phase 2: App Design System Integration (Days 2-4)
**Goal:** Wire the shared UI library into the Shopify app

| # | Task | Files | Priority |
|---|---|---|---|
| 2.1 | Import `tokens-v7.css` in app's `tailwind.css` | `app/tailwind.css` | Critical |
| 2.2 | Update app layout (`app.tsx`) to use shared Navigation | `app/routes/app.tsx` | Critical |
| 2.3 | Replace local Button/Card/StatCard with `@stockflows/ui` versions in all routes | `app/routes/*.tsx` | Critical |
| 2.4 | Replace Lucide icons with Material Symbols across all routes | `app/routes/*.tsx`, `app/components/*.tsx` | High |
| 2.5 | Apply dark theme tokens to all app components | `app/components/*.tsx` | High |
| 2.6 | Verify build passes with no TypeScript errors | `tsconfig.json` | Critical |

### Phase 3: Demo Package Completion (Days 3-5)
**Goal:** Make the demo a fully functional preview of the app

| # | Task | Files | Priority |
|---|---|---|---|
| 3.1 | Create MockDataProvider with 50+ SKUs | `packages/demo/src/data/` | Critical |
| 3.2 | Create Zustand store for demo state management | `packages/demo/src/store/` | Critical |
| 3.3 | Build GuidedTour component with step-by-step walkthrough | `packages/demo/src/components/` | High |
| 3.4 | Wire all 31 routes to use mock data | `packages/demo/src/routes/` | High |
| 3.5 | Ensure demo routes are functional (not just static) | `packages/demo/src/routes/` | High |

### Phase 4: Website Completion (Days 4-5)
**Goal:** Complete the marketing site with all required sections

| # | Task | Files | Priority |
|---|---|---|---|
| 4.1 | Add real customer logo images (or SVG placeholders) | `packages/website/src/components/` | High |
| 4.2 | Create social proof section (G2 reviews, testimonials) | `packages/website/src/components/` | High |
| 4.3 | Ensure problem statement is a distinct, prominent section | `packages/website/src/App.tsx` | Medium |
| 4.4 | Add pricing section (if required by spec) | `packages/website/src/` | Medium |

### Phase 5: Playwright UI/UX Gap Analysis (Days 5-6)
**Goal:** Use Playwright to systematically identify and document UI/UX issues

| # | Task | Output | Priority |
|---|---|---|---|
| 5.1 | Write Playwright tests for website (all sections render, responsive) | `e2e/website/` | High |
| 5.2 | Write Playwright tests for demo (all routes load, interactions work) | `e2e/demo/` | High |
| 5.3 | Write visual regression tests comparing app ↔ demo ↔ website | `e2e/visual/` | High |
| 5.4 | Write responsive design tests (mobile, tablet, desktop) | `e2e/responsive/` | Medium |
| 5.5 | Write accessibility tests (WCAG 2.1 AA) | `e2e/accessibility/` | Medium |
| 5.6 | Document all failing tests as gaps | `GAPS-REPORT.md` | High |

### Phase 6: Design Unification (Days 6-7)
**Goal:** Ensure consistent look and feel across all three products

| # | Task | Priority |
|---|---|---|
| 6.1 | Align color palette across app/website/demo | High |
| 6.2 | Align typography (font sizes, weights, line heights) | High |
| 6.3 | Align spacing (padding, margins, gaps) | High |
| 6.4 | Align component patterns (cards, buttons, badges) | High |
| 6.5 | Align navigation patterns | High |
| 6.6 | Align loading states and error states | Medium |
| 6.7 | Align empty states | Medium |

### Phase 7: Quality Assurance (Days 7-8)
**Goal:** Final verification that everything works

| # | Task | Priority |
|---|---|---|
| 7.1 | Run full Playwright test suite — all green | Critical |
| 7.2 | TypeScript build check — zero errors | Critical |
| 7.3 | Visual regression — no unexpected differences | High |
| 7.4 | Performance check — no regressions | Medium |
| 7.5 | Update PROGRESS.md with accurate status | High |
| 7.6 | Deploy to staging and verify | High |

---

## PART 3: PLAYWRIGHT UI/UX TEST STRATEGY

### Test Categories

1. **Visual Regression** — Screenshot comparisons across breakpoints
2. **Responsive Design** — Mobile (375px), Tablet (768px), Desktop (1440px)
3. **Accessibility** — WCAG 2.1 AA compliance (axe-core integration)
4. **Cross-Product Consistency** — Compare same elements across app/website/demo
5. **Interaction Testing** — Hover states, focus states, click feedback
6. **Loading States** — Skeleton screens, spinners, error states
7. **Performance** — Core Web Vitals (LCP, FID, CLS)

### Playwright Config Updates Needed

- Add website base URL to playwright config
- Add demo base URL to playwright config
- Configure screenshot comparison thresholds
- Add axe-core accessibility plugin
- Set up visual regression baseline directory

---

## PART 4: SUCCESS CRITERIA

| Criterion | Target |
|---|---|
| App uses `@stockflows/ui` | 100% of shared components |
| Design tokens applied | All three products |
| Demo functional routes | 31/31 |
| Demo SKUs | 50+ |
| Website sections complete | All spec sections present |
| E2E tests (total) | 100+ (app + website + demo) |
| Visual regression | Zero unexpected diffs |
| Accessibility | WCAG 2.1 AA |
| TypeScript errors | 0 |
| Build status | PASS |
| Documentation | Accurate and up-to-date |

---

## Estimated Effort

- **Phase 1-2 (Foundation + App Integration):** 3-4 days
- **Phase 3-4 (Demo + Website):** 2-3 days
- **Phase 5-6 (Playwright + Design Unification):** 2-3 days
- **Phase 7 (QA):** 1-2 days
- **Total:** 8-12 days

---

## PART 5: BUSINESS CONTEXT & REVENUE IMPACT

### 5.1 Market Opportunity

Stocky (Shopify's native inventory management tool) is sunsetting its primary capabilities. This creates a **time-sensitive acquisition window** for inventory management apps on the Shopify App Store. Every day StockFlows is not production-ready with a polished storefront (website + demo) is a day merchants migrate to competitors or remain on inadequate solutions.

**Key market dynamics:**
- Stocky deprecation removes the default option for 100,000+ Shopify merchants
- Merchants actively searching for replacements generate high-intent traffic
- First movers with professional presentation capture disproportionate market share
- The Shopify App Store listing requires a working demo and compelling landing page

### 5.2 Revenue Impact of Each Gap

| Gap | Revenue Impact | Urgency |
|---|---|---|
| App does not use shared UI library | Low direct revenue impact, but undermines brand trust and perceived quality | Medium |
| Demo missing core features | **HIGH** -- merchants cannot evaluate the product before installing; directly reduces conversion from website visitors to app installs | Critical |
| Website missing sections | **HIGH** -- incomplete marketing site reduces organic traffic capture and conversion | Critical |
| No E2E tests for website/demo | Medium -- undetected regressions erode merchant trust over time | Medium |
| Documentation contradictions | Low external impact, but high internal cost (misleads developers, wastes time) | Low |

### 5.3 Competitive Positioning

StockFlows differentiates on three axes:
1. **Modern design** (Wiz.io-inspired dark theme) vs. Polaris-default competitors
2. **Full-featured demo** (try before you install) vs. competitors with static screenshots
3. **Stocky migration path** (comparison matrix, audit ledger) vs. generic inventory tools

If the demo and website remain incomplete, StockFlows loses all three differentiators and becomes indistinguishable from basic inventory apps.

### 5.4 The Documentation Credibility Problem

PROGRESS.md claims "100% COMPLIANT" while IMPLEMENTATION-SUMMARY.md states "30% complete." This contradiction is not merely an internal documentation issue -- it represents a **governance failure** that could:
- Cause developers to skip work they believe is already done
- Lead to incorrect status reports to stakeholders or investors
- Result in shipping incomplete features marked as "complete"

**Recommendation:** Reconcile all status documents as the FIRST action in Phase 1, before any code changes.

---

## PART 6: RISK ASSESSMENT

### 6.1 Risk Matrix

| Risk | Probability | Impact | Severity | Mitigation |
|---|---|---|---|---|
| **Design system integration breaks existing app functionality** | Medium | High | High | Create feature branch; run full test suite before merge; maintain rollback capability |
| **Mock data generation for 50+ SKUs takes longer than estimated** | High | Medium | High | Use programmatic data generation (seed script); start with 30 SKUs as minimum viable, expand to 50+ |
| **31 demo routes require more complex wiring than expected** | High | High | Critical | Prioritize 8 core routes (Dashboard, Inventory CRUD, Purchasing, Forecasting); defer system routes (webhooks, health checks) |
| **Shopify review team rejects app for UX inconsistencies** | Medium | High | High | Maintain visual parity checklists; test against Shopify App Store guidelines before submission |
| **Cloudflare Pages deployment fails or has CDN caching issues** | Low | Medium | Low | Test deployment in Phase 1; maintain manual deploy fallback |
| **Lucide-to-Material Symbols migration introduces icon regressions** | Medium | Medium | Medium | Create icon mapping spreadsheet; test each route visually after migration |
| **Dark theme causes contrast failures (WCAG)** | Medium | High | High | Run axe-core accessibility audit after every theme change; fix critical issues immediately |
| **Scope creep -- adding features beyond gap closure** | High | Medium | High | Strictly enforce "gap closure only" scope; log new feature ideas in a separate backlog |
| **Developer fatigue from 31-route demo parity work** | Medium | Medium | Medium | Break into small PRs (2-3 routes per PR); celebrate incremental milestones |

### 6.2 Critical Dependencies

| Dependency | Blocks | Risk if Delayed |
|---|---|---|
| Phase 1 (duplicate cleanup) | All subsequent phases | Cannot proceed -- import paths will conflict |
| Shared UI library integration | App design upgrade, visual parity | Website/demo become the only products using the design system |
| Mock data generation | Demo route functionality | 31 routes exist but display empty states |
| Playwright config for website/demo | All Phase 5 testing | Cannot automate testing for website or demo |
| Design token alignment | Visual consistency across products | Each product drifts visually |

### 6.3 Rollback Strategy

Every phase should produce a working state. If a phase introduces regressions:
1. **Phase 1 rollback:** Restore duplicate components; revert index.ts exports
2. **Phase 2 rollback:** Remove @stockflows/ui imports; revert to local Polaris components
3. **Phase 3 rollback:** Revert demo routes to static content
4. **Phase 4 rollback:** Remove incomplete website sections
5. **Phase 5 rollback:** Remove new test files (existing tests unaffected)
6. **Phase 6 rollback:** Revert CSS token changes
7. **Phase 7 rollback:** N/A (verification only)

**Golden rule:** Never merge a phase that breaks the build. Every phase must pass `pnpm run build` before merge.

---

## PART 7: ACCEPTANCE CRITERIA BY PHASE

### Phase 1: Foundation -- Acceptance Criteria

- [ ] Zero duplicate component files in `packages/stockflows-ui/src/components/`
- [ ] Every component has exactly one canonical location
- [ ] `packages/stockflows-ui/src/index.ts` exports all components from canonical locations
- [ ] `app/package.json` includes `@stockflows/ui` as a dependency
- [ ] `pnpm run build` passes with zero TypeScript errors
- [ ] `PROGRESS.md` accurately reflects actual implementation state (no claims of "100% COMPLIANT" if gaps exist)
- [ ] `IMPLEMENTATION-SUMMARY.md` and `PROGRESS.md` are reconciled (same numbers, same status)

### Phase 2: App Design System Integration -- Acceptance Criteria

- [ ] `app/tailwind.css` imports `tokens-v7.css` from `@stockflows/ui`
- [ ] App layout (`app.tsx`) imports shared Navigation from `@stockflows/ui`
- [ ] Zero local re-implementations of Button, Card, StatCard, Badge (all imported from `@stockflows/ui`)
- [ ] All Lucide icon imports replaced with Material Symbols (zero `lucide-react` imports remain in `app/`)
- [ ] Dark theme tokens applied to all app routes (background matches `#0A0B0E`)
- [ ] `pnpm run build` passes with zero TypeScript errors
- [ ] Manual visual inspection of 5 representative routes shows consistent dark theme

### Phase 3: Demo Package Completion -- Acceptance Criteria

- [ ] `MockDataProvider` component exists and provides data to all demo routes
- [ ] Mock data includes 50+ SKUs across categories (Apparel, Footwear, Accessories)
- [ ] Mock data includes 100+ purchase orders with status variety
- [ ] Mock data includes 20+ forecast results across model types
- [ ] Mock data includes 10+ vendor records
- [ ] Zustand store manages client-side state (search, filter, selection)
- [ ] `GuidedTour` component exists with at least 5 tour steps covering core features
- [ ] All 31 demo routes load without errors and display meaningful data (not empty states)
- [ ] Demo runs entirely client-side with no backend dependency
- [ ] `pnpm run build --filter=demo` passes

### Phase 4: Website Completion -- Acceptance Criteria

- [ ] Customer logos section displays actual images (not text placeholders)
- [ ] Social proof section exists with at least 3 testimonial/review entries
- [ ] Problem statement section is visually distinct and prominent (not buried in hero)
- [ ] All CTAs link to correct destinations (demo: `/demo`, install: `stockflows.fly.dev`)
- [ ] Page loads in under 3 seconds on simulated 3G connection
- [ ] Responsive at 375px (mobile), 768px (tablet), 1280px (desktop)
- [ ] Zero console errors on page load

### Phase 5: Playwright UI/UX Gap Analysis -- Acceptance Criteria

- [ ] Playwright config includes website and demo base URLs
- [ ] Website tests cover all sections (hero, features, comparison, logos, social proof, CTA)
- [ ] Demo tests cover all 31 routes (load, render, interact)
- [ ] Visual regression tests exist comparing app, demo, and website
- [ ] Responsive tests verify 3 breakpoints per page
- [ ] Accessibility tests run axe-core with zero critical violations
- [ ] All tests pass (zero flaky tests)
- [ ] Gap report documents all remaining issues with severity ratings

### Phase 6: Design Unification -- Acceptance Criteria

- [ ] Side-by-side screenshots of app, demo, and website show consistent color palette
- [ ] Font sizes, weights, and line heights are identical across products
- [ ] Spacing (padding, margin, gap) follows the 4px baseline grid consistently
- [ ] Component patterns (cards, buttons, badges) are visually identical across products
- [ ] Navigation patterns are consistent (same header style, same active state treatment)
- [ ] Loading states use the same skeleton/spinner pattern
- [ ] Error states use the same alert/badge pattern
- [ ] Empty states use the same illustration and CTA pattern

### Phase 7: Quality Assurance -- Acceptance Criteria

- [ ] `pnpm run build` passes for all packages (app, stockflows-ui, website, demo)
- [ ] Full Playwright suite passes (existing 83 + new website/demo tests)
- [ ] Visual regression baseline updated with no unexpected diffs
- [ ] Lighthouse performance score >= 90 for website and demo
- [ ] Lighthouse accessibility score >= 90 for website and demo
- [ ] `PROGRESS.md` reflects final accurate state
- [ ] Staging deployment verified (all three products accessible via staging URLs)

---

## PART 8: TIMELINE REALISM & BOTTLENECK ANALYSIS

### 8.1 Timeline Comparison

| Source | Estimate | Scope |
|---|---|---|
| This GAP-ANALYSIS-AND-PLAN | 8-12 days | Gap closure only (not new features) |
| ARCHITECTURE-V7.md | 24-35 days | Full implementation from scratch |
| IMPLEMENTATION-SUMMARY.md | 24-35 days | Full implementation |

**Assessment:** The 8-12 day estimate is **optimistic but not unrealistic** IF:
- Scope is strictly limited to gap closure (no new features)
- The 31 demo routes can be wired to existing mock data without rewriting
- No major CSS conflicts arise during design system integration
- One developer works full-time without interruptions

**More realistic estimate: 10-14 days** (accounting for debugging, visual QA, and iteration)

### 8.2 Bottleneck Analysis

**Bottleneck 1: Phase 2 (App Design System Integration) -- 2-3 days**
- Replacing Polaris components with `@stockflows/ui` across 31 routes is mechanical but tedious
- Each route must be visually tested after migration
- Lucide-to-Material Symbols migration requires manual icon mapping
- **Mitigation:** Create an icon mapping spreadsheet first; use find-and-replace where possible

**Bottleneck 2: Phase 3 (Demo Package Completion) -- 2-3 days**
- MockDataProvider + Zustand store must be architected before routes can consume data
- 50+ SKUs of realistic mock data require domain knowledge
- GuidedTour component requires UX design decisions
- **Mitigation:** Generate mock data programmatically; limit tour to 5-7 steps

**Bottleneck 3: Phase 5 (Playwright Tests) -- 1-2 days**
- Writing tests for 31 demo routes plus website sections is volume work
- Visual regression baseline setup requires manual approval of screenshots
- **Mitigation:** Use parameterized tests; batch similar routes together

### 8.3 Critical Path

```
Phase 1 (Foundation)
  └─> Phase 2 (App Integration)
        └─> Phase 6 (Design Unification)
              └─> Phase 7 (QA)

Phase 1 (Foundation)
  └─> Phase 3 (Demo Completion)

Phase 4 (Website Completion) -- can run in parallel with Phase 2-3

Phase 5 (Playwright Tests) -- can begin in parallel with Phase 4
```

**Key insight:** Phases 2, 3, and 4 can partially overlap. Phase 4 (website) has no dependency on Phase 2 or 3 and can start immediately after Phase 1.

### 8.4 Recommended Schedule

| Day | Morning | Afternoon |
|---|---|---|
| Day 1 | Phase 1: Duplicate cleanup | Phase 1: Export consolidation, PROGRESS reconciliation |
| Day 2 | Phase 2: Import tokens, update app.tsx | Phase 2: Replace local components with @stockflows/ui |
| Day 3 | Phase 2: Material Symbols migration | Phase 3: MockDataProvider + Zustand store |
| Day 4 | Phase 3: Wire 31 routes to mock data | Phase 3: GuidedTour component |
| Day 5 | Phase 4: Website completion (parallel) | Phase 5: Playwright config + website tests |
| Day 6 | Phase 5: Demo Playwright tests | Phase 5: Visual regression tests |
| Day 7 | Phase 6: Design unification fixes | Phase 6: Responsive/accessibility fixes |
| Day 8 | Phase 7: Full test suite run | Phase 7: Staging deployment + verification |
| Day 9 | Buffer: Fix any failing tests | Buffer: Visual QA iterations |
| Day 10 | Buffer: Documentation updates | Buffer: Final stakeholder review |

---

## PART 9: STAKEHOLDER CONSIDERATIONS

### 9.1 Merchant Experience (End User)

Merchants interact with three touchpoints in sequence:
1. **Website** (discovery) -- must immediately communicate value proposition and Stocky migration urgency
2. **Demo** (evaluation) -- must feel like a real product, not a prototype; merchants should be able to complete a workflow
3. **App** (production) -- must work flawlessly; any regression in existing functionality will cause churn

**What merchants notice:**
- If the website looks different from the demo, trust is broken
- If the demo has empty states or broken interactions, merchants assume the app is similarly broken
- If the app has visual inconsistencies after an update, merchants question stability
- Loading speed matters: merchants will abandon slow demos

### 9.2 Shopify Review Team

Shopify's app review process checks:
1. **App functionality** -- all features must work as described in the listing
2. **UI/UX quality** -- no broken layouts, no missing states, consistent Polaris usage (or intentional deviation with justification)
3. **Performance** -- pages load within acceptable thresholds
4. **Security** -- no exposed API keys, proper authentication flows
5. **Privacy** -- clear data handling, GDPR compliance
6. **Billing accuracy** -- if monetized, billing must match description

**Specific risks for StockFlows:**
- The shift from Polaris to a custom dark theme may raise questions during review; be prepared to justify the design decision
- The demo app must not require Shopify authentication (it is standalone)
- The website must not make claims that cannot be verified in the app

### 9.3 Internal Development Team

- PROGRESS.md contradictions create confusion; developers may distrust status reports
- The "100% COMPLIANT" claim in PROGRESS.md should be replaced with an honest status once gaps are documented
- Each phase should have a clear "definition of done" to prevent scope creep

### 9.4 Investors / Leadership

- The 8-12 day timeline should be communicated as "gap closure" not "full build"
- The Stocky deprecation window is a competitive advantage that is time-limited
- A polished demo and website are prerequisites for marketing spend (paid ads, content marketing)

---

## PART 10: QUICK WINS (< 1 DAY, HIGH IMPACT)

### 10.1 Quick Win #1: Reconcile PROGRESS.md (1-2 hours)

**Action:** Update PROGRESS.md to accurately reflect the current state as documented in this gap analysis.
**Impact:** Eliminates documentation confusion; enables accurate planning.
**Effort:** Low -- no code changes, just documentation.
**Priority:** Do this FIRST.

### 10.2 Quick Win #2: Import @stockflows/ui as App Dependency (30 minutes)

**Action:** Add `@stockflows/ui` to `app/package.json` and verify the import resolves.
**Impact:** Unblocks all Phase 2 work; enables incremental adoption.
**Effort:** Very low -- one line in package.json plus pnpm install.
**Priority:** Do this in Phase 1.

### 10.3 Quick Win #3: Import tokens-v7.css in App Tailwind (30 minutes)

**Action:** Add `@import "@stockflows/ui/styles/tokens-v7.css"` to `app/tailwind.css`.
**Impact:** Design tokens become available to all app components; immediate visual improvement possible.
**Effort:** Very low -- one import statement.
**Priority:** Do this at start of Phase 2.

### 10.4 Quick Win #4: Create MockDataProvider Skeleton (2 hours)

**Action:** Create a `MockDataProvider` React context that wraps demo routes with mock data.
**Impact:** All 31 demo routes can immediately consume data instead of showing empty states.
**Effort:** Low -- standard React context pattern.
**Priority:** Do this at start of Phase 3.

### 10.5 Quick Win #5: Add Website Social Proof Section (3 hours)

**Action:** Add a testimonials/reviews section to the website using placeholder content.
**Impact:** Fills a critical gap in the marketing funnel; immediately improves credibility.
**Effort:** Low -- component exists in `@stockflows/ui` as `CustomerLogos`.
**Priority:** Do this during Phase 4.

### 10.6 Quick Win #6: Fix Customer Logos from Text to Images (1 hour)

**Action:** Replace text placeholders in `CustomerLogos` with SVG logo images.
**Impact:** Website looks professional instead of unfinished.
**Effort:** Low -- SVG files are freely available for public companies.
**Priority:** Do this during Phase 4.

---

## PART 11: PLAYWRIGHT TEST STRATEGY -- DETAILED

### 11.1 Test Infrastructure Setup

**Playwright Config Updates:**

```typescript
// playwright.config.ts additions
export default defineConfig({
  projects: [
    { name: 'app', testDir: './e2e/app' },
    { name: 'website', testDir: './e2e/website' },
    { name: 'demo', testDir: './e2e/demo' },
    { name: 'visual', testDir: './e2e/visual' },
    { name: 'responsive', testDir: './e2e/responsive' },
    { name: 'accessibility', testDir: './e2e/accessibility' },
  ],
  use: {
    baseURL: {
      app: 'http://localhost:3000',
      website: 'http://localhost:5173',
      demo: 'http://localhost:5174',
    },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
```

### 11.2 Website Test Scenarios

**File:** `e2e/website/landing-page.spec.ts`

| Test ID | Scenario | Selector Strategy | Assertion |
|---|---|---|---|
| WEB-001 | Hero section renders with headline | `[data-testid="hero-section"] h1` | Text contains "Stocky is Sunsetting" |
| WEB-002 | Hero CTA "Launch Shopify App" links correctly | `a:has-text("Launch Shopify App")` | `href` contains `stockflows.fly.dev` |
| WEB-003 | Hero CTA "Try Live Demo" links correctly | `a:has-text("Try Live Demo")` | `href` contains `/demo` |
| WEB-004 | Feature cards render (3 cards) | `[data-testid="feature-card"]` | Count equals 3 |
| WEB-005 | Feature card hover state changes border | `page.hover('[data-testid="feature-card"]')` | CSS `border-color` changes to accent |
| WEB-006 | Comparison matrix renders | `[data-testid="comparison-matrix"]` | Visible with Stocky and StockFlows columns |
| WEB-007 | Customer logos section renders | `[data-testid="customer-logos"]` | Contains at least 3 logo images |
| WEB-008 | Social proof section renders | `[data-testid="social-proof"]` | Contains at least 1 review/testimonial |
| WEB-009 | Footer renders with legal links | `footer` | Contains Privacy, Terms, Support links |
| WEB-010 | Navigation is sticky on scroll | `page.evaluate(() => window.scrollBy(0, 500))` | Nav element `position: sticky` or `fixed` |
| WEB-011 | Page loads in under 3 seconds | `page.goto(url, { waitUntil: 'networkidle' })` | `Date.now() - startTime < 3000` |
| WEB-012 | Zero console errors | `page.on('console', msg => ...)` | No `error` level messages |

### 11.3 Demo Test Scenarios

**File:** `e2e/demo/routes.spec.ts`

| Test ID | Scenario | Selector Strategy | Assertion |
|---|---|---|---|
| DEMO-001 | Dashboard loads with KPI cards | `[data-testid="stat-card"]` | At least 3 KPI cards visible |
| DEMO-002 | Dashboard shows recent activity | `[data-testid="activity-feed"]` | Contains at least 1 activity item |
| DEMO-003 | Inventory list loads with 50+ items | `table tbody tr` | Row count >= 50 |
| DEMO-004 | Inventory search filters results | `input[placeholder*="Search"]` + type "T-shirt" | Row count decreases |
| DEMO-005 | Inventory detail page loads | Click first table row | Detail view renders with item data |
| DEMO-006 | Stock transfer form loads | Navigate to transfer route | Form fields visible (item, quantity, location) |
| DEMO-007 | Adjust stock form loads | Navigate to adjust route | Form fields visible (item, adjustment, reason) |
| DEMO-008 | PO list loads with 100+ items | `table tbody tr` | Row count >= 100 |
| DEMO-009 | PO status filters work | Click "Waiting" filter | Only "Waiting" status POs shown |
| DEMO-010 | PO detail page loads | Click first PO row | Detail view renders with line items |
| DEMO-011 | Vendor list loads | Navigate to vendors route | At least 10 vendor entries |
| DEMO-012 | Forecasting page loads | Navigate to forecasting route | Forecast cards and chart visible |
| DEMO-013 | Forecast chart renders | `svg.recharts-surface` | Chart element exists and has data points |
| DEMO-014 | Reports page loads | Navigate to reports route | Export buttons visible (CSV, PDF) |
| DEMO-015 | Settings page loads | Navigate to settings route | Settings sections visible |
| DEMO-016 | Guided tour launches | Click "Start Tour" button | Tour overlay visible with step 1 |
| DEMO-017 | Guided tour advances | Click "Next" in tour | Step 2 content visible |
| DEMO-018 | Guided tour completes | Click through all steps | Tour overlay dismissed |
| DEMO-019 | All 31 routes load without errors | Iterate all routes | Zero console errors per route |
| DEMO-020 | Sidebar navigation works | Click each sidebar link | Route changes, content updates |

### 11.4 Visual Regression Test Scenarios

**File:** `e2e/visual/cross-product.spec.ts`

| Test ID | Scenario | Approach |
|---|---|---|
| VIS-001 | App dashboard matches demo dashboard | Screenshot comparison with `expect(page).toHaveScreenshot()` |
| VIS-002 | Website hero section renders consistently | Screenshot at 1280px width |
| VIS-003 | App inventory list matches demo inventory list | Screenshot comparison |
| VIS-004 | Shared Button component looks identical in app and demo | Component-level screenshot |
| VIS-005 | Shared Badge component looks identical in app and demo | Component-level screenshot |
| VIS-006 | Shared Card component looks identical in app and demo | Component-level screenshot |
| VIS-007 | Navigation header is consistent across products | Screenshot comparison |

### 11.5 Responsive Design Test Scenarios

**File:** `e2e/responsive/breakpoints.spec.ts`

| Test ID | Viewport | Page | Assertion |
|---|---|---|---|
| RES-001 | 375px (mobile) | Website | Hero text readable, CTAs accessible, no horizontal overflow |
| RES-002 | 768px (tablet) | Website | Feature cards stack vertically, logos visible |
| RES-003 | 1280px (desktop) | Website | Full layout renders, navigation horizontal |
| RES-004 | 375px (mobile) | Demo | Sidebar collapses to hamburger, content fills width |
| RES-005 | 768px (tablet) | Demo | Sidebar visible, content area adequate |
| RES-006 | 1280px (desktop) | Demo | Full sidebar + content layout |
| RES-007 | 375px (mobile) | App | Dashboard KPIs stack vertically |
| RES-008 | 768px (tablet) | App | KPIs in 2-column grid |
| RES-009 | 1280px (desktop) | App | Full dashboard layout |
| RES-010 | All viewports | All pages | No horizontal scroll on any page |

### 11.6 Accessibility Test Scenarios

**File:** `e2e/accessibility/wcag.spec.ts`

| Test ID | Scenario | Tool | Standard |
|---|---|---|---|
| A11Y-001 | Website homepage passes axe-core | `@axe-core/playwright` | WCAG 2.1 AA |
| A11Y-002 | Demo dashboard passes axe-core | `@axe-core/playwright` | WCAG 2.1 AA |
| A11Y-003 | App dashboard passes axe-core | `@axe-core/playwright` | WCAG 2.1 AA |
| A11Y-004 | All interactive elements are keyboard accessible | `page.keyboard.press('Tab')` | Focus visible on all elements |
| A11Y-005 | All images have alt text | axe-core `image-alt` rule | Zero violations |
| A11Y-006 | Color contrast meets 4.5:1 ratio | axe-core `color-contrast` rule | Zero violations |
| A11Y-007 | Form inputs have associated labels | axe-core `label` rule | Zero violations |
| A11Y-008 | Page titles are descriptive | `page.title()` | Non-empty, descriptive title |

### 11.7 Interaction Test Scenarios

**File:** `e2e/interaction/states.spec.ts`

| Test ID | Scenario | Selector | Assertion |
|---|---|---|---|
| INT-001 | Button hover state changes appearance | `button:has-text("Save")` | Background color changes on hover |
| INT-002 | Button focus state shows outline | `button:focus` | Visible focus ring (2px outline) |
| INT-003 | Button click provides feedback | Click button | Loading spinner or disabled state appears |
| INT-004 | Table row hover highlights row | `table tbody tr:hover` | Background color changes |
| INT-005 | Modal opens on trigger click | Click "New PO" button | Modal overlay visible |
| INT-006 | Modal closes on escape key | `page.keyboard.press('Escape')` | Modal overlay hidden |
| INT-007 | Modal closes on backdrop click | Click outside modal | Modal overlay hidden |
| INT-008 | Toast notification appears after action | Complete an action | Toast visible within 1 second |
| INT-009 | Loading skeleton shows during data fetch | Navigate to data-heavy route | Skeleton visible before data loads |
| INT-010 | Error state shows on failed request | Mock network failure | Error message visible with retry option |

---

## PART 12: GAP ANALYSIS CORRECTIONS & ADDITIONS

### 12.1 Gaps the Original Plan Missed

| Gap | Severity | Description |
|---|---|---|
| **No rollback strategy** | High | The plan has no mention of what to do if a phase introduces regressions |
| **No dependency mapping** | High | Phases have implicit dependencies that are not documented |
| **No Shopify review preparation** | Medium | The app must pass Shopify's review process; no preparation is planned |
| **No performance benchmarks** | Medium | No baseline measurements exist; "no regressions" is unverifiable without baselines |
| **No SEO implementation for website** | Medium | ARCHITECTURE-V7.md mentions SEO audit, but the gap plan does not address meta tags, structured data, or sitemap |
| **No monitoring/analytics plan** | Low | Post-deployment, how will success be measured? |
| **No staging environment verification** | Medium | Phase 7 mentions staging but provides no criteria for staging success |
| **No data seeding script for demo** | Medium | Mock data needs a repeatable generation process, not hand-crafted JSON |
| **No component-level testing** | Low | Unit tests for shared components would catch regressions faster than E2E |
| **No A/B testing infrastructure** | Low | Website conversion optimization requires testing capability |

### 12.2 Priority Reassessment

The original plan's priorities are largely correct but need adjustment:

| Original Priority | Revised Priority | Rationale |
|---|---|---|
| Phase 1: Critical | Phase 1: Critical | Correct -- foundation must come first |
| Phase 2: Critical | Phase 2: Critical | Correct -- app integration is core value |
| Phase 3: High | Phase 3: **Critical** | Demo is the primary conversion tool; must be complete |
| Phase 4: High | Phase 4: **Critical** | Website is the merchant acquisition funnel; incomplete = lost revenue |
| Phase 5: High | Phase 5: High | Important but can be partially deferred |
| Phase 6: High | Phase 6: Medium | Design polish is important but functional completeness comes first |
| Phase 7: Critical | Phase 7: Critical | Correct -- final verification is non-negotiable |

---

## PART 8: UI/UX DESIGN REVIEW

**Reviewer:** Senior UI/UX Designer
**Date:** 2026-07-07
**Scope:** Cross-product visual consistency, accessibility, responsive design, typography, color, spacing, component states, and animation across App, Website, Demo, and Shared UI Library

---

### 8.1 CRITICAL: Two Completely Different Themes Running Simultaneously

The single most severe visual issue in the product. The Shopify App runs a **light theme** (v6 legacy) while the Demo and Website run a **dark theme** (v7 Wiz.io-inspired). Merchants who visit the website, then open the demo, then install the app will experience a jarring theme switch.

**Evidence:**

| Product | Background | Text | Theme |
|---|---|---|---|
| App (`app/root.tsx` line 120) | `#fafafa` (body style) | `#0F172A` (v6 --sf-text) | **Light** |
| Demo (`packages/demo/src/index.css` lines 4-9) | `var(--bg-primary)` = `#0A0B0E` | `var(--text-primary)` = `#FFFFFF` | **Dark** |
| Website (`packages/website/src/components/LandingPage.tsx` line 99) | `bg-[#0A0B0E]` | `text-[#FFFFFF]` | **Dark** |

**Root cause:** `app/tailwind.css` (lines 1-54) defines v6 light-theme tokens (`--sf-bg: #FAFBFC`, `--sf-text: #0F172A`) and never imports `tokens-v7.css`. The body in `app/root.tsx` (line 120) sets `backgroundColor: "#fafafa"`.

**Mockup fix:** The app body should use `backgroundColor: "#0A0B0E"` and all `--sf-*` tokens should map to v7 dark-theme equivalents. The `app/tailwind.css` should `@import "@stockflows/ui/styles/tokens-v7.css"` and override Polaris variables with dark-theme values.

---

### 8.2 CRITICAL: Three Conflicting Badge Color Systems

Three different `Badge` components define success/warning/error colors differently, causing visual inconsistency when badges appear across products.

| Location | Success | Warning | Error | Border opacity |
|---|---|---|---|---|
| `packages/stockflows-ui/src/components/Badge/Badge.tsx` (lines 7-10) | `#34D399` | `#FBBF24` | `#F87171` | 30% |
| `packages/stockflows-ui/src/components/shared/Badge.tsx` (lines 11-14) | `#10B981` | `#F59E0B` | `#EF4444` | solid |
| `packages/stockflows-ui/src/components/StockBadge/StockBadge.tsx` (lines 17-27) | `#10B981` | `#F59E0B` | `#EF4444` | border-current |

The `tokens-v7.css` (lines 24-27) defines: `--success: #34D399`, `--warning: #FBBF24`, `--danger: #F87171`, `--info: #60A5FA`.

**Impact:** The root Badge matches the tokens. The shared Badge and StockBadge use a completely different color palette (#10B981 vs #34D399 for success, #F59E0B vs #FBBF24 for warning). When a merchant sees a success badge on the website (root Badge) vs. the demo (shared Badge), the green shades will be visibly different.

**Fix:** All Badge components must reference `var(--success)`, `var(--warning)`, `var(--danger)`, `var(--info)` from the token system, not hardcoded hex values.

---

### 8.3 CRITICAL: Three Conflicting Button Variants

The `Button` component exists in three versions with different visual treatments:

| Location | Primary shadow | Hover color | Focus ring |
|---|---|---|---|
| `packages/stockflows-ui/src/components/Button/Button.tsx` (line 18) | `shadow-lg hover:shadow-xl` | `#D4FF5C` | `ring-[#C7FB33] ring-offset-[#0A0B0E]` |
| `packages/stockflows-ui/src/components/shared/Button.tsx` (line 25) | `shadow-[2px_2px_0px_#C7FB33]` | `#D9FF4A` | No focus ring color defined |
| App (`app/root.tsx` line 164) | Polaris default | Polaris default | Polaris default |

**Specific issues:**
- Root Button hover: `#D4FF5C` vs shared Button hover: `#D9FF4A` -- two different light greens
- Root Button: flat shadow (`shadow-lg`) vs shared Button: brutalist offset shadow (`shadow-[2px_2px_0px_#C7FB33]`)
- App uses Polaris buttons entirely -- no dark theme, no neon accent
- Neither the shared nor root Button uses `var(--accent-hover)` from tokens (`#D4FF5C`)

**Fix:** Standardize on the root Button component's approach (matching tokens). The shared Button's brutalist offset shadow is a different design language that conflicts with the Wiz.io-inspired dark theme.

---

### 8.4 CRITICAL: Three Conflicting Card Components

| Location | Border width | Padding | Shadow | Border color |
|---|---|---|---|---|
| `packages/stockflows-ui/src/components/Card/Card.tsx` | 1px | `p-6` | Configurable (sm/md/lg) | `#2A2D35` |
| `packages/stockflows-ui/src/components/shared/Card.tsx` | 2px | `p-6` | `shadow-[2px_2px_0px_#20232A]` | `#20232A` |
| App (Polaris Card) | Polaris default | Polaris default | Polaris shadow | Polaris border |

**Issues:**
- Root Card uses 1px border (`border-[#2A2D35]`) matching token `--border-default`, shared Card uses 2px border (`border-[#20232A]`) -- a non-token color
- Shared Card has a brutalist offset shadow (`shadow-[2px_2px_0px_#20232A]`) that conflicts with the dark theme aesthetic
- App Card is entirely Polaris-styled (light theme, no dark variant)

**Fix:** Remove shared Card or align it with root Card. The brutalist shadow style in shared Card should be replaced with the token-based shadow system (`--shadow-sm/md/lg`).

---

### 8.5 CRITICAL: Chart Colors Violate Design Token System

Two chart components use hardcoded colors that do not exist anywhere in the design token system.

**StockLevelChart** (`app/components/inventory/StockLevelChart.tsx` lines 56, 64):
- `stroke="#0066cc"` -- not in tokens (token blue is `#60A5FA` via `--info`)
- `stroke="#ff6600"` -- not in tokens (token warning is `#FBBF24` via `--warning`)
- `className="bg-gray-50"` -- light theme class on a dark theme component
- `className="text-gray-500"` -- light theme text color

**ForecastChart** (`app/components/forecasting/ForecastChart.tsx` lines 54, 84, 99, 111, 123):
- `text-gray-500` -- light theme text
- `fill="#0066cc11"`, `fill="white"`, `stroke="#0066cc"` -- non-token colors
- `stroke="#008060"` -- Shopify green, not in tokens
- `stroke="#999"` -- neutral gray, not in tokens

**Fix:** All chart colors must use token values: `--accent-primary` (#C7FB33) for primary data, `--info` (#60A5FA) for secondary, `--danger` (#F87171) for alerts, `--success` (#34D399) for positive indicators.

---

### 8.6 CRITICAL: Three Conflicting StatCard Components

| Location | Icon color | Value font | Trend text |
|---|---|---|---|
| `packages/stockflows-ui/src/components/StatCard/StatCard.tsx` (line 28) | `text-[#A0A3AB]` | `text-3xl` | Arrow icons + color |
| `packages/stockflows-ui/src/components/shared/StatCard.tsx` (line 28) | `text-[#C7FB33]` | `text-3xl` | Hardcoded "12%" |
| `app/routes/app._index.tsx` (lines 320-355) | None | `headingLg` (Polaris) | `text-green-600` / `text-red-600` |

**Critical bug:** The shared StatCard (line 33) hardcodes `{trend === 'up' ? '↑' : '↓'} 12%` -- it always shows "12%" regardless of actual trend data. This is a logic error, not just a visual one.

**Additional issue:** The app's inline StatCard (line 336) uses `text-gray-900` for neutral state -- a light-theme color that will be invisible on the v7 dark background (#0A0B0E).

---

### 8.7 HIGH: Typography Font Mismatch

The three products load different font stacks:

| Product | Primary Font | Secondary Font | Mono Font |
|---|---|---|---|
| tokens-v7.css (line 55) | Inter | system-ui | Fira Code |
| app/tailwind.css (line 25) | Plus Jakarta Sans | - | JetBrains Mono |
| app/root.tsx (line 33) | Loads both Inter AND Plus Jakarta Sans via Google Fonts |
| demo/index.css (line 9) | var(--font-sans) = Inter | - | - |
| Website | Uses shared components (Inter) | - | - |

**Issues:**
- The app loads **two** font families (Plus Jakarta Sans at line 33, Inter at line 29 of root.tsx) -- unnecessary font bloat
- The E2E test `pixel-comparison.spec.ts` (line 177) asserts `expect(demoFont).toContain("Inter")` and `expect(shopifyFont).toContain("Inter")` but the app actually renders Plus Jakarta Sans
- The token system says Inter is the canonical font, but the app overrides it with Plus Jakarta Sans
- The serif font (`Playfair Display`) loaded at root.tsx line 33 is never used anywhere

**Fix:** Standardize on Inter (matching tokens-v7.css). Remove Plus Jakarta Sans and Playfair Display font loads from `app/root.tsx`.

---

### 8.8 HIGH: Spacing Inconsistencies Across Components

**Padding inconsistencies:**

| Component | Location | Padding |
|---|---|---|
| App StatCard | `app/routes/app._index.tsx` line 339 | `p-4` (16px) |
| Shared StatCard | `packages/stockflows-ui/src/components/StatCard/StatCard.tsx` line 24 | `p-6` (24px) |
| Root StatCard | `packages/stockflows-ui/src/components/shared/StatCard.tsx` line 24 | `p-6` (24px) |
| App SettingsCard | `app/components/settings/SettingsCard.tsx` line 17 | `p-4` (16px) |
| Root Card | `packages/stockflows-ui/src/components/Card/Card.tsx` line 17 | `p-6` (24px) |
| Root EmptyState | `packages/stockflows-ui/src/components/EmptyState/EmptyState.tsx` line 12 | `py-12` (48px) |
| App EmptyState | `app/components/ui/EmptyState.tsx` line 13 | `p-8` (32px) |

**Gap/margin inconsistencies:**

| Pattern | Location | Value |
|---|---|---|
| Dashboard grid gap | `app/routes/app._index.tsx` line 214 | `gap-4` (16px) |
| Demo grid gap | `packages/demo/src/routes/Dashboard.tsx` line 16 | `gap-4` (16px) -- matches |
| Demo table row gap | `packages/demo/src/routes/Forecasting.tsx` line 36 | `gap-6` (24px) |
| Website feature grid | `packages/stockflows-ui/src/components/FeatureCards/FeatureCards.tsx` line 11 | `gap-8` (32px) |

**Page heading margin inconsistency:**

| Pattern | Location | Margin |
|---|---|---|
| Demo Dashboard | `packages/demo/src/routes/Dashboard.tsx` line 13 | `mb-6` (24px) |
| Demo Forecasting | `packages/demo/src/routes/Forecasting.tsx` line 13 | `mb-8` (32px) |
| Demo Settings | `packages/demo/src/routes/settings.tsx` line 12 | `mb-8` (32px) |
| Shared PageHeader | `packages/stockflows-ui/src/components/PageHeader/PageHeader.tsx` line 12 | `mb-8` (32px) |
| Root EmptyState | `packages/stockflows-ui/src/components/EmptyState/EmptyState.tsx` line 15 | `mb-2` (8px) title, `mb-6` (24px) description |

**Fix:** Establish a spacing scale reference: `--space-1` through `--space-16` in tokens-v7.css. All components should use these values. Key decisions: stat cards should consistently use `p-6`, page headings should consistently use `mb-8`, grid gaps should be `gap-4` on data tables and `gap-6` on card grids.

---

### 8.9 HIGH: Accessibility Issues

#### 8.9.1 Modal Focus Trap Not Implemented

**File:** `packages/stockflows-ui/src/components/Modal.tsx`

The Modal component (lines 57-105) has `role="dialog"` and `aria-modal="true"` but:
- Does not trap focus inside the modal (users can Tab out to background content)
- Does not restore focus to the triggering element on close
- No `aria-labelledby` -- uses `aria-label={title}` but should link to the heading element

#### 8.9.2 Missing Keyboard Navigation for Navigation Dropdown

**File:** `packages/stockflows-ui/src/components/Navigation/Navigation.tsx`

The dropdown (lines 28-52) uses `onClick` for toggle but:
- No `aria-expanded` attribute on the dropdown button
- No `aria-haspopup` attribute
- Dropdown items are `<a>` tags without `role="menuitem"`
- No keyboard support for arrow key navigation within dropdown
- Clicking outside does not close the dropdown (no blur handler)

#### 8.9.3 Tooltip Not Accessible to Screen Readers

**File:** `packages/stockflows-ui/src/components/Tooltip.tsx`

While the Tooltip has `role="tooltip"` (line 62), it:
- Uses `onMouseEnter`/`onMouseLeave` only -- no keyboard equivalent for showing tooltip
- Should use `aria-describedby` on the trigger element linking to the tooltip content
- The 200ms delay (line 30) is fine for mouse but should show immediately on keyboard focus

#### 8.9.4 Empty State Button Lacks Accessible Label

**File:** `packages/stockflows-ui/src/components/EmptyState/EmptyState.tsx` (line 18)

The action button has no `aria-label` and no `type="button"` attribute. If the EmptyState is inside a form, this could trigger form submission.

#### 8.9.5 App Root Loading Indicator Not Announced

**File:** `app/root.tsx` (line 123)

The loading bar (`<div className="fixed top-0 left-0 right-0 h-1 bg-blue-600 animate-pulse z-50" />`) is a purely visual indicator with no `role="progressbar"`, no `aria-valuenow`, and no `aria-label`. Screen readers will not know loading is in progress.

#### 8.9.6 Demo Search Input Has No Label

**File:** `packages/demo/src/routes/InventoryList.tsx` (lines 35-46)

The search input uses `placeholder="Search by SKU or title..."` as its only label. It has no `<label>` element, no `aria-label`, and no `aria-labelledby`. This fails WCAG 1.3.1 (Info and Relationships).

---

### 8.10 HIGH: Responsive Design Gaps

#### 8.10.1 Demo Sidebar Has No Mobile Collapse

**File:** `packages/demo/src/routes/App.tsx` (lines 131-225)

The demo sidebar (lines 133-225) is always visible at 240px (or 64px collapsed). There is:
- No hamburger menu for mobile viewports
- No media query to auto-collapse below 768px
- The sidebar takes 240px + main content, which overflows on screens < 768px
- No touch-friendly tap targets for sidebar items on mobile

**Fix:** Add a responsive hook that auto-collapses sidebar below 768px and shows a hamburger toggle button.

#### 8.10.2 Demo Table Lacks Mobile Horizontal Scroll

**File:** `packages/demo/src/routes/InventoryList.tsx` (lines 50-84)

The inventory table uses `<div className="overflow-x-auto">` which is correct, but the table itself has 7 columns. On mobile (375px), each column becomes too narrow to read. The app's version uses Polaris `IndexTable` which has built-in mobile responsiveness (collapses to stacked cards).

**Fix:** Add a mobile-friendly card layout for the demo inventory table at viewport widths < 640px.

#### 8.10.3 Website Feature Cards Grid Gaps

**File:** `packages/stockflows-ui/src/components/FeatureCards/FeatureCards.tsx` (line 11)

Uses `grid-cols-1 md:grid-cols-3 gap-8`. This is correct for responsive behavior, but:
- No intermediate 2-column breakpoint (e.g., `lg:grid-cols-2` at 768px, `xl:grid-cols-3` at 1024px)
- On tablet (768px-1024px), 3 columns may be too cramped

#### 8.10.4 Website Hero Section Fixed Min-Height

**File:** `packages/stockflows-ui/src/components/HeroSection/HeroSection.tsx` (line 13)

Uses `min-h-screen` which forces the hero to fill the entire viewport. On mobile, this pushes the terminal mockup below the fold, requiring users to scroll to see it. Consider `min-h-[80vh]` on mobile or removing the terminal on small screens.

---

### 8.11 HIGH: Component State Gaps

#### 8.11.1 No Loading States in Demo Routes

The demo routes (`packages/demo/src/routes/`) use static mock data with `useState`. None of them show:
- Skeleton loading states while "data loads"
- Simulated network delays with loading indicators
- Suspense boundaries for lazy-loaded components

The app routes (e.g., `app/routes/app._index.tsx` lines 166-206) properly use `SkeletonPage` and `SkeletonDisplayText` during loading. The demo should mirror this.

#### 8.11.2 No Error States in Demo Routes

The demo routes have no error handling:
- No try/catch around data operations
- No error boundary components
- No retry mechanisms
- No toast/notification system for user feedback

#### 8.11.3 Button Disabled State Missing Focus Indicator

**File:** `packages/stockflows-ui/src/components/Button/Button.tsx` (line 29)

The disabled state uses `opacity-50 cursor-not-allowed` but the focus ring (`focus:ring-2 focus:ring-[#C7FB33]`) still appears on disabled buttons when focused via keyboard. Disabled elements should not be focusable.

**Fix:** Add `focus:ring-0` to the disabled classes or use `tabIndex={-1}` on disabled buttons.

#### 8.11.4 No Hover State on Demo Table Rows

**File:** `packages/demo/src/routes/InventoryList.tsx` (line 65)

The table row has `hover:bg-gray-50` which is a light-theme hover color. On the dark theme background, this will flash white. Should be `hover:bg-[#1C1E24]` (matching `--bg-tertiary`) to stay consistent with the dark theme.

---

### 8.12 HIGH: Animation and Microinteraction Gaps

#### 8.12.1 No CSS Animation for CustomerLogos Marquee

**File:** `packages/stockflows-ui/src/components/CustomerLogos/CustomerLogos.tsx` (line 14)

The component uses `className="flex animate-marquee gap-12 items-center"` but there is no `@keyframes marquee` defined in any CSS file. The logos will appear static, not scrolling.

**Fix:** Add to `tokens-v7.css` or a global CSS file:
```css
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-marquee { animation: marquee 30s linear infinite; }
```

#### 8.12.2 No Page Transition Animations

None of the three products implement page transitions:
- The app uses Remix, which supports view transitions -- none are configured
- The demo uses client-side routing with `useState` -- no enter/exit animations
- The website is a single page -- section transitions could benefit from scroll-triggered animations

#### 8.12.3 Tooltip Has No Entrance Animation

**File:** `packages/stockflows-ui/src/components/Tooltip.tsx`

The tooltip appears/disappears instantly (`isVisible` toggles at line 58). No fade-in or slide-in animation. Compare to the Modal which has `animate-in fade-in zoom-in-95 duration-150` (line 67).

**Fix:** Add `transition-opacity duration-150` and conditionally apply `opacity-0` / `opacity-100` for a smooth fade.

#### 8.12.4 Modal Animation Incomplete

**File:** `packages/stockflows-ui/src/components/Modal.tsx` (line 67)

Uses `animate-in fade-in zoom-in-95 duration-150` for entrance but has no exit animation. When `isOpen` changes to false, the modal simply disappears (returns null at line 49) without a fade-out.

---

### 8.13 MEDIUM: Empty State Inconsistencies

| Component | Icon | Illustration | CTA Button | Padding |
|---|---|---|---|---|
| App EmptyState (`app/components/ui/EmptyState.tsx`) | Emoji string (line 14) | None | Polaris Button (line 23) | `p-8` |
| Root EmptyState (`packages/stockflows-ui/src/components/EmptyState/EmptyState.tsx`) | Material Symbol (line 13) | None | Custom button (line 18) | `py-12` |
| App Polaris EmptyState (app._index.tsx line 261) | None | Shopify CDN image | Polaris action | Polaris default |
| App AlertsList (AlertsList.tsx line 33) | None | Shopify CDN image | Polaris action | Polaris default |

**Issues:**
- The app uses three different empty state patterns (emoji, Material Symbol, Polaris with image)
- The Shopify CDN images (`cdn.shopify.com/s/files/1/0262/4071/2726/files/empty-state.png`) may not load for users outside Shopify's network
- The root EmptyState icon color (`text-[#6B7280]`) is not from the token system (should be `var(--text-tertiary)` = `#6B6F78`)

---

### 8.14 MEDIUM: Skeleton/Loading Color Mismatch

| Component | Background Color | Token Reference |
|---|---|---|
| Root Skeleton (`packages/stockflows-ui/src/components/Skeleton.tsx` line 22) | `bg-[#1E2129]` | Not in tokens |
| Root LoadingSkeleton (line 12) | `bg-[#1E2129]` | Not in tokens |
| App Skeleton (Polaris) | Polaris default gray | Not dark-theme aware |

The skeleton background `#1E2129` is not defined in `tokens-v7.css`. It should map to a token like `--bg-tertiary` (#1C1E24) or a new `--skeleton` token.

---

### 8.15 MEDIUM: Color Usage Violations Summary

| Issue | Location | Current | Should Be (token) |
|---|---|---|---|
| StatCard trend positive | `app/routes/app._index.tsx` line 333 | `text-green-600` | `var(--success)` / `#34D399` |
| StatCard trend negative | `app/routes/app._index.tsx` line 335 | `text-red-600` | `var(--danger)` / `#F87171` |
| StatCard trend neutral | `app/routes/app._index.tsx` line 336 | `text-gray-900` | `var(--text-secondary)` / `#A0A3AB` |
| Dashboard "View all" link | `app/routes/app._index.tsx` line 256 | `text-blue-600` | `var(--accent-primary)` / `#C7FB33` |
| ForecastChart title | `app/components/forecasting/ForecastChart.tsx` line 54 | `text-gray-500` | `var(--text-tertiary)` / `#6B6F78` |
| StockLevelChart empty | `app/components/inventory/StockLevelChart.tsx` line 29 | `bg-gray-50` | `var(--bg-secondary)` / `#14161B` |
| StockLevelChart empty text | `app/components/inventory/StockLevelChart.tsx` line 31 | `text-gray-500` | `var(--text-tertiary)` / `#6B6F78` |
| BarcodeScanner HID area | `app/components/receiving/BarcodeScanner.tsx` line 189 | `bg-blue-50` | `var(--bg-tertiary)` / `#1C1E24` |
| BarcodeScanner scan result | `app/components/receiving/BarcodeScanner.tsx` line 245 | `bg-green-50` | `var(--accent-muted)` / `rgba(199,251,51,0.15)` |
| Demo table row hover | `packages/demo/src/routes/InventoryList.tsx` line 65 | `hover:bg-gray-50` | `hover:bg-[#1C1E24]` |
| Settings border | `app/routes/app.settings.tsx` line 309, 330 | `border-gray-200` | `var(--border-default)` / `#2A2D35` |
| Settings save border | `app/routes/app.settings.tsx` line 372 | `border-gray-200` | `var(--border-default)` / `#2A2D35` |
| Loading bar | `app/root.tsx` line 123 | `bg-blue-600` | `bg-[var(--accent-primary)]` / `#C7FB33` |

**Total: 13 hardcoded color violations** in the app that use light-theme Tailwind classes instead of dark-theme design tokens.

---

### 8.16 MEDIUM: E2E Visual Tests Have Incorrect Font Assertion

**File:** `e2e/pixel-comparison.spec.ts` (lines 168-179)

Test 13 asserts:
```typescript
expect(demoFont).toContain("Inter");
expect(shopifyFont).toContain("Inter");
```

But the app's `root.tsx` loads Plus Jakarta Sans as the primary font. This test will either:
- Pass incorrectly (if the browser falls back to Inter)
- Fail (if Plus Jakarta Sans loads successfully)

The test should assert against the actual font being used. If the design decision is to use Inter (per tokens-v7.css), then the app's font stack needs to change. If Plus Jakarta Sans is intentional, the test and tokens need updating.

---

### 8.17 MEDIUM: PageHeader Component Differences

| Location | Title size | Subtitle style | Breadcrumbs |
|---|---|---|---|
| Root PageHeader (`packages/stockflows-ui/src/components/PageHeader/PageHeader.tsx`) | `text-3xl font-bold` | `text-[#A0A3AB] mt-2` | Material Symbol `/` separator, `hover:text-[#C7FB33]` |
| App PageHeader (`app/components/ui/PageHeader.tsx`) | Polaris `Page` title | Polaris subtitle | Polaris breadcrumbs |
| Demo headings (various) | Mix of `text-2xl` and `text-3xl` | No subtitle | No breadcrumbs |

**Issues:**
- Demo Dashboard uses `text-2xl` (line 13), Demo Settings uses `text-3xl` (line 12), Demo Purchasing uses `text-3xl` (line 20) -- inconsistent heading sizes
- The root PageHeader breadcrumb separator uses a Material Symbol `/` character, which may render differently across platforms

---

### 8.18 MEDIUM: Duplicate Component Cleanup Required

The following components exist in multiple locations within `packages/stockflows-ui/src/components/`:

| Component | Root Version | Shared Version | Website Version |
|---|---|---|---|
| Button | `Button/Button.tsx` | `shared/Button.tsx` | -- |
| Card | `Card/Card.tsx` | `shared/Card.tsx` | -- |
| Badge | `Badge/Badge.tsx` | `shared/Badge.tsx` | -- |
| StatCard | `StatCard/StatCard.tsx` | `shared/StatCard.tsx` | -- |
| FeatureCards | `FeatureCards/FeatureCards.tsx` | -- | `website/FeatureCards.tsx` |
| ComparisonMatrix | `ComparisonMatrix/ComparisonMatrix.tsx` | -- | `website/ComparisonMatrix.tsx` |
| CustomerLogos | `CustomerLogos/CustomerLogos.tsx` | -- | `website/CustomerLogos.tsx` |
| Footer | `Footer/Footer.tsx` | -- | `website/Footer.tsx` |

The demo imports from `@stockflows/ui` which may resolve to either version depending on the package's `index.ts` exports. This must be deduplicated to a single canonical version per component.

---

### 8.19 LOW: Visual Polish Items

#### 8.19.1 Website Customer Logos Show Text Instead of Images

**File:** `packages/website/src/components/LandingPage.tsx` (lines 83-90)

Customer logos are defined with `src: ""` (empty strings). The `CustomerLogos` component renders `logo.name` as text inside gray boxes. This looks unfinished and unprofessional.

**Fix:** Use SVG logos or at minimum styled text that resembles actual brand marks.

#### 8.19.2 Website Heading Makes Unverifiable Claim

**File:** `packages/stockflows-ui/src/components/CustomerLogos/CustomerLogos.tsx` (line 6)

Default heading: `"Trusted by more than 50% of Fortune 100 companies"` -- with no actual customer logos, this claim is not substantiated and could be seen as misleading.

#### 8.19.3 Demo Shared StatCard Hardcoded Trend Value

**File:** `packages/stockflows-ui/src/components/shared/StatCard.tsx` (line 33)

Hardcoded `{trend === 'up' ? '↑' : '↓'} 12%` -- should display actual trend data or be removed.

#### 8.19.4 App Loading Bar Uses Wrong Color

**File:** `app/root.tsx` (line 123)

`bg-blue-600` -- the loading bar should use the accent color (`#C7FB33`) for brand consistency.

---

### 8.20 Design System Recommendations

#### 8.20.1 Immediate Actions (This Sprint)

1. **Import tokens-v7.css into app/tailwind.css** -- one import statement unifies the token system
2. **Remove Plus Jakarta Sans font load** from `app/root.tsx` -- standardize on Inter
3. **Fix the 13 hardcoded color violations** in app components -- replace with token references
4. **Fix the shared StatCard hardcoded "12%"** bug
5. **Add marquee CSS animation** for CustomerLogos

#### 8.20.2 Short-Term Actions (Next 2 Weeks)

1. **Migrate app from light to dark theme** -- this is the single highest-impact visual change
2. **Deduplicate Badge, Button, Card, StatCard** components -- keep one canonical version
3. **Fix chart colors** in StockLevelChart and ForecastChart to use tokens
4. **Add Modal focus trap** and restore focus on close
5. **Add keyboard navigation** to Navigation dropdown
6. **Add aria-label to demo search inputs**

#### 8.20.3 Medium-Term Actions (Next Month)

1. **Add responsive sidebar** to demo (hamburger menu for mobile)
2. **Add loading/error states** to all demo routes
3. **Add page transition animations** (Remix View Transitions API)
4. **Add tooltip entrance animation**
5. **Create mobile card layout** for demo tables
6. **Replace Shopify CDN empty state images** with custom illustrations
7. **Add WCAG 2.1 AA audit** with axe-core across all three products

---

### 8.21 Cross-Product Visual Consistency Scorecard

| Aspect | App vs Demo | App vs Website | Demo vs Website | Score |
|---|---|---|---|---|
| Color palette | FAIL (light vs dark) | FAIL (light vs dark) | PASS (both dark) | 1/3 |
| Typography | FAIL (Plus Jakarta Sans vs Inter) | FAIL (Plus Jakarta Sans vs Inter) | PASS (both Inter) | 1/3 |
| Badge colors | FAIL (Polaris vs custom) | N/A | FAIL (3 different palettes) | 0/3 |
| Button styles | FAIL (Polaris vs custom) | N/A | FAIL (2 custom variants) | 0/3 |
| Card styles | FAIL (Polaris vs custom) | N/A | FAIL (1px vs 2px border) | 0/3 |
| Spacing | PARTIAL (similar patterns) | N/A | PARTIAL (inconsistent gaps) | 1/3 |
| Loading states | PASS (both use skeletons) | N/A | FAIL (demo has none) | 1/3 |
| Empty states | FAIL (3 different patterns) | N/A | FAIL (none in demo) | 0/3 |
| Responsive | PASS (both use Tailwind grid) | PASS (both responsive) | FAIL (demo has no mobile nav) | 2/3 |
| Accessibility | PARTIAL (Polaris helps) | N/A | FAIL (missing ARIA) | 1/3 |

**Overall visual consistency score: 7/30 (23%)** -- The three products are visually disconnected.

---

## Notes

- This plan assumes no changes to the backend/business logic
- Focus is purely on frontend, design system, and quality
- Each phase should be verified before moving to the next
- The Playwright tests from Phase 5 should be run continuously throughout
- **NEW:** Every phase must produce a buildable state (`pnpm run build` passes)
- **NEW:** PROGRESS.md should be updated at the end of each phase to maintain accuracy
- **NEW:** Scope creep must be actively managed -- log new ideas in a backlog, do not add them to this plan

---

# PART 10: ARCHITECTURAL REVIEW

**Reviewer:** Senior Software Architect
**Date:** 2026-07-07
**Scope:** Technical feasibility, dependency management, build systems, CSS/token integration, icon strategy, demo architecture, test architecture, and risk assessment

---

## 10.1 Monorepo Structure and Workspace Configuration

### Finding: Root `package.json` uses npm `workspaces` field alongside pnpm

**File:** `/stockflows-v7/package.json`

```json
{
  "packageManager": "pnpm@9.15.0",
  "workspaces": ["app", "packages/stockflows-ui", "packages/website", "packages/demo"]
}
```

The `workspaces` field is an npm/yarn feature. pnpm uses `pnpm-workspace.yaml` exclusively for workspace resolution. The `workspaces` field in `package.json` is inert under pnpm and creates confusion. It should be removed.

**Severity:** Low (cosmetic, no functional impact under pnpm)
**Action:** Remove `workspaces` from root `package.json`. Keep `pnpm-workspace.yaml` as the single source of truth.

### Finding: `app/` has no `package.json`

The `app/` directory is listed as a workspace in both `pnpm-workspace.yaml` and the root `package.json`, but it has no `package.json` of its own. This means:

- `app/` cannot declare dependencies (e.g., `@shopify/polaris`, `prisma`, `@remix-run/node`)
- `app/` cannot be filtered via `pnpm --filter app`
- The Turbo task `app#build` in `turbo.json` references a package name that does not exist
- pnpm workspace protocol (`workspace:*`) cannot resolve `@stockflows/ui` into `app/` because `app/` is not a proper package

The `app/` directory appears to rely on the root `package.json` for all dependency declarations, but the root `package.json` has zero dependencies listed -- only scripts and `packageManager`. This means `node_modules` are likely populated by a legacy mechanism or manual `pnpm add`, not by workspace resolution.

**Severity:** HIGH. The monorepo workspace protocol is broken for the app. `@stockflows/ui` cannot be consumed by `app/` via `workspace:*` without a proper `app/package.json`.
**Action:** Create `app/package.json` with `name: "@stockflows/app"` and declare all app-specific dependencies (`@remix-run/*`, `@shopify/polaris`, `prisma`, etc.). Add `@stockflows/ui: "workspace:*"` as a dependency.

### Finding: Duplicate `@stockflows/ui` at root level

There are TWO copies of the `@stockflows/ui` package:

1. `/stockflows-v7/stockflows-ui/` -- at the project root, with identical `package.json` (`name: "@stockflows/ui"`)
2. `/stockflows-v7/packages/stockflows-ui/` -- the canonical location referenced by `pnpm-workspace.yaml`

The root-level copy appears to be an earlier iteration that was never cleaned up. Both have the same `name`, version, and exports. The root copy is NOT listed in `pnpm-workspace.yaml`, so it is orphaned, but its presence creates risk of accidental imports or confusion.

**Severity:** Medium (technical debt, confusion risk)
**Action:** Delete `/stockflows-v7/stockflows-ui/` entirely. Verify no imports reference it.

---

## 10.2 Dependency Management

### Finding: `@stockflows/ui` is not installed in `app/` or root `node_modules`

Grep confirms zero imports of `@stockflows/ui` in the `app/` directory. Additionally, `app/node_modules/@stockflows/ui` does not exist, and `node_modules/@stockflows/` does not exist at the root level either. The workspace symlink has never been created by pnpm.

This confirms Part 1 of the plan: the design system was built but never wired into the app. However, the root cause is structural -- without `app/package.json`, pnpm cannot resolve the workspace dependency.

**Severity:** HIGH
**Action:** Fix workspace structure first (see 10.1), then run `pnpm install` to establish symlinks.

### Finding: `@stockflows/ui` build script is a no-op

**File:** `/stockflows-v7/packages/stockflows-ui/package.json`

```json
"scripts": {
  "build": "echo 'Building @stockflows/ui...'"
}
```

The build script does nothing. The package exports raw TypeScript (`"main": "./src/index.ts"`, `"exports": { ".": "./src/index.ts" }`). This works for Vite-based consumers (website, demo) which use `@vitejs/plugin-react` and can compile TSX on the fly, but:

- It will NOT work for consumers that expect compiled JS output
- The Turbo build pipeline (`@stockflows/ui#build`) runs a no-op, so downstream packages may build before `@stockflows/ui` is actually ready
- There is no type-checking step in the build -- TypeScript errors in `@stockflows/ui` will only surface at consumer build time

**Severity:** Medium (works now for Vite consumers, but fragile)
**Action:** Either:
- (a) Add a real build step using `tsc` + `tsup` or `vite build` that emits `.js` + `.d.ts` files, OR
- (b) Keep source-only exports but add `tsc --noEmit` as a type-check build step, OR
- (c) For the Remix app, configure the Remix Vite plugin to handle TSX imports from the workspace package (this is the simplest path if the app stays Vite-based)

### Finding: No peer dependencies declared for React

**File:** `/stockflows-v7/packages/stockflows-ui/package.json`

```json
"dependencies": {
  "react": "^19.0.0"
}
```

React should be a `peerDependency`, not a `dependency`. Having React as a direct dependency means `@stockflows/ui` could install its own copy of React, leading to multiple React instances in the tree (the "two Reacts" problem). This causes hooks to break at runtime.

**Severity:** HIGH (potential runtime crashes with hooks)
**Action:** Move `react` from `dependencies` to `peerDependencies`. Add `peerDependenciesMeta` to mark it as optional if needed.

### Finding: Duplicate component implementations with divergent APIs

There are THREE sets of components with overlapping names but different implementations:

| Component | `packages/stockflows-ui/src/components/shared/` | `packages/stockflows-ui/src/components/{Name}/` | `stockflows-ui/src/components/` (root copy) |
|---|---|---|---|
| Badge | `shared/Badge.tsx` -- `status` prop, hardcoded colors | `Badge/Badge.tsx` -- `type`/`status` prop, uses `../../types` | `Badge.tsx` -- `status` prop, hardcoded colors |
| Button | `shared/Button.tsx` -- no loading prop, no ariaLabel | `Button/Button.tsx` -- has `loading`, `ariaLabel`, uses `../../types` | Not present |
| Card | `shared/Card.tsx` -- `shadow` prop (default/accent) | `Card/Card.tsx` -- `elevation` prop (sm/md/lg), `hoverable` | `Card.tsx` -- `elevation` prop |
| StatCard | `shared/StatCard.tsx` -- hardcoded "12%" trend text | `StatCard/StatCard.tsx` -- uses `../../types` | `StatCard.tsx` -- different layout |

The `index.ts` exports from BOTH locations:
```ts
export { Card } from './components/Card/Card';      // from {Name}/ subdirs
export { Badge } from './components/Badge/Badge';
export { StockBadge } from './components/shared/Badge';  // from shared/
```

This means the package exports TWO different `Badge` implementations under different names. The `Card` export shadows the `shared/Card` export. This is a maintenance nightmare and a source of subtle visual inconsistencies.

**Severity:** HIGH
**Action:** Consolidate into a single component per name. Prefer the `{Name}/` subdirectory versions (they use shared types and have more complete APIs). Remove `shared/` duplicates. Update `index.ts` accordingly.

### Finding: Color palette inconsistency across components

- `tokens-v7.css` defines semantic colors (e.g., `--success: #34D399`, `--warning: #FBBF24`, `--danger: #F87171`)
- `shared/Badge.tsx` uses different hex values: `success: #10B981`, `warning: #F59E0B`, `error: #EF4444`
- `Badge/Badge.tsx` uses the token-consistent values: `success: #34D399`, `warning: #FBBF24`, `error: #F87171`
- `app/tailwind.css` defines v6 colors: `--sf-success: #16A34A`, `--sf-warning: #D97706`, `--sf-critical: #DC2626`

There are three different color palettes in use. The v7 tokens and the `{Name}/` Badge component agree, but `shared/` components and the app itself use different values.

**Severity:** Medium (visual inconsistency)
**Action:** All components should reference CSS custom properties from `tokens-v7.css` or the Tailwind theme, not hardcoded hex values.

---

## 10.3 CSS and Token Integration

### Finding: `tailwind.css` imports v6 tokens, not v7

**File:** `/stockflows-v7/app/tailwind.css`

The file is titled "StockFlows v6 Design System" and defines v6-era CSS variables (`--sf-bg: #FAFBFC`, light theme). It does NOT import `tokens-v7.css`. The plan proposes:

```css
@import "tailwindcss";
@import "@stockflows/ui/styles/tokens-v7.css";
```

This approach is architecturally sound for Tailwind CSS v4 (which uses `@import` for CSS), but there are two issues:

1. **Path resolution:** The import `@stockflows/ui/styles/tokens-v7.css` relies on the package's `exports` field: `"./styles/*": "./src/styles/*"`. This maps `@stockflows/ui/styles/tokens-v7.css` to `./src/styles/tokens-v7.css`. This should work with Vite's CSS resolution, but needs verification with Remix's Vite plugin.

2. **Variable collision:** `tokens-v7.css` defines `:root` variables (e.g., `--bg-primary: #0A0B0E`) while `tailwind.css` defines `:root` variables (e.g., `--sf-bg: #FAFBFC`). Both will be active simultaneously. The v6 variables are light theme; v7 is dark. If both are loaded, CSS cascade order determines which wins. The plan should explicitly remove or scope the v6 variables.

**Severity:** Medium
**Action:** After importing `tokens-v7.css`, remove or scope the v6 `:root` variables in `tailwind.css` under a `.theme-v6` class or delete them entirely. Consider using CSS layers (`@layer`) to control specificity.

### Finding: No Playwright config file exists

Glob for `playwright.config.*` returned zero results. The plan references Playwright tests across three apps, but there is no configuration file to:
- Define `baseURL` per app (Shopify app on localhost, demo on Vite dev server, website on Vite dev server)
- Set up projects for each app
- Configure web server startup commands
- Set `testDir` paths

**Severity:** HIGH (tests cannot run without config)
**Action:** Create `playwright.config.ts` at the project root with three projects:
```ts
projects: [
  { name: 'app', testDir: './e2e/app', use: { baseURL: 'http://localhost:3000' } },
  { name: 'demo', testDir: './e2e/demo', use: { baseURL: 'http://localhost:5173' } },
  { name: 'website', testDir: './e2e/website', use: { baseURL: 'http://localhost:5174' } },
]
```

---

## 10.4 Icon Migration Strategy

### Finding: Plan says "Lucide to Material Symbols" but the app uses Polaris Icons

**File:** `/stockflows-v7/app/routes/app.tsx`

```tsx
import {
  HomeIcon, PackageIcon, ClipboardIcon,
  ChartVerticalIcon, SettingsIcon, CartIcon,
} from "@shopify/polaris-icons";
```

The app currently uses `@shopify/polaris-icons`. There is zero usage of `lucide-react` anywhere in the project (confirmed by Grep). The plan's language about "Lucide to Material Symbols" is inaccurate.

The `@stockflows/ui` shared components already use Material Symbols via `<span className="material-symbols-outlined">icon_name</span>`. This means:

1. The Material Symbols Google Font must be loaded (it is NOT currently loaded in `root.tsx` -- only Inter, Plus Jakarta Sans, Playfair Display, and JetBrains Mono are loaded)
2. The app's Polaris Icon imports need to be replaced with either:
   - Material Symbols (matching the shared library), or
   - A mapping layer that renders Material Symbols in the Navigation component

**Severity:** Medium (the plan's framing is wrong, but the actual migration direction is clear)
**Action:** 
- Add Material Symbols font to `root.tsx` links: `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined`
- Create an icon mapping in `@stockflows/ui` that maps semantic names to Material Symbols glyph names
- Replace Polaris icon imports in `app/routes/app.tsx` and other routes

---

## 10.5 Demo Architecture: Zustand vs Remix

### Finding: Zustand is declared but not implemented

**File:** `/stockflows-v7/packages/demo/package.json` lists `"zustand": "^5.0.0"` as a dependency.

However:
- `packages/demo/src/stores/` is an empty directory
- Grep for `zustand` or `create(` in demo routes found zero matches
- The demo uses `react-router-dom` (not Remix), which is correct for a standalone Vite app

The plan proposes a `MockDataProvider` using React Context + Zustand. This is architecturally reasonable for a client-side demo app. Key considerations:

1. **Zustand + React Context is redundant.** Zustand stores are already global state -- wrapping them in Context adds unnecessary provider nesting. Either use Zustand alone (simpler) or React Context alone (no extra dependency). Mixing both adds complexity without benefit.

2. **The demo routes directory exists but is nearly empty.** Only 4 route files exist: `Dashboard.tsx`, `Forecasting.tsx`, `InventoryList.tsx`, `PurchasingList.tsx`. The plan calls for 31 routes. The remaining routes in `packages/demo/src/routes/` are subdirectories (`api/`, `auth/`, `health/`, `inventory/`, `purchasing/`, `settings/`) that contain files, but many appear to be stubs.

**Severity:** Medium
**Action:** 
- Choose Zustand OR React Context, not both. Zustand is the better choice for a demo app with complex client state (filters, tour progress, selected items).
- Remove the `MockDataProvider` from the plan or redefine it as a Zustand store initializer, not a Context provider.
- Verify which of the 31 demo routes are actually implemented vs stubs.

---

## 10.6 Playwright Test Architecture

### Finding: 80+ test files exist, all targeting a single app

The `e2e/` directory contains 80+ spec files, but they all appear to target the Shopify app (based on file names like `app-routes.spec.ts`, `inventory-workflows.spec.ts`, `settings.spec.ts`). There are no test files organized by app.

The plan proposes reorganizing into `e2e/app/`, `e2e/demo/`, `e2e/website/` with shared utilities in `e2e/utils/`. This is sound, but:

1. **No `playwright.config.ts` exists** (see 10.3). Without it, the current tests rely on ad-hoc configuration or a missing config.
2. **Test count is far beyond what the plan specifies.** The plan says "22 new tests" but there are already 80+ files. Many may be duplicates or broken (e.g., `demo.spec.ts` and `demo-v6.spec.ts` both exist).
3. **No web server configuration.** The tests need to know how to start the Shopify app (requires `DATABASE_URL`, Shopify credentials), the demo (Vite dev server), and the website (Vite dev server). Without `webServer` config in Playwright, tests will fail connecting to backends.

**Severity:** HIGH
**Action:**
- Create `playwright.config.ts` with `webServer` entries for each app
- Audit existing 80+ test files: identify which are functional, which are duplicates, which are broken
- Organize into the three-app structure before writing new tests
- Add `globalSetup` for database seeding if the Shopify app tests need pre-populated data

---

## 10.7 Build Pipeline and Turborepo

### Finding: Turbo config references package names that may not resolve

**File:** `/stockflows-v7/turbo.json`

```json
{
  "tasks": {
    "@stockflows/ui#build": { "dependsOn": ["^build"] },
    "app#build": { "dependsOn": ["@stockflows/ui#build"] },
    "@stockflows/website#build": { "dependsOn": ["@stockflows/ui#build"] },
    "@stockflows/demo#build": { "dependsOn": ["@stockflows/ui#build"] }
  }
}
```

- `app#build` references a package named `app`, but there is no `app/package.json` with `"name": "app"`. Turbo resolves tasks by package name from `package.json`. This task will either silently skip or error.
- The `^build` dependency on `@stockflows/ui#build` means Turbo will try to build `@stockflows/ui` first, but its build is a no-op echo.
- No `dev`, `lint`, or `typecheck` tasks are defined. The only script in the root is `build:v7` which runs `turbo run build`.

**Severity:** Medium (build pipeline is fragile but may work by accident)
**Action:**
- Create `app/package.json` with proper name so Turbo can resolve `app#build`
- Add `dev`, `lint`, and `typecheck` tasks to `turbo.json`
- Replace the no-op build in `@stockflows/ui` with a real build or type-check

---

## 10.8 TypeScript Configuration

### Finding: Root `tsconfig.json` excludes `app/`

**File:** `/stockflows-v7/tsconfig.json`

```json
{
  "compilerOptions": {
    "paths": { "@stockflows/ui/*": ["./packages/stockflows-ui/src/*"] }
  },
  "exclude": ["app/**/*", "e2e/**/*", ...]
}
```

The `paths` alias `@stockflows/ui/*` is defined but the `app/` directory is excluded from this tsconfig. This means:
- IDE autocompletion for `@stockflows/ui` imports in `app/` files will not work via this tsconfig
- The Remix app likely has its own `tsconfig.json` (standard for Remix projects), but none was found at `app/tsconfig.json`
- TypeScript type resolution for `@stockflows/ui` in the app depends on pnpm workspace symlinks + module resolution, not the root `paths` config

**Severity:** Low (Remix/Vite handles resolution at build time, but DX suffers)
**Action:** Either:
- Remove `app` from `exclude` in root tsconfig (if it's meant to be a project-wide config), or
- Create `app/tsconfig.json` with its own `paths` mapping for `@stockflows/ui`

---

## 10.9 Architectural Risks Summary

| # | Risk | Severity | Impact | Mitigation |
|---|---|---|---|---|
| 1 | No `app/package.json` -- workspace protocol broken | HIGH | `@stockflows/ui` cannot be consumed by the app | Create `app/package.json` with proper deps |
| 2 | React as dependency (not peer dep) in `@stockflows/ui` | HIGH | Potential dual-React runtime, hooks break | Move to `peerDependencies` |
| 3 | No `playwright.config.ts` | HIGH | E2e tests cannot run | Create config with three app projects |
| 4 | Three divergent component implementations | HIGH | Visual bugs, maintenance burden | Consolidate to single implementation per component |
| 5 | Duplicate `@stockflows/ui` at root | MEDIUM | Confusion, accidental imports | Delete `/stockflows-ui/` at root |
| 6 | No-op build script for `@stockflows/ui` | MEDIUM | No type safety at build time, fragile pipeline | Add real build or type-check step |
| 7 | v6/v7 CSS variable collision | MEDIUM | Visual inconsistencies during migration | Scope or remove v6 variables |
| 8 | Material Symbols font not loaded | MEDIUM | Icons will not render | Add font link to `root.tsx` |
| 9 | Zustand + Context redundancy in demo | LOW | Unnecessary complexity | Choose one state management approach |
| 10 | 80+ orphaned test files | MEDIUM | Wasted effort, confusion about coverage | Audit and triage before writing new tests |

---

## 10.10 Recommended Implementation Order

The plan's phase ordering is mostly correct, but the workspace structure must be fixed FIRST, before any UI integration work:

1. **PREREQUISITE: Fix monorepo structure** (not in current plan)
   - Create `app/package.json` with all app dependencies
   - Delete root-level `stockflows-ui/` duplicate
   - Remove `workspaces` from root `package.json`
   - Move React to `peerDependencies` in `@stockflows/ui`
   - Run `pnpm install` and verify symlinks
   - Verify `turbo run build` resolves all package names

2. **Phase 0 (new): Build pipeline hardening**
   - Add real build/type-check to `@stockflows/ui`
   - Add `turbo.json` dev/lint/typecheck tasks
   - Create `playwright.config.ts`
   - Fix root `tsconfig.json` exclusions

3. Then proceed with Phases 1-8 as written, with the corrections noted above.

---

## 10.11 Specific File-Level Corrections to the Plan

### Plan Section 3.1 (UI Library Build)
The plan says to add `"build": "tsc && vite build"` to `@stockflows/ui`. This is correct but incomplete -- `vite build` for a library needs a `vite.config.ts` with `build.lib` mode configured. Without it, `vite build` will produce an SPA, not a library.

### Plan Section 3.2 (Token Integration)
The proposed `@import "@stockflows/ui/styles/tokens-v7.css"` is correct for Tailwind v4 CSS imports, but the package's `exports` field uses a wildcard: `"./styles/*": "./src/styles/*"`. This wildcard pattern may not resolve correctly in all CSS import contexts. Consider adding an explicit export: `"./styles/tokens-v7.css": "./src/styles/tokens-v7.css"`.

### Plan Section 4.1 (Icon Migration)
The plan references migrating from "Lucide" icons. There are zero Lucide imports in the codebase. The actual migration is from `@shopify/polaris-icons` to Material Symbols. Update all references accordingly.

### Plan Section 5 (Demo)
The plan calls for a `MockDataProvider` React Context. Since Zustand is already a dependency and is better suited for client-side state, refactor this to a Zustand store with `create()` that holds mock data, UI state (sidebar open, active tab), and tour progress.

### Plan Section 6 (Playwright)
The plan says "22 new Playwright tests" but the e2e directory already has 80+ files. Before writing new tests, audit the existing files. Many may be duplicates (`settings.spec.ts`, `settings-visual-match.spec.ts`, `settings_redesign.spec.ts`, `settings_review.spec.ts` all exist).

---

---

# PART 11: RELEASE TRAIN ENGINEER SYNTHESIS

**Author:** Release Train Engineer (RTE)
**Date:** 2026-07-07
**Purpose:** Resolve cross-perspective conflicts, unify the implementation plan, and produce a single authoritative execution roadmap

---

## 11.1 Cross-Perspective Conflict Resolution

The three agent reviews (BA, UI/UX Designer, Architect) identified overlapping and sometimes conflicting recommendations. This section resolves each conflict and establishes the canonical approach.

### Conflict 1: Component Architecture (Zustand vs React Context)

| Perspective | Recommendation |
|---|---|
| BA (Part 3, Phase 3) | `MockDataProvider` as React Context + Zustand store |
| Architect (10.5) | Use Zustand OR React Context, not both |

**Resolution: Zustand only.** The Architect is correct. React Context wrapping a Zustand store is redundant. The demo will use a single Zustand store (`useDemoStore`) with slices for: (a) mock data, (b) UI state (sidebar, active tab, filters), (c) tour progress. Remove all references to `MockDataProvider` as a React Context. The store initializes mock data at import time; no provider nesting required.

**Action items:**
- Delete any existing `MockDataProvider.tsx` context files
- Create `packages/demo/src/stores/demoStore.ts` as the single Zustand store
- Import mock data JSON directly into the store initializer

### Conflict 2: Icon Migration Source (Lucide vs Polaris Icons)

| Perspective | Recommendation |
|---|---|
| BA/Architecture Doc (Part 1, 1.7) | "Replace Lucide icons with Material Symbols" |
| Architect (10.4) | App uses `@shopify/polaris-icons`, not Lucide |

**Resolution: Migrate from Polaris Icons to Material Symbols.** The Architect is correct. There are zero Lucide imports in the codebase. All plan references to "Lucide" must be corrected to "Polaris Icons." The migration target remains Material Symbols (consistent with `@stockflows/ui`).

**Action items:**
- Global search-and-replace of plan text: "Lucide" -> "Polaris Icons"
- Create icon mapping: `@shopify/polaris-icons` names -> Material Symbols glyph names
- Add Material Symbols font to `app/root.tsx` `<link>` tags
- Replace all `@shopify/polaris-icons` imports with Material Symbols `<span>` elements

### Conflict 3: Design Token Priority (Light vs Dark Theme)

| Perspective | Recommendation |
|---|---|
| BA (Part 2, Phase 2) | Import tokens-v7.css, replace local components |
| UI/UX (8.1) | App runs light theme, demo/website run dark -- jarring inconsistency |
| Architect (10.3) | v6/v7 CSS variable collision must be resolved |

**Resolution: Dark theme migration is a Phase 0 prerequisite, not Phase 2.** The UI/UX Designer correctly identified this as the single highest-impact visual issue. The Architect's finding about variable collision confirms it must be resolved before any component work. Move dark theme migration from Phase 2 to Phase 0 (foundation).

**Action items (Phase 0):**
- Import `tokens-v7.css` into `app/tailwind.css`
- Remove all v6 `:root` variables (`--sf-bg`, `--sf-text`, etc.) or scope them under `.theme-v6`
- Set `app/root.tsx` body `backgroundColor` to `"#0A0B0E"`
- Fix all 13 hardcoded color violations identified in UI/UX section 8.15

### Conflict 4: Component Deduplication Strategy

| Perspective | Recommendation |
|---|---|
| BA (Part 1, 1.4) | Remove duplicate components, keep one canonical version |
| UI/UX (8.18, 8.2-8.4) | Three conflicting Badge/Button/Card/StatCard implementations |
| Architect (10.2) | Prefer `{Name}/` subdirectory versions (more complete APIs) |

**Resolution: Align with Architect. Keep `{Name}/` subdirectory versions as canonical.** These have richer APIs (loading states, elevation variants, type-safe props). Remove `shared/` duplicates. Remove the orphaned root-level `stockflows-ui/` directory entirely.

**Canonical component locations (keep these):**
- `packages/stockflows-ui/src/components/Button/Button.tsx`
- `packages/stockflows-ui/src/components/Badge/Badge.tsx`
- `packages/stockflows-ui/src/components/Card/Card.tsx`
- `packages/stockflows-ui/src/components/StatCard/StatCard.tsx`

**Delete these:**
- `packages/stockflows-ui/src/components/shared/Badge.tsx`
- `packages/stockflows-ui/src/components/shared/Button.tsx`
- `packages/stockflows-ui/src/components/shared/Card.tsx`
- `packages/stockflows-ui/src/components/shared/StatCard.tsx`
- `stockflows-ui/` (entire root-level duplicate directory)

### Conflict 5: Timeline Estimation

| Perspective | Estimate | Scope |
|---|---|---|
| BA (Part 8) | 10-14 days | Gap closure |
| Architecture Doc | 24-35 days | Full implementation from scratch |
| RTE Assessment | **12-16 days** | Gap closure + architectural prerequisites |

**Resolution: 12-16 days is the realistic estimate.** The BA's 10-14 days underestimated the architectural prerequisites (workspace fix, Playwright config, component deduplication). The Architecture Doc's 24-35 days is irrelevant since significant code already exists. The 12-16 day estimate includes buffer for the newly discovered blockers.

---

## 11.2 Unified Implementation Plan

### Phase 0: Architectural Prerequisites (Days 1-2)

**Goal:** Fix all structural blockers that prevent subsequent phases from working.

**This phase is NEW -- none of the previous plans included it.**

| # | Task | Owner | Files | Est. |
|---|---|---|---|---|
| 0.1 | Create `app/package.json` with all app dependencies | Architect | `app/package.json` | 2h |
| 0.2 | Add `@stockflows/ui: "workspace:*"` to app dependencies | Architect | `app/package.json` | 30m |
| 0.3 | Delete orphaned root-level `stockflows-ui/` directory | Architect | `stockflows-ui/` | 15m |
| 0.4 | Remove `workspaces` field from root `package.json` | Architect | `package.json` | 15m |
| 0.5 | Move React from `dependencies` to `peerDependencies` in `@stockflows/ui` | Architect | `packages/stockflows-ui/package.json` | 30m |
| 0.6 | Add explicit CSS export to `@stockflows/ui` package.json | Architect | `packages/stockflows-ui/package.json` | 15m |
| 0.7 | Run `pnpm install`, verify workspace symlinks | Architect | -- | 30m |
| 0.8 | Verify `turbo run build` resolves all package names | Architect | `turbo.json` | 30m |
| 0.9 | Add Material Symbols font link to `app/root.tsx` | UI/UX | `app/root.tsx` | 15m |
| 0.10 | Remove Plus Jakarta Sans and Playfair Display font loads from `app/root.tsx` | UI/UX | `app/root.tsx` | 15m |

**Acceptance Criteria:**
- [ ] `app/package.json` exists with `name: "@stockflows/app"` and all dependencies declared
- [ ] `pnpm install` produces correct symlinks (`node_modules/@stockflows/ui` -> `packages/stockflows-ui`)
- [ ] `pnpm --filter app run build` (or equivalent) resolves without module-not-found errors
- [ ] `turbo run build` executes tasks for all four packages without skipping
- [ ] Root `stockflows-ui/` directory no longer exists
- [ ] `@stockflows/ui/package.json` has React in `peerDependencies`
- [ ] Material Symbols font loads in `app/root.tsx`

---

### Phase 1: Foundation & Cleanup (Days 2-3)

**Goal:** Eliminate duplicate components, establish single source of truth for design system.

| # | Task | Owner | Files | Est. |
|---|---|---|---|---|
| 1.1 | Remove duplicate `shared/` components (Badge, Button, Card, StatCard) | Architect | `packages/stockflows-ui/src/components/shared/` | 1h |
| 1.2 | Update `@stockflows/ui/src/index.ts` to export from canonical `{Name}/` locations only | Architect | `packages/stockflows-ui/src/index.ts` | 30m |
| 1.3 | Fix hardcoded colors in canonical Badge to use CSS variables (`var(--success)`, etc.) | UI/UX | `packages/stockflows-ui/src/components/Badge/Badge.tsx` | 30m |
| 1.4 | Fix hardcoded "12%" trend bug in StatCard | UI/UX | `packages/stockflows-ui/src/components/StatCard/StatCard.tsx` | 15m |
| 1.5 | Add marquee CSS animation to `tokens-v7.css` | UI/UX | `packages/stockflows-ui/src/styles/tokens-v7.css` | 30m |
| 1.6 | Add Modal focus trap and `aria-labelledby` | UI/UX | `packages/stockflows-ui/src/components/Modal.tsx` | 1h |
| 1.7 | Add `aria-expanded`, `aria-haspopup` to Navigation dropdown | UI/UX | `packages/stockflows-ui/src/components/Navigation/Navigation.tsx` | 1h |
| 1.8 | Add `aria-describedby` to Tooltip trigger | UI/UX | `packages/stockflows-ui/src/components/Tooltip.tsx` | 30m |
| 1.9 | Reconcile PROGRESS.md with actual state | BA | `PROGRESS.md` | 1h |
| 1.10 | Reconcile IMPLEMENTATION-SUMMARY.md with PROGRESS.md | BA | `IMPLEMENTATION-SUMMARY.md` | 30m |

**Acceptance Criteria:**
- [ ] Zero duplicate component files in `packages/stockflows-ui/src/components/`
- [ ] Every exported component has exactly one canonical location
- [ ] `pnpm run build` passes with zero TypeScript errors
- [ ] Modal traps focus and restores focus on close
- [ ] Navigation dropdown has ARIA attributes
- [ ] Tooltip shows on keyboard focus
- [ ] PROGRESS.md and IMPLEMENTATION-SUMMARY.md agree on status numbers

---

### Phase 2: App Dark Theme Migration (Days 3-5)

**Goal:** Bring the Shopify app into visual alignment with demo and website by applying the v7 dark theme.

| # | Task | Owner | Files | Est. |
|---|---|---|---|---|
| 2.1 | Import `tokens-v7.css` in `app/tailwind.css`, remove v6 variables | Architect | `app/tailwind.css` | 1h |
| 2.2 | Set body background to `#0A0B0E` in `app/root.tsx` | UI/UX | `app/root.tsx` | 15m |
| 2.3 | Fix all 13 hardcoded color violations (section 8.15) | UI/UX | `app/routes/app._index.tsx`, `app/components/` | 2h |
| 2.4 | Update app layout (`app.tsx`) to use shared Navigation from `@stockflows/ui` | Architect | `app/routes/app.tsx` | 2h |
| 2.5 | Replace Polaris Icons with Material Symbols in `app/routes/app.tsx` sidebar | Architect | `app/routes/app.tsx` | 1h |
| 2.6 | Replace Polaris Icons in Dashboard route | Developer | `app/routes/app._index.tsx` | 1h |
| 2.7 | Replace Polaris Icons in Inventory routes | Developer | `app/routes/app.inventory.*.tsx` | 1.5h |
| 2.8 | Replace Polaris Icons in Purchasing routes | Developer | `app/routes/app.purchasing.*.tsx` | 1h |
| 2.9 | Replace Polaris Icons in Forecasting routes | Developer | `app/routes/app.forecasting.*.tsx` | 30m |
| 2.10 | Replace Polaris Icons in Reports routes | Developer | `app/routes/app.reports.*.tsx` | 30m |
| 2.11 | Replace Polaris Icons in Settings routes | Developer | `app/routes/app.settings.tsx` | 30m |
| 2.12 | Fix chart colors (StockLevelChart, ForecastChart) to use tokens | UI/UX | `app/components/inventory/StockLevelChart.tsx`, `app/components/forecasting/ForecastChart.tsx` | 1.5h |
| 2.13 | Fix font stack to use Inter exclusively | UI/UX | `app/root.tsx`, `app/tailwind.css` | 30m |
| 2.14 | Add `role="progressbar"` and `aria-label` to loading bar | UI/UX | `app/root.tsx` | 15m |
| 2.15 | Verify `pnpm run build` passes | Architect | -- | 30m |

**Acceptance Criteria:**
- [ ] App body background is `#0A0B0E` (dark theme)
- [ ] Zero `@shopify/polaris-icons` imports remain in `app/routes/`
- [ ] All chart colors reference design tokens, not hardcoded hex
- [ ] Font is Inter exclusively (no Plus Jakarta Sans, no Playfair Display)
- [ ] Loading bar uses accent color (`#C7FB33`), not blue
- [ ] Loading bar has ARIA attributes for screen readers
- [ ] `pnpm run build` passes with zero errors
- [ ] Manual visual inspection of 5 representative routes confirms dark theme

---

### Phase 3: Shared Component Polish (Days 4-5)

**Goal:** Ensure the shared design system components are production-quality before wiring into demo and app routes.

| # | Task | Owner | Files | Est. |
|---|---|---|---|---|
| 3.1 | Align all Badge variants to use CSS custom properties from tokens | UI/UX | `packages/stockflows-ui/src/components/Badge/Badge.tsx` | 1h |
| 3.2 | Align Card border to 1px (`border-[#2A2D35]`) matching tokens, remove brutalist shadow variant | UI/UX | `packages/stockflows-ui/src/components/Card/Card.tsx` | 30m |
| 3.3 | Standardize StatCard padding to `p-6`, fix trend value display | UI/UX | `packages/stockflows-ui/src/components/StatCard/StatCard.tsx` | 30m |
| 3.4 | Add skeleton loading states to shared Skeleton component | UI/UX | `packages/stockflows-ui/src/components/Skeleton.tsx` | 30m |
| 3.5 | Fix EmptyState to use `type="button"`, add `aria-label` | UI/UX | `packages/stockflows-ui/src/components/EmptyState/EmptyState.tsx` | 15m |
| 3.6 | Add tooltip entrance animation (fade-in 150ms) | UI/UX | `packages/stockflows-ui/src/components/Tooltip.tsx` | 30m |
| 3.7 | Add modal exit animation (fade-out 150ms) | UI/UX | `packages/stockflows-ui/src/components/Modal.tsx` | 30m |
| 3.8 | Fix disabled button focus ring (`focus:ring-0` when disabled) | UI/UX | `packages/stockflows-ui/src/components/Button/Button.tsx` | 15m |
| 3.9 | Standardize all spacing: `p-6` for cards, `mb-8` for page headings, `gap-4` for tables, `gap-6` for card grids | UI/UX | Various component files | 1.5h |
| 3.10 | Replace skeleton `bg-[#1E2129]` with `bg-[var(--bg-tertiary)]` | UI/UX | `packages/stockflows-ui/src/components/Skeleton.tsx` | 15m |
| 3.11 | Add responsive intermediate breakpoint (`lg:grid-cols-2`) to FeatureCards | UI/UX | `packages/stockflows-ui/src/components/FeatureCards/FeatureCards.tsx` | 15m |

**Acceptance Criteria:**
- [ ] All Badge colors reference CSS custom properties (zero hardcoded hex for semantic colors)
- [ ] All Cards use 1px border with token color
- [ ] StatCard trend shows actual data, not hardcoded "12%"
- [ ] Skeleton background matches a token value
- [ ] Modal has entrance AND exit animations
- [ ] Tooltip has fade-in animation and keyboard support
- [ ] Disabled buttons are not focusable
- [ ] Spacing is consistent across all shared components

---

### Phase 4: Demo Package Completion (Days 5-8)

**Goal:** Make the demo a fully functional, conversion-optimized preview of the Shopify app.

| # | Task | Owner | Files | Est. |
|---|---|---|---|---|
| 4.1 | Create `demoStore.ts` (Zustand) with mock data, UI state, and tour state | Architect | `packages/demo/src/stores/demoStore.ts` | 3h |
| 4.2 | Generate mock data: 50+ SKUs across Apparel, Footwear, Accessories | Developer | `packages/demo/src/data/inventory.json` | 2h |
| 4.3 | Generate mock data: 100+ purchase orders with status variety | Developer | `packages/demo/src/data/purchaseOrders.json` | 2h |
| 4.4 | Generate mock data: 20+ forecast results (ETS, linear, moving avg) | Developer | `packages/demo/src/data/forecasts.json` | 1h |
| 4.5 | Generate mock data: 10+ vendor records | Developer | `packages/demo/src/data/vendors.json` | 30m |
| 4.6 | Wire Dashboard route to store (KPI cards, activity feed) | Developer | `packages/demo/src/routes/Dashboard.tsx` | 1h |
| 4.7 | Wire Inventory routes to store (list, detail, search, filter) | Developer | `packages/demo/src/routes/InventoryList.tsx`, `inventory/` | 3h |
| 4.8 | Wire Purchasing routes to store (PO list, detail, vendors) | Developer | `packages/demo/src/routes/PurchasingList.tsx`, `purchasing/` | 2h |
| 4.9 | Wire Forecasting route to store (chart, forecast cards) | Developer | `packages/demo/src/routes/Forecasting.tsx` | 1.5h |
| 4.10 | Wire Reports route to store (export buttons) | Developer | `packages/demo/src/routes/` | 1h |
| 4.11 | Wire Settings route to store (read-only config) | Developer | `packages/demo/src/routes/settings.tsx` | 30m |
| 4.12 | Add skeleton loading states to all demo routes | UI/UX | `packages/demo/src/routes/*.tsx` | 2h |
| 4.13 | Add error boundary to demo app root | Architect | `packages/demo/src/routes/App.tsx` | 30m |
| 4.14 | Add toast/notification system for user feedback | Developer | `packages/demo/src/components/` | 1.5h |
| 4.15 | Build responsive sidebar (hamburger for < 768px) | UI/UX | `packages/demo/src/routes/App.tsx` | 2h |
| 4.16 | Add mobile card layout for inventory table (< 640px) | UI/UX | `packages/demo/src/routes/InventoryList.tsx` | 1.5h |
| 4.17 | Fix table row hover color to dark theme (`hover:bg-[#1C1E24]`) | UI/UX | `packages/demo/src/routes/InventoryList.tsx` | 15m |
| 4.18 | Add `aria-label` to demo search inputs | UI/UX | `packages/demo/src/routes/InventoryList.tsx` | 15m |
| 4.19 | Build GuidedTour component (5-7 steps covering core features) | UI/UX | `packages/demo/src/components/GuidedTour.tsx` | 3h |
| 4.20 | Wire GuidedTour to Zustand store for progress tracking | Developer | `packages/demo/src/stores/demoStore.ts`, `GuidedTour.tsx` | 1h |
| 4.21 | Add "Start Tour" button to demo Dashboard | Developer | `packages/demo/src/routes/Dashboard.tsx` | 30m |
| 4.22 | Verify `pnpm run build --filter=demo` passes | Architect | -- | 30m |

**Acceptance Criteria:**
- [ ] Zustand store manages all demo state (no React Context providers)
- [ ] Mock data includes 50+ SKUs, 100+ POs, 20+ forecasts, 10+ vendors
- [ ] All demo routes load without errors and display meaningful data (not empty states)
- [ ] Skeleton loading states appear during simulated data fetches
- [ ] Error boundary catches and displays errors gracefully
- [ ] Toast notifications appear after user actions
- [ ] Sidebar collapses to hamburger on mobile (< 768px)
- [ ] Inventory table shows card layout on mobile (< 640px)
- [ ] All table rows have correct dark-theme hover color
- [ ] Search inputs have `aria-label` attributes
- [ ] GuidedTour walks through Dashboard, Inventory, Purchasing, Forecasting
- [ ] Tour progress persists in Zustand store
- [ ] Demo runs entirely client-side with no backend dependency
- [ ] `pnpm run build --filter=demo` passes

---

### Phase 5: Website Completion (Days 6-8, parallel with Phase 4)

**Goal:** Complete the marketing site as a high-conversion funnel.

| # | Task | Owner | Files | Est. |
|---|---|---|---|---|
| 5.1 | Replace text placeholders in CustomerLogos with SVG images | UI/UX | `packages/website/src/components/LandingPage.tsx` | 2h |
| 5.2 | Update CustomerLogos heading to a substantiated claim | BA | `packages/stockflows-ui/src/components/CustomerLogos/CustomerLogos.tsx` | 15m |
| 5.3 | Create SocialProof section (3+ testimonials/reviews) | UI/UX | `packages/website/src/components/SocialProof.tsx` | 2h |
| 5.4 | Make Problem Statement section visually distinct and prominent | UI/UX | `packages/website/src/App.tsx` | 1h |
| 5.5 | Add Pricing section (if required) | UI/UX | `packages/website/src/components/Pricing.tsx` | 1.5h |
| 5.6 | Verify all CTAs link to correct destinations | Developer | `packages/website/src/` | 30m |
| 5.7 | Add SEO meta tags, Open Graph, structured data | Architect | `packages/website/index.html` | 1h |
| 5.8 | Add sitemap.xml generation | Architect | `packages/website/` | 30m |
| 5.9 | Ensure hero `min-h` is responsive (`min-h-[80vh]` on mobile) | UI/UX | `packages/stockflows-ui/src/components/HeroSection/HeroSection.tsx` | 15m |
| 5.10 | Add scroll-triggered animations for section reveals | UI/UX | `packages/website/src/` | 1.5h |
| 5.11 | Fix feature cards grid to use intermediate breakpoint | UI/UX | `packages/stockflows-ui/src/components/FeatureCards/FeatureCards.tsx` | 15m |
| 5.12 | Verify `pnpm run build --filter=website` passes | Architect | -- | 30m |

**Acceptance Criteria:**
- [ ] Customer logos display actual SVG images (not text)
- [ ] Social proof section has 3+ testimonials/reviews
- [ ] Problem Statement is a distinct, prominent section
- [ ] All CTAs link correctly (demo: `/demo`, install: `stockflows.fly.dev`)
- [ ] SEO meta tags and Open Graph data present
- [ ] Page loads in under 3 seconds on simulated 3G
- [ ] Responsive at 375px, 768px, 1280px
- [ ] Zero console errors on page load
- [ ] `pnpm run build --filter=website` passes

---

### Phase 6: Testing Infrastructure (Days 8-10)

**Goal:** Establish comprehensive test coverage across all three products.

| # | Task | Owner | Files | Est. |
|---|---|---|---|---|
| 6.1 | Create `playwright.config.ts` with three projects + webServer config | Architect | `playwright.config.ts` | 1h |
| 6.2 | Audit existing 80+ test files, identify duplicates and broken tests | Architect | `e2e/` | 2h |
| 6.3 | Reorganize tests into `e2e/app/`, `e2e/demo/`, `e2e/website/` | Architect | `e2e/` | 1h |
| 6.4 | Write website E2E tests (12 scenarios from section 11.2) | Developer | `e2e/website/landing-page.spec.ts` | 2h |
| 6.5 | Write demo E2E tests (20 scenarios from section 11.3) | Developer | `e2e/demo/routes.spec.ts` | 3h |
| 6.6 | Update existing app E2E tests for dark theme | Developer | `e2e/app/*.spec.ts` | 2h |
| 6.7 | Write visual regression tests (7 scenarios from section 11.4) | Developer | `e2e/visual/cross-product.spec.ts` | 2h |
| 6.8 | Write responsive design tests (10 scenarios from section 11.5) | Developer | `e2e/responsive/breakpoints.spec.ts` | 2h |
| 6.9 | Write accessibility tests (8 scenarios from section 11.6) | Developer | `e2e/accessibility/wcag.spec.ts` | 2h |
| 6.10 | Fix E2E font assertion in `pixel-comparison.spec.ts` | Developer | `e2e/pixel-comparison.spec.ts` | 30m |
| 6.11 | Add `globalSetup` for database seeding (if needed for app tests) | Architect | `e2e/globalSetup.ts` | 1h |

**Acceptance Criteria:**
- [ ] `playwright.config.ts` defines three projects with correct baseURLs
- [ ] `playwright.config.ts` includes `webServer` entries for each product
- [ ] Existing test files audited: duplicates removed, broken tests fixed
- [ ] Tests organized into `e2e/app/`, `e2e/demo/`, `e2e/website/`
- [ ] Website tests cover all sections (12 scenarios)
- [ ] Demo tests cover all routes (20 scenarios)
- [ ] App tests pass with dark theme
- [ ] Visual regression tests compare app, demo, and website
- [ ] Responsive tests verify 3 breakpoints per product
- [ ] Accessibility tests run axe-core with zero critical violations
- [ ] All tests pass (zero flaky tests)

---

### Phase 7: Design Unification & Cross-Product Consistency (Days 10-12)

**Goal:** Ensure all three products look and feel like the same product.

| # | Task | Owner | Files | Est. |
|---|---|---|---|---|
| 7.1 | Side-by-side visual audit: app vs demo vs website | UI/UX | -- | 2h |
| 7.2 | Fix any remaining color palette inconsistencies | UI/UX | Various | 1h |
| 7.3 | Fix any remaining typography inconsistencies | UI/UX | Various | 1h |
| 7.4 | Fix any remaining spacing inconsistencies | UI/UX | Various | 1h |
| 7.5 | Verify navigation patterns are consistent across products | UI/UX | Various | 1h |
| 7.6 | Verify loading states use same skeleton pattern | UI/UX | Various | 30m |
| 7.7 | Verify error states use same alert pattern | UI/UX | Various | 30m |
| 7.8 | Verify empty states use same illustration and CTA | UI/UX | Various | 30m |
| 7.9 | Run full visual regression suite, approve baselines | Developer | `e2e/visual/` | 1h |
| 7.10 | Run full accessibility suite, fix critical violations | Developer | `e2e/accessibility/` | 1h |

**Acceptance Criteria:**
- [ ] Side-by-side screenshots show consistent color palette across all three products
- [ ] Font sizes, weights, and line heights are identical
- [ ] Spacing follows 4px baseline grid consistently
- [ ] Component patterns (cards, buttons, badges) are visually identical
- [ ] Navigation patterns are consistent
- [ ] Loading, error, and empty states are consistent
- [ ] Visual regression baselines approved with no unexpected diffs
- [ ] Zero critical accessibility violations

---

### Phase 8: Quality Assurance & Release (Days 12-14)

**Goal:** Final verification, deployment, and release readiness.

| # | Task | Owner | Files | Est. |
|---|---|---|---|---|
| 8.1 | Run `pnpm run build` for all packages | Architect | -- | 30m |
| 8.2 | Run full Playwright suite -- all green | Developer | -- | 1h |
| 8.3 | Lighthouse performance audit (target: >= 90) | Developer | -- | 30m |
| 8.4 | Lighthouse accessibility audit (target: >= 90) | Developer | -- | 30m |
| 8.5 | Deploy website to Cloudflare Pages (staging) | Architect | -- | 30m |
| 8.6 | Deploy demo to Cloudflare Pages (staging) | Architect | -- | 30m |
| 8.7 | Deploy app to Fly.io (staging) | Architect | -- | 30m |
| 8.8 | Verify staging URLs: website loads, demo loads, app loads | Developer | -- | 30m |
| 8.9 | Cross-product flow test: website -> demo -> app install | BA | -- | 1h |
| 8.10 | Shopify App Store listing review preparation | BA | -- | 2h |
| 8.11 | Update PROGRESS.md with final accurate state | BA | `PROGRESS.md` | 30m |
| 8.12 | Update IMPLEMENTATION-SUMMARY.md | BA | `IMPLEMENTATION-SUMMARY.md` | 30m |
| 8.13 | Production deployment: website | Architect | -- | 15m |
| 8.14 | Production deployment: demo | Architect | -- | 15m |
| 8.15 | Production deployment: app | Architect | -- | 15m |
| 8.16 | Post-deployment verification (all three URLs live and functional) | Developer | -- | 30m |

**Acceptance Criteria:**
- [ ] `pnpm run build` passes for all packages
- [ ] Full Playwright suite passes
- [ ] Lighthouse performance >= 90 (website, demo)
- [ ] Lighthouse accessibility >= 90 (website, demo)
- [ ] All three staging deployments verified
- [ ] Cross-product flow (website -> demo -> app) works end-to-end
- [ ] Shopify App Store listing requirements met
- [ ] PROGRESS.md and IMPLEMENTATION-SUMMARY.md are accurate
- [ ] All three production deployments verified
- [ ] Zero regressions in existing functionality

---

## 11.3 RACI Matrix

| Task Area | Release Train Engineer | Senior Business Analyst | Senior UI/UX Designer | Senior Software Architect | Developer |
|---|---|---|---|---|---|
| **Phase 0: Architectural Prerequisites** | A | I | I | R | C |
| **Phase 1: Foundation & Cleanup** | A | C | R (a11y, tokens) | R (dedup, exports) | C |
| **Phase 2: App Dark Theme Migration** | A | I | R (colors, fonts) | C (tokens import) | R (icon migration) |
| **Phase 3: Shared Component Polish** | A | I | R | C | C |
| **Phase 4: Demo Package Completion** | A | C (content) | R (UX, responsive) | R (Zustand, data) | R (routes) |
| **Phase 5: Website Completion** | A | R (copy, claims) | R (design, layout) | C (SEO) | C |
| **Phase 6: Testing Infrastructure** | A | I | C | R (config, audit) | R (test writing) |
| **Phase 7: Design Unification** | A | I | R | C | C |
| **Phase 8: QA & Release** | R | R (flow test) | C | R (deploy) | R (verification) |

**Legend:** R = Responsible, A = Accountable, C = Consulted, I = Informed

---

## 11.4 Unified Testing Strategy

### Test Pyramid

```
                    /\
                   /  \
                  / E2E\         <- Playwright (Phase 6)
                 /------\
                / Visual  \      <- Playwright screenshot comparison
               / Regression\
              /--------------\
             /  Integration   \  <- Vitest component tests
            /------------------\
           /    Unit Tests      \ <- Vitest (existing)
          /----------------------\
```

### Test Coverage Targets

| Product | Unit Tests | Integration | E2E | Visual Regression | Accessibility |
|---|---|---|---|---|---|
| App | Existing (35+) | Existing | 35+ (updated) | 7 scenarios | 8 scenarios |
| Demo | 0 (client-side only) | 0 | 20 scenarios | 7 scenarios | 8 scenarios |
| Website | 0 (static) | 0 | 12 scenarios | 7 scenarios | 8 scenarios |
| **Total** | **35+** | **0** | **67+** | **21 scenarios** | **24 scenarios** |

### Test Execution Order

1. **Unit tests** (Vitest) -- run on every commit
2. **Integration tests** (Vitest) -- run on every commit
3. **E2E tests** (Playwright) -- run on every PR
4. **Visual regression** (Playwright) -- run on every PR
5. **Accessibility** (Playwright + axe-core) -- run on every PR
6. **Lighthouse** -- run before deployment

### Test Infrastructure Requirements

- `playwright.config.ts` with three projects (app, demo, website)
- `webServer` config for each product (app: Remix dev, demo: Vite dev, website: Vite dev)
- Visual regression baseline directory (`e2e/__screenshots__/`)
- axe-core accessibility plugin (`@axe-core/playwright`)
- Screenshot comparison threshold: 0.2% pixel difference

---

## 11.5 Deployment & Release Checklist

### Pre-Deployment (Each Phase)

- [ ] `pnpm run build` passes for all packages
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Visual inspection of changed routes
- [ ] Playwright tests pass

### Staging Deployment

- [ ] Website deployed to Cloudflare Pages (staging branch)
- [ ] Demo deployed to Cloudflare Pages (staging branch, `/demo` path)
- [ ] App deployed to Fly.io (staging)
- [ ] All three staging URLs accessible
- [ ] Cross-product links work (website -> demo, website -> app)
- [ ] Database seeded with test data (app only)

### Production Deployment

- [ ] All staging verification passed
- [ ] PROGRESS.md updated with final status
- [ ] No known critical bugs
- [ ] Rollback plan documented
- [ ] Website deployed to Cloudflare Pages (production)
- [ ] Demo deployed to Cloudflare Pages (production, `/demo` path)
- [ ] App deployed to Fly.io (production)
- [ ] DNS propagation verified
- [ ] SSL certificates valid
- [ ] Post-deployment smoke test (all three URLs)

### Shopify App Store Submission

- [ ] App listing description matches actual functionality
- [ ] Demo screenshots are current (not outdated)
- [ ] Privacy policy page exists and is accessible
- [ ] Terms of service page exists and is accessible
- [ ] App does not require Shopify authentication in demo mode
- [ ] All features described in listing are functional
- [ ] Billing (if applicable) matches listing description
- [ ] App passes Shopify's automated review checks

---

## 11.6 Risk Mitigation (Component-Specific)

### App Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Dark theme migration breaks existing functionality | Medium | High | Feature branch; run full test suite before merge; visual inspection of every route |
| Polaris Icon -> Material Symbols migration introduces missing icons | High | Medium | Create icon mapping spreadsheet first; test each route visually; keep Polaris Icons as fallback during migration |
| CSS variable collision causes visual regressions | Medium | Medium | Remove v6 variables entirely (not just scope); test in dark mode only |
| Shopify review rejects custom dark theme | Low | High | Prepare design justification document; ensure Polaris components are styled consistently; test against Shopify guidelines |

### Demo Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| 50+ SKUs of mock data are unrealistic | Medium | Medium | Use seed script with templates; validate with domain expert; start with 30 SKUs as minimum |
| 31 demo routes require more wiring than expected | High | High | Prioritize 8 core routes (Dashboard, Inventory CRUD, Purchasing, Forecasting); defer system routes |
| Zustand store becomes complex and hard to maintain | Low | Medium | Use slices for separation of concerns; document store structure; keep mock data in separate JSON files |
| Demo feels slow due to large mock data | Medium | Medium | Lazy-load data per route; use virtual lists for large tables; profile with React DevTools |

### Website Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Customer logos without authorization | Medium | High | Use only publicly available logos; add "illustrative" disclaimer; or use placeholder shapes |
| Unverifiable claims in copy | Low | High | Review all claims with BA; ensure every claim can be demonstrated in the app |
| Slow page load on mobile | Medium | Medium | Optimize images (SVG, WebP); lazy-load below-fold sections; target < 3s on 3G |
| SEO not configured | Medium | Low | Add meta tags in Phase 5; submit sitemap; test with Google Rich Results Test |

### Cross-Product Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Visual inconsistency between products | High | High | Shared component library is single source of truth; visual regression tests catch drift |
| Cross-product links break after deployment | Medium | High | Hard-code production URLs; add link verification to E2E tests |
| Different deployment cadences cause version mismatch | Medium | Medium | Deploy all three products simultaneously; use same Git tag for all |
| Design system changes in one product not reflected in others | Medium | High | All products import from `@stockflows/ui`; changes to shared components propagate automatically |

---

## 11.7 Component Coordination Protocol

### How the Three Components Work Together

```
                         MERCHAND JOURNEY
                         
    ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
    │   WEBSITE   │ ───> │    DEMO     │ ───> │     APP     │
    │  (Marketing) │      │ (Preview)   │      │ (Production)│
    │             │      │             │      │             │
    │ Conversion  │      │ Evaluation  │      │ Retention   │
    │ Funnel      │      │ Funnel      │      │ Funnel      │
    └─────────────┘      └─────────────┘      └─────────────┘
         │                     │                     │
         │   CTA: "Try Demo"   │   CTA: "Install"   │
         │   CTA: "Install"    │                     │
         └─────────────────────┴─────────────────────┘
                    │
              Shared UI Library
              (@stockflows/ui)
```

### Coordination Rules

1. **All three products MUST use `@stockflows/ui` components.** No local re-implementations of shared components.
2. **Design tokens are the single source of truth.** Any color, spacing, or typography value must come from `tokens-v7.css`.
3. **Cross-product links are verified in E2E tests.** Website -> Demo, Website -> App, Demo -> App.
4. **Deployments are coordinated.** All three products deploy together using the same Git tag.
5. **Visual regression tests compare all three products.** Any drift triggers a review.

### Shopify App Store Listing Requirements

The Shopify App Store listing requires:
1. **A working demo** (or screenshots that match the actual app) -- our demo at `stockflows.pages.dev/demo` serves this purpose
2. **A professional landing page** -- our website at `stockflows.pages.dev` serves this purpose
3. **App functionality that matches the listing description** -- Phase 2 ensures visual quality
4. **Privacy policy and terms of service** -- must be linked from the website
5. **No misleading claims** -- BA reviews all copy before submission

**The website and demo quality directly affects conversion rates.** A merchant who sees a polished website, tries a functional demo, and then installs an app that looks identical will have high trust and low churn. A merchant who sees a broken demo or inconsistent app will abandon immediately.

---

## 11.8 Refined Timeline

### Gantt Overview (16 Business Days)

```
Day:  1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16
      |----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
P0:   [==========]
P1:         [==========]
P2:              [===============]
P3:                   [==========]
P4:                        [==========================]
P5:                        [==========================]  (parallel with P4)
P6:                                    [==========================]
P7:                                              [==================]
P8:                                                    [==================]
```

### Milestone Dates

| Milestone | Target Day | Deliverable |
|---|---|---|
| **M0: Architecture Fixed** | Day 2 | `app/package.json` exists, workspace resolves, build passes |
| **M1: Foundation Clean** | Day 3 | Zero duplicate components, docs reconciled |
| **M2: App Dark Theme** | Day 5 | App runs dark theme, all icons migrated |
| **M3: Components Polished** | Day 5 | Shared components production-ready |
| **M4: Demo Complete** | Day 8 | Demo fully functional with 50+ SKUs, guided tour |
| **M5: Website Complete** | Day 8 | Website has all sections, CTAs, social proof |
| **M6: Tests Passing** | Day 10 | All E2E, visual, responsive, accessibility tests pass |
| **M7: Visual Unity** | Day 12 | All three products look identical |
| **M8: Release Ready** | Day 14 | All three products deployed to production |

### Critical Path

```
Phase 0 (Architectural Prerequisites)
  └─> Phase 1 (Foundation Cleanup)
        └─> Phase 2 (App Dark Theme Migration)
              └─> Phase 7 (Design Unification)
                    └─> Phase 8 (QA & Release)

Phase 1 (Foundation Cleanup)
  └─> Phase 3 (Shared Component Polish)
        └─> Phase 4 (Demo Completion)
              └─> Phase 6 (Testing Infrastructure)
                    └─> Phase 8 (QA & Release)

Phase 1 (Foundation Cleanup)
  └─> Phase 5 (Website Completion)  [can parallel with Phase 4]
        └─> Phase 6 (Testing Infrastructure)
              └─> Phase 8 (QA & Release)
```

**Key insight:** Phase 4 (Demo) and Phase 5 (Website) can run in parallel after Phase 1 completes. This is the primary schedule compression opportunity. If two developers are available, one can work on Demo while the other works on Website, saving 2-3 days.

---

## 11.9 Definition of Done (All Components)

### Definition of Done: Architecture

- [ ] `app/package.json` exists with all dependencies declared
- [ ] pnpm workspace resolves correctly (symlinks in `node_modules`)
- [ ] `@stockflows/ui` is in `peerDependencies` (not `dependencies`)
- [ ] `turbo run build` executes all four package builds
- [ ] No orphaned directories or duplicate packages

### Definition of Done: Shared UI Library

- [ ] Single canonical version for each component (no duplicates)
- [ ] All colors reference CSS custom properties from `tokens-v7.css`
- [ ] All components have proper ARIA attributes
- [ ] All components have keyboard navigation support
- [ ] All components have entrance/exit animations where appropriate
- [ ] Spacing follows 4px baseline grid
- [ ] `pnpm run build --filter=@stockflows/ui` passes

### Definition of Done: Shopify App

- [ ] Dark theme applied to all routes (`#0A0B0E` background)
- [ ] Zero `@shopify/polaris-icons` imports (all Material Symbols)
- [ ] All colors from design tokens (zero hardcoded hex)
- [ ] Font is Inter exclusively
- [ ] All 31+ routes visually consistent
- [ ] All existing functionality preserved
- [ ] `pnpm run build --filter=app` passes
- [ ] All existing E2E tests pass

### Definition of Done: Demo

- [ ] Zustand store manages all state (no Context providers)
- [ ] 50+ SKUs, 100+ POs, 20+ forecasts, 10+ vendors in mock data
- [ ] All 31 routes load with meaningful data
- [ ] Skeleton loading states on all routes
- [ ] Error boundary catches errors gracefully
- [ ] Guided tour covers Dashboard, Inventory, Purchasing, Forecasting
- [ ] Responsive sidebar (hamburger on mobile)
- [ ] Mobile card layout for tables
- [ ] All search inputs have `aria-label`
- [ ] Runs entirely client-side (no backend)
- [ ] `pnpm run build --filter=demo` passes
- [ ] 20 E2E test scenarios pass

### Definition of Done: Website

- [ ] All sections present: Hero, Problem Statement, Features, Comparison, Logos, Social Proof, CTA
- [ ] Customer logos are actual SVG images
- [ ] All claims are substantiated
- [ ] All CTAs link to correct destinations
- [ ] SEO meta tags and Open Graph configured
- [ ] Page loads in < 3 seconds on 3G
- [ ] Responsive at 375px, 768px, 1280px
- [ ] Zero console errors
- [ ] `pnpm run build --filter=website` passes
- [ ] 12 E2E test scenarios pass

### Definition of Done: Cross-Product

- [ ] Side-by-side screenshots show consistent visual design
- [ ] Visual regression tests pass with no unexpected diffs
- [ ] Accessibility tests pass with zero critical violations
- [ ] Lighthouse performance >= 90
- [ ] Lighthouse accessibility >= 90
- [ ] All three products deployed to production
- [ ] Cross-product links verified (website -> demo, website -> app)
- [ ] PROGRESS.md and IMPLEMENTATION-SUMMARY.md accurate
- [ ] Shopify App Store listing requirements met

---

## 11.10 Quick Reference: What Changed From Previous Plans

| Aspect | Previous Plan | RTE Unified Plan |
|---|---|---|
| Phase 0 | Did not exist | **NEW:** Architectural prerequisites (workspace fix, font setup) |
| Icon migration source | "Lucide to Material Symbols" | Corrected: "Polaris Icons to Material Symbols" |
| Demo state management | React Context + Zustand | Zustand only (no Context wrapper) |
| Component canonical version | Unclear (shared/ vs {Name}/) | `{Name}/` subdirectory versions |
| Dark theme migration timing | Phase 2 | **Moved to Phase 2** but prerequisite token import in Phase 0 |
| Timeline | 8-12 days (optimistic) | **12-16 days** (realistic, includes architectural prerequisites) |
| Testing scope | "22 new tests" | **67+ E2E tests** + 21 visual + 24 accessibility |
| Website priority | High | **Critical** (directly affects conversion) |
| Demo priority | High | **Critical** (primary conversion tool) |
| RACI matrix | Did not exist | **NEW** with clear ownership |
| Deployment checklist | Did not exist | **NEW** with staging and production checklists |
| Shopify App Store prep | Not addressed | **NEW** with submission checklist |
| Accessibility | Mentioned but not planned | **Planned** with specific WCAG scenarios |

---

*End of PART 11: Release Train Engineer Synthesis*

*This document is the FINAL, authoritative implementation plan for StockFlows v7. All previous parts (1-10) provide context and analysis; this part provides the execution roadmap. Developers should start with Phase 0 and proceed sequentially through Phase 8.*

---

## Notes

- This plan assumes no changes to the backend/business logic
- Focus is purely on frontend, design system, and quality
- Each phase should be verified before moving to the next
- The Playwright tests from Phase 6 should be run continuously throughout
- **Every phase must produce a buildable state** (`pnpm run build` passes)
- **PROGRESS.md should be updated at the end of each phase** to maintain accuracy
- **Scope creep must be actively managed** -- log new ideas in a backlog, do not add them to this plan
- **All three products deploy together** -- use the same Git tag for coordinated releases

---

# PART 12B: UI/UX DESIGNER FINAL REVIEW -- REFINEMENTS

**Reviewer:** Senior UI/UX Designer
**Date:** 2026-07-07
**Scope:** Final pass over the RTE synthesis (Part 11) to identify remaining gaps, missing specifics, and refinements

---

## 12B.1 Dark Theme Migration: Missing Polaris Override Cleanup (Phase 2)

The plan addresses importing `tokens-v7.css` and fixing 13 hardcoded color violations, but does not account for the **Polaris CSS override layer** currently in `app/tailwind.css`. This file (lines 84-263) contains extensive `.Polaris-Card`, `.Polaris-Button--variantPrimary`, `.Polaris-Badge--toneCritical`, etc. overrides that are all v6 light-theme styles. These will persist after `tokens-v7.css` is imported and will fight the dark theme.

**Specific CSS changes required in `app/tailwind.css` that are NOT in the plan:**

1. **Lines 84-93 (Polaris-Card overrides):** `background-color: #ffffff` must become `var(--bg-secondary)` (`#14161B`). Border must change from `var(--sf-border)` (`#E2E8F0`) to `var(--border-default)` (`#2A2D35`).

2. **Lines 96-128 (Polaris-Button overrides):** Primary button `background-color: var(--sf-brand)` (`#0F172A`) must become `var(--bg-tertiary)` or the accent color. Secondary button text `color: var(--sf-text)` (`#0F172A`) will be invisible on dark backgrounds -- must become `var(--text-primary)`.

3. **Lines 131-153 (Polaris-Badge overrides):** Background colors `#FEF2F2`, `#FFFBEB`, `#F0FDF4` are all light-theme subdued backgrounds. Must become dark equivalents (e.g., `rgba(248,113,113,0.1)` for danger).

4. **Lines 156-173 (Polaris-IndexTable overrides):** `background-color: var(--sf-bg)` (`#FAFBFC`) is light. Must become `var(--bg-primary)` or `var(--bg-secondary)`.

5. **Lines 191-232 (Navigation sidebar overrides):** `background: var(--sf-bg)` is `#FAFBFC`. Must become `var(--bg-secondary)` (`#14161B`). All hover/selected states reference light-theme colors.

6. **Lines 234-263 (TextField/Select overrides):** Border-radius `0px` is a design choice (brutalist) that should be reconsidered for dark theme -- the v7 token system uses `--radius-md: 6px`.

7. **Lines 57-77 (the `@theme` block):** This defines `--color-v6-*` Tailwind theme values. These should be replaced with v7 equivalents or removed entirely after `tokens-v7.css` import.

**Action:** Add a Phase 2 task "2.X: Rewrite all Polaris CSS overrides in `app/tailwind.css` to use v7 dark-theme tokens. Remove the entire `@theme` block and replace with v7 token mappings."

---

## 12B.2 Visual Regression Tests: Missing Critical Scenarios

The 7 visual regression scenarios (VIS-001 through VIS-007) cover basic screenshot comparisons but miss several high-value regression vectors:

**Missing scenarios:**

| Test ID | Scenario | Why It Matters |
|---|---|---|
| VIS-008 | StatCard appearance matches across app and demo | Three conflicting StatCard implementations exist; visual drift is likely after consolidation |
| VIS-009 | Badge variants (success/warning/error/info) look identical across products | Three different Badge color systems exist; this is the primary regression risk after Part 11 fixes |
| VIS-010 | Dark theme background is consistent (#0A0B0E) across all three products | Any Polaris override leak will cause background color drift |
| VIS-011 | Loading skeleton appearance is consistent | Skeleton background `#1E2129` vs token `--bg-tertiary` `#1C1E24` -- nearly identical but not the same |
| VIS-012 | Chart colors use correct tokens | StockLevelChart and ForecastChart have hardcoded colors that will look different from token-based colors |
| VIS-013 | Font rendering is consistent (Inter) across products | The app currently renders Plus Jakarta Sans; after migration, visual comparison validates correctness |

**Action:** Add VIS-008 through VIS-013 to `e2e/visual/cross-product.spec.ts` in Phase 6.

---

## 12B.3 Component Consolidation: StockBadge Not Addressed

Part 11 resolves the Badge/Button/Card/StatCard consolidation correctly (keep `{Name}/` subdirectory versions). However, **StockBadge** (`packages/stockflows-ui/src/components/StockBadge/StockBadge.tsx`) is a third Badge variant that is NOT mentioned in the consolidation plan.

StockBadge uses `border-current` for borders and its own color palette (`#10B981`, `#F59E0B`, `#EF4444`) that differs from both the canonical Badge (`#34D399`, `#FBBF24`, `#F87171`) and the tokens. If StockBadge is imported anywhere, it will produce visual inconsistency.

**Action:** Add to Phase 1, task 1.1: "Audit all imports of StockBadge. If used in demo or app routes, refactor to use canonical Badge component. If unused, delete `packages/stockflows-ui/src/components/StockBadge/`."

---

## 12B.4 Accessibility: Missing Requirements

Part 11 includes Modal focus trap, Navigation ARIA, and Tooltip keyboard support. These are correct. However, several accessibility requirements from the Part 8 UI/UX review are not carried into the RTE synthesis phases:

| Item | Current Plan Status | What's Missing |
|---|---|---|
| **8.9.4: EmptyState button `type="button"`** | Phase 3 task 3.5 covers this | Covered |
| **8.9.5: Loading bar ARIA** | Phase 2 task 2.14 covers this | Covered |
| **8.9.6: Demo search input `aria-label`** | Phase 4 task 4.18 covers this | Covered |
| **Demo sidebar button ARIA** | NOT in plan | Sidebar toggle buttons in `demo/src/App.tsx` (lines 152-166) lack `aria-label` and `aria-expanded`. Navigation buttons (lines 187-211) lack `aria-current="page"` for the active route |
| **Table semantics** | NOT in plan | All tables across app, demo, and website use `<table>` without `<caption>`, `<thead>` scope attributes, or `role="grid"` for interactive tables. WCAG 1.3.1 requires proper table semantics |
| **Charts inaccessible** | NOT in plan | StockLevelChart and ForecastChart are pure SVG with no `<title>`, `<desc>`, or `aria-label`. Screen readers will ignore them entirely. Add `role="img"` and `aria-label` to chart containers |
| **Color-only indicators** | NOT in plan | StatCard trend arrows and Badge status colors rely solely on color to convey meaning. Must add text labels or icons alongside color (e.g., "Up 12%" not just a green arrow) |
| **Skip-to-content link** | NOT in plan | None of the three products have a skip-to-content link. Required for keyboard users to bypass navigation |

**Action:** Add a Phase 3 task: "3.X: Accessibility audit of all shared components -- table semantics, chart ARIA, color-only indicator fixes, skip-to-content link." Add a Phase 4 task: "4.X: Add `aria-current='page'` and `aria-label` to demo sidebar navigation."

---

## 12B.5 Customer Journey: Missing Visual Continuity Cues

The plan addresses cross-product links (website CTA to demo, demo CTA to app) but does not address **visual continuity** across the journey. A merchant moving from website to demo to app should feel they are in the same product.

**Missing elements:**

1. **Shared header branding:** The website has a `Navigation` component with "StockFlows" branding. The demo has its own sidebar header. The app has Polaris navigation. None share a common header treatment. The website Navigation logo link should point to the homepage; the demo sidebar logo should link back to the website; the app sidebar should have a "Powered by StockFlows" link to the website.

2. **Consistent CTA styling:** Website uses `ctaPrimary` (label "Launch Shopify App") and `ctaSecondary` (label "Try Live Demo"). These link to different products but should use the same button styling as the app's primary action buttons. Verify that the canonical Button component's accent-primary style is used for all primary CTAs across all three products.

3. **Demo "Install" CTA is missing:** The demo routes have no visible CTA to install the actual app. Add a persistent banner or floating button in the demo: "Ready to manage real inventory? Install StockFlows" linking to `stockflows.fly.dev`.

4. **Website footer is generic:** The `Footer` component in `@stockflows/ui` does not include links to the demo or privacy policy. Add demo link, privacy policy, and terms of service links.

**Action:** Add to Phase 5 (Website) and Phase 4 (Demo): "Ensure Navigation component links back to website from demo. Add 'Install StockFlows' persistent CTA in demo layout. Add demo and legal links to Footer."

---

## 12B.6 Missing Visual Design Patterns

The plan does not define or reference standard interaction patterns for:

| Pattern | Status in Plan | Recommendation |
|---|---|---|
| **Toast/notification position and styling** | Phase 4 task 4.14 mentions "toast/notification system" but no design spec | Define: bottom-right position, dark background (`--bg-tertiary`), 4px left border accent color (green for success, red for error, yellow for warning), auto-dismiss after 5s |
| **Form validation error states** | Not in plan | Define: red border (`var(--danger)`), error text below field in `var(--danger)`, shake animation on submit |
| **Confirmation dialogs** | Not in plan | Reuse Modal component with destructive action variant (red "Delete" button) |
| **Data table row selection** | Not in plan | Define: selected row gets `var(--accent-muted)` background, checkbox column on left |
| **Pagination pattern** | Not in plan | Define: "Previous / 1 2 3 ... 10 / Next" with accent color for active page |
| **Search with results count** | Not in plan | Define: "Showing 1-25 of 1,234 results" text above table, consistent across app and demo |

**Action:** Add a new Phase 3.5 (or append to Phase 3): "Define and implement standard interaction patterns: toast notifications, form validation, confirmation dialogs, table selection, pagination, search results count."

---

## 12B.7 Material Symbols Icon Migration: Gaps

Part 11 correctly identifies the source (Polaris Icons) and target (Material Symbols), and includes adding the font to `root.tsx`. However:

1. **No icon mapping table:** The plan says "create icon mapping" but does not provide one. Here is the required mapping based on actual Polaris Icon usage in `app/routes/app.tsx`:

| Polaris Icon | Material Symbol | Notes |
|---|---|---|
| `HomeIcon` | `home` | Direct match |
| `PackageIcon` | `inventory_2` | Direct match |
| `ClipboardIcon` | `assignment` | Direct match |
| `ChartVerticalIcon` | `bar_chart` | Direct match |
| `SettingsIcon` | `settings` | Direct match |
| `CartIcon` | `shopping_cart` | Direct match |
| `SearchIcon` | `search` | Used in other routes |
| `PlusIcon` | `add` | Used in create flows |
| `DeleteIcon` | `delete` | Used in CRUD flows |
| `EditIcon` | `edit` | Used in edit flows |
| `FilterIcon` | `filter_list` | Used in list views |
| `DownloadIcon` | `download` | Used in reports |
| `UploadIcon` | `upload` | Used in import flows |
| `RefreshIcon` | `refresh` | Used in sync actions |

2. **Icon size standardization:** Polaris Icons render at 20px by default. Material Symbols need explicit `font-size` styling. Define: sidebar icons at 20px, inline icons at 18px, button icons at 16px.

3. **Icon weight:** Material Symbols support `FILL`, `wght`, `GRAD`, `opsz` axes. Define a consistent weight: `wght@400` for regular, `wght@600` for emphasis. Use `font-variation-settings` CSS to control.

**Action:** Add the icon mapping table to Phase 2 task 2.5. Add icon size/weight standardization as a new Phase 2 task.

---

## 12B.8 Tokens-v7.css: Missing Tokens

The current `tokens-v7.css` defines core colors, accent, text, borders, semantic colors, shadows, spacing, radius, typography, and z-index. However, it is missing tokens that components currently hardcode:

| Missing Token | Current Hardcoded Value | Used By | Recommended Token |
|---|---|---|---|
| Skeleton background | `#1E2129` | Skeleton.tsx | `--bg-skeleton: #1E2129` |
| Skeleton shimmer | None | Skeleton.tsx (missing) | `--skeleton-shimmer: rgba(255,255,255,0.05)` |
| Focus ring color | `#C7FB33` | Button.tsx | `--focus-ring: var(--accent-primary)` |
| Focus ring offset | `#0A0B0E` | Button.tsx | `--focus-ring-offset: var(--bg-primary)` |
| Overlay/mask | `rgba(0,0,0,0.5)` | Modal.tsx | `--overlay: rgba(0,0,0,0.5)` |
| Tooltip background | `#252830` | Tooltip.tsx | `--bg-tooltip: var(--bg-quaternary)` |
| Toast background | Not defined | New toast component | `--bg-toast: var(--bg-tertiary)` |

**Action:** Add missing tokens to `tokens-v7.css` before Phase 3 component polish work begins.

---

## 12B.9 Refinements to Phase 3 (Shared Component Polish)

Phase 3 task 3.9 says "Standardize all spacing" but provides only three rules. The Part 8 spacing audit (section 8.8) identified specific inconsistencies that should be addressed with concrete values:

| Component | Current | Standardized | Token |
|---|---|---|---|
| Card padding | `p-4` (app) / `p-6` (shared) | `p-6` everywhere | `--space-6` |
| Page heading margin | `mb-6` (Dashboard) / `mb-8` (Settings, PageHeader) | `mb-8` everywhere | `--space-8` |
| Table grid gap | `gap-4` (Dashboard) / `gap-6` (Forecasting) | `gap-4` for data tables | `--space-4` |
| Card grid gap | `gap-4` (Dashboard) / `gap-8` (FeatureCards) | `gap-6` for card grids | `--space-6` |
| EmptyState padding | `p-8` (app) / `py-12` (shared) | `py-12` for empty states | `--space-12` |

**Action:** Expand task 3.9 with the specific values above.

---

## 12B.10 Refinements to Phase 5 (Website Completion)

Phase 5 task 5.1 says "Replace text placeholders in CustomerLogos with SVG images." The website `App.tsx` (line 12-15) currently has only 2 logo entries with empty `src` strings. This is insufficient for a "Trusted by" section.

**Refinements:**

1. **Minimum 6 customer logos** for social proof credibility. Use publicly available SVG logos or styled brand-name treatments for real companies in the Shopify ecosystem (e.g., Allbirds, Gymshark, MVMT, Fashion Nova -- all Shopify merchants).

2. **Remove the unsubstantiated claim** from `CustomerLogos.tsx` default heading: "Trusted by more than 50% of Fortune 100 companies." Replace with "Trusted by Shopify merchants worldwide" or a verifiable number.

3. **Website `App.tsx` is missing the SocialProof section** from the spec. The RTE plan (task 5.3) says "Create SocialProof section" but the current `App.tsx` has no import or rendering of any social proof component. Add `<SocialProof />` between `<ComparisonMatrix />` and `<CustomerLogos />`.

**Action:** Update Phase 5 tasks 5.1-5.3 with minimum logo count, claim fix, and SocialProof insertion point.

---

## Summary of Top 10 Refinements (Ranked by Impact)

| Rank | Refinement | Phase Affected | Impact |
|---|---|---|---|
| 1 | Rewrite all Polaris CSS overrides in `app/tailwind.css` for dark theme (12B.1) | Phase 2 | Without this, the dark theme migration will be incomplete -- Polaris overrides will leak light-theme styles |
| 2 | Add `aria-current`, `aria-label`, skip-to-content, and table semantics (12B.4) | Phases 3-4 | WCAG 2.1 AA compliance will fail without these |
| 3 | Add missing `tokens-v7.css` tokens for skeleton, focus ring, overlay, tooltip, toast (12B.8) | Phase 3 | Components will continue hardcoding values without these tokens |
| 4 | Audit and remove/refactor StockBadge (12B.3) | Phase 1 | Third Badge variant will cause visual inconsistency if left in place |
| 5 | Add 6 more visual regression test scenarios (12B.2) | Phase 6 | Current 7 scenarios miss the highest-risk regression vectors |
| 6 | Add persistent "Install" CTA in demo + cross-product navigation links (12B.5) | Phases 4-5 | Merchant journey conversion depends on clear next-step CTAs |
| 7 | Define toast, form validation, confirmation dialog, pagination patterns (12B.6) | Phase 3 | Missing interaction patterns will be implemented inconsistently |
| 8 | Provide icon mapping table and size/weight standards (12B.7) | Phase 2 | Developers cannot migrate icons without a mapping reference |
| 9 | Expand spacing standardization with specific values per component (12B.9) | Phase 3 | Generic "standardize spacing" instruction will be interpreted differently |
| 10 | Fix website logo count, claim, and SocialProof insertion (12B.10) | Phase 5 | Website social proof will look sparse with only 2 empty logos |

---

# PART 12C: ARCHITECT FINAL REVIEW -- REFINEMENTS

**Author:** Senior Software Architect
**Date:** 2026-07-07
**Purpose:** Final validation of the Part 11 plan against the actual codebase state. Only NEW findings or corrections are listed -- items already addressed in Part 11 or Part 12B are omitted.

---

## 12C.1 Phase 0: Corrected and Missing Tasks

### 12C.1.1 Task 0.3 -- Root `stockflows-ui/` IS orphaned, confirmed

Glob confirms `stockflows-ui/src/styles/tokens-v7.css` exists at root level, but no `package.json` exists there. This directory is purely dead weight. Task 0.3 (delete it) is valid and safe.

### 12C.1.2 MISSING Task: Create `app/tsconfig.json`

The plan (section 10.8) identifies that the root `tsconfig.json` excludes `app/**/*` and that `app/tsconfig.json` does not exist, but labels this "Low severity." It is actually a **Phase 0 prerequisite** because:

- The root `paths` alias (`@stockflows/ui/*` -> `./packages/stockflows-ui/src/*`) is excluded from `app/` by the root tsconfig's `exclude` array (line 15: `"app/**/*"`).
- Without `app/tsconfig.json`, IDE autocompletion for `@stockflows/ui` imports will show red squiggles in every app file.
- While Remix/Vite handles resolution at build time, developer experience is degraded.

**New Task 0.11:** Create `app/tsconfig.json` with:
```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "paths": { "@stockflows/ui/*": ["../packages/stockflows-ui/src/*"] }
  },
  "include": ["**/*"]
}
```

**Effort:** 15 minutes.

### 12C.1.3 MISSING Task: `app/package.json` dependency list is unspecified

Phase 0, Task 0.1 says "Create `app/package.json` with all app dependencies" but does not enumerate them. The app's actual dependencies (verified from imports in `app/routes/app.tsx`, `app/root.tsx`, `app/entry.server.tsx`) include:

| Dependency | Source |
|---|---|
| `@remix-run/node` | Route loaders/actions |
| `@remix-run/react` | Components, hooks |
| `@remix-run/serve` | Production server |
| `@remix-run/vite` | Vite plugin |
| `@shopify/polaris` | UI components (Frame, Navigation, Page, etc.) |
| `@shopify/polaris-icons` | Icon imports (to be migrated) |
| `@shopify/app-bridge-react` | Embedded app auth |
| `react` / `react-dom` | Core React |
| `isbot` | Bot detection in entry.server |
| `@sentry/remix` | Error tracking |
| `@prisma/client` | Database (imported via `~/lib/db/client`) |
| `prisma` (devDep) | Schema CLI |
| `vite` (devDep) | Build tool |
| `tailwindcss` (devDep) | CSS framework |
| `typescript` (devDep) | Type checking |

**New Task 0.12:** Enumerate the above in `app/package.json`. Do not omit `@prisma/client` and `prisma` -- `app/root.tsx` line 15 imports `~/lib/db/client` which uses Prisma.

**Effort:** 30 minutes.

### 12C.1.4 Font Loading: Incomplete Removal Plan

Task 0.10 says to remove "Plus Jakarta Sans and Playfair Display font loads." Verified in `app/root.tsx` (line 33): the font link also loads **JetBrains Mono**. The plan should either:

- Remove JetBrains Mono too (if not used in `app/` code), or
- Keep it if any code uses `font-mono` / monospace styling.

**Action:** Search for `JetBrains` or `font-mono` usage in `app/` before removing.

---

## 12C.2 `@stockflows/ui` Package Configuration

### 12C.2.1 `react-dom` missing from peerDependencies

The plan (Task 0.5) moves `react` to `peerDependencies` but does not add `react-dom`. The `Modal.tsx` component uses `ReactDOM.createPortal`, which requires `react-dom` as a peer dependency. Without it, consumers will get a runtime error if `react-dom` is not hoisted.

**Updated Task 0.5:**
```json
"peerDependencies": {
  "react": "^18.0.0 || ^19.0.0",
  "react-dom": "^18.0.0 || ^19.0.0"
},
"peerDependenciesMeta": {
  "react-dom": { "optional": true }
}
```

### 12C.2.2 No `vite.config.ts` for library build

The plan (section 10.11) correctly identifies that `vite build` for a library needs `build.lib` mode. However, **no `vite.config.ts` exists at all in `packages/stockflows-ui/`**. The build script is `echo 'Building @stockflows/ui...'` -- a no-op.

Phase 0 should include creating `packages/stockflows-ui/vite.config.ts` with:
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: { globals: { react: 'React', 'react-dom': 'ReactDOM' } },
    },
  },
});
```

**New Task 0.13:** Create `packages/stockflows-ui/vite.config.ts`.

**Effort:** 30 minutes.

### 12C.2.3 CSS wildcard export may not resolve

The current `exports` field in `packages/stockflows-ui/package.json`:
```json
"exports": {
  ".": "./src/index.ts",
  "./styles/*": "./src/styles/*"
}
```

The `styles/*` wildcard pattern may not resolve correctly with Vite's CSS `@import` resolution. The plan (section 10.11) suggests adding an explicit export -- this is correct. **Confirm Task 0.6 adds:**
```json
"./styles/tokens-v7.css": "./src/styles/tokens-v7.css"
```

---

## 12C.3 Turbo.json Task Naming

### 12C.3.1 `app#build` will not resolve without `app/package.json`

The root `package.json` has `"workspaces": ["app", ...]` but **no `app/package.json` exists**. Turborepo resolves task names by reading `name` from each workspace package's `package.json`. The task `app#build` uses the directory name, not a package name. This will either skip silently or error.

**Once Task 0.1 is complete** (creating `app/package.json` with `"name": "@stockflows/app"`), the turbo.json task must be renamed:

```json
"tasks": {
  "@stockflows/ui#build": { "dependsOn": ["^build"] },
  "@stockflows/app#build": { "dependsOn": ["@stockflows/ui#build"] },
  "@stockflows/website#build": { "dependsOn": ["@stockflows/ui#build"] },
  "@stockflows/demo#build": { "dependsOn": ["@stockflows/ui#build"] }
}
```

**New Task 0.14:** Update `turbo.json` task names to use `@stockflows/app#build`.

**Effort:** 5 minutes.

---

## 12C.4 Playwright Configuration Gaps

### 12C.4.1 Missing `@playwright/test` devDependency

The root `package.json` has no devDependencies at all. Playwright must be installed. **Add to root `package.json`:**
```json
"devDependencies": {
  "@playwright/test": "^1.45.0"
}
```

**New Task 6.0 (before 6.1):** Install `@playwright/test` as root devDependency.

**Effort:** 5 minutes.

### 12C.4.2 WebServer commands need explicit specification

The plan says "webServer config for each product" but does not specify exact commands:

| App | Command | Port | Pre-req |
|---|---|---|---|
| App (Remix) | `remix vite:dev` | 5173 | `DATABASE_URL`, Shopify credentials |
| Demo (Vite) | `pnpm --filter @stockflows/demo dev` | 5174 | None |
| Website (Vite) | `pnpm --filter @stockflows/website dev` | 5175 | None |

**The app's webServer requires environment variables.** The Playwright config should include:
```ts
webServer: {
  command: 'remix vite:dev',
  port: 5173,
  env: { DATABASE_URL: process.env.DATABASE_URL },
  reuseExistingServer: !process.env.CI,
}
```

**Refinement to Task 6.1:** Add `env` passthrough and `reuseExistingServer` for local dev.

### 12C.4.3 App tests require database seeding -- not optional

The plan (Task 6.11) mentions `globalSetup` for database seeding "if needed." For the Shopify app, tests that hit routes like `/app/inventory` require a seeded database. This is not optional -- **it is required** for app E2E tests to pass.

**Refinement to Task 6.11:** Change "if needed" to "required for app tests." Create `e2e/globalSetup.ts` that runs `prisma db seed` before the app project starts.

---

## 12C.5 TypeScript / Build Pipeline Issues Not Addressed

### 12C.5.1 `@stockflows/ui` exports raw TypeScript

The package `exports` field maps `.` to `./src/index.ts` (raw TypeScript). This works for Vite-based consumers (Remix, Vite) which can transpile TS on the fly. However:

- If any non-Vite consumer ever imports this package, it will fail.
- There is no compiled output directory (`dist/`).

**Recommendation:** This is acceptable for the current three Vite-based consumers. Add a note to the plan: "All three consumers (app, demo, website) use Vite, so raw TS exports are acceptable. If a non-Vite consumer is added later, add a build step producing `dist/`."

### 12C.5.2 Root `package.json` has `"workspaces"` alongside pnpm

The root `package.json` has `"workspaces": ["app", "packages/stockflows-ui", ...]` but the project uses pnpm (declared via `"packageManager": "pnpm@9.15.0"`). pnpm uses `pnpm-workspace.yaml` for workspace definition, not `package.json` `workspaces`. The `workspaces` field is a Yarn/npm artifact and can cause confusion.

Task 0.4 (remove `workspaces` from root `package.json`) is correct. Confirmed: `pnpm-workspace.yaml` already lists the correct packages.

---

## 12C.6 Deployment / Infrastructure Concerns

### 12C.6.1 Fly.io app deployment needs secrets configuration

Phase 8 tasks 8.7 and 8.15 say "Deploy app to Fly.io" but do not mention that the Remix app requires:
- `DATABASE_URL` (PostgreSQL connection string)
- `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`
- `SESSION_SECRET`
- `SENTRY_DSN`

These must be set via `fly secrets set`. The deployment checklist (section 11.5) does not mention secrets.

**New item in 11.5 Production Deployment checklist:**
```
- [ ] Fly.io secrets configured (DATABASE_URL, SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SESSION_SECRET, SENTRY_DSN)
```

### 12C.6.2 Cloudflare Pages: build output directory not specified

The demo and website are Vite SPAs that build to `dist/`. Cloudflare Pages deployment requires:
- **Build command:** `pnpm run build --filter=@stockflows/demo` (or `@stockflows/website`)
- **Build output directory:** `dist/` (Vite default)
- **Node.js version:** Must match locally (>= 18)

The plan does not specify build output directories. **Add to Phase 5 and 8:** Verify that `vite build` output goes to `dist/` and that Cloudflare Pages is configured with the correct output directory.

---

## 12C.7 Consolidated New Tasks and Modifications

| # | Type | Description | Phase |
|---|---|---|---|
| 0.11 | NEW | Create `app/tsconfig.json` with paths alias | Phase 0 |
| 0.12 | NEW | Enumerate `app/package.json` dependencies explicitly | Phase 0 |
| 0.13 | NEW | Create `packages/stockflows-ui/vite.config.ts` for lib build | Phase 0 |
| 0.14 | NEW | Update `turbo.json` task name `app#build` to `@stockflows/app#build` | Phase 0 |
| 0.5a | MODIFY | Add `react-dom` to `peerDependencies` in `@stockflows/ui` | Phase 0 |
| 0.10a | CLARIFY | Check `JetBrains Mono` usage before removing font link | Phase 0 |
| 6.0 | NEW | Install `@playwright/test` as root devDependency | Phase 6 |
| 6.1a | MODIFY | Add `env` passthrough and `reuseExistingServer` to Playwright webServer | Phase 6 |
| 6.11a | MODIFY | Change database seeding from "if needed" to "required for app tests" | Phase 6 |
| 11.5a | ADD | Fly.io secrets to deployment checklist | Phase 8 |

---

*End of PART 12C: Architect Final Review*

---

# PART 12A: BA FINAL REVIEW -- REFINEMENTS

**Reviewer:** Senior Business Analyst
**Date:** 2026-07-07
**Scope:** Business priorities, timeline feasibility, acceptance criteria sufficiency, RACI completeness, merchant funnel, business risk, and deployment checklist readiness. Only NEW findings or gaps not already addressed in Parts 11, 12B, or 12C are listed.

---

## 12A.1 Website (Marketing Funnel) Needs Earlier Prioritization

The plan places the website in Phase 5 (Days 6-8), parallel with the demo. The website is the **first touchpoint** in the merchant acquisition funnel (Website -> Demo -> App). Spending Days 1-5 on app architecture and design system before touching the conversion entry point means the highest-leverage asset is delayed by nearly a week.

**Risk:** If the website is not ready to convert early visitors during development, the team loses the ability to gather real-world conversion data during the build cycle. The website should be shippable (even if minimal) by Day 4-5 so it can be deployed to staging for early feedback.

**Action:** Move the following to Phase 3 (Days 4-5) as a "Website MVP" sub-phase:
- 5.1: Customer logos with SVGs
- 5.3: SocialProof section
- 5.5: Pricing section
- 5.6: Verify all CTAs
- 5.7: SEO meta tags

This ensures the website is deployment-ready by Day 5, even if polish (animations, scroll triggers) happens in Phase 5 later.

---

## 12A.2 Phase Gate Criteria Missing Between Phases

The plan has phase-level acceptance criteria but no explicit **Go/No-Go gates** between phases. Without gates, a team member could proceed to Phase 4 (Demo) with unresolved Phase 2 (Dark Theme) issues, compounding rework.

**Action:** Add the following gate rule to the plan notes:
> "A phase is NOT complete until all its acceptance criteria are verified by the RTE. No phase may begin until the preceding phase's gate is passed. If a gate fails, the responsible owner must remediate before proceeding."

---

## 12A.3 RACI Gap: No Ownership of Merchant Acquisition Funnel Metrics

The RACI matrix (section 11.3) assigns the RTE as Accountable for every phase, but there is no role responsible for **conversion optimization** or **merchant funnel metrics**. The plan describes the funnel (Website -> Demo -> App) but assigns no one to:
- Define conversion KPIs (website visit-to-demo, demo-to-install, install-to-paid)
- Set up analytics infrastructure (Plausible, PostHog, or similar)
- Monitor funnel performance post-launch
- Run A/B tests on CTAs or landing page variants

**Action:** Add a "Growth/Analytics" row to the RACI matrix:
| Task Area | RTE | BA | UI/UX | Architect | Developer |
|---|---|---|---|---|---|
| Funnel metrics & analytics setup | A | R | C | C | C |

Add a Phase 5 task: "5.X: Integrate privacy-respecting analytics (e.g., Plausible) on website and demo. Define baseline KPIs: visit-to-demo rate, demo-to-install rate, install-to-activation rate."

---

## 12A.4 Shopify App Store Submission Checklist Is Incomplete

The deployment checklist (section 11.5) mentions "Shopify App Store Submission" but the items are shallow. Missing requirements for Shopify App Store review:

| Missing Item | Why It Matters |
|---|---|
| OAuth scopes documentation | Shopify requires explicit scope justification in the listing review |
| Data handling / data retention policy | Shopify requires disclosure of what data the app accesses and stores |
| GDPR/CCPA compliance statement | Required for apps serving EU/CA merchants |
| App review submission screenshots (at least 3) | Shopify requires 1280x800 screenshots in the Partner Dashboard |
| Test store credentials for reviewers | Must provide a test Shopify store with pre-loaded data |
| App functionality video (optional but recommended) | 1-2 minute walkthrough video improves approval speed |
| Privacy policy URL and ToS URL | Must be live and accessible (not just planned) |
| Billing plan configuration (if applicable) | Must match the listing description exactly |

**Action:** Expand section 11.5 "Shopify App Store Submission" with the above items. Assign to BA with a 1-day lead time before production deployment.

---

## 12A.5 Business Risk: No Competitive Differentiation in Website Copy

The website sections (Hero, Problem Statement, Features, Comparison) are defined structurally but there is no business guidance on **competitive positioning**. The SPEC mentions a comparison matrix but the plan does not specify which competitors to compare against or what differentiators to emphasize.

For an inventory management app in the Shopify ecosystem, the competitive landscape includes Stocky (Shopify's built-in), Stocky alternatives (Trunk, Stock Inventory), and general inventory tools. Without explicit differentiation messaging, the website risks blending in.

**Action:** Add a Phase 5 task: "5.X: BA to draft competitive positioning statement and comparison matrix content identifying 2-3 key differentiators vs. Shopify's built-in Stocky and top alternatives."

---

## 12A.6 Timeline Risk: 16 Days Assumes Zero External Dependencies

The 16-day timeline (section 11.8) assumes no external dependencies. In practice:

| External Factor | Potential Delay | Mitigation |
|---|---|---|
| Shopify App Store review | 1-5 business days (uncontrollable) | Submit listing early in Phase 8, not after production deploy |
| Cloudflare Pages deployment issues | 0.5-1 day | Pre-configure Pages in Phase 0; verify build output directory (per 12C.6.2) |
| Fly.io provisioning delays | 0.5-1 day | Verify Fly.io account is active and funded in Phase 0 |
| pnpm workspace resolution issues | 0.5-1 day | Test `pnpm install` in Phase 0 before any dependent work |
| Font loading (Material Symbols CDN) | 0-0.5 day | Test font rendering in Phase 0; fallback to local font file if CDN is slow |

**Action:** Add to the plan notes:
> "The 16-day timeline assumes all external services (Shopify Partner Dashboard, Cloudflare, Fly.io) are pre-configured and accessible. Add 2-3 buffer days for Shopify App Store review. Plan for a 19-20 calendar day end-to-end timeline."

---

## 12A.7 Missing: Post-Launch Monitoring and Rollback Trigger

Phase 8 ends with "post-deployment verification" but has no criteria for **when to roll back**. If the dark theme migration causes a spike in support tickets or the website conversion rate drops, there is no defined trigger or process.

**Action:** Add to Phase 8 acceptance criteria:
- [ ] Rollback trigger defined: "If >5 critical bugs reported within 24 hours of production deploy, initiate rollback to pre-migration state"
- [ ] Post-launch monitoring: "Monitor error rates and user-facing metrics for 48 hours post-deployment"
- [ ] Rollback procedure tested: "Verify that reverting to the last stable Git tag produces a working deployment"

---

## 12A.8 Summary of BA Refinements

| # | Refinement | Impact | Phase Affected |
|---|---|---|---|
| 1 | Move Website MVP to Phase 3 for earlier conversion readiness | High | Phase 3, 5 |
| 2 | Add explicit Go/No-Go phase gates | Medium | All phases |
| 3 | Add funnel metrics ownership to RACI | Medium | RACI matrix, Phase 5 |
| 4 | Expand Shopify App Store submission checklist | High | Phase 8 |
| 5 | Add competitive positioning task to website phase | Medium | Phase 5 |
| 6 | Acknowledge external dependency timeline risks | High | Timeline, Phase 0, 8 |
| 7 | Define post-launch rollback triggers | Medium | Phase 8 |

---

*End of PART 12A: BA Final Review*

---

# PART 13: RTE FINAL SYNTHESIS -- CLOSING THE LOOP

**Author:** Release Train Engineer (RTE)
**Date:** 2026-07-07
**Purpose:** Synthesize all findings from the three final reviews (12A, 12B, 12C), resolve cross-review conflicts, produce a consolidated change list, update the timeline and critical path, and deliver the final GO/NO-GO assessment.

---

## 13.1 Consolidated Changes from All Three Final Reviews

### 13.1.1 Changes Incorporated from BA Final Review (12A)

| # | Change | Rationale | Phase Affected |
|---|---|---|---|
| BA-1 | Move Website MVP (logos, social proof, pricing, CTAs, SEO) to Phase 3 (Days 4-5) | Website is the first merchant touchpoint; delaying it to Days 6-8 loses early conversion feedback | Phases 3, 5 |
| BA-2 | Add explicit Go/No-Go phase gates between all phases | Prevents carrying unresolved issues into subsequent phases | All phases |
| BA-3 | Add "Funnel metrics & analytics setup" to RACI matrix (BA responsible) | No one owns conversion optimization or funnel KPIs | RACI, Phase 5 |
| BA-4 | Expand Shopify App Store submission checklist (OAuth scopes, data handling, GDPR, screenshots, test store, video, privacy policy URL, billing config) | Current checklist is shallow; missing items will delay or block App Store approval | Phase 8 |
| BA-5 | Add competitive positioning task (BA drafts differentiation statement for comparison matrix) | Website copy has no explicit competitive differentiation messaging | Phase 5 |
| BA-6 | Acknowledge external dependency risks in timeline (Shopify review 1-5 days, Cloudflare, Fly.io, pnpm, font CDN) | 16-day estimate assumes zero external delays; reality is 19-20 calendar days | Timeline notes |
| BA-7 | Define post-launch rollback triggers (>5 critical bugs in 24h = rollback), 48-hour monitoring, rollback procedure verification | No rollback criteria existed; team would not know when to revert | Phase 8 |

### 13.1.2 Changes Incorporated from UI/UX Designer Final Review (12B)

| # | Change | Rationale | Phase Affected |
|---|---|---|---|
| UX-1 | Rewrite all Polaris CSS overrides in `app/tailwind.css` (lines 84-263) for dark theme -- not just import tokens-v7.css | Polaris overrides contain v6 light-theme styles that will fight the dark theme | Phase 2 |
| UX-2 | Add 6 visual regression scenarios (VIS-008 to VIS-013): StatCard, Badge variants, dark background consistency, skeleton, chart colors, font rendering | Current 7 scenarios miss the highest-risk regression vectors | Phase 6 |
| UX-3 | Audit and remove/refactor StockBadge component | Third Badge variant with divergent color palette will cause visual inconsistency | Phase 1 |
| UX-4 | Add accessibility tasks: sidebar button ARIA, table semantics, chart ARIA, color-only indicator fixes, skip-to-content link | WCAG 2.1 AA compliance will fail without these | Phases 3-4 |
| UX-5 | Add persistent "Install StockFlows" CTA in demo layout + cross-product navigation links (demo -> website, app -> website) | Merchant journey conversion depends on clear next-step CTAs | Phases 4-5 |
| UX-6 | Define standard interaction patterns: toast notifications, form validation errors, confirmation dialogs, table selection, pagination, search results count | Missing patterns will be implemented inconsistently across routes | Phase 3 |
| UX-7 | Add icon mapping table (14 Polaris-to-Material-Symbols mappings) and icon size/weight standards | Developers cannot migrate icons without a mapping reference | Phase 2 |
| UX-8 | Add missing tokens to `tokens-v7.css`: skeleton, skeleton shimmer, focus ring, focus ring offset, overlay, tooltip background, toast background | Components will continue hardcoding values without these tokens | Phase 3 |
| UX-9 | Expand spacing standardization with concrete values per component (card p-6, heading mb-8, table gap-4, card grid gap-6, empty state py-12) | Generic "standardize spacing" instruction will be interpreted differently | Phase 3 |
| UX-10 | Fix website: minimum 6 logos, remove unsubstantiated "50% of Fortune 100" claim, add SocialProof component between ComparisonMatrix and CustomerLogos | Website social proof will look sparse with only 2 empty logos and a false claim | Phase 5 |

### 13.1.3 Changes Incorporated from Architect Final Review (12C)

| # | Change | Rationale | Phase Affected |
|---|---|---|---|
| AR-1 | Create `app/tsconfig.json` with `paths` alias for `@stockflows/ui` | IDE autocompletion broken for all app files; root tsconfig excludes `app/**/*` | Phase 0 (NEW task 0.11) |
| AR-2 | Enumerate `app/package.json` dependencies explicitly (Remix, Polaris, Prisma, Sentry, Vite, etc.) | Task 0.1 says "all app dependencies" but does not list them; developers will guess | Phase 0 (NEW task 0.12) |
| AR-3 | Create `packages/stockflows-ui/vite.config.ts` with `build.lib` mode | No vite config exists; `vite build` would produce an SPA, not a library | Phase 0 (NEW task 0.13) |
| AR-4 | Update `turbo.json` task name from `app#build` to `@stockflows/app#build` | Turbo resolves by package name from `package.json`; `app#build` will silently skip | Phase 0 (NEW task 0.14) |
| AR-5 | Add `react-dom` to `peerDependencies` in `@stockflows/ui` (alongside `react`) | `Modal.tsx` uses `ReactDOM.createPortal`; missing peer dep causes runtime error | Phase 0 (task 0.5 modified) |
| AR-6 | Check `JetBrains Mono` usage in `app/` before removing font link | Font link loads JetBrains Mono; removing it may break monospace styling | Phase 0 (task 0.10 clarified) |
| AR-7 | Install `@playwright/test` as root devDependency | Root `package.json` has no devDependencies; Playwright cannot run without it | Phase 6 (NEW task 6.0) |
| AR-8 | Add `env` passthrough and `reuseExistingServer` to Playwright webServer config | App tests need `DATABASE_URL`; local dev should reuse running servers | Phase 6 (task 6.1 modified) |
| AR-9 | Change database seeding from "if needed" to "required for app tests" with `globalSetup.ts` | App routes require seeded database; tests will fail without it | Phase 6 (task 6.11 modified) |
| AR-10 | Add Fly.io secrets to deployment checklist (DATABASE_URL, SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SESSION_SECRET, SENTRY_DSN) | Deployment tasks mention Fly.io but not the required secrets | Phase 8 (task 11.5 modified) |
| AR-11 | Specify Cloudflare Pages build output directory (`dist/`) for demo and website | Deployment config is ambiguous without explicit output directory | Phases 5, 8 |

---

## 13.2 Cross-Review Conflict Resolution

No direct conflicts exist between the three final reviews. The reviews are complementary:

| Topic | BA Says | UI/UX Says | Architect Says | Resolution |
|---|---|---|---|---|
| Website timing | Move to Phase 3 (BA-1) | Add more visual content (UX-10) | Add SEO and Cloudflare config (AR-11) | All three agree: website needs more attention, earlier. Incorporate all. |
| Accessibility | Not addressed in detail | 5 specific a11y gaps (UX-4) | Not addressed in detail | Follow UI/UX recommendations. Architect does not contradict. |
| Timeline | 16 days is optimistic; plan for 19-20 (BA-6) | No timeline comments | Adds Phase 0 tasks (AR-1 through AR-4) | Architect additions add ~0.5 days to Phase 0. BA's external dependency buffer is valid. New total: **16-18 business days** (20-22 calendar days). |
| Phase gates | Add Go/No-Go gates (BA-2) | No gate comments | No gate comments | Adopt BA recommendation. Add gate protocol to plan notes. |

---

## 13.3 Updated Phase Timeline

The additions from all three reviews do not fundamentally alter the phase ordering but do add approximately 1-2 days of work and require more buffer for external dependencies.

### Revised Gantt Overview (18 Business Days)

```
Day:  1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16   17   18
      |----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
P0:   [=================]
P1:              [==========]
P2:                   [===============]
P3:                        [=====================]
P4:                             [==========================]
P5:                        [==========] (MVP)   [==========] (Polish)
P6:                                    [==========================]
P7:                                              [==================]
P8:                                                    [==================]
Ext:                                                                    [====] (Shopify review buffer)
```

### Updated Milestone Dates

| Milestone | Target Day | Deliverable | Gate Owner |
|---|---|---|---|
| **M0: Architecture Fixed** | Day 3 | `app/package.json`, `app/tsconfig.json`, `vite.config.ts`, workspace resolves, build passes | Architect |
| **M1: Foundation Clean** | Day 4 | Zero duplicate components, docs reconciled, StockBadge resolved, accessibility baseline set | Architect + UI/UX |
| **M2: App Dark Theme** | Day 6 | App runs dark theme, all Polaris overrides rewritten, icons migrated, tokens complete | Architect + UI/UX |
| **M3: Components Polished** | Day 6 | Shared components production-ready, interaction patterns defined | UI/UX |
| **M4: Demo Complete** | Day 9 | Demo fully functional with 50+ SKUs, guided tour, install CTA, responsive | Developer + UI/UX |
| **M5: Website MVP Deployed** | Day 5 | Website has logos, social proof, CTAs, SEO -- deployed to staging | BA + UI/UX |
| **M5b: Website Complete** | Day 9 | Website has animations, competitive positioning, analytics | BA + UI/UX |
| **M6: Tests Passing** | Day 12 | All E2E, visual (13 scenarios), responsive, accessibility tests pass | Architect + Developer |
| **M7: Visual Unity** | Day 14 | All three products look identical, cross-product links verified | UI/UX |
| **M8: Release Ready** | Day 16 | All three products deployed to production, App Store submitted | All |
| **M9: External Buffer** | Day 18 | Shopify App Store review completion, rollback monitoring | BA |

---

## 13.4 Updated Critical Path

```
Phase 0 (Architectural Prerequisites) -- Days 1-3
  ├─> Phase 1 (Foundation Cleanup) -- Days 3-4
  │     ├─> Phase 2 (App Dark Theme Migration) -- Days 4-6
  │     │     └─> Phase 7 (Design Unification) -- Days 12-14
  │     │           └─> Phase 8 (QA & Release) -- Days 14-16
  │     ├─> Phase 3 (Shared Component Polish + Interaction Patterns) -- Days 4-6
  │     │     └─> Phase 4 (Demo Completion) -- Days 6-9
  │     │           └─> Phase 6 (Testing Infrastructure) -- Days 8-12
  │     │                 └─> Phase 8 (QA & Release) -- Days 14-16
  │     └─> Phase 5 MVP (Website Core) -- Days 4-5  [PARALLEL with Phase 2-3]
  │           └─> Phase 5 Full (Website Polish) -- Days 7-9
  │                 └─> Phase 6 (Testing Infrastructure) -- Days 8-12
  └─> Phase 8 (QA & Release) -- Days 14-16
        └─> External Buffer (Shopify review) -- Days 16-18
```

**Primary schedule compression:** Phase 5 MVP (website) runs in parallel with Phase 2-3 (Days 4-5). This is the BA's key recommendation. The website is shippable to staging by Day 5.

**Longest path:** Phase 0 -> Phase 1 -> Phase 2 -> Phase 7 -> Phase 8 = 16 days. This is the critical path. Any slip in Phase 0 or Phase 2 directly delays release.

---

## 13.5 Final "GO / NO-GO" Assessment for Starting Execution

### Assessment: **GO -- with conditions**

The plan is comprehensive, cross-validated by three specialist reviews, and addresses all known gaps. Execution can begin immediately.

### Conditions for GO

| Condition | Status | Action Required Before Day 1 |
|---|---|---|
| All three reviews synthesized | COMPLETE | Part 13 (this section) |
| Conflicts resolved | COMPLETE | Section 13.2 |
| Timeline updated | COMPLETE | Section 13.3 (18 business days) |
| Critical path identified | COMPLETE | Section 13.4 |
| Developer handoff checklist | COMPLETE | Section 13.6 |
| Definition of complete | COMPLETE | Section 13.7 |

### Conditions for NO-GO (would block start)

| Blocker | Status |
|---|---|
| Codebase inaccessible | NOT BLOCKED -- files readable |
| `app/` directory structure unknown | NOT BLOCKED -- Architect verified structure |
| Design tokens file missing | NOT BLOCKED -- `tokens-v7.css` exists |
| Shared UI library missing | NOT BLOCKED -- `@stockflows/ui` exists (needs cleanup) |
| No Playwright installed | NOT BLOCKED -- will be installed in Phase 6 |

**No blockers exist. The team may proceed to Phase 0.**

---

## 13.6 Developer Handoff Checklist

This is the **first thing a developer should read and do** before writing any code. Complete every item in order.

### Pre-Flight (Day 0, before Phase 0)

- [ ] **Read this entire plan** (GAP-ANALYSIS-AND-PLAN.md) -- all 13 parts
- [ ] **Verify you can access the codebase** -- `ls /stockflows-v7/` should show `app/`, `packages/`, `stockflows-ui/`, `pnpm-workspace.yaml`, `turbo.json`
- [ ] **Verify pnpm is installed** -- `pnpm --version` should return 9.x
- [ ] **Verify Node.js is installed** -- `node --version` should return >= 18
- [ ] **Install dependencies** -- `pnpm install` (may fail due to missing `app/package.json`; this is expected and will be fixed in Phase 0)
- [ ] **Note any failures** from `pnpm install` -- these confirm the Architect's findings

### Phase 0 Execution Checklist (Days 1-3)

Complete these tasks IN ORDER. Do not skip ahead.

#### Block 1: Workspace Structure (Task 0.1 - 0.8)

- [ ] **0.1:** Create `app/package.json` with all dependencies enumerated in section 12C.1.3:
  - `@remix-run/node`, `@remix-run/react`, `@remix-run/serve`, `@remix-run/vite`
  - `@shopify/polaris`, `@shopify/polaris-icons`, `@shopify/app-bridge-react`
  - `react`, `react-dom`, `isbot`, `@sentry/remix`, `@prisma/client`
  - DevDeps: `prisma`, `vite`, `tailwindcss`, `typescript`
  - `"name": "@stockflows/app"`
- [ ] **0.2:** Add `"@stockflows/ui": "workspace:*"` to `app/package.json` dependencies
- [ ] **0.3:** Delete `/stockflows-v7/stockflows-ui/` (root-level orphan)
- [ ] **0.4:** Remove `"workspaces"` field from root `package.json`
- [ ] **0.5:** In `packages/stockflows-ui/package.json`:
  - Move `react` from `dependencies` to `peerDependencies`
  - Add `react-dom` to `peerDependencies`
  - Set range: `"react": "^18.0.0 || ^19.0.0"`, `"react-dom": "^18.0.0 || ^19.0.0"`
  - Add `peerDependenciesMeta` with `"react-dom": { "optional": true }`
- [ ] **0.6:** Add explicit CSS export to `@stockflows/ui` package.json:
  - `"./styles/tokens-v7.css": "./src/styles/tokens-v7.css"`
- [ ] **0.7:** Run `pnpm install` -- verify `node_modules/@stockflows/ui` symlinks to `packages/stockflows-ui`
- [ ] **0.8:** Run `turbo run build` -- verify all packages execute (will fail until 0.11-0.14 are done; that is OK at this stage)

#### Block 2: TypeScript and Build (Tasks 0.11 - 0.14)

- [ ] **0.11:** Create `app/tsconfig.json`:
  ```json
  {
    "extends": "../tsconfig.json",
    "compilerOptions": {
      "paths": { "@stockflows/ui/*": ["../packages/stockflows-ui/src/*"] }
    },
    "include": ["**/*"]
  }
  ```
- [ ] **0.12:** Verify `app/package.json` has all dependencies from section 12C.1.3 (cross-check against imports in `app/root.tsx`, `app/routes/app.tsx`, `app/entry.server.tsx`)
- [ ] **0.13:** Create `packages/stockflows-ui/vite.config.ts` (see section 12C.2.2 for full config)
- [ ] **0.14:** Update `turbo.json` -- rename `app#build` to `@stockflows/app#build`

#### Block 3: Font and Icon Setup (Tasks 0.9 - 0.10)

- [ ] **0.9:** Add Material Symbols font to `app/root.tsx` `<link>` tags
- [ ] **0.10:** Search for `JetBrains Mono` or `font-mono` usage in `app/`:
  - If used: keep the JetBrains Mono font link
  - If unused: remove JetBrains Mono, Plus Jakarta Sans, and Playfair Display font loads
- [ ] Verify `turbo run build` passes after all Phase 0 tasks

### Phase 0 Gate Check

Before proceeding to Phase 1, confirm ALL of the following:

- [ ] `app/package.json` exists with `"name": "@stockflows/app"` and all dependencies
- [ ] `app/tsconfig.json` exists with `paths` alias
- [ ] `pnpm install` produces correct symlinks
- [ ] `turbo run build` executes tasks for all four packages
- [ ] Root `stockflows-ui/` directory no longer exists
- [ ] `@stockflows/ui/package.json` has React and React DOM in `peerDependencies`
- [ ] Material Symbols font loads in `app/root.tsx`
- [ ] `vite.config.ts` exists in `packages/stockflows-ui/`
- [ ] `turbo.json` uses `@stockflows/app#build`

**If any item fails, STOP. Fix the issue before proceeding.**

---

## 13.7 Definition of Complete -- What the Project Looks Like When ALL Gaps Are Closed

The project is **complete** when the following conditions are ALL true simultaneously:

### Architecture

- The monorepo has four properly configured packages: `@stockflows/app`, `@stockflows/ui`, `@stockflows/demo`, `@stockflows/website`
- `pnpm install` resolves all workspace symlinks without errors
- `turbo run build` builds all four packages in dependency order
- `@stockflows/ui` has React in `peerDependencies`, a real Vite library build, and no duplicate components
- `app/tsconfig.json` provides IDE autocompletion for `@stockflows/ui` imports

### Visual Consistency

- All three products use the same dark theme (`#0A0B0E` background, white text, `#C7FB33` accent)
- All three products load the same font (Inter) with no competing font stacks
- All colors reference `tokens-v7.css` -- zero hardcoded hex values in any component
- Side-by-side screenshots of app, demo, and website show consistent color palette, typography, spacing, and component styles
- The Polaris CSS overrides in `app/tailwind.css` are fully rewritten for dark theme
- Material Symbols are used consistently across all products (zero Polaris Icons imports)

### Shared UI Library

- Each component exists in exactly one canonical location (`packages/stockflows-ui/src/components/{Name}/`)
- No `shared/` duplicates remain
- No root-level `stockflows-ui/` directory exists
- All Badge colors use CSS custom properties (`var(--success)`, `var(--warning)`, etc.)
- Modal has focus trap, `aria-labelledby`, entrance and exit animations
- Navigation dropdown has `aria-expanded`, `aria-haspopup`, keyboard support
- Tooltip has `aria-describedby`, keyboard focus support, fade-in animation
- All spacing follows the defined scale (card `p-6`, heading `mb-8`, table `gap-4`, card grid `gap-6`)
- Tokens include all missing tokens: skeleton, focus ring, overlay, tooltip background, toast background

### Shopify App

- Dark theme applied to all routes (`#0A0B0E` background)
- Zero `@shopify/polaris-icons` imports -- all Material Symbols
- All 13 hardcoded color violations replaced with token references
- Chart colors use design tokens (not hardcoded `#0066cc`, `#ff6600`, etc.)
- Font is Inter exclusively (no Plus Jakarta Sans, no Playfair Display)
- Loading bar uses accent color with ARIA attributes
- All existing functionality preserved (no regressions)
- `pnpm run build --filter=@stockflows/app` passes

### Demo

- Zustand store manages all state (no React Context providers)
- 50+ SKUs, 100+ purchase orders, 20+ forecasts, 10+ vendors in mock data
- All 31 routes load without errors and display meaningful data
- Skeleton loading states appear during simulated data fetches
- Error boundary catches and displays errors gracefully
- Toast notifications appear after user actions
- GuidedTour walks through Dashboard, Inventory, Purchasing, Forecasting
- Sidebar collapses to hamburger on mobile (< 768px)
- Inventory table shows card layout on mobile (< 640px)
- All search inputs have `aria-label` attributes
- Sidebar navigation has `aria-current="page"` and `aria-label`
- Persistent "Install StockFlows" CTA links to `stockflows.fly.dev`
- Cross-product link back to website in navigation
- Runs entirely client-side with no backend dependency
- `pnpm run build --filter=@stockflows/demo` passes

### Website

- All sections present: Hero, Problem Statement, Features, Comparison, Logos (6+), Social Proof (3+ testimonials), CTA, Footer
- Customer logos display actual SVG images (not text placeholders)
- All claims are substantiated and verifiable
- Competitive positioning statement identifies 2-3 key differentiators
- All CTAs link to correct destinations (demo: `/demo`, install: `stockflows.fly.dev`)
- SEO meta tags, Open Graph, and structured data configured
- Page loads in under 3 seconds on simulated 3G
- Responsive at 375px, 768px, 1280px
- Footer includes demo link, privacy policy, terms of service
- Zero console errors on page load
- `pnpm run build --filter=@stockflows/website` passes

### Testing

- `playwright.config.ts` defines three projects (app, demo, website) with correct baseURLs and webServer configs
- Existing 80+ test files audited: duplicates removed, broken tests fixed
- Tests organized into `e2e/app/`, `e2e/demo/`, `e2e/website/`
- 67+ E2E test scenarios pass across all three products
- 13 visual regression scenarios pass (VIS-001 through VIS-013)
- 10 responsive design scenarios pass at 3 breakpoints
- 8 accessibility scenarios pass with axe-core (zero critical violations)
- App E2E tests pass with dark theme
- `globalSetup.ts` seeds database before app tests

### Accessibility (WCAG 2.1 AA)

- All interactive elements are keyboard accessible with visible focus rings
- All images have alt text
- Color contrast meets 4.5:1 ratio
- All form inputs have associated labels
- Modal traps focus and restores focus on close
- Navigation dropdown supports keyboard navigation
- Tooltips appear on keyboard focus
- Tables have `<caption>`, `<thead>` scope attributes
- Charts have `role="img"` and `aria-label`
- Color-only indicators have text labels alongside color
- Skip-to-content link exists in all three products
- Loading bar has `role="progressbar"` and `aria-label`

### Deployment

- Website deployed to Cloudflare Pages (production)
- Demo deployed to Cloudflare Pages (production, `/demo` path)
- App deployed to Fly.io (production) with all secrets configured
- All three production URLs live and functional
- Cross-product links verified (website -> demo, website -> app, demo -> app)
- DNS propagation verified, SSL certificates valid

### Documentation

- PROGRESS.md accurately reflects final state (no "100% COMPLIANT" if gaps exist)
- IMPLEMENTATION-SUMMARY.md matches PROGRESS.md numbers
- Shopify App Store listing requirements met:
  - OAuth scopes documented
  - Data handling / retention policy written
  - GDPR/CCPA compliance statement drafted
  - 3+ submission screenshots (1280x800) prepared
  - Test store credentials provided for reviewers
  - Privacy policy and ToS URLs live and accessible
  - Billing plan configuration matches listing description

### Post-Launch

- Rollback trigger defined: ">5 critical bugs in 24 hours = rollback to pre-migration state"
- 48-hour post-deployment monitoring active
- Rollback procedure tested (reverting to last stable Git tag produces working deployment)
- Privacy-respecting analytics (e.g., Plausible) integrated on website and demo
- Baseline KPIs defined: visit-to-demo rate, demo-to-install rate, install-to-activation rate

---

## 13.8 Summary of All Changes Across Parts 11, 12A, 12B, 12C, and 13

| Category | Changes Added | Net Impact |
|---|---|---|
| Phase 0 tasks | +4 new tasks (0.11-0.14), 2 modified (0.5, 0.10) | +1 day to Phase 0 |
| Phase 1 tasks | +1 task (StockBadge audit) | +0.5 day |
| Phase 2 tasks | +2 tasks (Polaris CSS rewrite, icon mapping table) | +0.5 day |
| Phase 3 tasks | +2 tasks (accessibility audit, interaction patterns) | +0.5 day |
| Phase 4 tasks | +2 tasks (install CTA, demo sidebar ARIA) | +0.5 day |
| Phase 5 tasks | +3 tasks (competitive positioning, analytics, logo minimum) | Shifted: MVP in Phase 3 |
| Phase 6 tasks | +2 tasks (install Playwright, 6 visual regression scenarios) | +0.5 day |
| Phase 8 tasks | +2 items (Fly.io secrets, rollback triggers) | Minimal time impact |
| Timeline | 16 days -> 18 business days (20-22 calendar days) | +2 days buffer |
| Critical path | Unchanged (Phase 0 -> 1 -> 2 -> 7 -> 8) | Same path, longer duration |
| Definition of complete | Expanded from 11.9 to comprehensive 13.7 | Significantly more thorough |
| Go/No-Go | New section with explicit conditions | Enables confident execution start |
| Developer handoff | New section with step-by-step checklist | Reduces onboarding time |

---

*End of PART 13: RTE Final Synthesis -- Closing the Loop*

*This document (GAP-ANALYSIS-AND-PLAN.md) is now the FINAL, authoritative implementation plan for StockFlows v7. Parts 1-10 provide context and analysis. Part 11 provides the initial execution roadmap. Parts 12A, 12B, and 12C provide specialist refinements. Part 13 synthesizes everything into a single actionable plan. The developer should begin with the Developer Handoff Checklist (section 13.6) and proceed through Phase 0.
