# StockFlows v7 Demo — Mock Data Architecture

## Overview

This document defines the complete mock data layer for the StockFlows v7 demo app. It maps all 17 Prisma models to demo-compatible TypeScript interfaces, defines Zustand store architecture, mock API layer, and data generation strategy.

---

## Section 1: Prisma-to-Demo Interface Mapping

All 17 Prisma models mapped to TypeScript interfaces. IDs use `string` (UUIDs). Dates use `string` (ISO format). Decimals use `number`. Json fields use typed structures.

### Enums (shared)

```typescript
// prisma/schema.prisma enums → demo types
export type ShopPlan = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
export type UserRole = 'OWNER' | 'MANAGER' | 'STAFF';
export type LocationType = 'WAREHOUSE' | 'RETAIL_STORE' | 'DROP_SHIP' | 'THIRD_PARTY_LOGISTICS';
export type MovementType = 'SALE' | 'RETURN' | 'ADJUSTMENT' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'RECEIVING' | 'CYCLE_COUNT' | 'DAMAGE';
export type TransferStatus = 'PENDING' | 'APPROVED' | 'SHIPPED' | 'PARTIALLY_RECEIVED' | 'COMPLETED' | 'CANCELLED';
export type POStatus = 'DRAFT' | 'SENT' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CLOSED' | 'CANCELLED';
export type AlertUrgency = 'CRITICAL' | 'WARNING' | 'INFO';
export type AlertStatus = 'PENDING' | 'ACKNOWLEDGED' | 'PO_CREATED' | 'DISMISSED';
```

### 1. Shop

```typescript
export interface Shop {
  id: string;
  shopifyDomain: string;
  accessToken: string;        // demo: "demo-token-xxx"
  plan: ShopPlan;
  installedAt: string;        // ISO date
  updatedAt: string;
}
// Default: { id: uuid(), shopifyDomain: "demo-store.myshopify.com", plan: "PRO", ... }
```

### 2. Session

```typescript
export interface Session {
  id: string;
  shopId: string;
  shopifyDomain: string;
  accessToken: string;
  expires: string | null;
  createdAt: string;
  updatedAt: string;
}
// Default: tied to demo Shop
```

### 3. User

```typescript
export interface User {
  id: string;
  shopId: string;
  shopifyUserId: string;
  email: string;
  role: UserRole;
  permissions: Record<string, boolean> | null;
  createdAt: string;
}
// Defaults: 3 users — Owner (admin@demo.com), Manager (mgr@demo.com), Staff (staff@demo.com)
```

### 4. Location

```typescript
export interface Location {
  id: string;
  shopId: string;
  shopifyLocationId: string;
  name: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  } | null;
  type: LocationType;
  isActive: boolean;
}
// Defaults: 3 locations — Main Warehouse, Downtown Storefront, Westside Hub
```

### 5. InventoryItem

```typescript
export interface InventoryItem {
  id: string;
  shopId: string;
  locationId: string;
  shopifyProductId: string;
  shopifyVariantId: string;
  sku: string | null;
  barcode: string | null;
  title: string;
  quantity: number;
  reserved: number;
  available: number;           // computed: quantity - reserved
  costPerUnit: number | null;
  reorderPoint: number;
  reorderQuantity: number;
  lastCountedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
// 50+ items across 3 locations, 3 categories (Apparel, Footwear, Accessories)
```

### 6. StockMovement

```typescript
export interface StockMovement {
  id: string;
  inventoryItemId: string;
  locationId: string;
  type: MovementType;
  quantityChange: number;      // positive = in, negative = out
  reference: string | null;   // PO number, transfer ID, etc.
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
}
// 200+ movements — sales, returns, adjustments, transfers, receiving
```

### 7. StockTransfer

```typescript
export interface StockTransfer {
  id: string;
  shopId: string;
  fromLocationId: string;
  toLocationId: string;
  status: TransferStatus;
  lineItems: Array<{
    inventoryItemId: string;
    sku: string;
    title: string;
    quantity: number;
    receivedQty?: number;
  }>;
  notes: string | null;
  requestedBy: string;
  approvedBy: string | null;
  shippedAt: string | null;
  receivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
// 20+ transfers across all status types
```

### 8. Vendor

