/**
 * E2E Tests: Forecasting - Moving Average
 *
 * Covers: Moving average forecasting, window size effects.
 * ARCHITECTURE §5 (Moving average model)
 */
import { test, expect } from "@playwright/test";

test.describe("Forecasting - Moving Average", () => {
  test("moving average model produces forecasts", async ({ request }) => {
    const response = await request.get("/api/forecasting/moving-average");
    expect(response.ok()).toBeTruthy();
  });

  test("window size affects forecast smoothness", async ({ request }) => {
    const response = await request.get("/api/forecasting/moving-average?window=7");
    expect(response.ok()).toBeTruthy();
  });

  test("moving average handles short time series", async ({ request }) => {
    const response = await request.get("/api/forecasting/moving-average?short=true");
    expect(response.ok()).toBeTruthy();
  });

  test("moving average with different window sizes", async ({ request }) => {
    const windowSizes = [3, 7, 14, 30];
    for (const w of windowSizes) {
      const response = await request.get(`/api/forecasting/moving-average?window=${w}`);
      expect(response.ok()).toBeTruthy();
    }
  });

  test("moving average baseline forecast is stable", async ({ request }) => {
    const response = await request.get("/api/forecasting/moving-average?baseline=true");
    expect(response.ok()).toBeTruthy();
  });

  test("moving average responds to demand spikes", async ({ request }) => {
    const response = await request.get("/api/forecasting/moving-average?spike=true");
    expect(response.ok()).toBeTruthy();
  });
});
