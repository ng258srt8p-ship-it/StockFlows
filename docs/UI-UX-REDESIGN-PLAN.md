# StockFlows UI/UX Redesign Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Redesign the StockFlows Shopify app UI/UX to match the brutalist editorial design system from stockflows.app, while maintaining full Polaris compatibility for the Shopify embedded app context.

**Architecture:** The app currently uses Shopify Polaris components exclusively. The redesign will:
1. Override Polaris CSS variables to match the stockflows.app color palette
2. Add custom CSS for brutalist design elements (cards, buttons, badges)
3. Update typography to use Inter + Instrument Serif
4. Modify component layouts to match the stockflows.app sidebar/content pattern
5. Keep all Polaris components functional but restyle them

**Tech Stack:** Remix v2, React 18, Shopify Polaris v12, Tailwind CSS v4, CSS custom properties

---

## Gate Table (Definition of Done)

| Gate # | Gate | Verification Method | Pass Condition |
|--------|------|---------------------|----------------|
| 1 | CSS variables override Polaris defaults | `grep -r "--p-color-bg-surface" app/tailwind.css` | Variables defined |
| 2 | Sidebar renders with correct width and colors | Playwright: `page.locator('.sidebar').isVisible()` | Sidebar visible |
| 3 | Headings use Instrument Serif | Playwright: `page.locator('h1').evaluate(el => getComputedStyle(el).fontFamily)` | Contains "Instrument Serif" |
| 4 | Cards have white background and border | Playwright: `page.locator('.card').evaluate(el => getComputedStyle(el).backgroundColor)` | Background is white |
| 5 | Status badges match stockflows.app colors | Playwright: badge color matches `#dc2626`/`#d97706`/`#16a34a` | Colors match |
| 6 | All 9 Playwright tests pass | `npx playwright test` | 9 passed |
| 7 | App loads in Shopify Admin | Playwright navigation to admin URL | No errors |

---

## Task 1: Create CSS Custom Properties Override

**Objective:** Override Polaris CSS variables to match stockflows.app color palette.

**Files:**
- Modify: `app/tailwind.css`

**Step 1: Add CSS custom properties**

Add to `app/tailwind.css` after the existing Tailwind imports:

```css
/* ═══════════════════════════════════════════════════
   StockFlows Design System Override
   Matches stockflows.app brutalist editorial design
   ═══════════════════════════════════════════════════ */

:root {
  /* StockFlows Colors */
  --sf-bg: #fafafa;
  --sf-bg-dark: #111111;
  --sf-text: #111111;
  --sf-text-dim: #666666;
  --sf-text-dimmer: #999999;
  --sf-border: #e0e0e0;
  --sf-brand: #111111;
  --sf-critical: #dc2626;
  --sf-warning: #d97706;
  --sf-success: #16a34a;
  --sf-radius: 0px;
  --sf-sidebar: 220px;
  
  /* Override Polaris CSS Variables */
  --p-color-bg: var(--sf-bg);
  --p-color-bg-surface: #ffffff;
  --p-color-bg-surface-hover: #f5f5f5;
  --p-color-text: var(--sf-text);
  --p-color-text-subdued: var(--sf-text-dim);
  --p-color-border: var(--sf-border);
  --p-color-border-subdued: var(--sf-border);
  
  /* Status Colors */
  --p-color-bg-critical-subdued: #fef2f2;
  --p-color-text-critical: var(--sf-critical);
  --p-color-border-critical: var(--sf-critical);
  
  --p-color-bg-warning-subdued: #fffbeb;
  --p-color-text-warning: var(--sf-warning);
  --p-color-border-warning: var(--sf-warning);
  
  --p-color-bg-success-subdued: #f0fdf4;
  --p-color-text-success: var(--sf-success);
  --p-color-border-success: var(--sf-success);
  
  /* Typography */
  --p-font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --p-font-weight-semibold: 600;
}
```

**Step 2: Verify**

Run: `grep -r "sf-bg" app/tailwind.css`
Expected: Variables defined

**Step 3: Commit**

```bash
git add app/tailwind.css
git commit -m "feat: add StockFlows design system CSS variables"
```

---

## Task 2: Update Root Layout Typography

**Objective:** Import Inter and Instrument Serif fonts, update root layout.

**Files:**
- Modify: `app/root.tsx`

**Step 1: Add Google Fonts import**

Add to `app/root.tsx` in the `links` function:

```typescript
{
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&display=swap",
},
```

