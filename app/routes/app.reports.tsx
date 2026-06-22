import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import { stringify } from "csv-stringify/sync";
import { Page, Layout, Card, Button, Text } from "@shopify/polaris";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = await prisma.shop.findUnique({
    where: { shopifyDomain: session.shop },
  });

  if (!shop) return json({ stats: { totalValue: 0, totalItems: 0, movementCount: 0 } });

  const [items, movementCount] = await Promise.all([
    prisma.inventoryItem.findMany({ where: { shopId: shop.id } }),
    prisma.stockMovement.count({ where: { inventoryItem: { shopId: shop.id } } }),
  ]);

  const totalValue = items.reduce(
    (sum, i) => sum + i.quantity * Number(i.costPerUnit || 0),
    0
  );

  return json({
    stats: { totalValue, totalItems: items.length, movementCount },
  });
};

export default function Reports() {
  const { stats } = useLoaderData<typeof loader>();

  const handleExportCSV = async () => {
    const response = await fetch("/app/reports/export.csv");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stockflows-inventory-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Page title="Reports">
      <Layout>
        <Layout.Section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="p-4 text-center">
                <Text variant="headingSm" as="h3">
                  Total Inventory Value
                </Text>
                <Text variant="headingLg" as="p">
                  ${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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

        <Layout.Section>
          <Card>
            <div className="p-4">
              <Text variant="headingMd" as="h2">Export Data</Text>
              <div className="mt-3 flex gap-2">
                <Button onClick={handleExportCSV}>Export Inventory CSV</Button>
                <Button url="/app/reports/pdf" download>Export Inventory PDF</Button>
              </div>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
