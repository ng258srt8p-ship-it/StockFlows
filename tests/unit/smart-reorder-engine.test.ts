import { describe, it, expect, vi, beforeEach } from "vitest";
import { computeSmartReorders, computeItemRecommendation, calculateEOQ, calculateSafetyStock, determineUrgency, determineOrderFrequency, generateReasoning, getVendorPerformanceData, calculateVendorReliability } from "~/lib/purchasing/smart-reorder";
import type { SeasonalAdjustment, VendorData } from "~/lib/purchasing/smart-reorder";
import { prisma } from "~/lib/db/client";

// Mock Prisma and dependencies
vi.mock("~/lib/db/client", () => ({
  prisma: {
    inventoryItem: {
      findMany: vi.fn(),
    },
    vendor: {
      findMany: vi.fn(),
    },
    purchaseOrder: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("~/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("~/lib/shopify/billing", () => ({
  getCurrentPlan: vi.fn(() => Promise.resolve({ name: "premium" })),
  hasFeatureAccess: vi.fn(() => true),
}));

const mockPrisma = vi.mocked(prisma);

describe("Smart Reorder Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("EOQ Calculation", () => {
    it("calculates EOQ correctly for given parameters", () => {
      const monthlyDemand = 100;
      const unitCost = 50;
      const reorderPoint = 20;
      
      const result = calculateEOQ(monthlyDemand, unitCost, reorderPoint);
      
      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe("number");
      expect(Number.isInteger(result)).toBe(true);
      // EOQ formula: sqrt((2 * annualDemand * orderingCost) / holdingCost)
      // annualDemand = 100 * 12 = 1200
      // orderingCost = 25
      // holdingCost = 50 * 0.2 = 10
      // eoq = sqrt((2 * 1200 * 25) / 10) = sqrt(6000) ≈ 77.46, then * 1.1 = 85.2 → 86 (ceil)
      expect(result).toBeGreaterThanOrEqual(80);
    });

    it("EOQ respects minimum reorder point", () => {
      const monthlyDemand = 10;
      const unitCost = 100;
      const reorderPoint = 50;
      
      const result = calculateEOQ(monthlyDemand, unitCost, reorderPoint);
      
      expect(result).toBeGreaterThanOrEqual(reorderPoint);
    });

    it("EOQ is lower for high holding costs", () => {
      const monthlyDemand = 100;
      const unitCost = 10; // Low unit cost = low holding cost
      const reorderPoint = 20;
      
      const lowHoldingCostEOQ = calculateEOQ(monthlyDemand, unitCost, reorderPoint);
      
      const unitCostHigh = 1000; // High unit cost = high holding cost
      const highHoldingCostEOQ = calculateEOQ(monthlyDemand, unitCostHigh, reorderPoint);
      
      expect(highHoldingCostEOQ).toBeLessThan(lowHoldingCostEOQ);
    });
  });

  describe("Safety Stock Calculation", () => {
    it("calculates safety stock correctly", () => {
      const averageDemand = 100;
      const leadTimeVariability = 5;
      const forecastConfidence = 0.8;
      
      const result = calculateSafetyStock(averageDemand, leadTimeVariability, forecastConfidence);
      
      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe("number");
      expect(Number.isInteger(result)).toBe(true);
    });

    it("higher confidence = higher safety stock", () => {
      const dailySales = [10, 12, 8, 15, 11, 9, 13, 10, 12, 14];
      const leadTimeVariability = 7;
      
      const lowConfidence = calculateSafetyStock(100, leadTimeVariability, 0.5);
      const highConfidence = calculateSafetyStock(100, leadTimeVariability, 0.95);
      
      expect(highConfidence).toBeGreaterThan(lowConfidence);
    });

    it("safety stock considers demand variability", () => {
      const averageDemand = 100;
      const leadTimeVariability = 0; // No variability
      const forecastConfidence = 0.8;
      
      const result = calculateSafetyStock(averageDemand, leadTimeVariability, forecastConfidence);
      
      // With zero variability, safety stock should still be > 0 due to confidence factor
      expect(result).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Urgency Determination", () => {
    it("returns 'critical' when quantity <= 0", () => {
      const item = {
        id: "item1",
        quantity: 0,
        reorderPoint: 10,
      };
      
      const result = determineUrgency(item, 0, 0.8);
      
      expect(result).toBe("critical");
    });

    it("returns 'critical' when below reorder point with high confidence", () => {
      const item = {
        id: "item2",
        quantity: 5,
        reorderPoint: 10,
      };
      
      const result = determineUrgency(item, 10, 0.9); // High confidence
      
      expect(result).toBe("critical");
    });

    it("returns 'warning' when below reorder point with medium confidence", () => {
      const item = {
        id: "item3",
        quantity: 8,
        reorderPoint: 10,
      };
      
      const result = determineUrgency(item, 10, 0.7); // Medium confidence
      
      expect(result).toBe("warning");
    });

    it("returns 'warning' for large order quantities", () => {
      const item = {
        id: "item4",
        quantity: 50,
        reorderPoint: 10,
      };
      
      const result = determineUrgency(item, 200, 0.5); // Large order
      
      expect(result).toBe("warning");
    });

    it("returns 'info' for normal conditions", () => {
      const item = {
        id: "item5",
        quantity: 50,
        reorderPoint: 10,
      };
      
      const result = determineUrgency(item, 5, 0.5); // Normal conditions
      
      expect(result).toBe("info");
    });
  });

  describe("Order Frequency Determination", () => {
    it("returns 'weekly' for high demand", () => {
      const demand = 60;
      const leadTime = 7;
      
      const result = determineOrderFrequency(demand, leadTime);
      
      expect(result).toBe("weekly");
    });

    it("returns 'bi-weekly' for medium demand", () => {
      const demand = 30;
      const leadTime = 7;
      
      const result = determineOrderFrequency(demand, leadTime);
      
      expect(result).toBe("bi-weekly");
    });

    it("returns 'monthly' for low demand", () => {
      const demand = 10;
      const leadTime = 7;
      
      const result = determineOrderFrequency(demand, leadTime);
      
      expect(result).toBe("monthly");
    });
  });

  describe("Reasoning Generation", () => {
    it("generates reasoning string with recommendation", () => {
      const result = generateReasoning(
        "Widget",
        "WIDGET-001",
        10,
        50,
        5,
        35,
        25,
        "critical",
        0.8
      );
      
      expect(result).toContain("Widget");
      expect(result).toContain("WIDGET-001");
      expect(result).toContain("URGENT");
      expect(result).toContain("Recommend ordering");
      expect(result).toContain("25");
    });

    it("generates reasoning when no order needed", () => {
      const result = generateReasoning(
        "In Stock",
        "IN-001",
        50,
        30,
        5,
        35,
        0,
        "info",
        0.6
      );
      
      expect(result).toContain("In Stock");
      expect(result).toContain("Current stock is sufficient");
    });

    it("includes confidence level in reasoning", () => {
      const result = generateReasoning(
        "Test Item",
        "TEST-001",
        10,
        40,
        4,
        35,
        15,
        "warning",
        0.9
      );
      
      expect(result).toContain("High forecast confidence");
    });
  });

  describe("Vendor Reliability Calculation", () => {
    it("returns 50 for no POs", () => {
      const vendorPOs: any[] = [];
      const averageLeadTime = 7;
      
      const result = calculateVendorReliability(vendorPOs, averageLeadTime);
      
      expect(result).toBe(50);
    });

    it("reduces score for late deliveries", () => {
      const vendorPOs = [
        {
          id: "po1",
          expectedDate: new Date('2026-01-01'),
          receivedDate: new Date('2026-01-10'), // 9 days late
          status: "RECEIVED",
        },
      ];
      const averageLeadTime = 7;
      
      const result = calculateVendorReliability(vendorPOs, averageLeadTime);
      
      expect(result).toBeLessThan(100);
    });

    it("reduces score for cancelled POs", () => {
      const vendorPOs = [
        {
          id: "po1",
          expectedDate: new Date('2026-01-01'),
          receivedDate: new Date('2026-01-05'),
          status: "CANCELLED",
        },
      ];
      const averageLeadTime = 7;
      
      const result = calculateVendorReliability(vendorPOs, averageLeadTime);
      
      expect(result).toBeLessThan(100);
    });

    it("maintains minimum reliability score", () => {
      const vendorPOs = [
        {
          id: "po1",
          expectedDate: new Date('2026-01-01'),
          receivedDate: new Date('2026-03-01'), // Very late
          status: "RECEIVED",
        },
        {
          id: "po2",
          expectedDate: new Date('2026-01-02'),
          receivedDate: new Date('2026-01-03'),
          status: "CANCELLED",
        },
      ];
      const averageLeadTime = 7;
      
      const result = calculateVendorReliability(vendorPOs, averageLeadTime);
      
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });
  });
});