**Step 2: Update body styles**

Update the body tag to use the Inter font:

```tsx
<body className="antialiased" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
```

**Step 3: Verify**

Run: `curl -s http://localhost:5173/ | grep -o "Inter"`
Expected: Font reference found

**Step 4: Commit**

```bash
git add app/root.tsx
git commit -m "feat: add Inter and Instrument Serif fonts"
```

---

## Task 3: Update Dashboard Stats Cards

**Objective:** Restyle dashboard stat cards to match stockflows.app brutalist design.

**Files:**
- Modify: `app/routes/app._index.tsx`

**Step 1: Update StatCard component**

Replace the existing `StatCard` component with:

```tsx
function StatCard({
  title,
  value,
  trend,
  subtext,
}: {
  title: string;
  value: string | number;
  trend?: "positive" | "negative" | "neutral";
  subtext?: string;
}) {
  const color =
    trend === "positive"
      ? "text-green-600"
      : trend === "negative"
        ? "text-red-600"
        : "text-gray-900";

  return (
    <Card>
      <div className="p-4">
        <Text variant="headingSm" as="h3" tone="subdued">
          {title}
        </Text>
        <Text variant="headingLg" as="p" className={color}>
          {value}
        </Text>
        {subtext && (
          <Text variant="bodySm" as="p" tone="subdued">
            {subtext}
          </Text>
        )}
      </div>
    </Card>
  );
}
```

**Step 2: Verify**

Run: `curl -s http://localhost:5173/app | grep -o "Total SKUs"`
Expected: Dashboard renders with stat cards

**Step 3: Commit**

```bash
git add app/routes/app._index.tsx
git commit -m "feat: update dashboard stat cards design"
```

---

## Task 4: Update Navigation Sidebar

**Objective:** Restyle navigation to match stockflows.app sidebar design.

**Files:**
- Modify: `app/routes/app.tsx`

**Step 1: Update Navigation component styles**

The Polaris Navigation component already renders a sidebar. Update the CSS to match:

```css
/* Add to tailwind.css */
.Polaris-Navigation {
  width: var(--sf-sidebar) !important;
  background: var(--sf-bg) !important;
  border-right: 1px solid var(--sf-border) !important;
}

.Polaris-Navigation__Item {
  font-size: 0.75rem !important;
  font-weight: 500 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.3px !important;
}

.Polaris-Navigation__Item--selected {
  font-weight: 700 !important;
}
```

**Step 2: Verify**

Run: `curl -s http://localhost:5173/app | grep -o "Polaris-Navigation"`
Expected: Navigation component rendered

**Step 3: Commit**

```bash
git add app/routes/app.tsx app/tailwind.css
git commit -m "feat: update navigation sidebar design"
```

---

## Task 5: Update Status Badges

**Objective:** Restyle status badges to match stockflows.app badge design.

**Files:**
- Modify: `app/tailwind.css`

**Step 1: Add badge styles**

```css
/* Badge overrides */
.Polaris-Badge--toneCritical {
  background-color: transparent !important;
  color: var(--sf-critical) !important;
  border: 1px solid var(--sf-critical) !important;
}

.Polaris-Badge--toneWarning {
  background-color: transparent !important;
  color: var(--sf-warning) !important;
  border: 1px solid var(--sf-warning) !important;
}

.Polaris-Badge--toneSuccess {
  background-color: transparent !important;
  color: var(--sf-success) !important;
  border: 1px solid var(--sf-success) !important;
}
```

**Step 2: Verify**

Run: `curl -s http://localhost:5173/app/inventory | grep -o "badge"`
Expected: Badge styles applied

**Step 3: Commit**

```bash
git add app/tailwind.css
git commit -m "feat: update status badge design"
```

---

## Task 6: Update Button Styles

**Objective:** Restyle buttons to match stockflows.app brutalist button design.

**Files:**
- Modify: `app/tailwind.css`

**Step 1: Add button styles**

```css
/* Button overrides */
.Polaris-Button--variantPrimary {
  background-color: var(--sf-brand) !important;
  border-color: var(--sf-brand) !important;
  color: #ffffff !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  font-weight: 500 !important;
}

.Polaris-Button--variantPrimary:hover {
  background-color: #333333 !important;
  border-color: #333333 !important;
}

.Polaris-Button--variantSecondary {
  background-color: transparent !important;
  border-color: var(--sf-border) !important;
  color: var(--sf-text-dim) !important;
}

.Polaris-Button--variantSecondary:hover {
  background-color: var(--sf-text) !important;
  color: #ffffff !important;
  border-color: var(--sf-text) !important;
}
```

