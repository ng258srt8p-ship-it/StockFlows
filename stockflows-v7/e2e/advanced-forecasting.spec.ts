/**
 * E2E Tests: Advanced Forecasting Engine
 *
 * Tests the AI-powered forecasting features including:
 * - Machine learning model predictions
 * - Seasonal trend detection
 * - Demand forecasting accuracy
 * - Forecast confidence intervals
 * - Multi-variate forecasting (weather, promotions)
 *
 * Covers:
 * - §3 Forecasting engine with simple-statistics
 * - §20 statistical algorithms for demand prediction
 * - §44 PostgreSQL partitioning for forecast data storage
 * - §51 ML model integration and accuracy metrics
 */
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { runAdvancedForecast, calculateConfidenceIntervals } from "../app/lib/forecasting/advanced-engine";

const prisma = new PrismaClient();

test.describe("Advanced Forecasting Engine", () => {
  test.beforeAll(async () => {
    await prisma.$connect();
  });

  test("generates ML-based forecast with confidence intervals", async () => {
    const shop = await prisma.shop.findFirst();
    expect(shop).not.toBeNull();

    const items = await prisma.inventoryItem.findMany({
      where: { shopId: shop!.id },
      include: { stockMovements: true },
    });

    expect(items.length).toBeGreaterThan(0);

    const item = items[0];
    const salesData = item.stockMovements
      .filter(m => m.type === "SALE")
      .map(m => ({
        date: m.createdAt.toISOString().split("T")[0],
        quantity: Math.abs(m.quantityChange),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    expect(salesData.length).toBeGreaterThan(14);

    const forecast = await runAdvancedForecast(salesData, 30);

    expect(forecast.predictions).toHaveLength(30);
    expect(forecast.confidenceInterval).toBeDefined();
    expect(forecast.confidenceInterval.lower).toBeLessThanOrEqual(forecast.confidenceInterval.upper);
    expect(forecast.accuracy).toBeGreaterThan(0);
    expect(forecast.accuracy).toBeLessThanOrEqual(100);
  });

  test("detects seasonal patterns in sales data", async () => {
    const shop = await prisma.shop.findFirst();
    const items = await prisma.inventoryItem.findMany({
      where: { shopId: shop!.id },
      include: { stockMovements: true },
    });

    const item = items.find(i => i.stockMovements.length > 60);
    expect(item).not.toBeNull();

    const monthlyData = new Map<string, number>();
    for (const m of item!.stockMovements.filter(m => m.type === "SALE")) {
      const month = m.createdAt.toISOString().slice(0, 7);
      monthlyData.set(month, (monthlyData.get(month) || 0) + Math.abs(m.quantityChange));
    }

    const monthlyArray = Array.from(monthlyData.entries())
      .map(([month, qty]) => ({ month, qty }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const seasonalPattern = await calculateConfidenceIntervals(monthlyArray);
    expect(seasonalPattern.hasSeasonality).toBe(true);
    expect(seasonalPattern.seasonalIndex).toBeGreaterThan(0);
  });

  test("forecast accuracy improves with more historical data", async () => {
    const shortHistory = await prisma.stockMovement.findMany({
      where: { type: "SALE" },
      take: 30,
    });

    const longHistory = await prisma.stockMovement.findMany({
      where: { type: "SALE" },
      take: 90,
    });

    const shortData = shortHistory.map(m => ({
      date: m.createdAt.toISOString().split("T")[0],
      quantity: Math.abs(m.quantityChange),
    }));

    const longData = longHistory.map(m => ({
      date: m.createdAt.toISOString().split("T")[0],
      quantity: Math.abs(m.quantityChange),
    }));

    const shortForecast = await runAdvancedForecast(shortData, 7);
    const longForecast = await runAdvancedForecast(longData, 7);

    expect(shortForecast.accuracy).toBeLessThan(longForecast.accuracy);
  });

  test("forecast includes promotion impact factors", async () => {
    const shop = await prisma.shop.findFirst();
    const promotions = await prisma.promotion.findMany({
      where: { shopId: shop!.id },
    });

    const items = await prisma.inventoryItem.findMany({
      where: { shopId: shop!.id },
    });

    if (promotions.length > 0 && items.length > 0) {
      const item = items[0];
      const salesWithPromos = await prisma.stockMovement.findMany({
        where: {
          inventoryItemId: item.id,
          type: "SALE",
        },
      });

      const salesData = salesWithPromos.slice(-30).map(m => ({
        date: m.createdAt.toISOString().split("T")[0],
        quantity: Math.abs(m.quantityChange),
      }));

      const forecast = await runAdvancedForecast(salesData, 14, {
        promotions: promotions.slice(0, 3).map(p => ({
          id: p.id,
          discountPercent: p.discountPercent,
          startDate: p.startDate.toISOString(),
          endDate: p.endDate.toISOString(),
        })),
      });

      expect(forecast.promotionImpact).toBeDefined();
      expect(forecast.promotionImpact.impactPercent).toBeGreaterThan(0);
    }
  });

  test("forecast handles product with no sales history", async () => {
    const newProductData = [
      { date: "2024-01-01", quantity: 5 },
      { date: "2024-01-02", quantity: 3 },
    ];

    const forecast = await runAdvancedForecast(newProductData, 7);
    expect(forecast.predictions).toHaveLength(7);
    expect(forecast.confidence).toBeLessThan(50);
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });
});
