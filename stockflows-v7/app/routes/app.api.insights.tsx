import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import { generateInsights } from "~/lib/ai/service";
import type { InventoryContext } from "~/lib/ai/types";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { shopifyDomain: session.shop },
    include: {
      locations: true,
      alerts: {
        where: { status: "PENDING" },
        include: { inventoryItem: true, location: true },
        take: 20,
      },
    },
  });

  if (!shop) {
    return Response.json({ insights: [], error: "Shop not found" });
  }

  const items = await prisma.inventoryItem.findMany({
    where: { shopId: shop.id },
    include: { location: true },
  });

  const forecasts = await prisma.forecastResult.findMany({
    where: { inventoryItem: { shopId: shop.id } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const lowStockCount = items.filter((i) => i.quantity <= i.reorderPoint).length;
  const outOfStockCount = items.filter((i) => i.quantity === 0).length;
  const totalValue = items.reduce((sum, i) => sum + i.quantity * Number(i.costPerUnit || 0), 0);

  const avgConfidence =
    forecasts.length > 0
      ? forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length
      : 0;

  const context: InventoryContext = {
    shopDomain: session.shop,
    totalProducts: items.length,
    totalLocations: shop.locations.length,
    totalValue,
    lowStockCount,
    outOfStockCount,
    alerts: shop.alerts.map((a) => ({
      productName: a.inventoryItem.title,
      location: a.location.name,
      currentStock: a.currentStock,
      reorderPoint: a.reorderPoint,
      urgency: a.urgency,
      recommendedQty: a.recommendedQty,
    })),
    topProducts: items
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)
      .map((i) => ({
        name: i.title,
        sku: i.sku || "",
        quantity: i.quantity,
        reorderPoint: i.reorderPoint,
        location: i.location.name,
      })),
    forecastSummary: {
      avgConfidence,
      productsWithForecast: new Set(forecasts.map((f) => f.inventoryItemId)).size,
      avgDailyDemand:
        forecasts.length > 0
          ? forecasts.reduce((sum, f) => sum + ((f.factors as any)?.avgDailySales || 0), 0) /
            forecasts.length
          : 0,
    },
  };

  try {
    const insights = await generateInsights(context);
    return Response.json({ insights });
  } catch (error) {
    return Response.json({ insights: [], error: "Failed to generate insights" });
  }
};
