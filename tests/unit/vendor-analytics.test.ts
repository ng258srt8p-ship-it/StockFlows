import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "~/lib/db/client";
import {
  getDeliveryMetrics,
  getQualityMetrics,
  getCostMetrics,
  getVendorScorecard,
  getVendorComparison,
  getAllVendorsDeliveryMetrics,
} from "~/lib/purchasing/vendor-analytics";

vi.mock("~/lib/db/client", () => ({
  prisma: {
    vendor: { findUnique: vi.fn(), findMany: vi.fn() },
    purchaseOrder: { findMany: vi.fn(), findFirst: vi.fn() },
    receivingEvent: { findMany: vi.fn() },
  },
}));

vi.mock("~/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

const mockVendor = { id: "vendor-1", name: "Acme Corp" };

function makeReceivedPO(overrides: Record<string, any> = {}) {
  return {
    id: "po-1",
    expectedDate: new Date("2026-06-10T00:00:00Z"),
    receivedDate: new Date("2026-06-08T00:00:00Z"),
    receivingEvents: [],
    createdAt: new Date("2026-06-01T00:00:00Z"),
    lineItems: [
      {
        id: "li-1",
        quantity: 10,
        unitCost: 25,
        inventoryItemId: "item-1",
        inventoryItem: { id: "item-1", title: "Widget A", sku: "WGT-001" },
      },
    ],
    ...overrides,
  };
}

function makePOWithLineItems(overrides: Record<string, any> = {}) {
  return {
    id: "po-1",
    createdAt: new Date("2026-06-01T00:00:00Z"),
    lineItems: [
      {
        id: "li-1",
        quantity: 10,
        unitCost: 25,
        inventoryItemId: "item-1",
        inventoryItem: { id: "item-1", title: "Widget A", sku: "WGT-001" },
      },
    ],
    ...overrides,
  };
}

function makeReceivingEvent(notes: string | null, lineItemEntries: Record<string, number> = { "li-1": 10 }) {
  return {
    id: "event-1",
    createdAt: new Date("2026-06-10T00:00:00Z"),
    notes,
    purchaseOrder: {
      id: "po-1",
      lineItems: [
        { id: "li-1", inventoryItem: { id: "item-1", title: "Widget A" } },
      ],
    },
    lineItems: lineItemEntries,
  };
}

describe("Vendor Analytics Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDeliveryMetrics", () => {
    it("returns default metrics when vendor has no received POs", async () => {
      vi.mocked(prisma.vendor.findUnique).mockResolvedValueOnce(mockVendor as any);
      vi.mocked(prisma.purchaseOrder.findMany).mockResolvedValueOnce([]);

      const result = await getDeliveryMetrics("vendor-1");

      expect(result.vendorId).toBe("vendor-1");
      expect(result.vendorName).toBe("Acme Corp");
      expect(result.totalOrders).toBe(0);
      expect(result.reliabilityScore).toBe(1.0);
    });

    it("calculates on-time and late deliveries", async () => {
      vi.mocked(prisma.vendor.findUnique).mockResolvedValueOnce(mockVendor as any);
      vi.mocked(prisma.purchaseOrder.findMany).mockResolvedValueOnce([
        makeReceivedPO({ // 2 days early → on-time
          expectedDate: new Date("2026-06-10T00:00:00Z"),
          receivedDate: new Date("2026-06-08T00:00:00Z"),
        }),
        makeReceivedPO({ // 2 days late
          id: "po-2",
          expectedDate: new Date("2026-06-15T00:00:00Z"),
          receivedDate: new Date("2026-06-17T00:00:00Z"),
        }),
        makeReceivedPO({ // exactly on time
          id: "po-3",
          expectedDate: new Date("2026-06-20T00:00:00Z"),
          receivedDate: new Date("2026-06-20T00:00:00Z"),
        }),
      ] as any[]);

      const result = await getDeliveryMetrics("vendor-1", 30);

      expect(result.totalOrders).toBe(3);
      expect(result.onTimeDeliveries).toBeGreaterThanOrEqual(2);
      expect(result.onTimeRate).toBeGreaterThanOrEqual(0.66);
    });

    it("counts POs with missing dates in totalOrders but skips lead time calc", async () => {
      vi.mocked(prisma.vendor.findUnique).mockResolvedValueOnce(mockVendor as any);
      vi.mocked(prisma.purchaseOrder.findMany).mockResolvedValueOnce([
        makeReceivedPO({ receivedDate: null, expectedDate: new Date("2026-06-10T00:00:00Z") }),
        makeReceivedPO({ receivedDate: new Date("2026-06-12T00:00:00Z"), expectedDate: null }),
      ] as any[]);

      const result = await getDeliveryMetrics("vendor-1", 30);

      expect(result.totalOrders).toBe(2);
      expect(result.onTimeDeliveries).toBe(0);
      expect(result.lateDeliveries).toBe(0);
    });

    it("calculates lead time statistics", async () => {
      vi.mocked(prisma.vendor.findUnique).mockResolvedValueOnce(mockVendor as any);
      vi.mocked(prisma.purchaseOrder.findMany).mockResolvedValueOnce([
        makeReceivedPO({ // 3 days early
          expectedDate: new Date("2026-06-10T00:00:00Z"),
          receivedDate: new Date("2026-06-07T00:00:00Z"),
        }),
        makeReceivedPO({ // 1 day late
          id: "po-2",
          expectedDate: new Date("2026-06-15T00:00:00Z"),
          receivedDate: new Date("2026-06-16T00:00:00Z"),
        }),
      ] as any[]);

      const result = await getDeliveryMetrics("vendor-1", 30);

      expect(result.averageLeadTimeDays).toBeTypeOf("number");
      expect(result.medianLeadTimeDays).toBeTypeOf("number");
      expect(result.leadTimeStdDev).toBeGreaterThanOrEqual(0);
    });

    it("throws error for nonexistent vendor", async () => {
      vi.mocked(prisma.vendor.findUnique).mockResolvedValueOnce(null);

      await expect(getDeliveryMetrics("bad-id")).rejects.toThrow("Vendor bad-id not found");
    });
  });

  describe("getQualityMetrics", () => {
    it("returns perfect quality when no receiving events", async () => {
      vi.mocked(prisma.vendor.findUnique).mockResolvedValueOnce(mockVendor as any);
      vi.mocked(prisma.receivingEvent.findMany).mockResolvedValueOnce([]);

      const result = await getQualityMetrics("vendor-1");

      expect(result.qualityScore).toBe(1.0);
      expect(result.damagedRate).toBe(0);
      expect(result.qualityIssues).toHaveLength(0);
    });

    it("detects damaged units from notes (case-insensitive)", async () => {
      vi.mocked(prisma.vendor.findUnique).mockResolvedValueOnce(mockVendor as any);
      vi.mocked(prisma.receivingEvent.findMany).mockResolvedValueOnce([
        makeReceivingEvent("Package arrived DAMAGED"),
      ] as any[]);

      const result = await getQualityMetrics("vendor-1", 30);

      expect(result.damagedUnits).toBe(10);
      expect(result.qualityIssues.some((i) => i.issueType === "DAMAGE")).toBe(true);
      expect(result.qualityScore).toBe(0);
    });

    it("detects wrong item issues", async () => {
      vi.mocked(prisma.vendor.findUnique).mockResolvedValueOnce(mockVendor as any);
      vi.mocked(prisma.receivingEvent.findMany).mockResolvedValueOnce([
        makeReceivingEvent("WRONG item sent"),
      ] as any[]);

      const result = await getQualityMetrics("vendor-1", 30);
      expect(result.qualityIssues.some((i) => i.issueType === "WRONG_ITEM")).toBe(true);
    });

    it("detects shortage issues", async () => {
      vi.mocked(prisma.vendor.findUnique).mockResolvedValueOnce(mockVendor as any);
      vi.mocked(prisma.receivingEvent.findMany).mockResolvedValueOnce([
        makeReceivingEvent("SHORTAGE - 3 units missing"),
      ] as any[]);

      const result = await getQualityMetrics("vendor-1", 30);
      expect(result.qualityIssues.some((i) => i.issueType === "SHORTAGE")).toBe(true);
    });

    it("detects generic quality issues", async () => {
      vi.mocked(prisma.vendor.findUnique).mockResolvedValueOnce(mockVendor as any);
      vi.mocked(prisma.receivingEvent.findMany).mockResolvedValueOnce([
        makeReceivingEvent("QUALITY issue - paint peeling"),
      ] as any[]);

      const result = await getQualityMetrics("vendor-1", 30);
      expect(result.qualityIssues.some((i) => i.issueType === "QUALITY")).toBe(true);
    });

    it("handles null notes gracefully", async () => {
      vi.mocked(prisma.vendor.findUnique).mockResolvedValueOnce(mockVendor as any);
      vi.mocked(prisma.receivingEvent.findMany).mockResolvedValueOnce([
        makeReceivingEvent(null),
      ] as any[]);

      const result = await getQualityMetrics("vendor-1", 30);
      expect(result.qualityIssues).toHaveLength(0);
      expect(result.qualityScore).toBe(1.0);
    });

    it("handles non-matching lineItem IDs gracefully", async () => {
      vi.mocked(prisma.vendor.findUnique).mockResolvedValueOnce(mockVendor as any);
      vi.mocked(prisma.receivingEvent.findMany).mockResolvedValueOnce([
        makeReceivingEvent("DAMAGED", { "nonexistent-li": 5 }),
      ] as any[]);

      const result = await getQualityMetrics("vendor-1", 30);
      expect(result.totalReceivedUnits).toBe(0);
    });

    it("throws error for nonexistent vendor", async () => {
      vi.mocked(prisma.vendor.findUnique).mockResolvedValueOnce(null);

      await expect(getQualityMetrics("bad-id")).rejects.toThrow("Vendor bad-id not found");
    });
  });

  describe("getCostMetrics", () => {
    it("returns zero metrics when vendor has no POs", async () => {
      vi.mocked(prisma.vendor.findUnique).mockResolvedValueOnce(mockVendor as any);
      vi.mocked(prisma.purchaseOrder.findMany).mockResolvedValueOnce([]);

      const result = await getCostMetrics("vendor-1", 30);

      expect(result.totalSpend).toBe(0);
      expect(result.costTrend).toBe("stable");
      expect(result.savingsOpportunities).toHaveLength(0);
    });

    it("calculates total spend from line items", async () => {
      vi.mocked(prisma.vendor.findUnique).mockResolvedValueOnce(mockVendor as any);
      vi.mocked(prisma.purchaseOrder.findMany).mockResolvedValueOnce([
        makePOWithLineItems({
          lineItems: [
            { id: "li-1", quantity: 10, unitCost: 25, inventoryItemId: "item-1", inventoryItem: { id: "item-1", title: "Widget A" } },
            { id: "li-2", quantity: 5, unitCost: 50, inventoryItemId: "item-2", inventoryItem: { id: "item-2", title: "Widget B" } },
          ],
        }),
      ] as any[]);

      const result = await getCostMetrics("vendor-1", 30);

      expect(result.totalSpend).toBe(500);
      expect(result.averageOrderValue).toBe(500);
    });

    it("calculates average unit cost correctly", async () => {
      vi.mocked(prisma.vendor.findUnique).mockResolvedValueOnce(mockVendor as any);
      vi.mocked(prisma.purchaseOrder.findMany).mockResolvedValueOnce([
        makePOWithLineItems({
          lineItems: [
            { id: "li-1", quantity: 10, unitCost: 20, inventoryItemId: "item-1", inventoryItem: { id: "item-1", title: "A" } },
            { id: "li-2", quantity: 10, unitCost: 30, inventoryItemId: "item-2", inventoryItem: { id: "item-2", title: "B" } },
          ],
        }),
      ] as any[]);

      const result = await getCostMetrics("vendor-1", 30);
      expect(result.averageUnitCost).toBe(25);
    });

    it("detects increasing cost trend over 6+ months", async () => {
      vi.mocked(prisma.vendor.findUnique).mockResolvedValueOnce(mockVendor as any);
      vi.mocked(prisma.purchaseOrder.findMany).mockResolvedValueOnce([
        makePOWithLineItems({ id: "po-1", createdAt: new Date("2026-01-05T00:00:00Z"), lineItems: [{ id: "li-1", quantity: 10, unitCost: 10, inventoryItemId: "item-1", inventoryItem: { id: "item-1", title: "A" } }] }),
        makePOWithLineItems({ id: "po-2", createdAt: new Date("2026-02-05T00:00:00Z"), lineItems: [{ id: "li-2", quantity: 10, unitCost: 10, inventoryItemId: "item-1", inventoryItem: { id: "item-1", title: "A" } }] }),
        makePOWithLineItems({ id: "po-3", createdAt: new Date("2026-03-05T00:00:00Z"), lineItems: [{ id: "li-3", quantity: 10, unitCost: 10, inventoryItemId: "item-1", inventoryItem: { id: "item-1", title: "A" } }] }),
        makePOWithLineItems({ id: "po-4", createdAt: new Date("2026-04-05T00:00:00Z"), lineItems: [{ id: "li-4", quantity: 10, unitCost: 30, inventoryItemId: "item-1", inventoryItem: { id: "item-1", title: "A" } }] }),
        makePOWithLineItems({ id: "po-5", createdAt: new Date("2026-05-05T00:00:00Z"), lineItems: [{ id: "li-5", quantity: 10, unitCost: 30, inventoryItemId: "item-1", inventoryItem: { id: "item-1", title: "A" } }] }),
        makePOWithLineItems({ id: "po-6", createdAt: new Date("2026-06-05T00:00:00Z"), lineItems: [{ id: "li-6", quantity: 10, unitCost: 30, inventoryItemId: "item-1", inventoryItem: { id: "item-1", title: "A" } }] }),
      ] as any[]);

      const result = await getCostMetrics("vendor-1", 180);

      expect(result.costTrend).toBe("increasing");
      expect(result.costTrendPercentage).toBeGreaterThan(5);
    });

    it("identifies savings opportunities for expensive items", async () => {
      vi.mocked(prisma.vendor.findUnique).mockResolvedValueOnce(mockVendor as any);
      vi.mocked(prisma.purchaseOrder.findMany).mockResolvedValueOnce([
        makePOWithLineItems({
          lineItems: [
            { id: "li-1", quantity: 10, unitCost: 120, inventoryItemId: "item-1", inventoryItem: { id: "item-1", title: "Premium Widget" } },
          ],
        }),
      ] as any[]);

      const result = await getCostMetrics("vendor-1", 30);
      expect(result.savingsOpportunities.length).toBeGreaterThanOrEqual(1);
      expect(result.savingsOpportunities[0].itemId).toBe("item-1");
      expect(result.savingsOpportunities[0].potentialSavings).toBeGreaterThan(0);
    });

    it("throws error for nonexistent vendor", async () => {
      vi.mocked(prisma.vendor.findUnique).mockResolvedValueOnce(null);

      await expect(getCostMetrics("bad-id")).rejects.toThrow("Vendor bad-id not found");
    });
  });

  describe("getVendorScorecard", () => {
    it("generates scorecard with all required fields", async () => {
      vi.mocked(prisma.vendor.findUnique).mockResolvedValue(mockVendor as any);
      const dualPurposePOs = [
        makeReceivedPO({
          lineItems: [{ id: "li-1", quantity: 10, unitCost: 25, inventoryItemId: "item-1", inventoryItem: { id: "item-1", title: "Widget A" } }],
        }),
      ];
      vi.mocked(prisma.purchaseOrder.findMany).mockResolvedValue(dualPurposePOs as any[]);
      vi.mocked(prisma.receivingEvent.findMany).mockResolvedValue([]);
      vi.mocked(prisma.purchaseOrder.findFirst).mockResolvedValue(null as any);

      const result = await getVendorScorecard("vendor-1", 30);

      expect(result.vendorId).toBe("vendor-1");
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(result.deliveryScore).toBeGreaterThanOrEqual(0);
      expect(result.qualityScore).toBeGreaterThanOrEqual(0);
      expect(result.costScore).toBeGreaterThanOrEqual(0);
      expect(["low", "medium", "high", "critical"]).toContain(result.riskLevel);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it("assigns low risk to high-scoring vendors", async () => {
      const onTimePOs = Array.from({ length: 10 }, (_, i) =>
        makeReceivedPO({
          id: `po-${i}`,
          expectedDate: new Date(`2026-06-${String(i + 10).padStart(2, "0")}T12:00:00Z`),
          receivedDate: new Date(`2026-06-${String(i + 9).padStart(2, "0")}T12:00:00Z`),
          lineItems: [{ id: `li-${i}`, quantity: 10, unitCost: 25, inventoryItemId: `item-${i}`, inventoryItem: { id: `item-${i}`, title: `Widget ${i}` } }],
        })
      );

      vi.mocked(prisma.vendor.findUnique).mockResolvedValue(mockVendor as any);
      vi.mocked(prisma.purchaseOrder.findMany).mockResolvedValue(onTimePOs as any[]);
      vi.mocked(prisma.receivingEvent.findMany).mockResolvedValue([]);
      vi.mocked(prisma.purchaseOrder.findFirst).mockResolvedValue(null as any);

      const result = await getVendorScorecard("vendor-1", 30);

      expect(result.riskLevel).toBe("low");
      expect(result.deliveryScore).toBeGreaterThan(80);
    });

    it("generates recommendations for late vendors", async () => {
      const latePOs = Array.from({ length: 10 }, (_, i) =>
        makeReceivedPO({
          id: `po-late-${i}`,
          expectedDate: new Date(`2026-05-${String(i + 1).padStart(2, "0")}T12:00:00Z`),
          receivedDate: new Date(`2026-05-${String(i + 6).padStart(2, "0")}T12:00:00Z`),
          lineItems: [{ id: `li-${i}`, quantity: 10, unitCost: 25, inventoryItemId: `item-${i}`, inventoryItem: { id: `item-${i}`, title: `Widget ${i}` } }],
        })
      );

      vi.mocked(prisma.vendor.findUnique).mockResolvedValue(mockVendor as any);
      vi.mocked(prisma.purchaseOrder.findMany).mockResolvedValue(latePOs as any[]);
      vi.mocked(prisma.receivingEvent.findMany).mockResolvedValue([]);
      vi.mocked(prisma.purchaseOrder.findFirst).mockResolvedValue(null as any);

      const result = await getVendorScorecard("vendor-1", 30);

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations.some(r => r.includes("delivery"))).toBe(true);
    });
  });

  describe("getVendorComparison", () => {
    it("ranks vendors by score", async () => {
      vi.mocked(prisma.vendor.findMany).mockResolvedValueOnce([
        { id: "vendor-1", name: "Acme Corp" },
        { id: "vendor-2", name: "Beta Supplies" },
      ] as any[]);

      vi.mocked(prisma.vendor.findUnique).mockResolvedValue({ id: "vendor-1", name: "Acme Corp" } as any);

      vi.mocked(prisma.purchaseOrder.findMany).mockResolvedValue([]);
      vi.mocked(prisma.receivingEvent.findMany).mockResolvedValue([]);
      vi.mocked(prisma.purchaseOrder.findFirst).mockResolvedValue(null as any);

      const result = await getVendorComparison("shop-1", 30);

      expect(result.vendors).toHaveLength(2);
      expect(result.bestVendor).toBeTruthy();
      expect(result.worstVendor).toBeTruthy();
      expect(result.savingsPotential).toBeGreaterThanOrEqual(0);
      expect(result.vendors[0].score).toBeGreaterThanOrEqual(result.vendors[1].score);
    });

    it("handles shop with no vendors", async () => {
      vi.mocked(prisma.vendor.findMany).mockResolvedValueOnce([]);

      const result = await getVendorComparison("shop-1", 30);

      expect(result.vendors).toHaveLength(0);
      expect(result.bestVendor).toBe("");
      expect(result.worstVendor).toBe("");
    });
  });

  describe("getAllVendorsDeliveryMetrics", () => {
    it("returns delivery metrics for each active vendor", async () => {
      vi.mocked(prisma.vendor.findMany).mockResolvedValueOnce([
        { id: "vendor-1", name: "Acme" },
        { id: "vendor-2", name: "Beta" },
      ] as any[]);

      vi.mocked(prisma.vendor.findUnique).mockResolvedValue(mockVendor as any);
      vi.mocked(prisma.purchaseOrder.findMany).mockResolvedValue([]);

      const result = await getAllVendorsDeliveryMetrics("shop-1", 30);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("vendorId", "vendor-1");
      expect(result[1]).toHaveProperty("vendorId", "vendor-2");
    });

    it("returns empty array when no active vendors", async () => {
      vi.mocked(prisma.vendor.findMany).mockResolvedValueOnce([]);

      const result = await getAllVendorsDeliveryMetrics("shop-1", 30);
      expect(result).toHaveLength(0);
    });
  });
});
