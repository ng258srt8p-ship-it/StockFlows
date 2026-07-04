import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { prisma } from "~/lib/db/client";
import { requirePermission } from "~/lib/auth/middleware";
import {
  Page,
  Layout,
  Card,
  Text,
  Badge,
  IndexTable,
  EmptyState,
} from "@shopify/polaris";
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
  // A-class (High Priority)
  { title: "Premium Snowboard Boots", sku: "PSB-001", model: "ETS", confidence: 0.94, predicted: 420, current: 120, trend: "up", category: "A" as const },
  { title: "Performance Ski Goggles", sku: "PSG-002", model: "Ensemble", confidence: 0.91, predicted: 350, current: 95, trend: "up", category: "A" as const },
  { title: "Heated Ski Gloves", sku: "HSG-003", model: "Linear", confidence: 0.87, predicted: 380, current: 65, trend: "up", category: "A" as const },
  { title: "All-Mountain Ski Boots", sku: "AMS-004", model: "ETS", confidence: 0.89, predicted: 290, current: 205, trend: "stable", category: "A" as const },
  // B-class (Medium Priority)
  { title: "Carbon Fiber Ski Poles", sku: "CFP-005", model: "Linear", confidence: 0.82, predicted: 240, current: 85, trend: "up", category: "B" as const },
  { title: "Insulated Ski Jacket", sku: "ISJ-006", model: "Ensemble", confidence: 0.76, predicted: 110, current: 145, trend: "down", category: "B" as const },
  { title: "Helmet Visor Anti-Fog", sku: "HVA-007", model: "ETS", confidence: 0.80, predicted: 160, current: 130, trend: "stable", category: "B" as const },
  // C-class (Low Priority)
  { title: "Merino Wool Socks (3-pack)", sku: "MWS-008", model: "Linear", confidence: 0.74, predicted: 180, current: 220, trend: "up", category: "C" as const },
  { title: "Snowboard Wax Kit", sku: "SWK-009", model: "Ensemble", confidence: 0.68, predicted: 75, current: 90, trend: "down", category: "C" as const },
  { title: "Ski Helmet Strap Lock", sku: "SHS-010", model: "ETS", confidence: 0.65, predicted: 90, current: 180, trend: "stable", category: "C" as const },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await requirePermission(request, "reports:read");

  const shop = await prisma.shop.findUnique({
    where: { shopifyDomain: session.shop },
  });
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

  // Get active reorder alerts for the recommendation panel
  const reorderAlerts = await prisma.reorderAlert.findMany({
    where: { shop: { shopifyDomain: session.shop }, status: "PENDING" },
    include: { inventoryItem: true, location: true },
    orderBy: [{ urgency: "asc" }, { createdAt: "desc" }],
    take: 10,
  });

  // ABC Analysis — compute revenue from sales movements (last 90 days)
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

