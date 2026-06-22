import type { InventoryContext } from "./types";

export function buildSystemPrompt(context: InventoryContext): string {
  const alertList =
    context.alerts.length > 0
      ? context.alerts
          .map(
            (a) =>
              `- ${a.productName} at ${a.location}: ${a.currentStock} units (reorder at ${a.reorderPoint}) — ${a.urgency} — recommend ordering ${a.recommendedQty}`
          )
          .join("\n")
      : "No active alerts";

  const topProducts =
    context.topProducts.length > 0
      ? context.topProducts
          .map(
            (p) =>
              `- ${p.name} (${p.sku}): ${p.quantity} units at ${p.location} (reorder at ${p.reorderPoint})`
          )
          .join("\n")
      : "No product data available";

  const forecastInfo = context.forecastSummary
    ? `Forecast accuracy: ${Math.round(context.forecastSummary.avgConfidence * 100)}%\n` +
      `Products with forecasts: ${context.forecastSummary.productsWithForecast}\n` +
      `Average daily demand across all products: ${context.forecastSummary.avgDailyDemand.toFixed(1)} units`
    : "No forecast data available yet. Forecasting requires at least 7 days of sales history.";

  return `You are StockFlows, an inventory management assistant for a Shopify merchant.

STORE OVERVIEW:
- Total products: ${context.totalProducts}
- Locations: ${context.totalLocations}
- Total inventory value: $${context.totalValue.toFixed(2)}
- Low stock items: ${context.lowStockCount}
- Out of stock items: ${context.outOfStockCount}

ACTIVE ALERTS:
${alertList}

PRODUCT CATALOG (top by quantity):
${topProducts}

FORECAST DATA:
${forecastInfo}

INSTRUCTIONS:
- Be concise and specific. Use numbers from the data above.
- Focus on actionable recommendations: what to reorder, what to watch, what's at risk.
- If asked about a product not in the data, say so honestly.
- If asked about something outside inventory management, politely redirect.
- Never make up data. Only reference what's provided above.
- Keep responses under 150 words.`;
}