```typescript
export interface Vendor {
  id: string;
  shopId: string;
  name: string;
  email: string | null;
  phone: string | null;
  contactPerson: string | null;
  leadTimeDays: number;
  reliabilityScore: number;   // 0.0 - 1.0
  paymentTerms: string | null;
  defaultCurrency: string;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
// 6 vendors — Apex Loom Textiles, Denim Craft Co., Heritage Leatherworks, etc.
```

### 9. PurchaseOrder

```typescript
export interface PurchaseOrder {
  id: string;
  shopId: string;
  vendorId: string;
  locationId: string;
  poNumber: string;           // "PO-0001" format
  status: POStatus;
  expectedDate: string | null;
  receivedDate: string | null;
  shippingCost: number | null;
  customsDuties: number | null;
  otherCosts: number | null;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
// 30+ POs — 5 Draft, 8 Sent, 6 Partially Received, 10 Received, 2 Closed
```

### 10. POLineItem

```typescript
export interface POLineItem {
  id: string;
  poId: string;
  inventoryItemId: string;
  quantity: number;
  receivedQty: number;
  unitCost: number;
  landedCost: number | null;
  notes: string | null;
}
// 2-5 line items per PO
```

### 11. ReceivingEvent

```typescript
export interface ReceivingEvent {
  id: string;
  poId: string;
  lineItems: Array<{
    inventoryItemId: string;
    sku: string;
    receivedQty: number;
    condition: 'good' | 'damaged' | 'missing';
  }>;
  receivedBy: string;
  notes: string | null;
  createdAt: string;
}
// 15+ receiving events for completed/partial POs
```

### 12. ForecastResult

```typescript
export interface ForecastResult {
  id: string;
  inventoryItemId: string;
  locationId: string;
  forecastDate: string;
  horizonDays: number;
  predictedDaily: number[];   // array of daily predictions
  totalPredicted: number;
  confidence: number;         // 0.0 - 1.0
  modelUsed: string;          // "ets", "linear_regression", "moving_average"
  modelVersion: string;
  factors: Record<string, unknown> | null;
  createdAt: string;
}
// 50+ forecasts — one per active inventory item
```

### 13. ReorderAlert

```typescript
export interface ReorderAlert {
  id: string;
  shopId: string;
  inventoryItemId: string;
  locationId: string;
  currentStock: number;
  reorderPoint: number;
  recommendedQty: number;
  urgency: AlertUrgency;
  status: AlertStatus;
  poId: string | null;
  notes: string | null;
  createdAt: string;
  actedAt: string | null;
}
// 15+ alerts — mix of CRITICAL, WARNING, INFO
```

### 14. ShopSetting

```typescript
export interface ShopSetting {
  id: string;
  shopId: string;
  defaultLocationId: string | null;
  lowStockThreshold: number;
  criticalStockThreshold: number;
  enableAutoReorder: boolean;
  forecastHorizonDays: number;
  emailAlerts: boolean;
  slackWebhookUrl: string | null;
  smsPhoneNumbers: string[] | null;
  currency: string;
  createdAt: string;
  updatedAt: string;
  enableAiInsights: boolean;
  enableForecastExplanations: boolean;
  safetyStockMultiplier: number;
}
// Single record for demo shop
```

### 15. AuditLog

```typescript
export interface AuditLog {
  id: string;
  shopId: string;
  userId: string | null;
  action: string;             // "create", "update", "delete", "receive", "transfer"
  entityType: string;         // "InventoryItem", "PurchaseOrder", etc.
  entityId: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}
// 100+ audit entries
```

### 16. ProcessedWebhook

```typescript
export interface ProcessedWebhook {
  id: string;
  eventId: string;
  shopId: string;
  topic: string;              // "orders/create", "inventory_levels/update"
  processedAt: string;
}
// 50+ webhook records
```

---

## Section 2: State Management Architecture (Zustand)

### Store Modules

