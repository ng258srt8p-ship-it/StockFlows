import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import {
  Page,
  Layout,
  Card,
  IndexTable,
  Badge,
  Button,
} from "@shopify/polaris";

const statusBadge: Record<string, "info" | "success" | "warning" | "critical"> = {
  DRAFT: "info",
  SENT: "warning",
  PARTIALLY_RECEIVED: "warning",
  RECEIVED: "success",
  CLOSED: "success",
  CANCELLED: "critical",
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { shopifyDomain: session.shop },
  });
  if (!shop) return json({ purchaseOrders: [] });

  const purchaseOrders = await prisma.purchaseOrder.findMany({
    where: { shopId: shop.id },
    include: { vendor: true, location: true, lineItems: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return json({ purchaseOrders });
};

export default function PurchasingList() {
  const { purchaseOrders } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <Page
      title="Purchase Orders"
      primaryAction={{
        content: "Create PO",
        onAction: () => navigate("/app/purchasing/new"),
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <IndexTable
              resourceName={{ singular: "purchase order", plural: "purchase orders" }}
              itemCount={purchaseOrders.length}
              headings={[
                { title: "PO #" },
                { title: "Vendor" },
                { title: "Location" },
                { title: "Items", alignment: "end" },
                { title: "Status" },
                { title: "Expected" },
                { title: "Created" },
              ]}
              selectable={false}
              onRowClick={(_, row) => navigate(`/app/purchasing/${row.id}`)}
            >
              {purchaseOrders.map((po, index) => (
                <IndexTable.Row key={po.id} id={po.id} position={index}>
                  <IndexTable.Cell>
                    <span className="font-mono">{po.poNumber}</span>
                  </IndexTable.Cell>
                  <IndexTable.Cell>{po.vendor.name}</IndexTable.Cell>
                  <IndexTable.Cell>{po.location.name}</IndexTable.Cell>
                  <IndexTable.Cell>
                    <span className="text-right">{po.lineItems.length}</span>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Badge tone={statusBadge[po.status] || "info"}>
                      {po.status.replace(/_/g, " ")}
                    </Badge>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    {po.expectedDate
                      ? new Date(po.expectedDate).toLocaleDateString()
                      : "—"}
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    {new Date(po.createdAt).toLocaleDateString()}
                  </IndexTable.Cell>
                </IndexTable.Row>
              ))}
            </IndexTable>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
