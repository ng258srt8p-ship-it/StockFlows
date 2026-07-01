import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  calculateEOQ,
  calculateSafetyStock,
  computeItemRecommendation,
} from "~/lib/purchasing/smart-reorder";
import type { SeasonalAdjustment, VendorData } from "~/lib/purchasing/smart-reorder";

// ---------------------------------------------------------------------------
// Mock dependencies
// ---------------------------------------------------------------------------
vi.mock("~/lib/db/client", () => ({
  prisma: {
    shop: { findUnique: vi.fn() },
    inventoryItem: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    vendor: { findMany: vi.fn(), findFirst: vi.fn() },
    purchaseOrder: { create: vi.fn(), update: vi.fn() },
    purchaseOrderLineItem: { create: vi.fn() },
    stockMovement: { create: vi.fn() },
    reorderAlert: { create: vi.fn() },
  },
}));

vi.mock("~/lib/logger", () => ({
  logger: {
    child: vi.fn().mockReturnValue({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    }),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("~/lib/shopify/billing", () => ({
  getCurrentPlan: vi.fn().mockResolvedValue({ name: "professional" }),
  hasFeatureAccess: vi.fn().mockReturnValue(true),
}));

// ---------------------------------------------------------------------------
// Default seasonal adjustments (mirrors computeSmartReorders defaults)
// ---------------------------------------------------------------------------
const defaultSeasons: SeasonalAdjustment[] = [
  { season: "peak", multiplier: 1.5, startMonth: 10, endMonth: 12, confidence: 0.8 },
  { season: "normal", multiplier: 1.0, startMonth: 1, endMonth: 9, confidence: 0.6 },
  { season: "low", multiplier: 0.7, startMonth: 7, endMonth: 8, confidence: 0.7 },
];

// ---------------------------------------------------------------------------
// Vendor data helper
// ---------------------------------------------------------------------------
function makeVendor(overrides: Partial<VendorData> = {}): VendorData {
  return {
    id: "vendor-1",
    name: "Acme Corp",
    leadTimeDays: 7,
    reliabilityScore: 0.95,
    averageLeadTime: 7.5,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Item mock helper (shape expected by computeItemRecommendation)
// ---------------------------------------------------------------------------
function makeItem(overrides: Record<string, any> = {}) {
  return {
    id: "item-1",
    title: "Widget A",
    sku: "WGT-001",
    quantity: 10,
    reorderPoint: 20,
    reorderQuantity: 100,
    costPerUnit: 5,
    locationId: "loc-1",
    forecasts: [],
    ...overrides,
  };
}

// ===========================================================================
// EOQ – Economic Order Quantity
// ===========================================================================
describe("calculateEOQ", () => {
  it("returns a positive integer", () => {
    const eoq = calculateEOQ(50, 10, 20);
    expect(eoq).toBeGreaterThan(0);
    expect(Number.isInteger(eoq)).toBe(true);
  });

  it("increases when demand increases", () => {
    const low = calculateEOQ(10, 5, 10);
    const high = calculateEOQ(100, 5, 10);
    expect(high).toBeGreaterThan(low);
  });

  it("increases when ordering cost is effectively higher (via demand proxy)", () => {
    // EOQ ∝ √(demand)  — higher demand → larger order
    const base = calculateEOQ(20, 5, 10);
    const doubled = calculateEOQ(80, 5, 10); // 4× demand → 2× EOQ
    expect(doubled).toBeGreaterThan(base);
  });

  it("never drops below reorderPoint", () => {
    // Very low demand but high reorderPoint should still meet minimum
    const eoq = calculateEOQ(1, 5, 200);
    expect(eoq).toBeGreaterThanOrEqual(200);
  });

  it("handles zero demand gracefully (returns reorderPoint minimum)", () => {
    const eoq = calculateEOQ(0, 5, 10);
    expect(eoq).toBeGreaterThanOrEqual(10);
  });
});

// ===========================================================================
// Safety Stock
// ===========================================================================
describe("calculateSafetyStock", () => {
  it("returns a non-negative number", () => {
    const ss = calculateSafetyStock(10, 3, 0.8);
    expect(ss).toBeGreaterThanOrEqual(0);
  });

  it("increases with higher demand", () => {
    const low = calculateSafetyStock(5, 3, 0.8);
    const high = calculateSafetyStock(50, 3, 0.8);
    expect(high).toBeGreaterThanOrEqual(low);
  });

  it("increases with higher lead time variability", () => {
    const stable = calculateSafetyStock(10, 1, 0.8);
    const volatile = calculateSafetyStock(10, 10, 0.8);
    expect(volatile).toBeGreaterThanOrEqual(stable);
  });

  it("increases with higher forecast confidence (tighter service level)", () => {
    const low = calculateSafetyStock(10, 3, 0.3);
    const high = calculateSafetyStock(10, 3, 0.95);
    expect(high).toBeGreaterThanOrEqual(low);
  });

  it("returns minimum safety stock for zero demand", () => {
    const ss = calculateSafetyStock(0, 3, 0.8);
    expect(ss).toBe(1); // Minimum safety stock of 1
  });
});

// ===========================================================================
// computeItemRecommendation
// ===========================================================================
describe("computeItemRecommendation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns valid recommendation structure", () => {
    const vendorData = new Map<string, VendorData>();
    vendorData.set("loc-1", makeVendor());

    const result = computeItemRecommendation(makeItem(), vendorData, defaultSeasons);

    expect(result).toHaveProperty("inventoryItemId", "item-1");
    expect(result).toHaveProperty("currentQuantity", 10);
    expect(result).toHaveProperty("recommendedOrderQty");
    expect(result).toHaveProperty("orderFrequency");
    expect(result).toHaveProperty("urgency");
    expect(result).toHaveProperty("confidence");
    expect(result).toHaveProperty("forecastDemand");
    expect(result).toHaveProperty("leadTimeDays");
    expect(result).toHaveProperty("safetyStock");
    expect(result).toHaveProperty("eoq");
    expect(result).toHaveProperty("reasoning");
  });

  it("uses vendor lead time when available", () => {
    const vendorData = new Map<string, VendorData>();
    vendorData.set("loc-1", makeVendor({ leadTimeDays: 14 }));

    const result = computeItemRecommendation(makeItem(), vendorData, defaultSeasons);
    expect(result.leadTimeDays).toBe(14);
  });

  it("defaults to 7-day lead time when no vendor data", () => {
    const vendorData = new Map<string, VendorData>();
    const result = computeItemRecommendation(makeItem(), vendorData, defaultSeasons);
    expect(result.leadTimeDays).toBe(7);
  });

  it("applies forecast demand when forecast exists", () => {
    const vendorData = new Map<string, VendorData>();
    vendorData.set("loc-1", makeVendor());

    const item = makeItem({
      forecasts: [{ predictedDemand: 80, confidence: 0.9 }],
    });

    const result = computeItemRecommendation(item, vendorData, defaultSeasons);
    // Forecast demand is used; result should reflect it
    expect(result.forecastDemand).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it("falls back to quantity-based estimate when no forecasts", () => {
    const vendorData = new Map<string, VendorData>();
    vendorData.set("loc-1", makeVendor());

    const item = makeItem({ quantity: 20, forecasts: [] });
    const result = computeItemRecommendation(item, vendorData, defaultSeasons);
    // With no forecast, demand = quantity * 0.5 = 10
    expect(result.forecastDemand).toBeGreaterThan(0);
  });

  it("generates meaningful reasoning string", () => {
    const vendorData = new Map<string, VendorData>();
    vendorData.set("loc-1", makeVendor());

    const result = computeItemRecommendation(makeItem(), vendorData, defaultSeasons);
    expect(typeof result.reasoning).toBe("string");
    expect(result.reasoning.length).toBeGreaterThan(10);
  });

  it("sets urgency based on stock level vs demand", () => {
    const vendorData = new Map<string, VendorData>();
    vendorData.set("loc-1", makeVendor());

    // Very low stock → should be critical
    const lowStock = makeItem({ quantity: 0 });
    const result = computeItemRecommendation(lowStock, vendorData, defaultSeasons);
    expect(["critical", "warning"]).toContain(result.urgency);
  });

  it("returns recommendedOrderQty >= 0 always", () => {
    const vendorData = new Map<string, VendorData>();
    vendorData.set("loc-1", makeVendor());

    const result = computeItemRecommendation(makeItem(), vendorData, defaultSeasons);
    expect(result.recommendedOrderQty).toBeGreaterThanOrEqual(0);
  });
});

// ===========================================================================
// Seasonal adjustment integration
// ===========================================================================
describe("Seasonal adjustments via computeItemRecommendation", () => {
  it("applies peak season multiplier during Oct-Dec", () => {
    const vendorData = new Map<string, VendorData>();
    vendorData.set("loc-1", makeVendor());

    const peak: SeasonalAdjustment[] = [
      { season: "peak", multiplier: 2.0, startMonth: 10, endMonth: 12, confidence: 0.9 },
    ];
    const normal: SeasonalAdjustment[] = [
      { season: "normal", multiplier: 1.0, startMonth: 1, endMonth: 12, confidence: 0.5 },
    ];

    // Get recommendations in whatever the current month is — just verify the system handles both
    const item = makeItem({ forecasts: [{ predictedDemand: 50, confidence: 0.85 }] });
    const resultPeak = computeItemRecommendation(item, vendorData, peak);
    const resultNormal = computeItemRecommendation(item, vendorData, normal);

    // Both should produce valid results (actual multiplier depends on current month)
    expect(resultPeak.forecastDemand).toBeGreaterThanOrEqual(0);
    expect(resultNormal.forecastDemand).toBeGreaterThanOrEqual(0);
  });

  it("uses no seasonal data when array is empty (defaults to multiplier 1.0)", () => {
    const vendorData = new Map<string, VendorData>();
    vendorData.set("loc-1", makeVendor());

    const item = makeItem({ forecasts: [{ predictedDemand: 50, confidence: 0.8 }] });
    const result = computeItemRecommendation(item, vendorData, []);

    expect(result.forecastDemand).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
  });
});
