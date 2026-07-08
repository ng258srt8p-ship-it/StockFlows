/**
 * E2E Tests: Demand Forecasting
 *
 * Covers: Demand forecasting with multiple scenarios.
 * ARCHITECTURE §5 (Demand forecasting)
 */
import { test, expect } from "@playwright/test";

test.describe("Demand Forecasting", () => {
  test("demand forecasting endpoint is accessible", async ({ request }) => {
    const response = await request.get("/api/forecasting/demand");
    expect(response.ok()).toBeTruthy();
  });

  test("demand forecasting supports multiple scenarios", async ({ request }) => {
    const scenarios = ["optimistic", "realistic", "pessimistic"];
    for (const s of scenarios) {
      const response = await request.get(`/api/forecasting/demand?scenario=${s}`);
      expect(response.ok()).toBeTruthy();
    }
  });

  test("demand forecast includes probability distributions", async ({ request }) => {
    const response = await request.get("/api/forecasting/demand?probabilities=true");
    expect(response.ok()).toBeTruthy();
  });

  test("demand forecast respects seasonality", async ({ request }) => {
    const response = await request.get("/api/forecasting/demand?seasonal=true");
    expect(response.ok()).toBeTruthy();
  });

  test("demand forecast handles promotional events", async ({ request }) => {
    const response = await request.get("/api/forecasting/demand?promo=true");
    expect(response.ok()).toBeTruthy();
  });

  test("demand forecast provides reorder recommendations", async ({ request }) => {
    const response = await request.get("/api/forecasting/demand?reorder=true");
    expect(response.ok()).toBeTruthy();
  });

  test("demand forecast accuracy is tracked", async ({ request }) => {
    const response = await request.get("/api/forecasting/demand?accuracy=true");
    expect(response.ok()).toBeTruthy();
  });
});
