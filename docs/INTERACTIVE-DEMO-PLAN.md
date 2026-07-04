# StockFlows Interactive Demo Plan

## Objective
Build a self-contained, interactive demo hosted entirely on stockflows.app with realistic dummy data — no redirects to Shopify.

## Current State
- **stockflows.app** = Cloudflare Pages (static hosting from `public/` directory)
- **Data model** = Rich schema with Shop, Location, InventoryItem, PurchaseOrder, Vendor, ForecastResult, StockMovement, ReorderAlert
- **Current screenshots** = Wrong size, no realistic data, redirect to Shopify
- **No seed scripts** = Need to create dummy data from scratch

## Architecture
```
stockflows.app (Cloudflare Pages)
├── index.html          ← Landing page
├── demo.html           ← NEW: Interactive demo page
├── style.css           ← Shared styles
├── script.js           ← Landing page interactions
├── demo.js             ← NEW: Demo logic + dummy data
├── screenshots/        ← NEW: Properly sized screenshots
└── ...
```

---

## Phase 1: Create Dummy Data Module

### Task 1.1: Create `demo-data.js`

**Objective:** Build a comprehensive dummy dataset matching the Prisma schema.

**File:** `public/demo-data.js`

```javascript
// StockFlows Demo Data — Realistic e-commerce inventory

export const SHOP = {
  name: "Alpine Gear Co.",
  domain: "alpine-gear.myshopify.com",
  plan: "PRO",
  currency: "USD"
};

export const LOCATIONS = [
  { id: "L1", name: "Main Warehouse", type: "WAREHOUSE", address: "Portland, OR" },
  { id: "L2", name: "Retail Store #1", type: "RETAIL_STORE", address: "Portland, OR" },
  { id: "L3", name: "Fulfillment Center", type: "THIRD_PARTY_LOGISTICS", address: "Reno, NV" },
  { id: "L4", name: "Pop-up Shop", type: "RETAIL_STORE", address: "Seattle, WA" }
];

export const VENDORS = [
  { id: "V1", name: "Pacific Rim Outfitters", email: "orders@pacificrim.com", leadTime: 14, reliability: 0.92 },
  { id: "V2", name: "Summit Textiles", email: "supply@summittextiles.com", leadTime: 7, reliability: 0.97 },
  { id: "V3", name: "Alloy Components", email: "sales@alloycomp.com", leadTime: 21, reliability: 0.88 },
  { id: "V4", name: "Trail Blazer Packaging", email: "orders@trailblazer.com", leadTime: 5, reliability: 0.95 }
];

export const PRODUCTS = [
  {
    id: "P1", sku: "AG-TENT-001", title: "Alpine 4-Season Tent",
    category: "Tents", cost: 289.00, price: 549.00,
    variants: [
      { id: "P1-V1", title: "Green / 2-Person", barcode: "8901234567001", qty: 45, reorderPoint: 10 },
      { id: "P1-V2", title: "Green / 4-Person", barcode: "8901234567002", qty: 12, reorderPoint: 8 },
      { id: "P1-V3", title: "Orange / 2-Person", barcode: "8901234567003", qty: 28, reorderPoint: 10 },
      { id: "P1-V4", title: "Orange / 4-Person", barcode: "8901234567004", qty: 3, reorderPoint: 5 }
    ]
  },
  {
    id: "P2", sku: "AG-BAG-002", title: "Expedition Backpack 65L",
    category: "Bags", cost: 89.50, price: 189.00,
    variants: [
      { id: "P2-V1", title: "Black", barcode: "8901234567010", qty: 120, reorderPoint: 25 },
      { id: "P2-V2", title: "Forest Green", barcode: "8901234567011", qty: 85, reorderPoint: 25 },
      { id: "P2-V3", title: "Burnt Orange", barcode: "8901234567012", qty: 8, reorderPoint: 15 }
    ]
  },
  {
    id: "P3", sku: "AG-BOOTS-003", title: "Trailmaster GTX Boots",
    category: "Footwear", cost: 145.00, price: 299.00,
    variants: [
      { id: "P3-V1", title: "Black / Size 9", barcode: "8901234567020", qty: 18, reorderPoint: 10 },
      { id: "P3-V2", title: "Black / Size 10", barcode: "8901234567021", qty: 22, reorderPoint: 10 },
      { id: "P3-V3", title: "Black / Size 11", barcode: "8901234567022", qty: 2, reorderPoint: 10 },
      { id: "P3-V4", title: "Brown / Size 9", barcode: "8901234567023", qty: 15, reorderPoint: 8 },
      { id: "P3-V5", title: "Brown / Size 10", barcode: "8901234567024", qty: 19, reorderPoint: 8 },
      { id: "P3-V6", title: "Brown / Size 11", barcode: "8901234567025", qty: 0, reorderPoint: 8 }
    ]
  },
  {
    id: "P4", sku: "AG-SLEEPING-004", title: "Down Sleeping Bag -10°C",
    category: "Sleeping", cost: 178.00, price: 349.00,
    variants: [
      { id: "P4-V1", title: "Regular", barcode: "8901234567030", qty: 34, reorderPoint: 12 },
      { id: "P4-V2", title: "Long", barcode: "8901234567031", qty: 6, reorderPoint: 8 }
    ]
  },
  {
    id: "P5", sku: "AG-LAMP-005", title: "Rechargeable Headlamp 900lm",
    category: "Lighting", cost: 32.00, price: 79.00,
    variants: [
      { id: "P5-V1", title: "Black", barcode: "8901234567040", qty: 200, reorderPoint: 50 },
      { id: "P5-V2", title: "Red", barcode: "8901234567041", qty: 150, reorderPoint: 50 }
    ]
  },
  {
    id: "P6", sku: "AG-CLOTHING-006", title: "Merino Base Layer Set",
    category: "Clothing", cost: 67.00, price: 149.00,
    variants: [
      { id: "P6-V1", title: "Navy / S", barcode: "8901234567050", qty: 40, reorderPoint: 15 },
      { id: "P6-V2", title: "Navy / M", barcode: "8901234567051", qty: 65, reorderPoint: 15 },
      { id: "P6-V3", title: "Navy / L", barcode: "8901234567052", qty: 55, reorderPoint: 15 },
      { id: "P6-V4", title: "Charcoal / S", barcode: "8901234567053", qty: 12, reorderPoint: 10 },
      { id: "P6-V5", title: "Charcoal / M", barcode: "8901234567054", qty: 38, reorderPoint: 10 },
      { id: "P6-V6", title: "Charcoal / L", barcode: "8901234567055", qty: 42, reorderPoint: 10 }
    ]
  },
  {
    id: "P7", sku: "AG-COOKWARE-007", title: "Titanium Cookset",
    category: "Cookware", cost: 54.00, price: 119.00,
    variants: [
      { id: "P7-V1", title: "1-Person", barcode: "8901234567060", qty: 75, reorderPoint: 20 },
      { id: "P7-V2", title: "2-Person", barcode: "8901234567061", qty: 48, reorderPoint: 15 }
    ]
  },
  {
    id: "P8", sku: "AG-HAMMOCK-008", title: "Ultralight Hammock",
    category: "Sleeping", cost: 28.00, price: 69.00,
    variants: [
      { id: "P8-V1", title: "Olive", barcode: "8901234567070", qty: 92, reorderPoint: 30 },
      { id: "P8-V2", title: "Royal Blue", barcode: "8901234567071", qty: 5, reorderPoint: 20 }
    ]
  },
  {
    id: "P9", sku: "AG-WATER-009", title: "Water Filter System",
    category: "Hydration", cost: 22.00, price: 59.00,
    variants: [
      { id: "P9-V1", title: "Standard", barcode: "8901234567080", qty: 180, reorderPoint: 40 },
      { id: "P9-V2", title: "Pro (0.1 micron)", barcode: "8901234567081", qty: 0, reorderPoint: 25 }
    ]
  },
  {
    id: "P10", sku: "AG-COMPASS-010", title: "Precision Compass",
    category: "Navigation", cost: 18.00, price: 45.00,
    variants: [
      { id: "P10-V1", title: "Standard", barcode: "8901234567090", qty: 110, reorderPoint: 30 }
    ]
  }
];

// Purchase Orders
export const PURCHASE_ORDERS = [
  {
    id: "PO1", number: "PO-2026-001", vendorId: "V1", locationId: "L1",
    status: "RECEIVED", expectedDate: "2026-06-20", receivedDate: "2026-06-19",
    items: [
      { productId: "P1-V1", qty: 50, received: 50, unitCost: 289.00 },
      { productId: "P1-V3", qty: 30, received: 30, unitCost: 289.00 }
    ]
  },
  {
    id: "PO2", number: "PO-2026-002", vendorId: "V2", locationId: "L1",
    status: "PARTIALLY_RECEIVED", expectedDate: "2026-07-05", receivedDate: null,
    items: [
      { productId: "P6-V2", qty: 100, received: 60, unitCost: 67.00 },
      { productId: "P6-V5", qty: 80, received: 40, unitCost: 67.00 }
    ]
  },
  {
    id: "PO3", number: "PO-2026-003", vendorId: "V3", locationId: "L1",
    status: "SENT", expectedDate: "2026-07-20", receivedDate: null,
    items: [
      { productId: "P3-V3", qty: 25, received: 0, unitCost: 145.00 },
      { productId: "P3-V6", qty: 15, received: 0, unitCost: 145.00 }
    ]
  },
  {
    id: "PO4", number: "PO-2026-004", vendorId: "V1", locationId: "L1",
    status: "DRAFT", expectedDate: "2026-08-01", receivedDate: null,
    items: [
      { productId: "P4-V2", qty: 20, received: 0, unitCost: 178.00 },
      { productId: "P1-V2", qty: 15, received: 0, unitCost: 289.00 }
    ]
  }
];

// Stock Movements (last 30 days)
export const STOCK_MOVEMENTS = [
  { type: "SALE", productId: "P2-V1", qty: -8, date: "2026-07-03" },
  { type: "SALE", productId: "P5-V1", qty: -12, date: "2026-07-03" },
  { type: "SALE", productId: "P9-V1", qty: -5, date: "2026-07-03" },
  { type: "SALE", productId: "P6-V2", qty: -3, date: "2026-07-02" },
  { type: "RETURN", productId: "P3-V1", qty: 2, date: "2026-07-02" },
  { type: "RECEIVING", productId: "P6-V2", qty: 60, date: "2026-07-01" },
  { type: "SALE", productId: "P1-V1", qty: -4, date: "2026-07-01" },
  { type: "ADJUSTMENT", productId: "P8-V2", qty: -2, date: "2026-06-30" },
  { type: "SALE", productId: "P7-V1", qty: -6, date: "2026-06-30" },
  { type: "TRANSFER_OUT", productId: "P5-V1", qty: -20, date: "2026-06-29" },
  { type: "TRANSFER_IN", productId: "P5-V1", qty: 20, locationId: "L2", date: "2026-06-29" }
];

// Reorder Alerts
export const ALERTS = [
  { id: "A1", productId: "P3-V3", urgency: "CRITICAL", currentStock: 2, reorderPoint: 10, recommendedQty: 25 },
  { id: "A2", productId: "P3-V6", urgency: "CRITICAL", currentStock: 0, reorderPoint: 8, recommendedQty: 15 },
  { id: "A3", productId: "P4-V2", urgency: "WARNING", currentStock: 6, reorderPoint: 8, recommendedQty: 20 },
  { id: "A4", productId: "P1-V4", urgency: "WARNING", currentStock: 3, reorderPoint: 5, recommendedQty: 15 },
  { id: "A5", productId: "P9-V2", urgency: "CRITICAL", currentStock: 0, reorderPoint: 25, recommendedQty: 50 },
  { id: "A6", productId: "P8-V2", urgency: "WARNING", currentStock: 5, reorderPoint: 20, recommendedQty: 30 }
];

// Forecast Data (30-day)
export const FORECASTS = [
  { productId: "P2-V1", dailyAvg: 2.8, trend: "up", confidence: 0.87, model: "ETS" },
  { productId: "P5-V1", dailyAvg: 4.2, trend: "stable", confidence: 0.92, model: "Ensemble" },
  { productId: "P1-V1", dailyAvg: 1.5, trend: "up", confidence: 0.81, model: "Linear" },
  { productId: "P9-V1", dailyAvg: 6.1, trend: "up", confidence: 0.89, model: "ETS" },
  { productId: "P6-V2", dailyAvg: 3.3, trend: "stable", confidence: 0.85, model: "Moving Avg" }
];

// Dashboard Stats
export const STATS = {
  totalProducts: 35,
  totalSKUs: 35,
  totalValue: 47892.50,
  lowStockCount: 6,
  outOfStockCount: 2,
  pendingAlerts: 6,
  openPOs: 3,
  pendingTransfers: 1
};
```