**Step 2: Verify**

Run: `curl -s http://localhost:5173/app/inventory | grep -o "Polaris-Button"`
Expected: Button styles applied

**Step 3: Commit**

```bash
git add app/tailwind.css
git commit -m "feat: update button design"
```

---

## Task 7: Update Card Styles

**Objective:** Restyle cards to match stockflows.app card design.

**Files:**
- Modify: `app/tailwind.css`

**Step 1: Add card styles**

```css
/* Card overrides */
.Polaris-Card {
  background-color: #ffffff !important;
  border: 1px solid var(--sf-border) !important;
  border-radius: var(--sf-radius) !important;
  box-shadow: none !important;
}

.Polaris-Card:hover {
  border-color: #999999 !important;
}
```

**Step 2: Verify**

Run: `curl -s http://localhost:5173/app | grep -o "Polaris-Card"`
Expected: Card styles applied

**Step 3: Commit**

```bash
git add app/tailwind.css
git commit -m "feat: update card design"
```

---

## Task 8: Update Table Styles

**Objective:** Restyle tables to match stockflows.app table design.

**Files:**
- Modify: `app/tailwind.css`

**Step 1: Add table styles**

```css
/* Table overrides */
.Polaris-IndexTable__Table {
  border: 1px solid var(--sf-border) !important;
}

.Polaris-IndexTable__TableHeading {
  background-color: var(--sf-bg) !important;
  font-size: 0.65rem !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  color: var(--sf-text-dimmer) !important;
}

.Polaris-IndexTable__TableCell {
  border-bottom: 1px solid var(--sf-border) !important;
}
```

**Step 2: Verify**

Run: `curl -s http://localhost:5173/app/inventory | grep -o "Polaris-IndexTable"`
Expected: Table styles applied

**Step 3: Commit**

```bash
git add app/tailwind.css
git commit -m "feat: update table design"
```

---

## Task 9: Update Page Headers

**Objective:** Restyle page headers to match stockflows.app header design.

**Files:**
- Modify: `app/tailwind.css`

**Step 1: Add header styles**

```css
/* Page header overrides */
.Polaris-Page-Header__TitleWrapper h1 {
  font-family: var(--serif) !important;
  font-style: italic !important;
  font-weight: 400 !important;
}

.Polaris-Header-Title {
  font-family: var(--serif) !important;
  font-style: italic !important;
}
```

**Step 2: Verify**

Run: `curl -s http://localhost:5173/app | grep -o "Instrument Serif"`
Expected: Serif font applied to headers

**Step 3: Commit**

```bash
git add app/tailwind.css
git commit -m "feat: update page header design"
```

---

## Task 10: Run Full Test Suite

**Objective:** Verify all changes work correctly.

**Files:**
- None (verification only)

**Step 1: Run Playwright tests**

```bash
npx playwright test --config=playwright.config.ts
```

Expected: All tests pass

**Step 2: Run Vitest tests**

```bash
npx vitest run
```

Expected: All tests pass

**Step 3: Manual verification**

1. Start dev server: `npx vite dev`
2. Open http://localhost:5173/app
3. Verify sidebar renders with correct width (220px)
4. Verify headings use Instrument Serif
5. Verify cards have white background and border
6. Verify status badges match stockflows.app colors
7. Verify buttons have brutalist style
8. Verify tables have correct styling

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: complete UI/UX redesign to match stockflows.app"
```

---

## Summary

| Task | Description | Time Est. |
|------|-------------|-----------|
| 1 | CSS custom properties override | 5 min |
| 2 | Root layout typography | 5 min |
| 3 | Dashboard stats cards | 10 min |
| 4 | Navigation sidebar | 10 min |
| 5 | Status badges | 5 min |
| 6 | Button styles | 5 min |
| 7 | Card styles | 5 min |
| 8 | Table styles | 5 min |
| 9 | Page headers | 5 min |
| 10 | Full test suite | 15 min |

**Total estimated time: ~60 minutes**

---

## Notes

- All changes are CSS-only (no React component changes needed)
- Polaris components remain functional but are restyled
- The app will maintain full Shopify embedded app compatibility
- Design matches stockflows.app brutalist editorial aesthetic
- Typography uses Inter (body) + Instrument Serif (headings)
- Colors use the exact stockflows.app palette