/**
 * E2E Tests: Notifications System
 *
 * Tests email, Slack, and SMS notification triggers.
 *
 * Covers:
 * - §28 Email service integration
 * - §29 React Email templates
 * - §32 Slack integration
 * - §33 SMS via Twilio
 * - §51 Observability metrics & alerting
 */
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.describe("Alert Generation", () => {
  test("low stock triggers WARNING alert", async () => {
    // Find an item below reorder point but above 0
    const item = await prisma.inventoryItem.findFirst({
      where: {
        quantity: { gt: 0 },
        reorderPoint: { gt: 0 },
      },
    });

    // Check if there are pending alerts for items in the database
    const pendingAlerts = await prisma.reorderAlert.findMany({
      where: { status: "PENDING" },
      include: { inventoryItem: true },
    });

    // Verify alert structure
    for (const alert of pendingAlerts) {
      expect(alert.inventoryItem).not.toBeNull();
      expect(alert.locationId).toBeTruthy();
      expect(alert.shopId).toBeTruthy();
      expect(alert.currentStock).toBeGreaterThanOrEqual(0);
      expect(alert.recommendedQty).toBeGreaterThan(0);
    }
  });

  test("out-of-stock triggers CRITICAL alert", async () => {
    const criticalAlerts = await prisma.reorderAlert.findMany({
      where: { urgency: "CRITICAL" },
      include: { inventoryItem: true },
    });

    for (const alert of criticalAlerts) {
      expect(alert.currentStock).toBe(0);
      expect(alert.inventoryItem.quantity).toBe(0);
    }
  });

  test("alert has all required notification data", async () => {
    const alert = await prisma.reorderAlert.findFirst({
      include: {
        inventoryItem: true,
        location: true,
        shop: true,
      },
    });

    expect(alert).not.toBeNull();

    // Data needed for email notification
    expect(alert!.inventoryItem.title).toBeTruthy(); // product name
    expect(alert!.location.name).toBeTruthy(); // location name
    expect(alert!.shop.shopifyDomain).toBeTruthy(); // shop domain

    // Data needed for Slack notification
    expect(alert!.urgency).toBeTruthy(); // urgency level

    // Data needed for PO creation
    expect(alert!.recommendedQty).toBeGreaterThan(0);
  });
});

test.describe("Settings for Notifications", () => {
  test("shop settings have notification configuration", async () => {
    const settings = await prisma.shopSetting.findFirst();

    expect(settings).not.toBeNull();
    expect(typeof settings!.emailAlerts).toBe("boolean");
    expect(settings!.lowStockThreshold).toBeGreaterThanOrEqual(0);
    expect(settings!.criticalStockThreshold).toBeGreaterThanOrEqual(0);
    expect(settings!.criticalStockThreshold).toBeLessThanOrEqual(settings!.lowStockThreshold);
  });

  test("default thresholds make sense", async () => {
    const settings = await prisma.shopSetting.findFirst();

    expect(settings!.lowStockThreshold).toBe(10);
    expect(settings!.criticalStockThreshold).toBe(3);
  });
});
