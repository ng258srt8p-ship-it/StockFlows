import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/lib/db/client";
import { requirePermission } from "~/lib/auth/middleware";
import { Page, Layout, Card, Text, IndexTable, Badge } from "@shopify/polaris";

interface InventoryItem {
  id: string;
  title: string;
  sku: string | null;
  quantity: number;
  costPerUnit: number | null;
}

interface MovementSummary {
  inbound: number;
  outbound: number;
  adjustments: number;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await requirePermission(request, "reports:read");
  const shop = await prisma.shop.findUnique({
    where: { shopifyDomain: session.shop },
  });

  if (!shop)
    return json({
      items: [],
      stats: { totalValue: 0, totalItems: 0, movementCount: 0 },
      movementSummary: { inbound: 0, outbound: 0, adjustments: 0 },
    });

  const [items, movementCount, movements] = await Promise.all([
    prisma.inventoryItem.findMany({
      where: { shopId: shop.id },
      select: { id: true, title: true, sku: true, quantity: true, costPerUnit: true },
    }),
    prisma.stockMovement.count({ where: { inventoryItem: { shopId: shop.id } } }),
    prisma.stockMovement.groupBy({
      by: ["type"],
      where: { inventoryItem: { shopId: shop.id } },
      _sum: { quantityChange: true },
    }),
  ]);

  const totalValue = items.reduce(
    (sum, i) => sum + i.quantity * Number(i.costPerUnit || 0),
    0
  );

  // Calculate movement summary
  const movementSummary: MovementSummary = { inbound: 0, outbound: 0, adjustments: 0 };
  movements.forEach((m) => {
    const qty = Math.abs(m._sum.quantityChange ?? 0);
    if (m.type === "RECEIVED" || m.type === "RETURN") {
      movementSummary.inbound += qty;
    } else if (m.type === "SALE" || m.type === "SHIPPED") {
      movementSummary.outbound += qty;
    } else {
      movementSummary.adjustments += qty;
    }
  });

  return json({
    items: items.map((item) => ({
      ...item,
      costPerUnit: item.costPerUnit ? Number(item.costPerUnit) : null,
      totalValue: item.quantity * Number(item.costPerUnit || 0),
    })),
    stats: { totalValue, totalItems: items.length, movementCount },
    movementSummary,
  });
};

export default function Reports() {
  const { items, stats, movementSummary } = useLoaderData<typeof loader>();

  return (
    <Page title="Reports" subtitle="Export inventory data and analytics">
      <Layout>
        {/* KPI Cards */}
        <Layout.Section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="p-4 text-center">
                <Text variant="headingSm" as="h3">
                  Total Inventory Value
                </Text>
                <Text variant="headingLg" as="p">
                  ${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </div>
            </Card>
            <Card>
              <div className="p-4 text-center">
                <Text variant="headingSm" as="h3">
                  Total Items
                </Text>
                <Text variant="headingLg" as="p">{stats.totalItems}</Text>
              </div>
            </Card>
            <Card>
              <div className="p-4 text-center">
                <Text variant="headingSm" as="h3">
                  Total Movements
                </Text>
                <Text variant="headingLg" as="p">{stats.movementCount}</Text>
              </div>
            </Card>
          </div>
        </Layout.Section>

        {/* Inventory Valuation Table */}
        <Layout.Section>
          <Card>
            <div className="p-4">
              <Text variant="headingMd" as="h2">
                Inventory Valuation
              </Text>
              <Text variant="bodySm" as="p" tone="subdued">
                Detailed breakdown of inventory value across all tracked items.
              </Text>

              {items.length === 0 ? (
                <Text variant="bodySm" as="p" tone="subdued" className="mt-4">
                  No inventory items found. Add items to see valuation data.
                </Text>
              ) : (
                <div className="mt-4">
                  <IndexTable
                    resourceName={{ singular: "item", plural: "items" }}
                    itemCount={items.length}
                    selectable={false}
                    headings={[
                      { title: "Product" },
                      { title: "SKU" },
                      { title: "Quantity", alignment: "end" },
                      { title: "Unit Cost", alignment: "end" },
                      { title: "Total Value", alignment: "end" },
                    ]}
                    totalsRow={{
                      totals: [
                        { total: "Total Inventory Value" },
                        { total: null },
                        { total: null },
                        {
                          total: `$${stats.totalValue.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`,
                        },
                      ],
                    }}
                  >
                    {items.map((item, index) => (
                      <IndexTable.Row key={item.id} id={item.id} position={index}>
                        <IndexTable.Cell>
                          <Text variant="bodyMd" as="p" fontWeight="semibold">
                            {item.title}
                          </Text>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <Text variant="bodySm" as="p" tone="subdued">
                            {item.sku ?? "—"}
                          </Text>
                        </IndexTable.Cell>
                        <IndexTable.Cell alignment="end">
                          <Text variant="bodySm" as="p">
                            {item.quantity.toLocaleString()}
                          </Text>
                        </IndexTable.Cell>
                        <IndexTable.Cell alignment="end">
                          <Text variant="bodySm" as="p">
                            {item.costPerUnit
                              ? `$${item.costPerUnit.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}`
                              : "—"}
                          </Text>
                        </IndexTable.Cell>
                        <IndexTable.Cell alignment="end">
                          <Text variant="bodySm" as="p" fontWeight="semibold">
                            ${item.totalValue.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </Text>
                        </IndexTable.Cell>
                      </IndexTable.Row>
                    ))}
                  </IndexTable>
                </div>
              )}
            </div>
          </Card>
        </Layout.Section>

        {/* Stock Movement Summary */}
        <Layout.Section>
          <Card>
            <div className="p-4">
              <Text variant="headingMd" as="h2">
                Stock Movement Summary
              </Text>
              <Text variant="bodySm" as="p" tone="subdued">
                Breakdown of inventory movements by type.
              </Text>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <Text variant="headingSm" as="h3" tone="success">
                    Inbound
                  </Text>
                  <Text variant="headingLg" as="p">
                    {movementSummary.inbound.toLocaleString()} units
                  </Text>
                  <Text variant="bodySm" as="p" tone="subdued">
                    Received & Returns
                  </Text>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Text variant="headingSm" as="h3" tone="info">
                    Outbound
                  </Text>
                  <Text variant="headingLg" as="p">
                    {movementSummary.outbound.toLocaleString()} units
                  </Text>
                  <Text variant="bodySm" as="p" tone="subdued">
                    Sales & Shipments
                  </Text>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <Text variant="headingSm" as="h3" tone="warning">
                    Adjustments
                  </Text>
                  <Text variant="headingLg" as="p">
                    {movementSummary.adjustments.toLocaleString()} units
                  </Text>
                  <Text variant="bodySm" as="p" tone="subdued">
                    Manual & System Adjustments
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </Layout.Section>

        {/* Export Data */}
        <Layout.Section>
          <Card>
            <div className="p-4">
              <Text variant="headingMd" as="h2">
                Export Data
              </Text>
              <div className="mt-3 flex gap-2">
                <a href="/app/reports/export.csv" download>
                  Export Inventory CSV
                </a>
                <a href="/app/reports/pdf" download>
                  Export Inventory PDF
                </a>
              </div>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
