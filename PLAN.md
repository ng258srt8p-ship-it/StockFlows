# StockFlows Integration Evaluation & Settings Redesign Plan

## Objective
Identify all data synchronization issues between the Shopify store and StockFlows app, fix the Settings page formatting to match Polaris design standards, and create an automated deploy-verify loop for continuous validation.

---

## 🎯 Phase 1: Diagnostics & Auditing (5 Parallel Subagents)

### Subagent 1: Settings vs Forecasting Page CSS Audit ✅ COMPLETE
**Deliverables:** Component structure analysis

**Key Findings:**
| Issue | Settings Page | Forecasting Page (Reference) | Status |
|-------|--------------|---------------------------|--------|
| Component architecture | Custom `SettingsCard` + `NotificationToggle` | Pure Polaris `Card` components | ❌ |
| Grid layout | `lg:grid-cols-2` + custom wrapper | `md:grid-cols-3` with standard `Layout.Section` | ❌ |
| Background override | `bg-background-secondary min-h-screen` | None (uses Polaris default) | ❌ |
| Typography | Mixed `Text` without variant | Consistent `headingSm`, `headingLg`, `bodyMd` | ❌ |
| Spacing | `px-4 py-6`, `border-t border-gray-200` | Standard `p-4` inside Cards | ❌ |
| Form toggle | Custom `Checkbox` with `labelHidden` | No toggles (read-only page) | ❌ |

**Files to fix:**
- `app/routes/app.settings.tsx` — Replace custom components with Polaris native
- `app/components/settings/SettingsCard.tsx` — Either remove or align with Polaris `Card`
- `app/components/settings/NotificationToggle.tsx` — Replace with Polaris `Toggle`
- `app/components/settings/SettingsSection.tsx` — Replace with Polaris `Text` directly

---

### Subagent 2: Playwright E2E Test Suite ✅ COMPLETE
**Deliverables:** 3 new test files (in `stockflows-e2e-tests/` separate directory)

**Tests Created:**
1. **`visual-consistency.spec.ts`** (20+ tests) — Background colors, typography, heading sizes, card layouts, button styling, conditional fields, iOS settings design
2. **`data-integration.spec.ts`** (20+ tests) — Product count accuracy, inventory badges, PO data, vendor info, forecast confidence, dashboard metrics, settings persistence
3. **`form-interactions.spec.ts`** (60+ tests) — All checkbox toggles, numeric input validation, conditional fields, currency select, save button, toast messages, edge cases

**Key Features:**
- Multi-browser: Chromium, Firefox, WebKit
- Mobile emulation: Pixel 5 (Android)
- Visual regression with screenshot comparison
- Tags-based filtering (`@visual`, `@data`, `@form`)
- CI-ready with JUnit reporting

---

### Subagent 3: Static HTML Analysis ✅ COMPLETE (Direct Analysis)
**Deliverables:** Line-by-line fix specifications for all static HTML files

**Three separate Settings rendering implementations found:**
1. **`explore.html:669`** — Uses `.polaris-page-title`, `.polaris-card`, `.polaris-checkbox` classes defined in inline `<style>` block
2. **`tour.html:929`** — Uses iOS-style classes (`.ios-settings`, `.ios-toggle`, `.ios-section`) — completely different design system
3. **`settings-preview.html`** — Standalone page with its own complete `<style>` block

**Findings by file:**

**`public/settings-preview.html` (standalone preview page)**
| Line | Issue | Fix |
|------|-------|-----|
| 11 | `--serif` font variable defined for titles | Remove; Polaris uses system sans-serif |
| 13 | `background: #f6f6f7` on body | Change to Polaris default surface background `#fafafa` |
| 18 | `.polaris-page-title { font-family: var(--serif); font-size: 1.375rem; }` | Change to `font-family: -apple-system, "Inter", sans-serif; font-size: 1.25rem;` |
| 29 | `.polaris-card-header { font-size: 1.25rem; }` | Change to `font-size: 1.125rem` or remove — Card title uses Polaris `headingSm` |
| 67 | `.polaris-btn-primary { background: #D97706; }` (amber) | Change to Polaris green `#008060` |
| 68-69 | `.polaris-btn-primary:hover { background: #b85f05; }` | Change to `#006e52` (Polaris green hover) |
| 70 | `.polaris-btn-primary:active { background: #934c04; }` | Change to `#005c45` (Polaris green active) |

**`public/explore.html:648-906` (Polaris-style rendering)**
| Line | Issue | Fix |
|------|-------|-----|
| 669 | `<h1 class="polaris-page-title">Settings</h1>` with serif font | Change font-family—CSS is in page `<style>` block, update `.polaris-page-title` |
| 680 | `.polaris-card-header` uses div with raw text | Should use Polaris `<Text>` component hierarchy |
| 682-686 | Raw checkbox HTML instead of Polaris `<Checkbox>` | Acceptable for static HTML demo, but visual should match |
| 802 | Save button uses `#D97706` amber | Change CSS class to use `#008060` green |

