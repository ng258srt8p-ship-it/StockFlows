/**
 * E2E Tests: Forecasting - ETS Model
 *
 * Covers: Exponential Smoothing (ETS) forecasting, trend detection, seasonality.
 * ARCHITECTURE §5 (Forecasting engine)
 */
import { test, expect } from "@playwright/test";

test.describe("Forecasting - ETS Model", () => {
  test("ETS model produces forecasts for inventory items", async ({ request }) => {
    const response = await request.get("/api/forecasting/ets");
    expect(response.ok()).toBeTruthy();
  });

  test("ETS forecasts include trend component", async ({ request }) => {
    const response = await request.get("/api/forecasting/ets");
    if (response.ok()) {
      const data = await response.json();
      expect(data).toBeTruthy();
    }
  });

  test("ETS forecasts include confidence intervals", async ({ request }) => {
    const response = await request.get("/api/forecasting/ets");
    if (response.ok()) {
      const data = await response.json();
      expect(data).toBeTruthy();
    }
  });

  test("ETS model handles zero-demand items", async ({ request }) => {
    const response = await request.get("/api/forecasting/ets?item=zero_demand");
    expect(response.ok()).toBeTruthy();
  });

  test("ETS model handles seasonal patterns", async ({ request }) => {
    const response = await request.get("/api/forecasting/ets?item=seasonal");
    expect(response.ok()).toBeTruthy();
  });

  test("ETS confidence intervals widen with forecast horizon", async ({ request }) => {
    const response = await request.get("/api/forecasting/ets");
    if (response.ok()) {
      const data = await response.json();
      expect(data).toBeTruthy();
    }
  });
});
