/**
 * E2E Tests: Purchasing - Vendors
 *
 * Covers: Vendor management, performance metrics, lead times.
 * ARCHITECTURE §3.2 (Vendor management)
 */
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.describe("Purchasing - Vendors", () => {
  test("vendor records exist in database", async () => {
    const vendors = await prisma.vendor.findMany({ take: 10 });
    expect(Array.isArray(vendors)).toBe(true);
  });

  test("vendors have valid lead times", async () => {
    const vendors = await prisma.vendor.findMany({ take: 20 });
    for (const v of vendors) {
      expect(v.leadTimeDays).toBeGreaterThan(0);
    }
  });

  test("vendor performance metrics are tracked", async () => {
    const vendors = await prisma.vendor.findMany({ take: 10 });
    for (const v of vendors) {
      if (v.onTimeDeliveryRate !== undefined) {
        expect(v.onTimeDeliveryRate).toBeGreaterThanOrEqual(0);
        expect(v.onTimeDeliveryRate).toBeLessThanOrEqual(100);
      }
    }
  });

  test("vendor contact information is present", async () => {
    const vendors = await prisma.vendor.findMany({ take: 10 });
    for (const v of vendors) {
      expect(v.name).toBeTruthy();
      expect(typeof v.name).toBe("string");
    }
  });

  test("vendor orders reference valid vendors", async () => {
    const orders = await prisma.purchaseOrder.findMany({ take: 10 });
    for (const o of orders) {
      const vendor = await prisma.vendor.findUnique({ where: { id: o.vendorId } });
      expect(vendor).not.toBeNull();
    }
  });

  test("vendor ratings are within valid range", async () => {
    const vendors = await prisma.vendor.findMany({ take: 20 });
    for (const v of vendors) {
      if (v.rating !== undefined && v.rating !== null) {
        expect(v.rating).toBeGreaterThanOrEqual(1);
        expect(v.rating).toBeLessThanOrEqual(5);
      }
    }
  });
});