**Step 2: Verify**

Run: `node -e "import('./public/demo-data.js').then(d => console.log(d.STATS))"`
Expected: Stats object printed

**Step 3: Commit**

```bash
git add public/demo-data.js
git commit -m "feat: add comprehensive demo data module"
```

---

## Phase 2: Build Interactive Demo Page

### Task 2.1: Create `demo.html`

**Objective:** Build the demo page with sidebar navigation and interactive panels.

**File:** `public/demo.html`

**Step 1: Create demo.html structure**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StockFlows — Live Demo</title>
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&display=swap">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200">
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="demo.css">
</head>
<body>
  <div class="demo-shell">
    <!-- Sidebar -->
    <aside class="demo-sidebar">
      <div class="demo-logo">
        <img src="/SF icon.svg" alt="StockFlows" width="20" height="20">
        <span>StockFlows</span>
      </div>
      <nav class="demo-nav">
        <a href="#" class="demo-nav-item active" data-page="dashboard">
          <span class="material-symbols-outlined">dashboard</span>
          <span>Dashboard</span>
        </a>
        <a href="#" class="demo-nav-item" data-page="inventory">
          <span class="material-symbols-outlined">inventory_2</span>
          <span>Inventory</span>
        </a>
        <a href="#" class="demo-nav-item" data-page="purchasing">
          <span class="material-symbols-outlined">shopping_cart</span>
          <span>Purchasing</span>
        </a>
        <a href="#" class="demo-nav-item" data-page="forecasting">
          <span class="material-symbols-outlined">monitoring</span>
          <span>Forecasting</span>
        </a>
        <a href="#" class="demo-nav-item" data-page="reports">
          <span class="material-symbols-outlined">analytics</span>
          <span>Reports</span>
        </a>
      </nav>
      <div class="demo-sidebar-footer">
        <div class="demo-badge">DEMO</div>
        <a href="/" class="demo-back-link">← Back to Site</a>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="demo-main">
      <!-- Dashboard Page -->
      <div class="demo-page active" id="page-dashboard">
        <div class="demo-header">
          <h1>Dashboard</h1>
          <p class="demo-subtitle">Alpine Gear Co. — Inventory Overview</p>
        </div>
        <div class="demo-stats" id="dashboard-stats"></div>
        <div class="demo-grid">
          <div class="demo-card">
            <h3>Recent Activity</h3>
            <div id="recent-activity"></div>
          </div>
          <div class="demo-card">
            <h3>Low Stock Alerts</h3>
            <div id="low-stock-alerts"></div>
          </div>
        </div>
      </div>

      <!-- Inventory Page -->
      <div class="demo-page" id="page-inventory">
        <div class="demo-header">
          <h1>Inventory</h1>
          <div class="demo-header-actions">
            <input type="text" class="demo-search" id="inventory-search" placeholder="Search products...">
            <select class="demo-select" id="location-filter">
              <option value="all">All Locations</option>
            </select>
          </div>
        </div>
        <div class="demo-table-wrap">
          <table class="demo-table" id="inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Location</th>
                <th>Qty</th>
                <th>Reorder Pt</th>
                <th>Status</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody id="inventory-tbody"></tbody>
          </table>
        </div>
      </div>

      <!-- Purchasing Page -->
      <div class="demo-page" id="page-purchasing">
        <div class="demo-header">
          <h1>Purchase Orders</h1>
          <button class="demo-btn demo-btn-primary" id="btn-new-po">+ New PO</button>
        </div>
        <div class="demo-table-wrap">
          <table class="demo-table" id="po-table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Vendor</th>
                <th>Status</th>
                <th>Items</th>
                <th>Total</th>
                <th>Expected</th>
              </tr>
            </thead>
            <tbody id="po-tbody"></tbody>
          </table>
        </div>
      </div>

      <!-- Forecasting Page -->
      <div class="demo-page" id="page-forecasting">
        <div class="demo-header">
          <h1>Demand Forecasting</h1>
          <p class="demo-subtitle">30-day predictions powered by AI</p>
        </div>
        <div class="demo-grid" id="forecast-cards"></div>
      </div>

      <!-- Reports Page -->
      <div class="demo-page" id="page-reports">
        <div class="demo-header">
          <h1>Reports</h1>
          <div class="demo-header-actions">
            <button class="demo-btn">Export CSV</button>
            <button class="demo-btn">Generate PDF</button>
          </div>
        </div>
        <div class="demo-grid">
          <div class="demo-card">
            <h3>Inventory Valuation</h3>
            <div id="valuation-report"></div>
          </div>
          <div class="demo-card">
            <h3>Stock Movement Summary</h3>
            <div id="movement-report"></div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <script type="module" src="demo-data.js"></script>
  <script type="module" src="demo.js"></script>