```typescript
// stores/inventoryStore.ts
interface InventoryStore {
  items: InventoryItem[];
  movements: StockMovement[];
  locations: Location[];
  // Actions
  addItem: (item: Partial<InventoryItem>) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  adjustStock: (itemId: string, quantityChange: number, type: MovementType, notes?: string) => void;
  bulkAdjust: (adjustments: Array<{ itemId: string; quantityChange: number; type: MovementType }>) => void;
  // Selectors (computed)
  getItemsByLocation: (locationId: string) => InventoryItem[];
  getLowStockItems: () => InventoryItem[];
  getCriticalStockItems: () => InventoryItem[];
  getMovementsByItem: (itemId: string) => StockMovement[];
  getMovementsByDateRange: (start: string, end: string) => StockMovement[];
  searchItems: (query: string) => InventoryItem[];
}

// stores/purchasingStore.ts
interface PurchasingStore {
  purchaseOrders: PurchaseOrder[];
  lineItems: POLineItem[];
  receivingEvents: ReceivingEvent[];
  vendors: Vendor[];
  // Actions
  createPO: (po: Partial<PurchaseOrder>, lineItems: Partial<POLineItem>[]) => void;
  updatePO: (id: string, updates: Partial<PurchaseOrder>) => void;
  sendPO: (id: string) => void;
  receivePO: (id: string, receivedQty: Record<string, number>) => void;
  closePO: (id: string) => void;
  cancelPO: (id: string) => void;
  createVendor: (vendor: Partial<Vendor>) => void;
  // Selectors
  getPOsByStatus: (status: POStatus) => PurchaseOrder[];
  getActivePOs: () => PurchaseOrder[];
  getPOWithLineItems: (poId: string) => PurchaseOrder & { lineItems: POLineItem[] };
  getVendorsByReliability: () => Vendor[];
}

// stores/forecastStore.ts
interface ForecastStore {
  forecasts: ForecastResult[];
  alerts: ReorderAlert[];
  // Actions
  generateForecast: (itemId: string, locationId: string) => void;
  dismissAlert: (id: string) => void;
  createAlertPO: (alertId: string) => string; // returns PO ID
  // Selectors
  getForecastsByItem: (itemId: string) => ForecastResult[];
  getPendingAlerts: () => ReorderAlert[];
  getAlertsByUrgency: (urgency: AlertUrgency) => ReorderAlert[];
}

// stores/uiStore.ts
interface UIStore {
  activeLocation: string | null;
  searchQuery: string;
  selectedItems: string[];
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
  isLoading: boolean;
  // Actions
  setActiveLocation: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  toggleItemSelection: (id: string) => void;
  clearSelection: () => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  setLoading: (loading: boolean) => void;
}
```

### Persistence Strategy

- **In-memory only** — no localStorage needed for demo
- Stores initialized from seed data on app load
- All mutations are transient (refresh resets to seed data)
- Optional: Zustand `persist` middleware with `localStorage` for preserving edits during demo session

---

## Section 3: Mock API Layer Specification

### Simulated Network Behavior

```typescript
// lib/mockApi.ts
const LATENCY_MIN = 200;
const LATENCY_MAX = 800;
const ERROR_RATE = 0.05; // 5% error rate

async function simulateNetwork<T>(operation: () => T): Promise<T> {
  // Simulate latency
  await new Promise(r => setTimeout(r, LATENCY_MIN + Math.random() * (LATENCY_MAX - LATENCY_MIN)));
  
  // Simulate random errors (5% chance)
  if (Math.random() < ERROR_RATE) {
    const errors = [
      { status: 404, message: 'Resource not found' },
      { status: 500, message: 'Internal server error' },
      { status: 503, message: 'Service temporarily unavailable' },
    ];
    const err = errors[Math.floor(Math.random() * errors.length)];
    throw new MockApiError(err.status, err.message);
  }
  
  return operation();
}

export class MockApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
```

### Loading States Pattern

```typescript
// All store actions wrap operations in:
async function withLoading<T>(store: UIStore, fn: () => Promise<T>): Promise<T> {
  store.setLoading(true);
  try {
    return await fn();
  } finally {
    store.setLoading(false);
  }
}
```

### Optimistic Updates with Rollback

```typescript
// Example in inventoryStore:
adjustStock: async (itemId, quantityChange, type, notes) => {
  const prev = get().items.find(i => i.id === itemId);
  if (!prev) throw new Error('Item not found');
  
  // Optimistic update
  set(state => ({
    items: state.items.map(i => 
      i.id === itemId 
        ? { ...i, quantity: i.quantity + quantityChange, available: i.available + quantityChange }
        : i
    )
  }));
  
  try {
    await simulateNetwork(() => {
      // Record movement
      const movement = createMovement(itemId, quantityChange, type, notes);
      set(state => ({ movements: [...state.movements, movement] }));
    });
  } catch (error) {
    // Rollback
    set(state => ({
      items: state.items.map(i => i.id === itemId ? prev : i)
    }));
    throw error;
  }
}
```

---

