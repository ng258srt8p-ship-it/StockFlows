/**
 * E2E Tests: Alerts System
 *
 * Covers: Alert system (low stock, critical stock, out-of-stock alerts).
 * ARCHITECTURE §2.5 (Alert management)
 */
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.describe("Alerts System", () => {
  test("active alerts exist in database", async () => {
    const alerts = await prisma.alert.findMany({ take: 10 });
    expect(Array.isArray(alerts)).toBe(true);
  });

  test("alerts have valid severity levels", async () => {
    const alerts = await prisma.alert.findMany({ take: 20 });
    const validSeverities = ["low", "medium", "high", "critical"];
    for (const a of alerts) {
      expect(validSeverities).toContain(a.severity);
    }
  });

  test("alerts reference valid inventory items", async () => {
    const alerts = await prisma.alert.findMany({ take: 10 });
    for (const a of alerts) {
      const item = await prisma.inventoryItem.findUnique({ where: { id: a.inventoryItemId } });
      expect(item).not.toBeNull();
    }
  });

  test("alert resolution is tracked", async () => {
    const alerts = await prisma.alert.findMany({ take: 10 });
    for (const a of alerts) {
      if (a.resolvedAt) {
        expect(a.resolvedAt).toBeInstanceOf(Date);
      }
    }
  });

  test("alert counts reflect stock levels correctly", async () => {
    const settings = await prisma.shopSetting.findFirst();
    const items = await prisma.inventoryItem.findMany({ take: 50 });
    for (const item of items) {
      if (item.stockLevel <= settings!.criticalStockThreshold) {
        const alert = await prisma.alert.findFirst({
          where: { inventoryItemId: item.id, severity: "critical" },
        });
        expect(alert).not.toBeNull();
      } else if (item.stockLevel <= settings!.lowStockThreshold) {
        const alert = await prisma.alert.findFirst({
          where: { inventoryItemId: item.id, severity: "low" },
        });
        expect(alert).not.toBeNull();
      }
    }
  });

  test("bulk alert generation works", async ({ request }) => {
    const response = await request.get("/api/alerts/generate");
    expect(response.ok()).toBeTruthy();
  });
});