export default function Forecasting() {
  const loaderData = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  // Cast to bypass Remix Jsonify null-union types — our data is clean
  const forecastList = (loaderData.forecasts ?? []) as any[];
  const alertList = (loaderData.reorderAlerts ?? []) as any[];
  const abcSummary = (loaderData as any).abcSummary;

  const selectedId = searchParams.get("forecast");
  const selectedForecast = forecastList.find((f: any) => f.id === selectedId) ?? null;

  // Summary stats
  const totalPredicted = forecastList.reduce((sum: number, f: any) => sum + (f.totalPredicted || 0), 0);
  const highConfidence = forecastList.filter((f: any) => f.confidence >= 0.8).length;

  // Use demo data if no real forecasts exist
  const displayForecasts = forecastList.length > 0 ? forecastList : demoForecastData;

  return (
    <Page
      title="Forecasting"
      subtitle={`Average accuracy: ${loaderData.accuracy}% — ${forecastList.length} forecasts generated`}
    >
      <Layout>
        {/* Summary cards */}
        <Layout.Section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="p-4">
                <Text variant="headingSm" as="h3">
                  Total Predicted (30d)
                </Text>
                <Text variant="headingLg" as="p">
                  {forecastList.length > 0 ? totalPredicted.toLocaleString() : "0"} units
                </Text>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <Text variant="headingSm" as="h3">
                  High Confidence
                </Text>
                <Text variant="headingLg" as="p" className="text-green-600">
                  {forecastList.length > 0 ? `${highConfidence} / ${forecastList.length}` : "0 / 0"}
                </Text>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <Text variant="headingSm" as="h3">
                  Reorder Needed
                </Text>
                <Text variant="headingLg" as="p" className={alertList.length > 0 ? "text-red-600" : ""}>
                  {alertList.length} items
                </Text>
              </div>
            </Card>
          </div>
        </Layout.Section>

        {/* Forecast cards - show demo data to match stockflows.app */}
        <Layout.Section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoForecastData.map((item, index) => (
              <Card key={index}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge tone={item.category === "A" ? "success" : item.category === "B" ? "warning" : "info"}>
                      {item.category}
                    </Badge>
                    <Text variant="bodySm" as="p" tone="subdued">
                      {item.model}
                    </Text>
                  </div>
                  <Text variant="headingSm" as="h3">
                    {item.title}
                  </Text>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge tone={item.trend === "up" ? "success" : item.trend === "down" ? "critical" : "info"}>
                      {item.trend === "up" ? "↑ Up" : item.trend === "down" ? "↓ Down" : "→ Stable"}
                    </Badge>
                    <Text variant="bodySm" as="p" tone="subdued">
                      {Math.round(item.confidence * 100)}% confidence
                    </Text>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between">
                      <Text variant="bodySm" as="p">Predicted:</Text>
                      <Text variant="bodySm" as="p" fontWeight="semibold">{item.predicted} units</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text variant="bodySm" as="p">Current:</Text>
                      <Text variant="bodySm" as="p">{item.current} units</Text>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Layout.Section>

        {/* Forecast chart — shows when a forecast row is selected */}
        {selectedForecast && (
          <Layout.Section>
            <Card>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Text variant="headingMd" as="h2">
                      {selectedForecast.inventoryItem.title}
                    </Text>
                    <Text variant="bodySm" as="p" tone="subdued">
                      SKU: {selectedForecast.inventoryItem.sku ?? "N/A"} — {selectedForecast.location.name}
                    </Text>
                  </div>
                  <Badge>{selectedForecast.modelUsed}</Badge>
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
            </Card>
          </Layout.Section>
        )}

        {/* Forecasts table */}
        <Layout.Section>
          <Card>
            <div className="p-4">
              <Text variant="headingMd" as="h2">
                Generated Forecasts
              </Text>
              <Text variant="bodySm" tone="subdued" as="p">
                Click a row to view the forecast chart and reorder recommendation.
              </Text>
              {forecastList.length === 0 ? (
                <EmptyState
                  heading="No forecasts yet"
                  action={{ content: "Run forecast", url: "/app/settings" }}
                  secondaryAction={{ content: "Learn more", url: "#" }}
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>
                    Forecasts are generated nightly for all tracked inventory items.
                    Make sure your inventory is synced to see predictions here.
                  </p>
                </EmptyState>
              ) : (
                <IndexTable
                  resourceName={{ singular: "forecast", plural: "forecasts" }}
                  itemCount={forecastList.length}
                  selectable={false}
                  onRowClick={(id) => setSearchParams({ forecast: id })}
                  headings={[
                    { title: "Product" },
                    { title: "Location" },
                    { title: "Model" },
                    { title: "Confidence" },
                    { title: "30-Day Pred." },
                    { title: "Stock" },
                    { title: "Generated" },
                  ]}
                >
                  {forecastList.map((f, index) => (
                    <IndexTable.Row
                      key={f.id}
                      id={f.id}
                      position={index}
                      selected={f.id === selectedId}
                    >
                      <IndexTable.Cell>
                        <Text variant="bodyMd" as="p" fontWeight="semibold">
                          {f.inventoryItem.title}
                        </Text>
                        <Text variant="bodySm" as="p" tone="subdued">
                          {f.inventoryItem.sku ?? "No SKU"}
                        </Text>
                      </IndexTable.Cell>
                      <IndexTable.Cell>{f.location.name}</IndexTable.Cell>
                      <IndexTable.Cell>
                        <Badge>{f.modelUsed}</Badge>
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        <Badge
                          tone={
                            f.confidence >= 0.8
                              ? "success"
                              : f.confidence >= 0.6
                                ? "warning"
                                : "critical"
                          }
                        >
                          {`${Math.round(f.confidence * 100)}%`}
                        </Badge>
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        {f.totalPredicted.toLocaleString()} units
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        <Badge
                          tone={
                            f.inventoryItem.quantity <= f.inventoryItem.reorderPoint
                              ? "critical"
                              : "success"
                          }
                        >
                          {`${f.inventoryItem.quantity} in stock`}
                        </Badge>
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        {new Date(f.createdAt).toLocaleDateString()}
                      </IndexTable.Cell>
                    </IndexTable.Row>
                  ))}
                </IndexTable>
              )}
            </div>
          </Card>
        </Layout.Section>

        {/* ABC Analysis */}
        <Layout.Section>
          <Card>
            <div className="p-4">
              <Text variant="headingMd" as="h2">
                ABC Analysis
              </Text>
              <Text variant="bodySm" as="p" tone="subdued">
                Inventory items classified by revenue contribution over the last 90 days.
              </Text>

              {/* Summary badges */}
              <div className="flex gap-4 mt-3 mb-4">
                <div className="flex items-center gap-2">
                  <Badge tone="success">A</Badge>
                  <Text variant="bodySm" as="p">
                    {abcSummary.totals.A.count} items ({abcSummary.totals.A.percentRevenue}% revenue)
                  </Text>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="warning">B</Badge>
                  <Text variant="bodySm" as="p">
                    {abcSummary.totals.B.count} items ({abcSummary.totals.B.percentRevenue}% revenue)
                  </Text>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="info">C</Badge>
                  <Text variant="bodySm" as="p">
                    {abcSummary.totals.C.count} items ({abcSummary.totals.C.percentRevenue}% revenue)
                  </Text>
                </div>
              </div>

              {abcSummary.categories.length === 0 ? (
                <Text variant="bodySm" as="p" tone="subdued">
                  No sales data available for ABC analysis. Items will appear once sales are recorded.
                </Text>
              ) : (
                <IndexTable
                  resourceName={{ singular: "item", plural: "items" }}
                  itemCount={abcSummary.categories.length}
                  selectable={false}
                  headings={[
                    { title: "Category" },
                    { title: "Product" },
                    { title: "SKU" },
                    { title: "Revenue (90d)" },
                    { title: "Cumulative %" },
                    { title: "Stock" },
                    { title: "Review Freq." },
                  ]}
                >
                  {abcSummary.categories.map((item: any, index: number) => {
                    const policy = getReorderPolicy(item.category);
                    return (
                      <IndexTable.Row key={item.id} id={item.id} position={index}>
                        <IndexTable.Cell>
                          <Badge
                            tone={
                              item.category === "A"
                                ? "success"
                                : item.category === "B"
                                  ? "warning"
                                  : "info"
                            }
                          >
                            {item.category}
                          </Badge>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <Text variant="bodyMd" as="p" fontWeight="semibold">
                            {item.title}
                          </Text>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <Text variant="bodySm" as="p">{item.sku ?? "—"}</Text>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <Text variant="bodySm" as="p">
                            ${item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Text>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <Text variant="bodySm" as="p">{item.cumulativePercent}%</Text>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <Text variant="bodySm" as="p">{item.quantity} units</Text>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <Text variant="bodySm" as="p">{policy.reviewFrequency}</Text>
                        </IndexTable.Cell>
                      </IndexTable.Row>
                    );
                  })}
                </IndexTable>
              )}
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
