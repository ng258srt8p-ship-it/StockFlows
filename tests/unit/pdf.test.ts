import { describe, it, expect } from "vitest";
import { generateInventoryReportHTML } from "~/lib/reports/pdf";

describe("PDF Report Generation", () => {
  const mockItems = [
    {
      sku: "WDG-001",
      title: "Widget A",
      location: "Main Warehouse",
      quantity: 50,
      reorderPoint: 10,
      unitCost: 5.99,
    },
    {
      sku: "WDG-002",
      title: "Widget B",
      location: "Main Warehouse",
      quantity: 0,
      reorderPoint: 20,
      unitCost: 12.5,
    },
    {
      sku: "GAD-001",
      title: "Gadget X",
      location: "Retail Store",
      quantity: 8,
      reorderPoint: 15,
      unitCost: null,
    },
  ];

  it("generates valid HTML", () => {
    const html = generateInventoryReportHTML(mockItems);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<table>");
    expect(html).toContain("WDG-001");
    expect(html).toContain("Widget A");
  });

  it("includes all items", () => {
    const html = generateInventoryReportHTML(mockItems);
    expect(html).toContain("WDG-001");
    expect(html).toContain("WDG-002");
    expect(html).toContain("GAD-001");
  });

  it("highlights out-of-stock items", () => {
    const html = generateInventoryReportHTML(mockItems);
    expect(html).toContain("out-of-stock");
  });

  it("highlights low-stock items", () => {
    const html = generateInventoryReportHTML(mockItems);
    expect(html).toContain("low-stock");
  });

  it("calculates total value correctly", () => {
    const html = generateInventoryReportHTML(mockItems);
    // Widget A: 50 * 5.99 = 299.50, Widget B: 0 * 12.50 = 0, Gadget: 8 * null = 0
    expect(html).toContain("$299.50");
  });

  it("handles empty items array", () => {
    const html = generateInventoryReportHTML([]);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Total items: 0");
  });

  it("escapes HTML in item data", () => {
    const maliciousItems = [
      {
        sku: "<script>alert('xss')</script>",
        title: 'Item & "Quotes"',
        location: "<b>Location</b>",
        quantity: 1,
        reorderPoint: 0,
        unitCost: 1,
      },
    ];
    const html = generateInventoryReportHTML(maliciousItems);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&amp;");
  });
});
