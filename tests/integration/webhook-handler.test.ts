import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock all external dependencies
vi.mock("~/lib/shopify/server", () => ({
  authenticate: {
    admin: vi.fn(),
    webhook: vi.fn(),
  },
}));

vi.mock("~/lib/db/client", () => ({
  prisma: {
    shop: { findUnique: vi.fn(), delete: vi.fn() },
    inventoryItem: { findFirst: vi.fn(), update: vi.fn() },
    stockMovement: { create: vi.fn(), findMany: vi.fn(), count: vi.fn() },
    reorderAlert: { create: vi.fn() },
    processedWebhook: { findUnique: vi.fn(), create: vi.fn() },
    auditLog: { create: vi.fn() },
  },
}));

vi.mock("~/lib/jobs/queue.server", () => ({
  inventorySyncQueue: { add: vi.fn().mockResolvedValue({}) },
}));

vi.mock("~/lib/sse/manager.server", () => ({
  broadcastSSE: vi.fn(),
  addSSEConnection: vi.fn(),
  removeSSEConnection: vi.fn(),
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

describe("Webhook Handlers (Integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("inventory_levels/update webhook", () => {
    it("queues inventory update to BullMQ", async () => {
      const { authenticate } = await import("~/lib/shopify/server");
      const { inventorySyncQueue } = await import("~/lib/jobs/queue.server");

      (authenticate.webhook as any).mockResolvedValue({
        shop: "test-store.myshopify.com",
        payload: {
          inventory_item_id: 12345,
          location_id: 67890,
          available: 42,
        },
      });

      const { action } = await import(
        "~/routes/webhooks.inventory_levels.update"
      );

      const request = new Request("https://example.com/webhooks", {
        method: "POST",
      });

      const response = await action({
        request,
        params: {},
        context: {},
      } as any);

      expect(response.status).toBe(200);
      expect(inventorySyncQueue.add).toHaveBeenCalledWith(
        "webhook-inventory-update",
        expect.objectContaining({
          shopDomain: "test-store.myshopify.com",
          changes: expect.arrayContaining([
            expect.objectContaining({
              inventoryItemId: "12345",
              available: 42,
            }),
          ]),
        }),
        expect.objectContaining({ jobId: expect.any(String) })
      );
    });
  });

  describe("app/uninstalled webhook", () => {
    it("deletes shop data on uninstall", async () => {
      const { authenticate } = await import("~/lib/shopify/server");
      const { prisma } = await import("~/lib/db/client");

      (authenticate.webhook as any).mockResolvedValue({
        shop: "test-store.myshopify.com",
      });

      const { action } = await import(
        "~/routes/webhooks.app_uninstalled"
      );

      const request = new Request("https://example.com/webhooks", {
        method: "POST",
      });

      const response = await action({
        request,
        params: {},
        context: {},
      } as any);

      expect(response.status).toBe(200);
      expect(prisma.shop.delete).toHaveBeenCalledWith({
        where: { shopifyDomain: "test-store.myshopify.com" },
      });
    });
  });

  describe("privacy webhooks", () => {
    it("handles shop/redact by deleting all data", async () => {
      const { authenticate } = await import("~/lib/shopify/server");
      const { prisma } = await import("~/lib/db/client");

      (authenticate.webhook as any).mockResolvedValue({
        shop: "test-store.myshopify.com",
        topic: "shop/redact",
        payload: {},
      });

      const { action } = await import("~/routes/webhooks.privacy");

      const request = new Request("https://example.com/webhooks", {
        method: "POST",
      });

      const response = await action({
        request,
        params: {},
        context: {},
      } as any);

      expect(response.status).toBe(200);
      expect(prisma.shop.delete).toHaveBeenCalled();
    });
  });
});
