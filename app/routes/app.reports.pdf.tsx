import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import { generatePDF, generateInventoryReportHTML } from "~/lib/reports/pdf";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { shopifyDomain: session.shop },
  });
  if (!shop) return new Response("No data", { status: 404 });

  const items = await prisma.inventoryItem.findMany({
    where: { shopId: shop.id },
    include: { location: true },
    orderBy: { sku: "asc" },
  });

  const reportItems = items.map((item) => ({
    sku: item.sku || "",
    title: item.title,
    location: item.location.name,
    quantity: item.quantity,
    reorderPoint: item.reorderPoint,
    unitCost: item.costPerUnit ? Number(item.costPerUnit) : null,
  }));

  const html = generateInventoryReportHTML(reportItems, "StockFlows Inventory Report");
  const pdf = await generatePDF(html, {
    format: "A4",
    footerTemplate: `
      <div style="font-size:8px;width:100%;text-align:center;color:#666;">
        StockFlows Inventory Report — ${new Date().toLocaleDateString()} —
        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
      </div>
    `,
  });

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="stockflows-inventory-${new Date().toISOString().split("T")[0]}.pdf"`,
    },
  });
};
