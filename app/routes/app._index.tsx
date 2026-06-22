import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, defer } from "@remix-run/node";
import { useLoaderData, Await } from "@remix-run/react";
import { Suspense } from "react";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import {
  Page,
  Layout,
  Card,
  Text,
  Badge,
  IndexTable,
} from "@shopify/polaris";
import { StockLevelChart } from "~/components/inventory/StockLevelChart";
import { AlertsList } from "~/components/inventory/AlertsList";
import { DashboardSkeleton } from "~/components/shared/LoadingSkeleton";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { shopifyDomain: session.shop },
    include: { settings: true },
  });

  if (!shop) {
    return json({
      stats: { totalSKUs: 0, lowStockItems: 0, valueAtRisk: 0, forecastAccuracy: 0 },
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
    const lowStockItems = items.filter((i) => i.quantity <= i.reorderPoint).length;
    const valueAtRisk = items
      .filter((i) => i.quantity <= i.reorderPoint)
      .reduce((sum, i) => sum + i.quantity * Number(i.costPerUnit || 0), 0);

    return { totalSKUs, lowStockItems, valueAtRisk };
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

  return defer({
    stats: inventoryPromise,
    forecastAccuracy: forecastPromise,
    alerts: alertsPromise,
  });
};

export default function Dashboard() {
  const { stats, forecastAccuracy, alerts } = useLoaderData<typeof loader>();

  return (
    <Page title="StockFlows Dashboard" subtitle="Inventory overview">
      <Layout>
        {/* Stat Cards */}
        <Layout.Section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Suspense fallback={<DashboardSkeleton cards={4} />}>
              <Await resolve={stats}>
                {(data) => (
                  <>
                    <StatCard title="Total SKUs" value={data.totalSKUs} />
                    <StatCard
                      title="Low Stock"
                      value={data.lowStockItems}
                      trend={data.lowStockItems > 0 ? "negative" : "neutral"}
                    />
                    <StatCard
                      title="Value at Risk"
                      value={`$${data.valueAtRisk.toLocaleString()}`}
                      trend={data.valueAtRisk > 0 ? "negative" : "neutral"}
                    />
                    <Suspense fallback={<StatCard title="Forecast Accuracy" value="..." />}>
                      <Await resolve={forecastAccuracy}>
                        {(accuracy) => (
                          <StatCard
                            title="Forecast Accuracy"
                            value={`${accuracy}%`}
                            trend={accuracy >= 80 ? "positive" : accuracy >= 60 ? "neutral" : "negative"}
                          />
                        )}
                      </Await>
                    </Suspense>
                  </>
                )}
              </Await>
            </Suspense>
          </div>
        </Layout.Section>

        {/* Alerts */}
        <Layout.Section>
          <Card>
            <Text variant="headingMd" as="h2">
              Active Alerts
            </Text>
            <Suspense fallback={<DashboardSkeleton cards={1} />}>
              <Await resolve={alerts}>
                {(data) => <AlertsList alerts={data} />}
              </Await>
            </Suspense>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function StatCard({
  title,
  value,
  trend,
}: {
  title: string;
  value: string | number;
  trend?: "positive" | "negative" | "neutral";
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
      </div>
    </Card>
  );
}
