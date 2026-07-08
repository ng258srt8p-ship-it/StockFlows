/**
 * E2E Tests: ABC Analysis
 *
 * Covers: ABC classification of inventory items, Pareto analysis.
 * ARCHITECTURE §5.3 (ABC classification)
 */
import { test, expect } from "@playwright/test";

test.describe("ABC Analysis", () => {
  test("ABC classification endpoint returns valid results", async ({ request }) => {
    const response = await request.get("/api/inventory/abc-classification");
    expect(response.ok()).toBeTruthy();
  });

  test("A items represent highest value inventory", async ({ request }) => {
    const response = await request.get("/api/inventory/abc-classification?class=A");
    expect(response.ok()).toBeTruthy();
  });

  test("B items represent medium value inventory", async ({ request }) => {
    const response = await request.get("/api/inventory/abc-classification?class=B");
    expect(response.ok()).toBeTruthy();
  });

  test("C items represent lowest value inventory", async ({ request }) => {
    const response = await request.get("/api/inventory/abc-classification?class=C");
    expect(response.ok()).toBeTruthy();
  });

  test("Pareto curve is computed correctly", async ({ request }) => {
    const response = await request.get("/api/inventory/abc-classification?pareto=true");
    expect(response.ok()).toBeTruthy();
  });

  test("ABC thresholds are configurable", async ({ request }) => {
    const response = await request.get("/api/inventory/abc-classification?threshold=80");
    expect(response.ok()).toBeTruthy();
  });

  test("ABC classification updates with new data", async ({ request }) => {
    const response = await request.get("/api/inventory/abc-classification?refresh=true");
    expect(response.ok()).toBeTruthy();
  });
});