</body>
</html>
```

**Step 2: Commit**

```bash
git add public/demo.html
git commit -m "feat: create interactive demo page structure"
```

---

### Task 2.2: Create `demo.css`

**Objective:** Style the demo to match the stockflows.app design system.

**File:** `public/demo.css`

**Step 1: Create demo.css**

```css
/* StockFlows Demo — Interactive Dashboard Styles */

/* Shell Layout */
.demo-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* Sidebar */
.demo-sidebar {
  width: 240px;
  background: var(--bg-dark);
  color: #fff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.demo-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 24px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  border-bottom: 1px solid #333;
}

.demo-nav {
  flex: 1;
  padding: 12px 0;
}

.demo-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  color: #888;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.15s;
}

.demo-nav-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

.demo-nav-item.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border-left: 3px solid #fff;
}

.demo-nav-item .material-symbols-outlined {
  font-size: 20px;
}

.demo-sidebar-footer {
  padding: 16px 24px;
  border-top: 1px solid #333;
}

.demo-badge {
  display: inline-block;
  padding: 4px 8px;
  background: var(--success);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 1px;
  border-radius: 2px;
  margin-bottom: 8px;
}

.demo-back-link {
  display: block;
  color: #666;
  text-decoration: none;
  font-size: 0.75rem;
}

