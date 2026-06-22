import { chromium } from "playwright";

export async function generatePDF(
  htmlContent: string,
  options: {
    format?: "A4" | "Letter" | "Legal";
    landscape?: boolean;
    headerTemplate?: string;
    footerTemplate?: string;
    margin?: { top?: string; bottom?: string; left?: string; right?: string };
  } = {}
): Promise<Buffer> {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setContent(htmlContent, { waitUntil: "networkidle" });

  const pdf = await page.pdf({
    format: options.format ?? "A4",
    landscape: options.landscape ?? false,
    printBackground: true,
    margin: {
      top: options.margin?.top ?? "20mm",
      bottom: options.margin?.bottom ?? "20mm",
      left: options.margin?.left ?? "15mm",
      right: options.margin?.right ?? "15mm",
    },
    displayHeaderFooter: !!(options.headerTemplate || options.footerTemplate),
    headerTemplate: options.headerTemplate ?? "",
    footerTemplate:
      options.footerTemplate ??
      `<div style="font-size:8px;width:100%;text-align:center;">
        StockFlows — Page <span class="pageNumber"></span> of <span class="totalPages"></span>
      </div>`,
  });

  await browser.close();
  return Buffer.from(pdf);
}

export function generateInventoryReportHTML(
  items: Array<{
    sku: string;
    title: string;
    location: string;
    quantity: number;
    reorderPoint: number;
    unitCost: number | null;
  }>,
  title: string = "Inventory Report"
): string {
  const totalValue = items.reduce(
    (sum, i) => sum + i.quantity * (i.unitCost ?? 0),
    0
  );

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
    h1 { color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 8px; }
    .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { background: #f4f6f8; text-align: left; padding: 8px; border-bottom: 2px solid #ddd; font-size: 12px; }
    td { padding: 8px; border-bottom: 1px solid #eee; font-size: 12px; }
    .low-stock { background: #fff3e0; }
    .out-of-stock { background: #ffebee; }
    .summary { margin-top: 20px; padding: 12px; background: #f4f6f8; border-radius: 4px; }
    .summary strong { color: #0066cc; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">
    Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}<br>
    Total items: ${items.length} | Total value: $${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
  </div>
  <table>
    <thead>
      <tr>
        <th>SKU</th>
        <th>Product</th>
        <th>Location</th>
        <th style="text-align:right">Qty</th>
        <th style="text-align:right">Reorder Pt</th>
        <th style="text-align:right">Unit Cost</th>
        <th style="text-align:right">Total Value</th>
      </tr>
    </thead>
    <tbody>
      ${items
        .map(
          (item) => `
        <tr class="${item.quantity === 0 ? "out-of-stock" : item.quantity <= item.reorderPoint ? "low-stock" : ""}">
          <td>${escapeHtml(item.sku || "—")}</td>
          <td>${escapeHtml(item.title)}</td>
          <td>${escapeHtml(item.location)}</td>
          <td style="text-align:right"><strong>${item.quantity}</strong></td>
          <td style="text-align:right">${item.reorderPoint}</td>
          <td style="text-align:right">${item.unitCost != null ? `$${item.unitCost.toFixed(2)}` : "—"}</td>
          <td style="text-align:right">${item.unitCost != null ? `$${(item.quantity * item.unitCost).toFixed(2)}` : "—"}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