## Section 4: Data Generation Strategy

### Seed Script: `seed-demo-data.ts`

Generates deterministic (seeded) demo data for consistent UI.

### Data Volume

| Entity | Count | Notes |
|--------|-------|-------|
| Shop | 1 | Demo store |
| Users | 3 | Owner, Manager, Staff |
| Locations | 3 | Warehouse, Storefront, Hub |
| Vendors | 6 | Diverse lead times and reliability |
| Inventory Items | 60 | 20 per location, 3 categories |
| Stock Movements | 200 | 30-day history, mixed types |
| Stock Transfers | 20 | All status types |
| Purchase Orders | 35 | 5 Draft, 8 Sent, 6 Partial, 10 Received, 6 Closed |
| PO Line Items | 100 | 2-5 per PO |
| Receiving Events | 15 | For completed POs |
| Forecast Results | 60 | One per active item |
| Reorder Alerts | 18 | Mix of CRITICAL/WARNING/INFO |
| Audit Logs | 150 | Recent activity trail |
| Processed Webhooks | 50 | Simulated webhook history |

### Category Distribution

| Category | Items | SKUs |
|----------|-------|------|
| Apparel | 25 | SWE, DEN, TEE, JKT, VES |
| Footwear | 15 | BTS, SNR, SLR |
| Accessories | 20 | BAG, WAL, BEL, HAT, SCN |

### Velocity Patterns

- **Fast movers** (10-20/day): Basic tees, socks, popular jeans
- **Medium movers** (3-10/day): Sweaters, jackets, boots
- **Slow movers** (0.5-3/day): Premium leather, formal wear
- **Dead stock** (0/day): Seasonal leftovers, discontinued items

### PO Status Progression

Generate POs in realistic lifecycle states:
1. **Draft** (5): Just created, not sent
2. **Sent** (8): Waiting for vendor confirmation
3. **Partially Received** (6): Some items received
4. **Received** (10): Fully received
5. **Closed** (6): Received and invoiced
6. **Cancelled** (2): Vendor couldn't fulfill

### Forecast Data

Each forecast includes:
- 30-day `predictedDaily` array (realistic demand curve)
- Confidence score (0.6-0.95)
- Model used: "ets", "linear_regression", "moving_average"
- Factors: `{ trend: "up"|"down"|"stable", seasonality: true/false }`

---

## Section 5: File Structure

```
demo/src/
├── data/
│   ├── demoData.ts              # Legacy interfaces (keep for backward compat)
│   ├── types.ts                 # All new interfaces (Section 1)
│   ├── seed-demo-data.ts        # Data generation function
│   └── seed/                    # Generated seed data (output)
│       ├── shop.json
│       ├── users.json
│       ├── locations.json
│       ├── vendors.json
│       ├── inventoryItems.json
│       ├── stockMovements.json
│       ├── stockTransfers.json
│       ├── purchaseOrders.json
│       ├── poLineItems.json
│       ├── receivingEvents.json
│       ├── forecastResults.json
│       ├── reorderAlerts.json
│       ├── shopSettings.json
│       ├── auditLogs.json
│       └── processedWebhooks.json
├── stores/
│   ├── inventoryStore.ts
│   ├── purchasingStore.ts
│   ├── forecastStore.ts
│   └── uiStore.ts
├── lib/
│   ├── mockApi.ts               # Network simulation
│   └── mockHelpers.ts           # UUID generation, date helpers
└── context/
    └── DemoDataContext.tsx       # Updated to use Zustand stores
```

### Naming Conventions

- Interfaces: PascalCase (`InventoryItem`, `PurchaseOrder`)
- Files: kebab-case (`inventory-store.ts`, `seed-demo-data.ts`)
- Store hooks: `use[Store]Store` (`useInventoryStore`)
- Mock data files: camelCase JSON (`inventoryItems.json`)
- IDs: `uuid()` format (crypto.randomUUID())
- Dates: ISO 8601 strings (`"2026-03-15T10:30:00Z"`)

---

## Implementation Priority

1. **Phase 1**: `types.ts` + `seed-demo-data.ts` + `seed/*.json`
2. **Phase 2**: Zustand stores (`inventoryStore`, `purchasingStore`)
3. **Phase 3**: Mock API layer (`mockApi.ts`)
4. **Phase 4**: Forecast + Alert stores
5. **Phase 5**: Wire up to routes (top 10 first)
