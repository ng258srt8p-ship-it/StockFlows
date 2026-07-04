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

export const ALERTS = [
  { id: "A1", productId: "P3-V3", urgency: "CRITICAL", currentStock: 2, reorderPoint: 10, recommendedQty: 25 },
  { id: "A2", productId: "P3-V6", urgency: "CRITICAL", currentStock: 0, reorderPoint: 8, recommendedQty: 15 },
  { id: "A3", productId: "P4-V2", urgency: "WARNING", currentStock: 6, reorderPoint: 8, recommendedQty: 20 },
  { id: "A4", productId: "P1-V4", urgency: "WARNING", currentStock: 3, reorderPoint: 5, recommendedQty: 15 },
  { id: "A5", productId: "P9-V2", urgency: "CRITICAL", currentStock: 0, reorderPoint: 25, recommendedQty: 50 },
  { id: "A6", productId: "P8-V2", urgency: "WARNING", currentStock: 5, reorderPoint: 20, recommendedQty: 30 }
];

export const FORECASTS = [
  { productId: "P2-V1", dailyAvg: 2.8, trend: "up", confidence: 0.87, model: "ETS" },
  { productId: "P5-V1", dailyAvg: 4.2, trend: "stable", confidence: 0.92, model: "Ensemble" },
  { productId: "P1-V1", dailyAvg: 1.5, trend: "up", confidence: 0.81, model: "Linear" },
  { productId: "P9-V1", dailyAvg: 6.1, trend: "up", confidence: 0.89, model: "ETS" },
  { productId: "P6-V2", dailyAvg: 3.3, trend: "stable", confidence: 0.85, model: "Moving Avg" }
];

export const STATS = {
  totalProducts: 10,
  totalSKUs: 35,
  totalValue: 47892.50,
  lowStockCount: 6,
  outOfStockCount: 2,
  pendingAlerts: 6,
  openPOs: 3,
  pendingTransfers: 1
};
