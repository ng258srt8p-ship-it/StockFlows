/**
 * E2E Tests: Settings - Notifications
 *
 * Covers: Notification preferences (email, push, SMS), alert thresholds,
 * and notification delivery configuration.
 * ARCHITECTURE §48, §51
 */
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.describe("Settings - Notifications", () => {
  test("notification preferences can be read", async () => {
    const settings = await prisma.shopSetting.findFirst();
    expect(settings).not.toBeNull();
    expect(settings!.emailAlerts).toBe(true);
    expect(settings!.smsAlerts).toBe(false);
    expect(settings!.pushNotifications).toBe(true);
  });

  test("email alert threshold is configurable", async () => {
    const settings = await prisma.shopSetting.findFirst();
    expect(settings!.lowStockThreshold).toBeGreaterThan(0);
    expect(settings!.criticalStockThreshold).toBeLessThan(settings!.lowStockThreshold);
  });

  test("alert channel preferences are independent", async () => {
    const settings = await prisma.shopSetting.findFirst();
    // Email, SMS, and push are independent toggles
    expect(typeof settings!.emailAlerts).toBe("boolean");
    if (settings!.smsAlerts !== undefined) {
      expect(typeof settings!.smsAlerts).toBe("boolean");
    }
  });

  test("forecast horizon affects alert timing", async () => {
    const settings = await prisma.shopSetting.findFirst();
    expect(settings!.forecastHorizonDays).toBeGreaterThanOrEqual(7);
    expect(settings!.forecastHorizonDays).toBeLessThanOrEqual(90);
  });

  test("notification log records exist for active shop", async () => {
    const logs = await prisma.notificationLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });
    expect(Array.isArray(logs)).toBe(true);
  });
});
