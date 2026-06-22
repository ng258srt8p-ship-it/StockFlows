import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  addSSEConnection,
  removeSSEConnection,
  broadcastSSE,
  getConnectionCount,
} from "~/lib/sse/manager.server";

function createMockController() {
  return {
    enqueue: vi.fn(),
    close: vi.fn(),
  } as unknown as ReadableStreamDefaultController;
}

describe("SSE Manager", () => {
  beforeEach(() => {
    // Clean up all connections between tests
    // (The module-level Map persists, so we remove manually)
  });

  it("adds and removes connections", () => {
    const controller = createMockController();
    const client = addSSEConnection("test-shop.myshopify.com", controller);

    expect(getConnectionCount("test-shop.myshopify.com")).toBe(1);

    removeSSEConnection(client);
    expect(getConnectionCount("test-shop.myshopify.com")).toBe(0);
  });

  it("broadcasts to connected clients", () => {
    const controller1 = createMockController();
    const controller2 = createMockController();

    addSSEConnection("shop-a.myshopify.com", controller1);
    addSSEConnection("shop-a.myshopify.com", controller2);

    broadcastSSE("shop-a.myshopify.com", "inventory-update", {
      itemId: "123",
      newQty: 42,
    });

    expect(controller1.enqueue).toHaveBeenCalledTimes(1);
    expect(controller2.enqueue).toHaveBeenCalledTimes(1);

    // Verify the data format
    const call = (controller1.enqueue as any).mock.calls[0][0];
    const decoded = new TextDecoder().decode(call);
    expect(decoded).toContain("event: inventory-update");
    expect(decoded).toContain('"newQty":42');
  });

  it("does not broadcast to other shops", () => {
    const controllerA = createMockController();
    const controllerB = createMockController();

    addSSEConnection("shop-a.myshopify.com", controllerA);
    addSSEConnection("shop-b.myshopify.com", controllerB);

    broadcastSSE("shop-a.myshopify.com", "inventory-update", { qty: 10 });

    expect(controllerA.enqueue).toHaveBeenCalledTimes(1);
    expect(controllerB.enqueue).not.toHaveBeenCalled();
  });

  it("returns 0 for unknown shop", () => {
    expect(getConnectionCount("unknown.myshopify.com")).toBe(0);
  });

  it("handles controller enqueue errors gracefully", () => {
    const badController = {
      enqueue: vi.fn(() => {
        throw new Error("Stream closed");
      }),
      close: vi.fn(),
    } as unknown as ReadableStreamDefaultController;

    addSSEConnection("error-shop.myshopify.com", badController);

    // Should not throw
    expect(() =>
      broadcastSSE("error-shop.myshopify.com", "test", { data: 1 })
    ).not.toThrow();
  });
});
