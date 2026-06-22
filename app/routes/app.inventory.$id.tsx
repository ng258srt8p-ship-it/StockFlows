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
  DescriptionList,
} from "@shopify/polaris";
import { StockLevelChart } from "~/components/inventory/StockLevelChart";
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

  return defer({
    item,
    movements: movementsPromise,
    forecast: forecastPromise,
  });
};

export default function InventoryDetail() {
  const { item, movements, forecast } = useLoaderData<typeof loader>();
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
      </Layout>
    </Page>
  );
}