.demo-back-link:hover {
  color: #fff;
}

/* Main Content */
.demo-main {
  flex: 1;
  overflow-y: auto;
  background: var(--bg);
  padding: 32px 40px;
}

/* Pages */
.demo-page {
  display: none;
}

.demo-page.active {
  display: block;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Header */
.demo-header {
  margin-bottom: 32px;
}

.demo-header h1 {
  font-family: var(--serif);
  font-size: 2rem;
  font-weight: 400;
  font-style: italic;
  margin-bottom: 4px;
}

.demo-subtitle {
  color: var(--text-dim);
  font-size: 0.85rem;
}

.demo-header-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

/* Stats Cards */
.demo-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.demo-stat-card {
  background: #fff;
  border: 1px solid var(--border);
  padding: 20px;
  transition: border-color 0.15s;
}

.demo-stat-card:hover {
  border-color: #999;
}

.demo-stat-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.demo-stat-value {
  font-family: var(--serif);
  font-size: 2rem;
  font-style: italic;
  line-height: 1;
}

.demo-stat-value.green { color: var(--success); }
.demo-stat-value.red { color: var(--critical); }
.demo-stat-value.blue { color: var(--brand); }

/* Cards */
.demo-card {
  background: #fff;
  border: 1px solid var(--border);
  padding: 24px;
}

.demo-card h3 {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Grid */
.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

/* Tables */
.demo-table-wrap {
  overflow-x: auto;
}

.demo-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border: 1px solid var(--border);
}

.demo-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}

.demo-table td {
  padding: 12px 16px;
  font-size: 0.85rem;
  border-bottom: 1px solid var(--border);
}

.demo-table tbody tr:hover {
  background: #fafafa;
}

