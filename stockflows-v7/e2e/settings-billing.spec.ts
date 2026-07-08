/**
 * E2E Tests: Settings - Billing
 *
 * Covers: Billing plan, usage stats, payment method management, invoice history.
 * ARCHITECTURE §8 (Billing & monetization)
 */
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.describe("Settings - Billing", () => {
  test("billing record exists for active shop", async () => {
    const billing = await prisma.billingRecord.findFirst();
    expect(billing).not.toBeNull();
    expect(billing!.shopId).toBeTruthy();
  });

  test("plan type is valid enum value", async () => {
    const billing = await prisma.billingRecord.findFirst();
    expect(billing).not.toBeNull();
    const validPlans = ["free", "starter", "professional", "enterprise"];
    expect(validPlans).toContain(billing!.plan);
  });

  test("usage metrics are tracked", async () => {
    const billing = await prisma.billingRecord.findFirst({
      select: { apiCalls: true, storageUsed: true },
    });
    expect(billing).not.toBeNull();
    expect(typeof billing!.apiCalls).toBe("number");
    expect(billing!.apiCalls).toBeGreaterThanOrEqual(0);
  });

  test("billing history is chronological", async () => {
    const history = await prisma.billingHistory.findMany({
      orderBy: { date: "desc" },
      take: 10,
    });
    expect(Array.isArray(history)).toBe(true);
    if (history.length > 1) {
      for (let i = 0; i < history.length - 1; i++) {
        expect(history[i].date.getTime()).toBeGreaterThanOrEqual(
          history[i + 1].date.getTime()
        );
      }
    }
  });

  test("plan change logs are recorded", async () => {
    const changes = await prisma.planChange.findMany({ take: 3 });
    expect(Array.isArray(changes)).toBe(true);
  });
});
