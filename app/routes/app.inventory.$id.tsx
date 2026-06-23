import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, defer } from "@remix-run/node";
import { useLoaderData, useNavigate, Await } from "@remix-run/react";
import { Suspense } from "react";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import {
  Page,
  Layout,
  Card,
  Text,
  Badge,
  Button,
  Banner,
  DescriptionList,
} from "@shopify/polaris";
import { StockLevelChart } from "~/components/inventory/StockLevelChart";
import { ForecastChart } from "~/components/forecasting/ForecastChart";
import { TableSkeleton } from "~/components/shared/LoadingSkeleton";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const item = await prisma.inventoryItem.findUnique({
    where: { id: params.id },
    include: { location: true },
  });

  if (!item) {
    throw new Response("Inventory item not found", { status: 404 });
  }

  // Recent movements
  const movementsPromise = prisma.stockMovement.findMany({
    where: { inventoryItemId: item.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // Forecast
  const forecastPromise = prisma.forecastResult.findFirst({
    where: {
      inventoryItemId: item.id,
      locationId: item.locationId,
    },
    orderBy: { createdAt: "desc" },
  });

  // Linked POs (purchase orders containing this item)
  const poLineItems = await prisma.pOLineItem.findMany({
    where: { inventoryItemId: item.id },
    include: {
      purchaseOrder: {
        include: { vendor: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Active alerts for this item
  const alerts = await prisma.reorderAlert.findMany({
    where: {
      inventoryItemId: item.id,
      status: "PENDING",
    },
    orderBy: { createdAt: "desc" },
  });

  return defer({
    item,
    movements: movementsPromise,
    forecast: forecastPromise,
    poLineItems: poLineItems.map((pli) => ({
      id: pli.id,
      quantity: pli.quantity,
      receivedQty: pli.receivedQty,
      unitCost: Number(pli.unitCost),
      poNumber: pli.purchaseOrder.poNumber,
      status: pli.purchaseOrder.status,
      vendorName: pli.purchaseOrder.vendor.name,
      createdAt: pli.purchaseOrder.createdAt.toISOString(),
    })),
    alerts: alerts.map((a) => ({
      id: a.id,
      urgency: a.urgency,
      currentStock: a.currentStock,
      reorderPoint: a.reorderPoint,
      recommendedQty: a.recommendedQty,
    })),
  });
};

export default function InventoryDetail() {
  const { item, movements, forecast, poLineItems, alerts } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const stockStatus =
    item.quantity === 0
      ? { label: "Out of Stock", status: "critical" as const }
      : item.quantity <= item.reorderPoint
        ? { label: "Low Stock", status: "warning" as const }
        : { label: "In Stock", status: "success" as const };

  return (
    <Page
      title={item.title}
      subtitle={`${item.sku || "No SKU"} — ${item.location.name}`}
      breadcrumbs={[{ content: "Inventory", url: "/app/inventory" }]}
      primaryAction={{
        content: "Adjust Stock",
        url: `/app/inventory/${item.id}/adjust`,
      }}
      secondaryActions={[
        {
          content: "Transfer",
          url: `/app/inventory/transfer?item=${item.id}`,
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card>
              <div className="p-4 text-center">
                <Text variant="headingSm" as="h3">
                  Current Stock
                </Text>
                <Text variant="heading2xl" as="p">
                  {item.quantity}
                </Text>
                <Badge tone={stockStatus.status}>{stockStatus.label}</Badge>
              </div>
            </Card>
            <Card>
              <div className="p-4 text-center">
                <Text variant="headingSm" as="h3">
                  Reorder Point
                </Text>
                <Text variant="heading2xl" as="p">
                  {item.reorderPoint}
                </Text>
              </div>
            </Card>
            <Card>
              <div className="p-4 text-center">
                <Text variant="headingSm" as="h3">
                  Unit Cost
                </Text>
                <Text variant="heading2xl" as="p">
                  {item.costPerUnit ? `$${Number(item.costPerUnit).toFixed(2)}` : "—"}
                </Text>
              </div>
            </Card>
          </div>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div className="p-4">
              <Text variant="headingMd" as="h2">
                Item Details
              </Text>
              <DescriptionList
                items={[
                  { term: "Product ID", description: item.shopifyProductId },
                  { term: "Variant ID", description: item.shopifyVariantId },
                  { term: "Barcode", description: item.barcode || "—" },
                  { term: "Reserved", description: String(item.reserved) },
                  { term: "Available", description: String(item.available) },
                  {
                    term: "Last Counted",
                    description: item.lastCountedAt
                      ? new Date(item.lastCountedAt).toLocaleDateString()
                      : "Never",
                  },
                ]}
              />
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div className="p-4">
              <Text variant="headingMd" as="h2">
                Stock Movements
              </Text>
              <Suspense fallback={<TableSkeleton rows={5} />}>
                <Await resolve={movements}>
                  {(data) =>
                    data.length === 0 ? (
                      <p className="text-gray-500 mt-2">No movements recorded yet.</p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {data.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center justify-between py-2 border-b"
                          >
                            <div>
                              <Badge>{m.type}</Badge>
                              <span className="ml-2 text-sm text-gray-600">
                                {m.reference || ""}
                              </span>
                            </div>
                            <div className="text-right">
                              <span
                                className={
                                  m.quantityChange > 0 ? "text-green-600" : "text-red-600"
                                }
                              >
                                {m.quantityChange > 0 ? "+" : ""}
                                {m.quantityChange}
                              </span>
                              <span className="text-xs text-gray-400 ml-2">
                                {new Date(m.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  }
                </Await>
              </Suspense>
            </div>
          </Card>
        </Layout.Section>

        {/* Active alerts for this item */}
        {alerts.length > 0 && (
          <Layout.Section>
            <Card>
              <div className="p-4">
                <Text variant="headingMd" as="h2">
                  Active Alerts
                </Text>
                <div className="mt-2 space-y-2">
                  {alerts.map((a) => (
                    <Banner
                      key={a.id}
                      tone={a.urgency === "CRITICAL" ? "critical" : "warning"}
                    >
                      <p>
                        {a.urgency}: Stock is {a.currentStock} (reorder point: {a.reorderPoint}).
                        Recommended order: {a.recommendedQty} units.
                      </p>
                    </Banner>
                  ))}
                </div>
              </div>
            </Card>
          </Layout.Section>
        )}

        {/* Linked Purchase Orders */}
        {poLineItems.length > 0 && (
          <Layout.Section>
            <Card>
              <div className="p-4">
                <Text variant="headingMd" as="h2">
                  Purchase Orders
                </Text>
                <div className="mt-2 space-y-2">
                  {poLineItems.map((pli) => (
                    <div
                      key={pli.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <Text variant="bodyMd" as="p" fontWeight="semibold">
                          {pli.poNumber}
                        </Text>
                        <Text variant="bodySm" as="p" tone="subdued">
                          {pli.vendorName} — {new Date(pli.createdAt).toLocaleDateString()}
                        </Text>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <Badge
                          tone={
                            pli.status === "RECEIVED"
                              ? "success"
                              : pli.status === "CANCELLED"
                                ? "critical"
                                : "info"
                          }
                        >
                          {pli.status.replace(/_/g, " ")}
                        </Badge>
                        <Text variant="bodySm" as="p">
                          {pli.receivedQty}/{pli.quantity} received
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </Layout.Section>
        )}

        {/* Forecast Visualization */}
        <Layout.Section>
          <Card>
            <div className="p-4">
              <Text variant="headingMd" as="h2">
                Demand Forecast
              </Text>
              <Suspense fallback={<TableSkeleton rows={3} />}>
                <Await resolve={forecast}>
                  {(data) =>
                    !data ? (
                      <Text variant="bodySm" as="p" tone="subdued" className="mt-2">
                        No forecast available yet. Forecasts are generated nightly.
                      </Text>
                    ) : (
                      <div className="mt-2">
                        <div className="flex items-center gap-4 mb-3">
                          <Badge>{data.modelUsed}</Badge>
                          <Text variant="bodySm" as="p" tone="subdued">
                            Confidence: {Math.round(data.confidence * 100)}%
                          </Text>
                          <Text variant="bodySm" as="p" tone="subdued">
                            30-day predicted: {data.totalPredicted} units
                          </Text>
                        </div>
                        <ForecastChart
                          forecast={(data.predictedDaily as any[]).map((p: any) => ({
                            date: p.date,
                            yhat: p.yhat,
                            lower: p.lower ?? p.yhat * 0.8,
                            upper: p.upper ?? p.yhat * 1.2,
                          }))}
                          height={250}
                          title="30-Day Demand Forecast"
                        />
                      </div>
                    )
                  }
                </Await>
              </Suspense>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