/* Status Badges */
.demo-status {
  display: inline-block;
  padding: 3px 8px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.demo-status.in-stock { color: var(--success); border: 1px solid var(--success); }
.demo-status.low-stock { color: var(--warning); border: 1px solid var(--warning); }
.demo-status.out-of-stock { color: var(--critical); border: 1px solid var(--critical); }
.demo-status.draft { color: var(--text-dim); border: 1px solid var(--border); }
.demo-status.sent { color: #3b82f6; border: 1px solid #3b82f6; }
.demo-status.partial { color: var(--warning); border: 1px solid var(--warning); }
.demo-status.received { color: var(--success); border: 1px solid var(--success); }

/* Buttons */
.demo-btn {
  padding: 8px 16px;
  font-size: 0.8rem;
  font-weight: 500;
  font-family: var(--font);
  cursor: pointer;
  border: 1px solid var(--border);
  background: #fff;
  color: var(--text);
  transition: all 0.15s;
}

.demo-btn:hover {
  border-color: #999;
}

.demo-btn-primary {
  background: var(--brand);
  color: #fff;
  border-color: var(--brand);
}

.demo-btn-primary:hover {
  background: #333;
}

/* Inputs */
.demo-search,
.demo-select {
  padding: 8px 12px;
  font-size: 0.85rem;
  font-family: var(--font);
  border: 1px solid var(--border);
  background: #fff;
  color: var(--text);
}

.demo-search {
  width: 250px;
}

.demo-search:focus,
.demo-select:focus {
  outline: none;
  border-color: #999;
}

/* Alert Items */
.demo-alert-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.demo-alert-item:last-child {
  border-bottom: none;
}

.demo-alert-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.demo-alert-dot.critical { background: var(--critical); }
.demo-alert-dot.warning { background: var(--warning); }
.demo-alert-dot.info { background: #3b82f6; }

.demo-alert-text {
  flex: 1;
  font-size: 0.85rem;
}

.demo-alert-qty {
  font-size: 0.75rem;
  color: var(--text-dim);
}

/* Activity Items */
.demo-activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}

.demo-activity-item:last-child {
  border-bottom: none;
}

.demo-activity-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  border-radius: 4px;
  flex-shrink: 0;
}

.demo-activity-icon .material-symbols-outlined {
  font-size: 18px;
  color: var(--text-dim);
}

.demo-activity-text {
  flex: 1;
  font-size: 0.85rem;
}

.demo-activity-time {
  font-size: 0.75rem;
  color: var(--text-dim);
}

/* Forecast Cards */
.demo-forecast-card {
  background: #fff;
  border: 1px solid var(--border);
  padding: 24px;
}

.demo-forecast-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.demo-forecast-product {
  font-weight: 600;
  font-size: 0.9rem;
}

.demo-forecast-model {
  font-size: 0.7rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.demo-forecast-chart {
  height: 60px;
  display: flex;
  align-items: flex-end;
  gap: 2px;
  margin-bottom: 12px;
}

.demo-forecast-bar {
  flex: 1;
  background: var(--brand);
  opacity: 0.3;
  border-radius: 2px 2px 0 0;
  transition: opacity 0.15s;
}

.demo-forecast-bar.predicted {
  opacity: 0.7;
}

.demo-forecast-bar:hover {
  opacity: 1;
}

.demo-forecast-stats {
  display: flex;
  gap: 24px;
  font-size: 0.75rem;
  color: var(--text-dim);
}

.demo-forecast-stat strong {
  color: var(--text);
}

/* Report Cards */
.demo-report-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  font-size: 0.85rem;
}

.demo-report-row:last-child {
  border-bottom: none;
}

.demo-report-total {
  font-weight: 600;
  font-family: var(--serif);
  font-style: italic;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .demo-shell {
    flex-direction: column;
  }
  
  .demo-sidebar {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
  }
  
  .demo-nav {
    display: flex;
    padding: 0;
  }
  
  .demo-nav-item {
    padding: 12px 16px;
    white-space: nowrap;
  }
  
  .demo-sidebar-footer {
    display: none;
  }
  
  .demo-main {
    padding: 20px;
  }
  
  .demo-grid {
    grid-template-columns: 1fr;
  }
}
```

**Step 2: Commit**

```bash
git add public/demo.css
git commit -m "feat: create demo page styles"
```

---

### Task 2.3: Create `demo.js`

**Objective:** Build interactive demo logic with tab switching and data rendering.

**File:** `public/demo.js`

**Step 1: Create demo.js**

```javascript
// StockFlows Interactive Demo
import { SHOP, LOCATIONS, VENDORS, PRODUCTS, PURCHASE_ORDERS, STOCK_MOVEMENTS, ALERTS, FORECASTS, STATS } from './demo-data.js';

// --- Utility Functions ---
function fmt(n) { return n.toLocaleString(); }
function fmtM(n) { return '$' + n.toFixed(2); }

function getStatus(product) {
  const totalQty = product.variants.reduce((s, v) => s + v.qty, 0);
  const hasOut = product.variants.some(v => v.qty === 0);
  const hasLow = product.variants.some(v => v.qty > 0 && v.qty <= v.reorderPoint);
  if (hasOut) return 'out-of-stock';
  if (hasLow) return 'low-stock';
  return 'in-stock';
}

function getStatusLabel(status) {
  return status === 'out-of-stock' ? 'Out of Stock' :
         status === 'low-stock' ? 'Low Stock' : 'In Stock';
}

function getProductName(id) {
  for (const p of PRODUCTS) {
    for (const v of p.variants) {
      if (v.id === id) return `${p.title} — ${v.title}`;
    }
  }
  return id;
}

function getLocationName(id) {
  return LOCATIONS.find(l => l.id === id)?.name || id;
}

function getVendorName(id) {
  return VENDORS.find(v => v.id === id)?.name || id;
}

// --- Navigation ---
function initNavigation() {
  document.querySelectorAll('.demo-nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      
      // Update nav
      document.querySelectorAll('.demo-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      // Show page
      document.querySelectorAll('.demo-page').forEach(p => p.classList.remove('active'));
      document.getElementById(`page-${page}`).classList.add('active');
    });
  });
}

