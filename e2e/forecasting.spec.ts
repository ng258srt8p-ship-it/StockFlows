/**
 * E2E Tests: Forecasting Engine
 *
 * Tests the full forecasting pipeline from data ingestion to prediction.
 *
 * Covers:
 * - §2.2 Process View (forecasting pipeline)
 * - §3 Forecasting engine research
 * - §20 simple-statistics for forecasting
 * - §44 PostgreSQL partitioning (stock_movements for forecast data)
 */
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { runForecast, calculateSafetyStock } from "../app/lib/forecasting/engine";

const prisma = new PrismaClient();

test.describe("Forecasting Engine — Integration", () => {
  test("can generate forecast from real database data", async () => {
    const item = await prisma.inventoryItem.findFirst({
      where: { sku: "WDG-001" },
    });
    expect(item).not.toBeNull();

    // Get 30 days of sales history from the database
    const movements = await prisma.stockMovement.findMany({
      where: {
        inventoryItemId: item!.id,
        type: "SALE",
      },
      orderBy: { createdAt: "asc" },
    });

    // Aggregate daily sales
    const dailyMap = new Map<string, number>();
    for (const m of movements) {
      const dateStr = m.createdAt.toISOString().split("T")[0];
      const current = dailyMap.get(dateStr) || 0;
      dailyMap.set(dateStr, current + Math.abs(m.quantityChange));
    }

    const dailySales = Array.from(dailyMap.entries())
      .map(([date, qty]) => ({ date, qty }))
      .sort((a, b) => a.date.localeCompare(b.date));

    expect(dailySales.length).toBeGreaterThan(7);

    // Run forecast
    const forecast = runForecast(dailySales, 30);

    expect(forecast.predictions).toHaveLength(30);
    expect(forecast.confidence).toBeGreaterThan(0);
    expect(forecast.totalPredicted).toBeGreaterThan(0);
    expect(forecast.avgDailySales).toBeGreaterThan(0);
    expect(["up", "down", "stable"]).toContain(forecast.trendDirection);

    // Predictions should have valid date format
    for (const pred of forecast.predictions) {
      expect(pred.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(pred.yhat).toBeGreaterThanOrEqual(0);
      expect(pred.lower).toBeLessThanOrEqual(pred.yhat);
      expect(pred.upper).toBeGreaterThanOrEqual(pred.yhat);
    }
  });

  test("safety stock calculation with real vendor lead times", async () => {
    const vendor = await prisma.vendor.findFirst({
      where: { name: "Acme Supplies Co." },
    });
    expect(vendor).not.toBeNull();
    expect(vendor!.leadTimeDays).toBe(7);

    // Get sales history for a product from this vendor
    const item = await prisma.inventoryItem.findFirst({
      where: { sku: "WDG-001" },
    });

    const movements = await prisma.stockMovement.findMany({
      where: { inventoryItemId: item!.id, type: "SALE" },
      orderBy: { createdAt: "asc" },
    });

    const dailySales = movements.map((m) => Math.abs(m.quantityChange));

    // Need at least a few days of data
    if (dailySales.length >= 7) {
      const safetyStock = calculateSafetyStock(dailySales, vendor!.leadTimeDays, 7, 0.95);

      expect(safetyStock).toBeGreaterThan(0);
      expect(Number.isInteger(safetyStock)).toBe(true);

      // Higher service level should give higher safety stock
      const safetyStock99 = calculateSafetyStock(dailySales, vendor!.leadTimeDays, 7, 0.99);
      expect(safetyStock99).toBeGreaterThanOrEqual(safetyStock);
    }
  });

  test("forecast results can be stored and retrieved", async () => {
    const item = await prisma.inventoryItem.findFirst({ where: { sku: "WDG-001" } });
    expect(item).not.toBeNull();

    const forecast = runForecast(
      Array.from({ length: 30 }, (_, i) => ({
        date: `2026-06-${String(i + 1).padStart(2, "0")}`,
        qty: 10 + Math.round(Math.random() * 5),
      })),
      30
    );

    const saved = await prisma.forecastResult.create({
      data: {
        inventoryItemId: item!.id,
        locationId: item!.locationId,
        forecastDate: new Date(),
        horizonDays: 30,
        predictedDaily: forecast.predictions,
        totalPredicted: forecast.totalPredicted,
        confidence: forecast.confidence,
        modelUsed: forecast.modelUsed,
        modelVersion: "1.0",
        factors: {
          avgDailySales: forecast.avgDailySales,
          trendDirection: forecast.trendDirection,
        },
      },
    });

    expect(saved.id).toBeTruthy();

    // Retrieve and verify
    const retrieved = await prisma.forecastResult.findUnique({
      where: { id: saved.id },
    });

    expect(retrieved).not.toBeNull();
    expect(retrieved!.confidence).toBeCloseTo(forecast.confidence, 2);
    expect(retrieved!.modelUsed).toBe(forecast.modelUsed);
    expect(retrieved!.totalPredicted).toBe(forecast.totalPredicted);

    // Cleanup
    await prisma.forecastResult.delete({ where: { id: saved.id } });
  });
});