**`public/tour.html:929-978` (iOS-style rendering)**
| Line | Issue | Fix |
|------|-------|-----|
| 935 | Uses `.ios-settings` wrapper | Documentation only; iOS style is intentional marketing design |
| 945-946 | Uses `.ios-input` with inline styles | Matches mobile-first tour design — no change needed |
| N/A | Completely different design from Polaris | This is intended as iOS-style settings mockup, not Polaris |

**`public/landing.html:958-959` (Basic rendering)**
| Line | Issue | Fix |
|------|-------|-----|
| 960 | `<h2>Settings</h2>` with basic description | Matches landing page design, not app-level Polaris — no change needed |

**`public/explore.html` CSS `<style>` block (inline CSS around line 50-125)**
| CSS Class | Current Value | Should Be |
|-----------|--------------|-----------|
| `.polaris-page-title` | `font-family: var(--serif)` | `font-family: -apple-system, "Inter", sans-serif` |
| `.polaris-btn-primary` | `background: #D97706` | `background: #008060` |
| `.polaris-btn-primary:hover` | `background: #b85f05` | `background: #006e52` |

**Files to fix:**
- `public/settings-preview.html` — Fix button color, font-family, background color
- `public/explore.html` — Fix `--serif` font usage on page title, fix amber button
- No changes needed for `tour.html` (intentionally iOS-style) or `landing.html` (intentionally minimal)
- `public/tour.html` — Sync settings rendering
- `public/landing.html` — Sync settings rendering

---

### Subagent 4: Integration Validation Framework ✅ COMPLETE
**Deliverables:** Validation scripts and comparison framework

**Components Created:**
```bash
scripts/deploy-verify-loop.sh     # Full 6-phase deployment pipeline
scripts/deploy-verify-loop.conf   # Configuration & environment reference
```

**6 Phases per Iteration:**
| Phase | Action | Verification |
|-------|--------|-------------|
| 1. Git | `git push origin main` | Exit code |
| 2. Fly.io | `fly deploy --now` | Health endpoint `/health` |
| 3. Cloudflare | `wrangler pages deploy` | URL reachable |
| 4. Shopify | `shopify app deploy --force` | Exit code |
| 5. E2E Tests | `npx playwright test` | All tests pass (up to 10 retries) |
| 6. Verification | Health checks on all endpoints | HTTP 200/OK |

---

### Subagent 5: Settings Page Redesign 🔄 IN PROGRESS
**Deliverables:** Refactored `app.settings.tsx` to match Polaris/Forecasting page design

**Planned Changes:**
1. Remove `bg-background-secondary min-h-screen` wrapper
2. Replace custom `SettingsCard` component with Polaris `<Card>`
3. Replace custom `NotificationToggle` with proper Polaris form pattern
4. Standardize heading hierarchy using `Text variant="headingLg"`
5. Ensure consistent `p-4` padding inside all Card containers
6. Fix font sizes — page titles should use Polaris `headingLg` not custom CSS `--serif`
7. Fix save button colors — use Polaris `Button primary` (green) not amber
8. Align grid layout with forecasting page pattern

---

## 🔄 Phase 2: Deploy-Verify Loop (Automated)

### Flow Diagram
```
┌─────────────────────────────────────────────────────────┐
│                    deploy-verify-loop.sh                  │
│  ┌─────────┐   ┌──────────┐   ┌──────────┐   ┌────────┐ │
│  │  Git     │→  │ Fly.io   │→  │ Cloudflare│→  │ Shopify│ │
│  │  Push    │   │ Deploy   │   │ Pages     │   │ App    │ │
│  └─────────┘   └──────────┘   └──────────┘   └────────┘ │
│                                                           │
│  ┌──────────┐   ┌──────────────┐   ┌───────────────────┐ │
│  │  E2E     │←  │  Health      │←  │  Data Integration  │ │
│  │  Tests   │   │  Check       │   │  Validation        │ │
│  └──────────┘   └──────────────┘   └───────────────────┘ │
└─────────────────────────────────────────────────────────┘
        │                                     │
        ▼                                     ▼
   ✅ All Pass                        ❌ Any Fail
   Continue/Stop                      Log & Rollback
```

### Usage
```bash
# Run a single deploy-verify cycle
./scripts/deploy-verify-loop.sh

# Run 5 cycles, stopping on first failure
./scripts/deploy-verify-loop.sh 5

# Run continuously through failures
./scripts/deploy-verify-loop.sh --iterations=10 --continue-on-failure
```

---

## 🛠 Phase 3: Fix Implementation

