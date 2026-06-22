import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies before import
vi.mock("~/lib/db/client", () => ({
  prisma: {
    auditLog: { create: vi.fn().mockResolvedValue({}) },
    shop: { findUnique: vi.fn() },
    inventoryItem: { findMany: vi.fn().mockResolvedValue([]) },
  },
}));

import { logAudit } from "~/lib/db/audit";

describe("Audit Logging", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates audit log record", async () => {
    const { prisma } = await import("~/lib/db/client");

    await logAudit({
      shopId: "shop-123",
      userId: "user-456",
      action: "inventory.adjust",
      entityType: "InventoryItem",
      entityId: "item-789",
      oldValue: { quantity: 10 },
      newValue: { quantity: 15, reason: "correction" },
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        shopId: "shop-123",
        userId: "user-456",
        action: "inventory.adjust",
        entityType: "InventoryItem",
        entityId: "item-789",
      }),
    });
  });

  it("never throws — audit failures are swallowed", async () => {
    const { prisma } = await import("~/lib/db/client");
    (prisma.auditLog.create as any).mockRejectedValue(new Error("DB down"));

    // Should not throw
    await expect(
      logAudit({
        shopId: "shop-123",
        action: "test",
        entityType: "Test",
        entityId: "1",
      })
    ).resolves.toBeUndefined();
  });
});
