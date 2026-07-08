import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import { stringify } from "csv-stringify/sync";

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

  const rows = items.map((item) => ({
    SKU: item.sku || "",
    Product: item.title,
    Location: item.location.name,
    Quantity: item.quantity,
    "Reorder Point": item.reorderPoint,
    "Unit Cost": item.costPerUnit ? Number(item.costPerUnit).toFixed(2) : "",
    "Total Value": item.costPerUnit
      ? (item.quantity * Number(item.costPerUnit)).toFixed(2)
      : "",
    Barcode: item.barcode || "",
    "Last Counted": item.lastCountedAt
      ? new Date(item.lastCountedAt).toISOString()
      : "",
  }));

  const csv = stringify(rows, { header: true });

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="stockflows-inventory-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
};
