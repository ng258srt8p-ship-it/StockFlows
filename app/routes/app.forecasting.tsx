import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
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

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { shopifyDomain: session.shop },
  });
  if (!shop) return json({ forecasts: [], accuracy: 0, reorderAlerts: [] });

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
  const { forecasts, accuracy, reorderAlerts } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedId = searchParams.get("forecast");
  const selectedForecast = forecasts.find((f) => f.id === selectedId) ?? null;

  // Summary stats
  const totalPredicted = forecasts.reduce((sum, f) => sum + (f.totalPredicted || 0), 0);
  const highConfidence = forecasts.filter((f) => f.confidence >= 0.8).length;

  return (
    <Page
      title="Forecasting"
      subtitle={`Average accuracy: ${accuracy}% — ${forecasts.length} forecasts generated`}
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
                  {totalPredicted.toLocaleString()} units
                </Text>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <Text variant="headingSm" as="h3">
                  High Confidence
                </Text>
                <Text variant="headingLg" as="p" className="text-green-600">
                  {highConfidence} / {forecasts.length}
                </Text>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <Text variant="headingSm" as="h3">
                  Reorder Needed
                </Text>
                <Text variant="headingLg" as="p" className={reorderAlerts.length > 0 ? "text-red-600" : ""}>
                  {reorderAlerts.length} items
                </Text>
              </div>
            </Card>
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
                  forecast={selectedForecast.predictedDaily.map((p) => ({
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
                        ? selectedForecast.predictedDaily.reduce((sum, p) => sum + p.yhat, 0) /
                          selectedForecast.predictedDaily.length
                        : 0
                    }
                    leadTimeDays={14}
                    safetyStock={Math.ceil(
                      selectedForecast.predictedDaily.reduce((sum, p) => sum + p.yhat, 0) /
                        Math.max(selectedForecast.predictedDaily.length, 1) * 1.5
                    )}
                    recommendedQty={
                      Math.max(
                        0,
                        Math.ceil(
                          (selectedForecast.predictedDaily.reduce((sum, p) => sum + p.yhat, 0) /
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
                                selectedForecast.predictedDaily.reduce((sum, p) => sum + p.yhat, 0) /
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
              {forecasts.length === 0 ? (
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
                  itemCount={forecasts.length}
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
                  {forecasts.map((f, index) => (
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
                          status={
                            f.confidence >= 0.8
                              ? "success"
                              : f.confidence >= 0.6
                                ? "warning"
                                : "critical"
                          }
                        >
                          {String(Math.round(f.confidence * 100))}%
                        </Badge>
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        {f.totalPredicted.toLocaleString()} units
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        <Badge
                          status={
                            f.inventoryItem.quantity <= f.inventoryItem.reorderPoint
                              ? "critical"
                              : "success"
                          }
                        >
                          {String(f.inventoryItem.quantity)} in stock
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
                  {abcSummary.categories.map((item, index) => {
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