// --- Dashboard ---
function renderDashboard() {
  // Stats
  const statsHtml = `
    <div class="demo-stat-card">
      <div class="demo-stat-label">Total SKUs</div>
      <div class="demo-stat-value blue">${STATS.totalSKUs}</div>
    </div>
    <div class="demo-stat-card">
      <div class="demo-stat-label">Inventory Value</div>
      <div class="demo-stat-value">${fmtM(STATS.totalValue)}</div>
    </div>
    <div class="demo-stat-card">
      <div class="demo-stat-label">Low Stock Items</div>
      <div class="demo-stat-value red">${STATS.lowStockCount}</div>
    </div>
    <div class="demo-stat-card">
      <div class="demo-stat-label">Out of Stock</div>
      <div class="demo-stat-value red">${STATS.outOfStockCount}</div>
    </div>
    <div class="demo-stat-card">
      <div class="demo-stat-label">Open POs</div>
      <div class="demo-stat-value">${STATS.openPOs}</div>
    </div>
    <div class="demo-stat-card">
      <div class="demo-stat-label">Pending Alerts</div>
      <div class="demo-stat-value">${STATS.pendingAlerts}</div>
    </div>
  `;
  document.getElementById('dashboard-stats').innerHTML = statsHtml;

  // Recent Activity
  const activityHtml = STOCK_MOVEMENTS.slice(0, 6).map(m => {
    const icon = m.type === 'SALE' ? 'point_of_sale' :
                 m.type === 'RETURN' ? 'replay' :
                 m.type === 'RECEIVING' ? 'local_shipping' :
                 m.type === 'ADJUSTMENT' ? 'edit' :
                 m.type.startsWith('TRANSFER') ? 'swap_horiz' : 'inventory';
    const color = m.qty > 0 ? 'green' : '';
    return `
      <div class="demo-activity-item">
        <div class="demo-activity-icon">
          <span class="material-symbols-outlined">${icon}</span>
        </div>
        <div class="demo-activity-text">
          <strong>${m.type.replace('_', ' ')}</strong> — ${getProductName(m.productId)}
        </div>
        <div class="demo-activity-time ${color}">${m.qty > 0 ? '+' : ''}${m.qty} units</div>
      </div>
    `;
  }).join('');
  document.getElementById('recent-activity').innerHTML = activityHtml;

  // Low Stock Alerts
  const alertsHtml = ALERTS.map(a => `
    <div class="demo-alert-item">
      <div class="demo-alert-dot ${a.urgency.toLowerCase()}"></div>
      <div class="demo-alert-text">${getProductName(a.productId)}</div>
      <div class="demo-alert-qty">${a.currentStock} / ${a.reorderPoint}</div>
    </div>
  `).join('');
  document.getElementById('low-stock-alerts').innerHTML = alertsHtml;
}

// --- Inventory ---
function renderInventory() {
  const tbody = document.getElementById('inventory-tbody');
  const rows = [];
  
  for (const product of PRODUCTS) {
    for (const variant of product.variants) {
      const status = variant.qty === 0 ? 'out-of-stock' :
                     variant.qty <= variant.reorderPoint ? 'low-stock' : 'in-stock';
      const value = variant.qty * product.cost;
      
      rows.push(`
        <tr data-search="${product.title} ${variant.title} ${product.sku} ${variant.barcode}">
          <td><strong>${product.title}</strong><br><span style="color:#666;font-size:0.75rem">${variant.title}</span></td>
          <td><code style="font-size:0.8rem">${product.sku}</code></td>
          <td>Main Warehouse</td>
          <td><strong>${variant.qty}</strong></td>
          <td>${variant.reorderPoint}</td>
          <td><span class="demo-status ${status}">${getStatusLabel(status)}</span></td>
          <td>${fmtM(value)}</td>
        </tr>
      `);
    }
  }
  
  tbody.innerHTML = rows.join('');
  
  // Search
  document.getElementById('inventory-search').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    tbody.querySelectorAll('tr').forEach(row => {
      row.style.display = row.dataset.search.toLowerCase().includes(term) ? '' : 'none';
    });
  });
}

// --- Purchasing ---
function renderPurchasing() {
  const tbody = document.getElementById('po-tbody');
  const rows = PURCHASE_ORDERS.map(po => {
    const total = po.items.reduce((s, i) => s + i.qty * i.unitCost, 0);
    const statusClass = po.status.toLowerCase().replace('_', '-');
    return `
      <tr>
        <td><strong>${po.number}</strong></td>
        <td>${getVendorName(po.vendorId)}</td>
        <td><span class="demo-status ${statusClass}">${po.status.replace('_', ' ')}</span></td>
        <td>${po.items.length} items</td>
        <td>${fmtM(total)}</td>
        <td>${po.expectedDate}</td>
      </tr>
    `;
  }).join('');
  tbody.innerHTML = rows.join('');
}

// --- Forecasting ---
function renderForecasting() {
  const container = document.getElementById('forecast-cards');
  const cards = FORECASTS.map(f => {
    const bars = Array.from({length: 30}, (_, i) => {
      const base = f.dailyAvg;
      const variation = (Math.sin(i * 0.3) * 0.3 + 0.7) * base;
      const height = Math.max(10, (variation / 10) * 100);
      return `<div class="demo-forecast-bar ${i >= 20 ? 'predicted' : ''}" style="height:${height}%"></div>`;
    }).join('');
    
    return `
      <div class="demo-forecast-card">
        <div class="demo-forecast-header">
          <div class="demo-forecast-product">${getProductName(f.productId)}</div>
          <div class="demo-forecast-model">${f.model}</div>
        </div>
        <div class="demo-forecast-chart">${bars}</div>
        <div class="demo-forecast-stats">
          <span>Avg: <strong>${f.dailyAvg}/day</strong></span>
          <span>Trend: <strong>${f.trend}</strong></span>
          <span>Confidence: <strong>${(f.confidence * 100).toFixed(0)}%</strong></span>
        </div>
      </div>
    `;
  }).join('');
  container.innerHTML = cards;
}

