import { describe, it, expect } from "vitest";
import { runForecast, calculateSafetyStock } from "~/lib/forecasting/engine";

describe("Forecasting Engine", () => {
  const stableSales = Array.from({ length: 30 }, (_, i) => ({
    date: `2026-01-${String(i + 1).padStart(2, "0")}`,
    qty: 10 + Math.round(Math.random() * 4), // ~10-14 units/day
  }));

  const growingSales = Array.from({ length: 60 }, (_, i) => ({
    date: `2026-${String(Math.floor(i / 30) + 1).padStart(2, "0")}-${String((i % 30) + 1).padStart(2, "0")}`,
    qty: 5 + Math.floor(i / 3), // Growing trend
  }));

  it("generates forecast with stable sales data", () => {
    const result = runForecast(stableSales, 30);

    expect(result.predictions).toHaveLength(30);
    expect(result.confidence).toBeGreaterThan(0.3);
    expect(result.modelUsed).toBe("ets");
    expect(result.avgDailySales).toBeGreaterThan(0);
    expect(result.trendDirection).toBe("stable");
  });

  it("generates forecast with growing trend", () => {
    const result = runForecast(growingSales, 30);

    expect(result.predictions).toHaveLength(30);
    expect(result.trendDirection).toBe("up");
    expect(result.totalPredicted).toBeGreaterThan(0);
  });

  it("returns empty forecast for insufficient data", () => {
    const shortData = [
      { date: "2026-01-01", qty: 10 },
      { date: "2026-01-02", qty: 12 },
    ];
    const result = runForecast(shortData, 30);

    expect(result.predictions).toHaveLength(0);
    expect(result.confidence).toBe(0);
    expect(result.modelUsed).toBe("none");
  });

  it("predictions have confidence intervals", () => {
    const result = runForecast(stableSales, 7);

    expect(result.predictions).toHaveLength(7);
    for (const pred of result.predictions) {
      expect(pred.lower).toBeLessThanOrEqual(pred.yhat);
      expect(pred.upper).toBeGreaterThanOrEqual(pred.yhat);
      expect(pred.date).toBeTruthy();
    }
  });

  it("calculates safety stock correctly", () => {
    const dailySales = [10, 12, 8, 15, 11, 9, 13, 10, 12, 14];
    const safetyStock = calculateSafetyStock(dailySales, 7, 7, 0.95);

    expect(safetyStock).toBeGreaterThan(0);
    expect(typeof safetyStock).toBe("number");
    expect(Number.isInteger(safetyStock)).toBe(true);
  });

  it("higher service level = higher safety stock", () => {
    const dailySales = [10, 12, 8, 15, 11, 9, 13, 10, 12, 14];
    const low = calculateSafetyStock(dailySales, 7, 7, 0.90);
    const high = calculateSafetyStock(dailySales, 7, 7, 0.99);

    expect(high).toBeGreaterThan(low);
  });
});
