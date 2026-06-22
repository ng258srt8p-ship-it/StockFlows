import { describe, it, expect } from "vitest";
import {
  AdjustInventorySchema,
  CreatePurchaseOrderSchema,
  CycleCountSchema,
} from "~/lib/schemas/inventory";

describe("Zod Schemas", () => {
  describe("AdjustInventorySchema", () => {
    it("accepts valid adjustment", () => {
      const result = AdjustInventorySchema.safeParse({
        inventoryItemId: "550e8400-e29b-41d4-a716-446655440000",
        locationId: "550e8400-e29b-41d4-a716-446655440001",
        quantityChange: 10,
        reason: "CORRECTION",
      });
      expect(result.success).toBe(true);
    });

    it("rejects zero quantity change", () => {
      const result = AdjustInventorySchema.safeParse({
        inventoryItemId: "550e8400-e29b-41d4-a716-446655440000",
        locationId: "550e8400-e29b-41d4-a716-446655440001",
        quantityChange: 0,
        reason: "CORRECTION",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid UUID", () => {
      const result = AdjustInventorySchema.safeParse({
        inventoryItemId: "not-a-uuid",
        locationId: "550e8400-e29b-41d4-a716-446655440001",
        quantityChange: 5,
        reason: "CORRECTION",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid reason", () => {
      const result = AdjustInventorySchema.safeParse({
        inventoryItemId: "550e8400-e29b-41d4-a716-446655440000",
        locationId: "550e8400-e29b-41d4-a716-446655440001",
        quantityChange: 5,
        reason: "INVALID_REASON",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("CreatePurchaseOrderSchema", () => {
    it("accepts valid PO with line items", () => {
      const result = CreatePurchaseOrderSchema.safeParse({
        vendorId: "550e8400-e29b-41d4-a716-446655440000",
        locationId: "550e8400-e29b-41d4-a716-446655440001",
        poNumber: "PO-2026-001",
        lineItems: [
          {
            inventoryItemId: "550e8400-e29b-41d4-a716-446655440002",
            quantity: 100,
            unitCost: 5.99,
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    it("rejects PO with no line items", () => {
      const result = CreatePurchaseOrderSchema.safeParse({
        vendorId: "550e8400-e29b-41d4-a716-446655440000",
        locationId: "550e8400-e29b-41d4-a716-446655440001",
        poNumber: "PO-2026-001",
        lineItems: [],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("CycleCountSchema", () => {
    it("accepts valid cycle count", () => {
      const result = CycleCountSchema.safeParse({
        locationId: "550e8400-e29b-41d4-a716-446655440001",
        items: [
          {
            inventoryItemId: "550e8400-e29b-41d4-a716-446655440002",
            countedQuantity: 42,
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    it("rejects negative count", () => {
      const result = CycleCountSchema.safeParse({
        locationId: "550e8400-e29b-41d4-a716-446655440001",
        items: [
          {
            inventoryItemId: "550e8400-e29b-41d4-a716-446655440002",
            countedQuantity: -5,
          },
        ],
      });
      expect(result.success).toBe(false);
    });
  });
});
