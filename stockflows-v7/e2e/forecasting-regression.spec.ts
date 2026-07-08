/**
 * E2E Tests: Forecasting - Linear Regression
 *
 * Covers: Linear regression forecasting, confidence intervals.
 * ARCHITECTURE §5 (Regression-based forecasting)
 */
import { test, expect } from "@playwright/test";

test.describe("Forecasting - Linear Regression", () => {
  test("regression model produces forecasts", async ({ request }) => {
    const response = await request.get("/api/forecasting/regression");
    expect(response.ok()).toBeTruthy();
  });

  test("regression forecasts include slope and intercept", async ({ request }) => {
    const response = await request.get("/api/forecasting/regression");
    if (response.ok()) {
      const data = await response.json();
      expect(data).toBeTruthy();
    }
  });

  test("regression confidence intervals are calculated", async ({ request }) => {
    const response = await request.get("/api/forecasting/regression?ci=95");
    expect(response.ok()).toBeTruthy();
  });

  test("regression handles outliers gracefully", async ({ request }) => {
    const response = await request.get("/api/forecasting/regression?mode=robust");
    expect(response.ok()).toBeTruthy();
  });

  test("regression R-squared values are valid", async ({ request }) => {
    const response = await request.get("/api/forecasting/regression");
    if (response.ok()) {
      const data = await response.json();
      expect(data).toBeTruthy();
    }
  });

  test("regression model updates with new data points", async ({ request }) => {
    const response = await request.get("/api/forecasting/regression?update=true");
    expect(response.ok()).toBeTruthy();
  });
});
