# Interactive Tour Plan for stockflows.app Demo

## Objective
Add an interactive guided tour to the demo page that walks users through the key features of StockFlows. The tour is ONLY for the marketing website (stockflows.app), NOT the Shopify app.

## Architecture
```
stockflows.app/demo
├── Tour overlay (fixed position)
├── Tour steps (highlighted elements)
├── Tour navigation (prev/next/skip)
└── Tour data (stored in localStorage)
```

## Tour Steps

### Step 1: Welcome
- **Element**: `.demo-sidebar` (full sidebar)
- **Title**: "Welcome to StockFlows"
- **Message**: "This is your inventory management command center. Let's take a quick tour."
- **Position**: right

### Step 2: Dashboard Stats
- **Element**: `.demo-stats` (stats cards)
- **Title**: "Real-Time Dashboard"
- **Message**: "See your total SKUs, inventory value, and alerts at a glance."
- **Position**: bottom

### Step 3: Recent Activity
- **Element**: `#recent-activity`
- **Title**: "Track Every Movement"
- **Message**: "See sales, returns, transfers, and adjustments as they happen."
- **Position**: right

### Step 4: Low Stock Alerts
- **Element**: `#low-stock-alerts`
- **Title**: "Never Run Out"
- **Message**: "Get notified before stockouts with color-coded urgency levels."
- **Position**: right

### Step 5: Inventory Table
- **Element**: `#page-inventory`
- **Title**: "Full Inventory View"
- **Message**: "Search, filter, and manage all 35 SKUs across 4 locations."
- **Position**: bottom

### Step 6: Search Functionality
- **Element**: `#inventory-search`
- **Title**: "Instant Search"
- **Message**: "Find any product in milliseconds. Try searching for 'tent' or 'boots'."
- **Position**: bottom

### Step 7: Status Badges
- **Element**: `.demo-status`
- **Title**: "Visual Status Indicators"
- **Message**: "Green = In Stock, Yellow = Low Stock, Red = Out of Stock."
- **Position**: top

### Step 8: Purchase Orders
- **Element**: `#page-purchasing`
- **Title**: "Purchase Order Management"
- **Message**: "Create POs, track receiving, and calculate landed costs."
- **Position**: bottom

### Step 9: Forecasting
- **Element**: `#page-forecasting`
- **Title**: "AI-Powered Forecasting"
- **Message**: "30-day predictions using ETS, Linear, and Ensemble models."
- **Position**: bottom

### Step 10: Reports
- **Element**: `#page-reports`
- **Title**: "Inventory Valuation"
- **Message**: "Track total inventory value and movement summaries."
- **Position**: bottom

### Step 11: Settings
- **Element**: `#page-settings`
- **Title**: "Customize Everything"
- **Message**: "Set alert thresholds, notification preferences, and AI features."
- **Position**: bottom

### Step 12: Complete
- **Element**: `.demo-sidebar`
- **Title**: "You're Ready!"
- **Message**: "Start managing your inventory like a pro. Install StockFlows today."
- **Position**: right

## Implementation

### Files to Modify
1. `public/demo.html` — Add tour overlay HTML
2. `public/demo.css` — Add tour styles
3. `public/demo.js` — Add tour logic

### Tour HTML Structure
```html
<!-- Tour Overlay -->
<div class="tour-overlay" id="tour-overlay" style="display:none">
  <div class="tour-backdrop"></div>
  <div class="tour-tooltip" id="tour-tooltip">
    <div class="tour-header">
      <span class="tour-step" id="tour-step">1/12</span>
      <button class="tour-close" id="tour-close">×</button>
    </div>
    <h3 id="tour-title">Welcome</h3>
    <p id="tour-message">Message here</p>
    <div class="tour-nav">
      <button class="demo-btn" id="tour-prev">← Previous</button>
      <button class="demo-btn demo-btn-primary" id="tour-next">Next →</button>
    </div>
  </div>
</div>
```

### Tour JavaScript
```javascript
// Tour State
let currentStep = 0;
const TOUR_STEPS = [
  { selector: '.demo-sidebar', title: 'Welcome to StockFlows', message: '...', position: 'right' },
  { selector: '.demo-stats', title: 'Real-Time Dashboard', message: '...', position: 'bottom' },
  // ... more steps
];

// Tour Functions
function startTour() { ... }
function showStep(step) { ... }
function nextStep() { ... }
function prevStep() { ... }
function endTour() { ... }
function positionTooltip() { ... }
```

### Tour CSS
```css
.tour-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1000; }
.tour-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.5); }
.tour-tooltip { position: absolute; background: #fff; border: 1px solid var(--border); padding: 24px; max-width: 400px; z-index: 1001; }
.tour-highlight { position: relative; z-index: 1002; box-shadow: 0 0 0 4px var(--brand); }
```

## Features
1. **Guided Navigation** — Previous/Next buttons
2. **Keyboard Support** — Arrow keys, Escape to close
3. **Progress Indicator** — Step counter (1/12)
4. **Persistent State** — "Don't show again" checkbox
5. **Mobile Responsive** — Tooltip repositions on small screens
6. **Auto-Start** — First-time visitors see tour automatically
7. **Replay Button** — "Take Tour" button in sidebar

## Testing
1. Verify tour starts on first visit
2. Verify tour doesn't show on return visits
3. Verify all 12 steps render correctly
4. Verify keyboard navigation works
5. Verify mobile responsive layout
6. Verify "Replay Tour" button works

## Deployment
- Only changes to `public/` directory
- Auto-deploys via Cloudflare Pages on git push
- No changes to Shopify app or Fly.io

## Timeline
- **Step 1**: Add tour HTML structure (10 min)
- **Step 2**: Add tour CSS (15 min)
- **Step 3**: Add tour JavaScript logic (20 min)
- **Step 4**: Add tour data and steps (15 min)
- **Step 5**: Test and debug (15 min)
- **Step 6**: Deploy and verify (5 min)

**Total: ~80 minutes**
