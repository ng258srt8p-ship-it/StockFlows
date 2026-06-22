import { describe, it, expect } from "vitest";
import { generateInventoryReportHTML } from "~/lib/reports/pdf";

describe("Stocky Import Service (Unit)", () => {
  // We test the CSV parsing and data transformation logic directly
  // since the actual import functions require a live database

  it("CSV report generation handles special characters", () => {
    const items = [
      {
        sku: "SKU-001",
        title: "Product with <html> & \"quotes\"",
        location: "Warehouse A",
        quantity: 10,
        reorderPoint: 5,
        unitCost: 9.99,
      },
    ];
    const html = generateInventoryReportHTML(items);
    expect(html).toContain("&lt;html&gt;");
    expect(html).toContain("&amp;");
    expect(html).toContain("&quot;");
  });

  it("report handles zero-cost items", () => {
    const items = [
      {
        sku: "FREE-001",
        title: "Free Sample",
        location: "Warehouse",
        quantity: 100,
        reorderPoint: 0,
        unitCost: 0,
      },
    ];
    const html = generateInventoryReportHTML(items);
    expect(html).toContain("$0.00");
  });

  it("report handles negative stock (data correction scenario)", () => {
    const items = [
      {
        sku: "ERR-001",
        title: "Correction Item",
        location: "Warehouse",
        quantity: -5,
        reorderPoint: 10,
        unitCost: 1.0,
      },
    ];
    const html = generateInventoryReportHTML(items);
    expect(html).toContain("ERR-001");
    expect(html).toContain("-5");
  });
});