// --- Reports ---
function renderReports() {
  // Inventory Valuation
  const valuationHtml = PRODUCTS.map(p => {
    const totalQty = p.variants.reduce((s, v) => s + v.qty, 0);
    const totalValue = totalQty * p.cost;
    return `
      <div class="demo-report-row">
        <span>${p.title}</span>
        <span>${fmt(totalQty)} units — ${fmtM(totalValue)}</span>
      </div>
    `;
  }).join('');
  document.getElementById('valuation-report').innerHTML = valuationHtml + `
    <div class="demo-report-row" style="font-weight:600;margin-top:8px;padding-top:8px;border-top:2px solid var(--border)">
      <span>Total Inventory Value</span>
      <span class="demo-report-total">${fmtM(STATS.totalValue)}</span>
    </div>
  `;

  // Stock Movement Summary
  const movementTypes = {};
  STOCK_MOVEMENTS.forEach(m => {
    if (!movementTypes[m.type]) movementTypes[m.type] = 0;
    movementTypes[m.type] += Math.abs(m.qty);
  });
  const movementHtml = Object.entries(movementTypes).map(([type, qty]) => `
    <div class="demo-report-row">
      <span>${type.replace('_', ' ')}</span>
      <span>${qty} units</span>
    </div>
  `).join('');
  document.getElementById('movement-report').innerHTML = movementHtml;
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  renderDashboard();
  renderInventory();
  renderPurchasing();
  renderForecasting();
  renderReports();
});
```

**Step 2: Commit**

```bash
git add public/demo.js
git commit -m "feat: create interactive demo logic with all pages"
```

---

## Phase 3: Update Landing Page

### Task 3.1: Update `index.html` Demo Section

**Objective:** Replace the screenshot gallery with a link to the interactive demo.

**File:** `public/index.html`

**Step 1: Update demo section**

```html
<!-- Demo Section -->
<section class="demo-section" id="demo">
  <div class="demo-inner">
    <h2>See it in action</h2>
    <p class="section-sub">Experience the full StockFlows dashboard with real data</p>
    <div class="demo-preview">
      <div class="demo-mockup">
        <div class="demo-mockup-header">
          <div class="demo-mockup-dots">
            <span></span><span></span><span></span>
          </div>
          <span class="demo-mockup-url">stockflows.app/demo</span>
        </div>
        <div class="demo-mockup-body">
          <div class="demo-mockup-sidebar">
            <div class="demo-mockup-nav-item active"></div>
            <div class="demo-mockup-nav-item"></div>
            <div class="demo-mockup-nav-item"></div>
          </div>
          <div class="demo-mockup-content">
            <div class="demo-mockup-stats">
              <div class="demo-mockup-stat"></div>
              <div class="demo-mockup-stat"></div>
              <div class="demo-mockup-stat"></div>
            </div>
            <div class="demo-mockup-chart"></div>
          </div>
        </div>
      </div>
      <a href="/demo.html" class="btn btn-brand btn-lg">Launch Interactive Demo</a>
    </div>
  </div>
</section>
```

**Step 2: Add mockup CSS to style.css**

```css
/* Demo Mockup */
.demo-mockup {
  max-width: 900px;
  margin: 0 auto 48px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}

.demo-mockup-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}

.demo-mockup-dots {
  display: flex;
  gap: 6px;
}

.demo-mockup-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--border);
}

.demo-mockup-url {
  font-size: 0.75rem;
  color: var(--text-dim);
}

.demo-mockup-body {
  display: flex;
  height: 300px;
}

.demo-mockup-sidebar {
  width: 60px;
  background: var(--bg-dark);
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.demo-mockup-nav-item {
  height: 8px;
  background: #333;
  border-radius: 2px;
}

.demo-mockup-nav-item.active {
  background: #fff;
}

.demo-mockup-content {
  flex: 1;
  padding: 24px;
}

.demo-mockup-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.demo-mockup-stat {
  flex: 1;
  height: 60px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
}

.demo-mockup-chart {
  height: 160px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
}
```

**Step 3: Commit**

```bash
git add public/index.html public/style.css
git commit -m "feat: update landing page with interactive demo mockup"
```

---

## Phase 4: Create Proper Screenshots

### Task 4.1: Take Screenshots of Demo

**Objective:** Capture properly sized screenshots of the interactive demo.

**File:** `e2e/demo-screenshots.test.ts`

**Step 1: Create screenshot test**

```typescript
import { test } from "@playwright/test";

const DEMO_URL = "https://stockflows.app/demo.html";

test.describe("Take Demo Screenshots", () => {
  let browser: any;
  let page: any;

  test.beforeAll(async ({ playwright }) => {
    browser = await playwright.chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    page = await context.newPage();
  });

  test.afterAll(async () => { if (browser) await browser.close(); });

  test("Dashboard Screenshot", async () => {
    await page.goto(DEMO_URL, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "public/screenshots/demo-dashboard.png", fullPage: false });
  });

  test("Inventory Screenshot", async () => {
    await page.click('[data-page="inventory"]');
    await page.waitForTimeout(500);
    await page.screenshot({ path: "public/screenshots/demo-inventory.png", fullPage: false });
  });

  test("Purchasing Screenshot", async () => {
    await page.click('[data-page="purchasing"]');
    await page.waitForTimeout(500);
    await page.screenshot({ path: "public/screenshots/demo-purchasing.png", fullPage: false });
  });

  test("Forecasting Screenshot", async () => {
    await page.click('[data-page="forecasting"]');
    await page.waitForTimeout(500);
    await page.screenshot({ path: "public/screenshots/demo-forecasting.png", fullPage: false });
  });

  test("Reports Screenshot", async () => {
    await page.click('[data-page="reports"]');
    await page.waitForTimeout(500);
    await page.screenshot({ path: "public/screenshots/demo-reports.png", fullPage: false });
  });
});
```

**Step 2: Run screenshot tests**

```bash
npx playwright test e2e/demo-screenshots.test.ts
```

**Step 3: Update landing page to use new screenshots**

```html
<img src="/screenshots/demo-dashboard.png" alt="StockFlows Dashboard" class="demo-image">
```

**Step 4: Commit**

```bash
git add e2e/demo-screenshots.test.ts public/screenshots/
git commit -m "feat: add proper demo screenshots at 1440x900"
```

---

## Phase 5: E2E Test Suite

### Task 5.1: Create `e2e/demo.spec.ts`

**Objective:** Full E2E test suite for the interactive demo.

**File:** `e2e/demo.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

