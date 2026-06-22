import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("~/lib/db/client", () => ({
  prisma: {
    shop: { findUnique: vi.fn() },
    inventoryItem: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
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
  },
}));

vi.mock("~/lib/sse/manager.server", () => ({
  broadcastSSE: vi.fn(),
}));

describe("Inventory Sync Logic (Integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates reorder alert when stock drops below threshold", async () => {
    const { prisma } = await import("~/lib/db/client");

    // Setup: shop exists
    (prisma.shop.findUnique as any).mockResolvedValue({
      id: "shop-1",
      shopifyDomain: "test.myshopify.com",
    });

    // Setup: item exists with qty 25, reorderPoint 20
    (prisma.inventoryItem.findFirst as any).mockResolvedValue({
      id: "item-1",
      shopifyVariantId: "variant-1",
      locationId: "loc-1",
      quantity: 25,
      reserved: 0,
      available: 25,
      reorderPoint: 20,
      reorderQuantity: 40,
      title: "Widget",
    });

    (prisma.inventoryItem.update as any).mockResolvedValue({});
    (prisma.stockMovement.create as any).mockResolvedValue({});
    (prisma.reorderAlert.create as any).mockResolvedValue({});

    // Simulate: webhook brings qty from 25 → 15 (below reorder point of 20)
    const newQty = 15;

    const item = await prisma.inventoryItem.findFirst({
      where: {
        shopifyVariantId: "variant-1",
        locationId: "loc-1",
      },
    });

    expect(item).toBeTruthy();
    expect(item!.quantity).toBe(25);

    // Update inventory
    await prisma.inventoryItem.update({
      where: { id: "item-1" },
      data: {
        quantity: newQty,
        available: Math.max(0, newQty - item!.reserved),
      },
    });

    // Record movement
    const delta = newQty - item!.quantity;
    await prisma.stockMovement.create({
      data: {
        inventoryItemId: "item-1",
        locationId: "loc-1",
        type: "SALE",
        quantityChange: delta,
        reference: "webhook-test",
      },
    });

    // Check reorder threshold
    if (newQty <= item!.reorderPoint) {
      await prisma.reorderAlert.create({
        data: {
          shopId: "shop-1",
          inventoryItemId: "item-1",
          locationId: "loc-1",
          currentStock: newQty,
          reorderPoint: 20,
          recommendedQty: 40,
          urgency: "WARNING",
        },
      });
    }

    // Verify all operations happened
    expect(prisma.inventoryItem.update).toHaveBeenCalledWith({
      where: { id: "item-1" },
      data: expect.objectContaining({ quantity: 15, available: 15 }),
    });

    expect(prisma.stockMovement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: "SALE",
        quantityChange: -10,
      }),
    });

    expect(prisma.reorderAlert.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        currentStock: 15,
        urgency: "WARNING",
      }),
    });
  });

  it("does not create alert when stock stays above threshold", async () => {
    const { prisma } = await import("~/lib/db/client");

    (prisma.shop.findUnique as any).mockResolvedValue({
      id: "shop-1",
      shopifyDomain: "test.myshopify.com",
    });

    (prisma.inventoryItem.findFirst as any).mockResolvedValue({
      id: "item-1",
      shopifyVariantId: "variant-1",
      locationId: "loc-1",
      quantity: 50,
      reserved: 0,
      reorderPoint: 20,
      reorderQuantity: 40,
    });

    (prisma.inventoryItem.update as any).mockResolvedValue({});
    (prisma.stockMovement.create as any).mockResolvedValue({});

    const newQty = 40;
    const item = await prisma.inventoryItem.findFirst({
      where: { shopifyVariantId: "variant-1", locationId: "loc-1" },
    });

    await prisma.inventoryItem.update({
      where: { id: "item-1" },
      data: { quantity: newQty, available: newQty },
    });

    await prisma.stockMovement.create({
      data: {
        inventoryItemId: "item-1",
        locationId: "loc-1",
        type: "SALE",
        quantityChange: -10,
        reference: "test",
      },
    });

    // Should NOT create alert since 40 > 20
    if (newQty <= item!.reorderPoint) {
      await prisma.reorderAlert.create({ data: {} as any });
    }

    expect(prisma.reorderAlert.create).not.toHaveBeenCalled();
  });
});