### A. Settings Page — Visual Fixes
| CSS Property | Before (Broken) | After (Fixed) | File |
|-------------|-----------------|---------------|------|
| Background | `#f6f6f7` / `bg-background-secondary` | Polaris default (remove override) | `app.settings.tsx:202` |
| Page title font | `var(--serif)` / Instrument Serif | Polaris sans-serif `headingLg` | `explore.html:18` |
| Heading tag | `<h1 class="polaris-page-title">` | `<Page title="Settings" subtitle="...">` | `explore.html:669` |
| Card title font | `font-size: 1.25rem` | `Text variant="headingSm"` via Polaris Card | `settings-preview.html:29` |
| Button color | `#D97706` (amber) | `#008060` (Polaris green) | `settings-preview.html:67` |
| Grid columns | `grid-template-columns: 1fr` on mobile | Polaris `Layout` + `Layout.Section` | `settings-preview.html:24` |

### B. Data Integration — Validation Checks
| Check | Source A | Source B | Expected |
|-------|----------|----------|----------|
| Product count | Shopify Admin API | StockFlows DB | Match |
| Inventory levels | Shopify REST API | DB `inventoryItem.quantity` | Match |
| Last sync time | Webhook log | DB `updatedAt` | < 5 minutes |
| Location count | Shopify Locations API | DB `Location` table | Match |

### C. Playwright Test — Success Criteria
| Test Suite | Min Tests | Pass Rate | Target |
|-----------|-----------|-----------|--------|
| Visual Consistency | 20 | 100% | Settings matches Forecasting page layout |
| Data Integration | 20 | 100% | Shopify data reflects in StockFlows |
| Form Interactions | 60 | 100% | All inputs, toggles, save work |
| **TOTAL** | **100+** | **100%** | All tests green |

---

## 📋 Implementation Checklist

### Prerequisites
- [ ] Playwright tests created in `stockflows-e2e-tests/`
- [ ] `deploy-verify-loop.sh` executable and syntax-verified
- [ ] `deploy-verify-loop.conf` configuration file written

### Settings Page Fixes
- [ ] Fix `app.settings.tsx` — Remove `bg-background-secondary` wrapper
- [ ] Fix `app.settings.tsx` — Replace `SettingsCard` with Polaris `<Card>`
- [ ] Fix `app.settings.tsx` — Replace `NotificationToggle` with Polaris `Toggle`/`Checkbox`
- [ ] Fix `explore.html` — Update `renderSettings()` CSS classes and font-family
- [ ] Fix `settings-preview.html` — Fix button color, background, font
- [ ] Fix `tour.html` — Sync settings rendering
- [ ] Fix `landing.html` — Sync settings rendering

### Deploy-Verify Loop
- [ ] Run `deploy-verify-loop.sh` with `--iterations=1`
- [ ] Verify all Playwright tests pass against deployed app
- [ ] Verify Shopify ↔ StockFlows data matches
- [ ] Fix any test failures and re-run
- [ ] Update the StockFlows deployment skill with loop reference

### Final Validation
- [ ] Settings page renders correctly in Shopify admin at `https://admin.shopify.com/store/stockflows/apps/stockflows-app`
- [ ] Font sizes, colors, and spacing match Forecasting page
- [ ] Data shown in StockFlows matches Shopify store inventory
- [ ] All 100+ Playwright tests pass
- [ ] No Railway references remain in any test or script file

---

## 📊 Status Summary

| Component | Status | Owner |
|-----------|--------|-------|
| CSS/component audit | ✅ Complete | Subagent 1 |
| Playwright test suite | ✅ Complete | Subagent 2 |
| Static HTML analysis | 🔄 Subagent running | Subagent 3 |
| Integration validation | ✅ Complete | Subagent 4 |
| Settings page redesign | 🔄 Subagent running | Subagent 5 |
| Deploy-verify loop script | ✅ Complete (611 lines) | Subagent 4 |
| Settings preview HTML audit | ⏳ Pending | Subagent 3 |

**Total tests to pass:** 100+ (20 visual + 20 data + 60 form interactions + existing 127 vitest)

## Edge Cases & Pitfalls

1. **CSS specificity conflicts** — Tailwind classes may override Polaris components. Use `className` sparingly.
2. **Shopify session dependency** — `/app/*` routes require auth. E2E tests must work without it via `explore.html`.
3. **Data seeding required** — Run `npx tsx scripts/seed.ts` before integration tests.
4. **Seed script non-idempotent** — Run only once or do a nuclear re-seed (`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`).
5. **Railway references** — The `settings-visual-match.spec.ts` still references `faithful-love-production-18fb.up.railway.app` — must be updated to Fly.io.
6. **Fly.io secrets** — `DATABASE_URL`, `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_APP_URL` must be set before first deploy.