const DEMO_URL = "https://stockflows.app/demo.html";

test.describe("StockFlows Interactive Demo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DEMO_URL, { waitUntil: "networkidle" });
  });

  test("Demo page loads with correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/StockFlows.*Demo/);
  });

  test("Dashboard shows all stats", async ({ page }) => {
    await expect(page.locator("#page-dashboard")).toBeVisible();
    await expect(page.locator(".demo-stat-card")).toHaveCount(6);
    await expect(page.locator(".demo-stat-value").first()).toContainText("35");
  });

  test("Navigation switches pages", async ({ page }) => {
    await page.click('[data-page="inventory"]');
    await expect(page.locator("#page-inventory")).toBeVisible();
    await expect(page.locator("#page-dashboard")).not.toBeVisible();
  });

  test("Inventory table shows all products", async ({ page }) => {
    await page.click('[data-page="inventory"]');
    await expect(page.locator("#inventory-tbody tr")).toHaveCount(35);
  });

  test("Inventory search filters products", async ({ page }) => {
    await page.click('[data-page="inventory"]');
    await page.fill("#inventory-search", "tent");
    const visibleRows = await page.locator("#inventory-tbody tr:visible").count();
    expect(visibleRows).toBeGreaterThan(0);
    expect(visibleRows).toBeLessThan(35);
  });

  test("Purchasing page shows POs", async ({ page }) => {
    await page.click('[data-page="purchasing"]');
    await expect(page.locator("#po-tbody tr")).toHaveCount(4);
  });

  test("Forecasting shows forecast cards", async ({ page }) => {
    await page.click('[data-page="forecasting"]');
    await expect(page.locator(".demo-forecast-card")).toHaveCount(5);
  });

  test("Reports show valuation", async ({ page }) => {
    await page.click('[data-page="reports"]');
    await expect(page.locator("#valuation-report")).toContainText("Total Inventory Value");
    await expect(page.locator("#valuation-report")).toContainText("$47,892.50");
  });

  test("All pages have correct header", async ({ page }) => {
    const pages = ["dashboard", "inventory", "purchasing", "forecasting", "reports"];
    for (const p of pages) {
      await page.click(`[data-page="${p}"]`);
      await expect(page.locator(`#page-${p} h1`)).toBeVisible();
    }
  });
});
```

**Step 2: Commit**

```bash
git add e2e/demo.spec.ts
git commit -m "feat: add comprehensive E2E test suite for demo"
```

---

## Phase 6: Deploy & Verify

### Task 6.1: Deploy Everything

**Objective:** Push all changes to GitHub, Cloudflare, Fly.io, and Shopify.

**Step 1: Commit all changes**

```bash
git add -A
git commit -m "feat: complete interactive demo with dummy data, E2E tests, and proper screenshots"
```

**Step 2: Push to GitHub**

```bash
git push origin main
```

**Step 3: Deploy to Cloudflare**

```bash
wrangler pages deploy public --project-name=stockflows
```

**Step 4: Deploy to Fly.io**

```bash
fly deploy --app stockflows
```

**Step 5: Deploy to Shopify**

```bash
shopify app deploy --allow-updates --allow-deletes
```

**Step 6: Verify all deployments**

```bash
# Cloudflare
curl -s -o /dev/null -w "%{http_code}" https://stockflows.app/demo.html

# Fly.io
curl -s https://stockflows.fly.dev/health

# All pages
for page in dashboard inventory purchasing forecasting reports; do
  curl -s -o /dev/null -w "$page: %{http_code}\n" "https://stockflows.app/demo.html#$page"
done
```

---

## Phase 7: E2E Test Execution

### Task 7.1: Run Full Test Suite

**Step 1: Run E2E tests**

```bash
npx playwright test e2e/demo.spec.ts
```

**Step 2: Run screenshot tests**

```bash
npx playwright test e2e/demo-screenshots.test.ts
```

**Step 3: Verify all tests pass**

Expected: All tests green.

---

## Summary

| Phase | Tasks | Deliverables |
|-------|-------|--------------|
| Phase 1 | Dummy data module | `demo-data.js` with realistic data |
| Phase 2 | Interactive demo | `demo.html`, `demo.css`, `demo.js` |
| Phase 3 | Landing page update | Updated mockup section |
| Phase 4 | Proper screenshots | 5 screenshots at 1440x900 |
| Phase 5 | E2E test suite | 10 comprehensive tests |
| Phase 6 | Deployment | GitHub, Cloudflare, Fly.io, Shopify |
| Phase 7 | Test execution | All tests passing |

**Total Files:** 6 new, 2 modified
**Total Tests:** 10 E2E tests + 5 screenshot tests
**Deployment:** All 4 platforms
