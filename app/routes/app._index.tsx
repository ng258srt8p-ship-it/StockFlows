import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import {
  Page,
  Layout,
  Card,
  Text,
  Badge,
} from "@shopify/polaris";
import { AlertsList } from "~/components/inventory/AlertsList";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { shopifyDomain: session.shop },
    include: { settings: true },
  });

  if (!shop) {
    return json({
      stats: { totalSKUs: 0, lowStockItems: 0, outOfStockItems: 0, valueAtRisk: 0, totalInventoryValue: 0 },
      alerts: [],
      recentActivity: [],
    });
  }

  // Fast: inventory summary
  const inventoryPromise = (async () => {
    const items = await prisma.inventoryItem.findMany({
      where: { shopId: shop.id },
      include: { location: true },
    });

    const totalSKUs = items.length;
    const lowStockItems = items.filter((i) => i.quantity <= i.reorderPoint && i.quantity > 0).length;
    const outOfStockItems = items.filter((i) => i.quantity === 0).length;
    const valueAtRisk = items
      .filter((i) => i.quantity <= i.reorderPoint)
      .reduce((sum, i) => sum + i.quantity * Number(i.costPerUnit || 0), 0);
    const totalInventoryValue = items.reduce(
      (sum, i) => sum + i.quantity * Number(i.costPerUnit || 0), 0
    );

    return { totalSKUs, lowStockItems, outOfStockItems, valueAtRisk, totalInventoryValue };
  })();

  // Slow: forecast accuracy
  const forecastPromise = (async () => {
    const forecasts = await prisma.forecastResult.findMany({
      where: { inventoryItem: { shopId: shop.id } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    if (forecasts.length === 0) return 0;
    const avgConfidence =
      forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length;
    return Math.round(avgConfidence * 100);
  })();

  // Alerts
  const alertsPromise = prisma.reorderAlert.findMany({
    where: { shopId: shop.id, status: "PENDING" },
    include: { inventoryItem: true, location: true },
    orderBy: [
      { urgency: "asc" },
      { createdAt: "desc" },
    ],
    take: 10,
  });

  // Recent activity (latest stock movements)
  const recentActivityPromise = prisma.stockMovement.findMany({
    where: { inventoryItem: { shopId: shop.id } },
    include: {
      inventoryItem: { select: { title: true, sku: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  // Await everything for simple data access (avoid Jsonify relation stripping)
  const [stats, forecastAccuracy, alertsList, recentActivity] = await Promise.all([
    inventoryPromise,
    forecastPromise,
    alertsPromise,
    recentActivityPromise,
  ]);

  return json({
    stats,
    forecastAccuracy,
    alerts: alertsList,
    recentActivity: recentActivity.filter(Boolean),
  } as const);
};

const MOVEMENT_LABELS: Record<string, string> = {
  SALE: "Sold",
  RETURN: "Returned",
  ADJUSTMENT: "Adjusted",
  TRANSFER_IN: "Transfer in",
  TRANSFER_OUT: "Transfer out",
  RECEIVING: "Received",
  CYCLE_COUNT: "Cycle count",
  DAMAGE: "Damaged",
};

const MOVEMENT_TONES: Record<string, "success" | "critical" | "attention" | "info"> = {
  SALE: "info",
  RETURN: "success",
  ADJUSTMENT: "attention",
  TRANSFER_IN: "success",
  TRANSFER_OUT: "info",
  RECEIVING: "success",
  CYCLE_COUNT: "info",
  DAMAGE: "critical",
};

export default function Dashboard() {
  const { stats, forecastAccuracy, alerts, recentActivity } =
    useLoaderData<typeof loader>();

  return (
    <Page title="StockFlows Dashboard" subtitle="Inventory overview">
      <Layout>
        {/* Stat Cards */}
        <Layout.Section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total SKUs" value={stats.totalSKUs} />
            <StatCard
              title="Low Stock"
              value={stats.lowStockItems}
              trend={stats.lowStockItems > 0 ? "negative" : "neutral"}
            />
            <StatCard
              title="Out of Stock"
              value={stats.outOfStockItems}
              trend={stats.outOfStockItems > 0 ? "negative" : "positive"}
            />
            <StatCard
              title="Inventory Value"
              value={`$${stats.totalInventoryValue.toLocaleString()}`}
              subtext={
                stats.valueAtRisk > 0
                  ? `$${stats.valueAtRisk.toLocaleString()} at risk`
                  : undefined
              }
            />
          </div>
        </Layout.Section>

        {/* Alerts + Recent Activity side by side */}
        <Layout.Section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <div className="flex items-center justify-between mb-2">
                <Text variant="headingMd" as="h2">
                  Active Alerts
                </Text>
                <Badge>{String(alerts.length)}</Badge>
              </div>
              <AlertsList alerts={alerts} />
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-2">
                <Text variant="headingMd" as="h2">
                  Recent Activity
                </Text>
                <Link to="/app/inventory" className="text-sm text-blue-600 hover:underline">
                  View all
                </Link>
              </div>
              {recentActivity.length === 0 ? (
                <Text variant="bodySm" as="p" tone="subdued">
                  No recent stock movements. Activity will appear here as
                  inventory changes.
                </Text>
              ) : (
                <div className="space-y-2">
                  {recentActivity.filter(Boolean).map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <Badge tone={MOVEMENT_TONES[m.type] ?? "info"}>
                          {MOVEMENT_LABELS[m.type] ?? m.type}
                        </Badge>
                        <div>
                          <Text variant="bodySm" as="p" fontWeight="semibold">
                            {m.inventoryItem.title}
                          </Text>
                          <Text variant="bodySm" as="p" tone="subdued">
                            {m.inventoryItem.sku ?? "No SKU"}
                          </Text>
                        </div>
                      </div>
                      <div className="text-right">
                        <Text
                          variant="bodySm"
                          as="p"
                          fontWeight="semibold"
                          className={
                            m.quantityChange > 0
                              ? "text-green-600"
                              : m.quantityChange < 0
                                ? "text-red-600"
                                : ""
                          }
                        >
                          {m.quantityChange > 0 ? "+" : ""}
                          {m.quantityChange}
                        </Text>
                        <Text variant="bodySm" as="p" tone="subdued">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function StatCard({
  title,
  value,
  trend,
  subtext,
}: {
  title: string;
  value: string | number;
  trend?: "positive" | "negative" | "neutral";
  subtext?: string;
}) {
  const color =
    trend === "positive"
      ? "text-green-600"
      : trend === "negative"
        ? "text-red-600"
        : "text-gray-900";

  return (
    <Card>
      <div className="p-4">
        <Text variant="headingSm" as="h3">
          {title}
        </Text>
        <Text variant="headingLg" as="p" className={color}>
          {value}
        </Text>
        {subtext && (
          <Text variant="bodySm" as="p" tone="subdued">
            {subtext}
          </Text>
        )}
      </div>
    </Card>
  );
}
