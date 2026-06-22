# Chart Redesign Implementation Spec

**Goal:** Redesign the bar chart (dashboard) and pie chart (reports) in `public/tour.html` following modern SaaS design patterns from Linear, Framer, PostHog, and Vercel.

**Reference:** Research.md section 66

---

## Bar Chart (Dashboard)

### Current State
- Thin bars with staggered animation, product names below, SKU codes below names
- Status dots below labels
- Values above bars
- Grid lines + baseline

### Target Design

```
500  320  200  150   45    8   3   0    0   25
 |    |    |    |    |    |    |   |    |    |
 |    |    |    |    |    |    |   |    |    |
 |    |    |    |    |    |    |   |    |    |
 |    |    |    |    |    |    |   |    |    |
 |    |    |    |    |    |    |   |    |    |
████  ████ ████ ████  ██  ██  █   ·    ·   ██
████  ████ ████ ████  ██  ██  █   ·    ·   ██
──────────────────────────────────────────────
Shp   USB  Acc   Acc   Wdg Gad Gad Gad Gad  Bubble
 Box  Cbl  Pack  Pack  Basic  XL  Min  XL  Mini  Wrap
 PKG  Cbl  A     B     WDG  GAD GAD GAD GAD  PKG
 001  001  001   002   002  001 002 001 002  002
  ●    ●    ●     ●     ●   ●   ●   ●    ●    ●
```

**Changes needed:**
1. Remove the old `buildBarChart` function entirely
2. Replace with new function implementing these rules:
   - Bar width: 40% of slot (narrower, more elegant)
   - Bar border-radius: 2px top only (rounded top corners)
   - Value above bar: Inter, 11px, font-weight 700, colored by status
   - Product name below: Inter, 9px, #666, truncated at 11 chars
   - SKU below name: SF Mono, 7.5px, #bbb
   - Status dot: 2px circle below SKU, colored by status
   - Baseline: 1.5px solid #111
   - Grid lines: 2 horizontal, 0.5px dashed #e5e5e5
   - Animation: 0.4s spline easing `0.16 1 0.3 1`, 0.03s stagger
   - Value fade-in: 0.2s, starts 0.35s after bar begins
3. SVG viewBox: `0 0 620 280` (current is correct)
4. Remove the chart container card wrapper — SVG floats directly

### CSS Additions Needed
```css
/* Bar chart hover effect */
.bar-chart svg rect:hover { opacity: 0.7; cursor: pointer; transition: opacity 0.15s; }
```

---

## Pie Chart (Reports)

### Current State
- Full pie chart (not donut) with 3 slices: green (#008060), amber (#f49342), red (#d72c0d)
- Legend below with colored squares
- ViewBox 200x200

### Target Design — Convert to Donut Chart

```
         ╭──────────╮
       ╱   60% In    ╲
      │    Stock       │
      │    (4)         │
       ╲              ╱
        │   25%       │
        │  Low (2)    │
         ╲   ╭──╮   ╱
          ╰──╯15%╰──╯
             Out (2)
```

**Changes needed:**
1. Replace `pieSlice` function with `donutSlice` function that draws arcs (not filled wedges)
2. Donut: inner radius = 50, outer radius = 80 (ratio ~0.625)
3. Colors: `#111` (in stock), `#d97706` (low), `#dc2626` (out) — matches bar chart palette
4. Labels INSIDE the donut segments (percentage or count)
5. No border on segments, 2px gap between segments (using stroke offset)
6. Legend below as thin horizontal row: dot + label (like bar chart status dots)
7. SVG viewBox: `0 0 200 200`
8. Animation: stroke-dashoffset from full circumference to final arc length, 0.4s per slice

### Donut Slice Algorithm

```javascript
function donutSlice(cx, cy, rOuter, rInner, startAngle, endAngle, color) {
  // Calculate arc paths for both outer and inner radii
  // Return SVG path with M (outer start) A (outer arc) L (inner end) A (inner arc back) Z
  // This creates a ring segment, not a pie wedge
}
```

### Legend Update

Replace colored squares with thin horizontal lines (matching bar chart style):
```html
<div style="display:flex; gap:20px; margin-top:16px">
  <div style="display:flex; align-items:center; gap:6px">
    <div style="width:12px; height:3px; background:#111"></div>
    <span>In Stock (4)</span>
  </div>
  <div style="display:flex; align-items:center; gap:6px">
    <div style="width:12px; height:3px; background:#d97706"></div>
    <span>Low (2)</span>
  </div>
  <div style="display:flex; align-items:center; gap:6px">
    <div style="width:12px; height:3px; background:#dc2626"></div>
    <span>Out (2)</span>
  </div>
</div>
```

---

## Forecast Sparkline (Forecasting Page)

### Current State
- Already uses `buildSparkline` — thin lines, no card wrapper, good design
- Legend below with line indicators

### Changes Needed
None — this is already well-designed. Only verify it renders correctly with the updated CSS.

---

## Files to Modify

| File | Change |
|------|--------|
| `public/tour.html` | Replace `buildBarChart()`, replace `pieSlice()` with `donutSlice()`, update report chart rendering |
| `public/tour.css` | Add `.bar-chart svg rect:hover` style (optional) |

## Verification

1. Open `public/tour.html` in browser
2. Click "Explore" — Dashboard loads
3. Verify bar chart: all 10 products visible, labels not cut off, animation works
4. Navigate to Reports — verify donut chart renders, legend below matches style
5. Navigate to Forecasting — verify sparkline unchanged
6. Test responsive: resize to 768px width — verify chart adapts
7. Run: `node -c` on extracted JS to verify no syntax errors
