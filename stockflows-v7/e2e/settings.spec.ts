/**
 * E2E Tests: Settings & Configuration
 *
 * Tests shop settings, notification preferences, and configuration.
 *
 * Covers:
 * - §48 Shopify staff member sync
 * - §51 Observability metrics
 * - §8 Billing & monetization
 */
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.describe("Shop Settings", () => {
  test("settings record exists with defaults", async () => {
    const settings = await prisma.shopSetting.findFirst();

    expect(settings).not.toBeNull();
    expect(settings!.lowStockThreshold).toBe(10);
    expect(settings!.criticalStockThreshold).toBe(3);
    expect(settings!.forecastHorizonDays).toBe(30);
    expect(settings!.emailAlerts).toBe(true);
    expect(settings!.currency).toBe("USD");
  });

  test("critical threshold is always less than low threshold", async () => {
    const settings = await prisma.shopSetting.findFirst();
    expect(settings!.criticalStockThreshold).toBeLessThan(settings!.lowStockThreshold);
  });

  test("settings can be updated", async () => {
    const settings = await prisma.shopSetting.findFirst();
    expect(settings).not.toBeNull();

    const originalThreshold = settings!.lowStockThreshold;

    await prisma.shopSetting.update({
      where: { shopId: settings!.shopId },
      data: { lowStockThreshold: 25 },
    });

    const updated = await prisma.shopSetting.findUnique({
      where: { shopId: settings!.shopId },
    });
    expect(updated!.lowStockThreshold).toBe(25);

    // Restore
    await prisma.shopSetting.update({
      where: { shopId: settings!.shopId },
      data: { lowStockThreshold: originalThreshold },
    });
  });
});

test.describe("User Management", () => {
  test("users have valid roles", async () => {
    const users = await prisma.user.findMany();

    expect(users.length).toBeGreaterThan(0);

    const validRoles = ["OWNER", "MANAGER", "STAFF"];
    for (const user of users) {
      expect(validRoles).toContain(user.role);
      expect(user.email).toBeTruthy();
      expect(user.shopifyUserId).toBeTruthy();
    }
  });

  test("only one OWNER per shop", async () => {
    const owners = await prisma.user.findMany({ where: { role: "OWNER" } });

    // Group by shop
    const ownersByShop = new Map<string, number>();
    for (const owner of owners) {
      ownersByShop.set(owner.shopId, (ownersByShop.get(owner.shopId) || 0) + 1);
    }

    for (const [shopId, count] of ownersByShop) {
      expect(count).toBe(1);
    }
  });
});

test.describe("Vendor Management", () => {
  test("vendor lead times are reasonable", async () => {
    const vendors = await prisma.vendor.findMany();

    for (const vendor of vendors) {
      expect(vendor.leadTimeDays).toBeGreaterThan(0);
      expect(vendor.leadTimeDays).toBeLessThanOrEqual(365); // Max 1 year
    }
  });

  test("vendor reliability scores are normalized", async () => {
    const vendors = await prisma.vendor.findMany();

    for (const vendor of vendors) {
      expect(vendor.reliabilityScore).toBeGreaterThanOrEqual(0);
      expect(vendor.reliabilityScore).toBeLessThanOrEqual(1);
    }
  });
});
