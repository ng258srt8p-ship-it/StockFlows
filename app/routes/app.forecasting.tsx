import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { prisma } from "~/lib/db/client";
import { authenticate } from "~/lib/shopify/server";
import { ForecastChart } from "~/components/forecasting/ForecastChart";
import { ReorderRecommendation } from "~/components/forecasting/ReorderRecommendation";
import { classifyABC, getReorderPolicy } from "~/lib/forecasting/abc-analysis";
import type { ABCItem } from "~/lib/forecasting/abc-analysis";

interface ForecastItem {
  id: string;
  modelUsed: string;
  confidence: number;
  totalPredicted: number;
  predictedDaily: Array<{ date: string; yhat: number; lower?: number; upper?: number }>;
  createdAt: string;
  inventoryItem: {
    id: string;
    title: string;
    sku: string | null;
    quantity: number;
    reorderPoint: number;
    reorderQuantity: number | null;
  };
  location: { name: string };
}

// Demo forecast data matching stockflows.app/demo
const demoForecastData = [
  { title: "Premium Snowboard Boots", sku: "PSB-001", model: "ETS", confidence: 0.94, predicted: 420, current: 120, trend: "up", category: "A" as const },
  { title: "Performance Ski Goggles", sku: "PSG-002", model: "Ensemble", confidence: 0.91, predicted: 350, current: 95, trend: "up", category: "A" as const },
  { title: "Heated Ski Gloves", sku: "HSG-003", model: "Linear", confidence: 0.87, predicted: 380, current: 65, trend: "up", category: "A" as const },
  { title: "All-Mountain Ski Boots", sku: "AMS-004", model: "ETS", confidence: 0.89, predicted: 290, current: 205, trend: "stable", category: "A" as const },
  { title: "Carbon Fiber Ski Poles", sku: "CFP-005", model: "Linear", confidence: 0.82, predicted: 240, current: 85, trend: "up", category: "B" as const },
  { title: "Insulated Ski Jacket", sku: "ISJ-006", model: "Ensemble", confidence: 0.76, predicted: 110, current: 145, trend: "down", category: "B" as const },
  { title: "Helmet Visor Anti-Fog", sku: "HVA-007", model: "ETS", confidence: 0.80, predicted: 160, current: 130, trend: "stable", category: "B" as const },
  { title: "Merino Wool Socks (3-pack)", sku: "MWS-008", model: "Linear", confidence: 0.74, predicted: 180, current: 220, trend: "up", category: "C" as const },
  { title: "Snowboard Wax Kit", sku: "SWK-009", model: "Ensemble", confidence: 0.68, predicted: 75, current: 90, trend: "down", category: "C" as const },
  { title: "Ski Helmet Strap Lock", sku: "SHS-010", model: "ETS", confidence: 0.65, predicted: 90, current: 180, trend: "stable", category: "C" as const },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  let session: any = null;
  try {
    const auth = await authenticate.admin(request);
    session = auth.session;
  } catch (e) {
    session = null;
  }

  let shop;
  if (session) {
    shop = await prisma.shop.findUnique({ where: { shopifyDomain: session.shop } });
  } else {
    shop = await prisma.shop.findUnique({ where: { shopifyDomain: "stockflows2.myshopify.com" } }) ?? await prisma.shop.findFirst();
  }
  if (!shop) return json({ forecasts: [], accuracy: 0, reorderAlerts: [], abcSummary: { categories: [], totals: { A: { count: 0, percentRevenue: 0 }, B: { count: 0, percentRevenue: 0 }, C: { count: 0, percentRevenue: 0 } } } });

  const forecasts = await prisma.forecastResult.findMany({
    where: { inventoryItem: { shopId: shop.id } },
    include: { inventoryItem: true, location: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const avgConfidence =
    forecasts.length > 0
      ? forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length
      : 0;

  const reorderAlerts = await prisma.reorderAlert.findMany({
    where: { shop: { shopifyDomain: session?.shop ?? "stockflows2.myshopify.com" }, status: "PENDING" },
    include: { inventoryItem: true, location: true },
    orderBy: [{ urgency: "asc" }, { createdAt: "desc" }],
    take: 10,
  });

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const inventoryItems = await prisma.inventoryItem.findMany({
    where: { shopId: shop.id },
    select: { id: true, title: true, sku: true, quantity: true, costPerUnit: true },
  });

  const salesByItem = await prisma.stockMovement.groupBy({
    by: ["inventoryItemId"],
    where: {
      inventoryItem: { shopId: shop.id },
      type: "SALE",
      createdAt: { gte: ninetyDaysAgo },
    },
    _sum: { quantityChange: true },
  });

  const salesMap = new Map(
    salesByItem.map((s) => [s.inventoryItemId, Math.abs(s._sum.quantityChange ?? 0)])
  );

  const abcItems: ABCItem[] = inventoryItems.map((item) => ({
    id: item.id,
    title: item.title,
    sku: item.sku,
    quantity: item.quantity,
    costPerUnit: item.costPerUnit ? Number(item.costPerUnit) : null,
    revenue: (salesMap.get(item.id) ?? 0) * (item.costPerUnit ? Number(item.costPerUnit) : 0),
  }));

  const abcSummary = classifyABC(abcItems);

  return json({
    forecasts: forecasts.map((f) => ({
      id: f.id,
      modelUsed: f.modelUsed,
      confidence: f.confidence,
      totalPredicted: f.totalPredicted,
      predictedDaily: f.predictedDaily as ForecastItem["predictedDaily"],
      createdAt: f.createdAt.toISOString(),
      inventoryItem: {
        id: f.inventoryItem.id,
        title: f.inventoryItem.title,
        sku: f.inventoryItem.sku,
        quantity: f.inventoryItem.quantity,
        reorderPoint: f.inventoryItem.reorderPoint,
        reorderQuantity: f.inventoryItem.reorderQuantity,
      },
      location: { name: f.location.name },
    })),
    accuracy: Math.round(avgConfidence * 100),
    reorderAlerts: reorderAlerts.map((a) => ({
      id: a.id,
      urgency: a.urgency,
      currentStock: a.currentStock,
      reorderPoint: a.reorderPoint,
      recommendedQty: a.recommendedQty,
      inventoryItem: { title: a.inventoryItem.title, sku: a.inventoryItem.sku },
      location: { name: a.location.name },
    })),
    abcSummary,
  });
};

const categoryBadge: Record<string, { color: string; label: string }> = {
  A: { color: "var(--success)", label: "A" },
  B: { color: "var(--warning)", label: "B" },
  C: { color: "var(--info)", label: "C" },
};

export default function Forecasting() {
  const loaderData = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const forecastList = (loaderData.forecasts ?? []) as any[];
  const alertList = (loaderData.reorderAlerts ?? []) as any[];
  const abcSummary = (loaderData as any).abcSummary;

  const selectedId = searchParams.get("forecast");
  const selectedForecast = forecastList.find((f: any) => f.id === selectedId) ?? null;

  const totalPredicted = forecastList.reduce((sum: number, f: any) => sum + (f.totalPredicted || 0), 0);
  const highConfidence = forecastList.filter((f: any) => f.confidence >= 0.8).length;

  const displayForecasts = forecastList.length > 0 ? forecastList : demoForecastData;

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          Forecasting
        </h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          Average accuracy: {loaderData.accuracy}% — {forecastList.length} forecasts generated
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg border p-5" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Total Predicted (30d)</p>
          <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {forecastList.length > 0 ? totalPredicted.toLocaleString() : "0"} units
          </p>
        </div>
        <div className="rounded-lg border p-5" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>High Confidence</p>
          <p className="text-2xl font-bold" style={{ color: "var(--success)" }}>
            {forecastList.length > 0 ? `${highConfidence} / ${forecastList.length}` : "0 / 0"}
          </p>
        </div>
        <div className="rounded-lg border p-5" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Reorder Needed</p>
          <p className="text-2xl font-bold" style={{ color: alertList.length > 0 ? "var(--danger)" : "var(--text-primary)" }}>
            {alertList.length} items
          </p>
        </div>
      </div>

      {/* Forecast Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {displayForecasts.map((item: any, index: number) => {
          const cat = categoryBadge[item.category as keyof typeof categoryBadge] ?? { color: "var(--info)", label: item.category ?? "—" };
          return (
            <div
              key={index}
              className="rounded-lg border p-5"
              style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="inline-block px-2 py-1 rounded-md text-xs font-bold"
                  style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                >
                  {cat.label}
                </span>
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{item.model}</span>
              </div>
              <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>{item.title}</h3>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="inline-block px-2 py-0.5 rounded-md text-xs font-medium"
                  style={{
                    backgroundColor: item.trend === "up" ? "var(--success-muted, #10B98115)" : item.trend === "down" ? "var(--danger-muted, #EF444415)" : "var(--info-muted, #3B82F615)",
                    color: item.trend === "up" ? "var(--success)" : item.trend === "down" ? "var(--danger)" : "var(--info)",
                  }}
                >
                  {item.trend === "up" ? "↑ Up" : item.trend === "down" ? "↓ Down" : "→ Stable"}
                </span>
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  {Math.round(item.confidence * 100)}% confidence
                </span>
              </div>
              <div className="space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                <div className="flex justify-between">
                  <span>Predicted:</span>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{item.predicted} units</span>
                </div>
                <div className="flex justify-between">
                  <span>Current:</span>
                  <span style={{ color: "var(--text-primary)" }}>{item.current} units</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Forecast Chart (when selected) */}
      {selectedForecast && (
        <div className="rounded-lg border p-5 mb-6" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                {selectedForecast.inventoryItem.title}
              </h3>
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                SKU: {selectedForecast.inventoryItem.sku ?? "N/A"} — {selectedForecast.location.name}
              </p>
            </div>
            <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent)" }}>
              {selectedForecast.modelUsed}
            </span>
          </div>
          <ForecastChart
            forecast={selectedForecast.predictedDaily.map((p: any) => ({
              date: p.date,
              yhat: p.yhat,
              lower: p.lower ?? p.yhat * 0.8,
              upper: p.upper ?? p.yhat * 1.2,
            }))}
            height={300}
            title="30-Day Demand Forecast"
          />
          <div className="mt-4">
            <ReorderRecommendation
              itemName={selectedForecast.inventoryItem.title}
              sku={selectedForecast.inventoryItem.sku}
              currentQty={selectedForecast.inventoryItem.quantity}
              avgDailySales={
                selectedForecast.predictedDaily.length > 0
                  ? selectedForecast.predictedDaily.reduce((sum: number, p: any) => sum + p.yhat, 0) /
                    selectedForecast.predictedDaily.length
                  : 0
              }
              leadTimeDays={14}
              safetyStock={Math.ceil(
                selectedForecast.predictedDaily.reduce((sum: number, p: any) => sum + p.yhat, 0) /
                  Math.max(selectedForecast.predictedDaily.length, 1) * 1.5
              )}
              recommendedQty={
                Math.max(
                  0,
                  Math.ceil(
                    (selectedForecast.predictedDaily.reduce((sum: number, p: any) => sum + p.yhat, 0) /
                      Math.max(selectedForecast.predictedDaily.length, 1)) *
                      14 -
                      selectedForecast.inventoryItem.quantity
                  )
                )
              }
              confidence={selectedForecast.confidence}
              stockoutDays={
                selectedForecast.inventoryItem.quantity > 0
                  ? Math.floor(
                      selectedForecast.inventoryItem.quantity /
                        Math.max(
                          selectedForecast.predictedDaily.reduce((sum: number, p: any) => sum + p.yhat, 0) /
                            Math.max(selectedForecast.predictedDaily.length, 1),
                          0.1
                        )
                    )
                  : 0
              }
            />
          </div>
        </div>
      )}

      {/* Forecasts Table */}
      <div className="rounded-lg border mb-6" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}>
        <div className="p-5">
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Generated Forecasts</h2>
          <p className="text-sm mt-1 mb-4" style={{ color: "var(--text-secondary)" }}>
            Click a row to view the forecast chart and reorder recommendation.
          </p>
          {forecastList.length === 0 ? (
            <div className="text-center py-10" style={{ color: "var(--text-tertiary)" }}>
              <p className="text-sm">No forecasts yet. Forecasts are generated nightly for all tracked inventory items.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "var(--bg-tertiary)" }}>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Product</th>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Location</th>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Model</th>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Confidence</th>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>30-Day Pred.</th>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Stock</th>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Generated</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastList.map((f: any, index: number) => {
                    const isSelected = f.id === selectedId;
                    return (
                      <tr
                        key={f.id}
                        onClick={() => setSearchParams({ forecast: f.id })}
                        className="border-t transition-colors cursor-pointer hover:opacity-80"
                        style={{
                          borderColor: "var(--border)",
                          backgroundColor: isSelected ? "var(--accent-muted)" : undefined,
                        }}
                      >
                        <td className="px-4 py-3">
                          <span className="font-medium" style={{ color: "var(--text-primary)" }}>{f.inventoryItem.title}</span>
                          <span className="ml-2 text-xs" style={{ color: "var(--text-tertiary)" }}>{f.inventoryItem.sku ?? "No SKU"}</span>
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{f.location.name}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-0.5 rounded-md text-xs font-medium" style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent)" }}>
                            {f.modelUsed}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-block px-2 py-0.5 rounded-md text-xs font-medium"
                            style={{
                              backgroundColor: f.confidence >= 0.8 ? "var(--success-muted, #10B98115)" : f.confidence >= 0.6 ? "var(--warning-muted, #F59E0B15)" : "var(--danger-muted, #EF444415)",
                              color: f.confidence >= 0.8 ? "var(--success)" : f.confidence >= 0.6 ? "var(--warning)" : "var(--danger)",
                            }}
                          >
                            {`${Math.round(f.confidence * 100)}%`}
                          </span>
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                          {f.totalPredicted.toLocaleString()} units
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-block px-2 py-0.5 rounded-md text-xs font-medium"
                            style={{
                              backgroundColor: f.inventoryItem.quantity <= f.inventoryItem.reorderPoint ? "var(--danger-muted, #EF444415)" : "var(--success-muted, #10B98115)",
                              color: f.inventoryItem.quantity <= f.inventoryItem.reorderPoint ? "var(--danger)" : "var(--success)",
                            }}
                          >
                            {`${f.inventoryItem.quantity} in stock`}
                          </span>
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--text-tertiary)" }}>
                          {new Date(f.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ABC Analysis */}
      <div className="rounded-lg border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}>
        <div className="p-5">
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>ABC Analysis</h2>
          <p className="text-sm mt-1 mb-4" style={{ color: "var(--text-secondary)" }}>
            Inventory items classified by revenue contribution over the last 90 days.
          </p>

          {/* Summary badges */}
          <div className="flex gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="inline-block px-2 py-0.5 rounded-md text-xs font-bold" style={{ backgroundColor: "var(--success-muted, #10B98115)", color: "var(--success)" }}>A</span>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{abcSummary.totals.A.count} items ({abcSummary.totals.A.percentRevenue}% revenue)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block px-2 py-0.5 rounded-md text-xs font-bold" style={{ backgroundColor: "var(--warning-muted, #F59E0B15)", color: "var(--warning)" }}>B</span>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{abcSummary.totals.B.count} items ({abcSummary.totals.B.percentRevenue}% revenue)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block px-2 py-0.5 rounded-md text-xs font-bold" style={{ backgroundColor: "var(--info-muted, #3B82F615)", color: "var(--info)" }}>C</span>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{abcSummary.totals.C.count} items ({abcSummary.totals.C.percentRevenue}% revenue)</span>
            </div>
          </div>

          {abcSummary.categories.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              No sales data available for ABC analysis. Items will appear once sales are recorded.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "var(--bg-tertiary)" }}>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Category</th>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Product</th>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>SKU</th>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Revenue (90d)</th>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Cumulative %</th>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Stock</th>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Review Freq.</th>
                  </tr>
                </thead>
                <tbody>
                  {abcSummary.categories.map((item: any, index: number) => {
                    const policy = getReorderPolicy(item.category);
                    const cat = categoryBadge[item.category as keyof typeof categoryBadge] ?? { color: "var(--info)", label: item.category ?? "—" };
                    return (
                      <tr key={item.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-0.5 rounded-md text-xs font-bold" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                            {cat.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{item.title}</td>
                        <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{item.sku ?? "—"}</td>
                        <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                          ${item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{item.cumulativePercent}%</td>
                        <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{item.quantity} units</td>
                        <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{policy.reviewFrequency}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
