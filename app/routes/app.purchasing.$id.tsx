import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import {
  Page,
  Layout,
  Card,
  DescriptionList,
  IndexTable,
  Badge,
  Button,
  Text,
} from "@shopify/polaris";

// ---------------------------------------------------------------------------
// Status badge tone mapping (matches app.purchasing.tsx)
// ---------------------------------------------------------------------------

const statusBadge: Record<string, "info" | "success" | "warning" | "critical"> = {
  DRAFT: "info",
  SENT: "warning",
  PARTIALLY_RECEIVED: "warning",
  RECEIVED: "success",
  CLOSED: "success",
  CANCELLED: "critical",
};

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const po = await prisma.purchaseOrder.findUnique({
    where: { id: params.id },
    include: {
      vendor: true,
      location: true,
      lineItems: {
        include: { inventoryItem: true },
      },
      receivingEvents: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!po) {
    throw new Response("Purchase order not found", { status: 404 });
  }

  return json({ po });
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PurchaseOrderDetail() {
  const { po } = useLoaderData<typeof loader>();

  const canReceive = po.status === "SENT" || po.status === "PARTIALLY_RECEIVED";

  // Compute totals
  const subtotal = po.lineItems.reduce(
    (sum, li) => sum + Number(li.unitCost) * li.quantity,
    0,
  );
  const shippingCost = Number(po.shippingCost ?? 0);
  const customsDuties = Number(po.customsDuties ?? 0);
  const otherCosts = Number(po.otherCosts ?? 0);
  const totalCost = subtotal + shippingCost + customsDuties + otherCosts;

  return (
    <Page
      title={`PO ${po.poNumber}`}
      breadcrumbs={[
        { content: "Purchasing", url: "/app/purchasing" },
        { content: po.poNumber },
      ]}
      primaryAction={
        canReceive
          ? {
              content: "Receive Shipment",
              url: `/app/purchasing/${po.id}/receive`,
            }
          : undefined
      }
    >
      <Layout>
        {/* ── PO Information ───────────────────────────────── */}
        <Layout.Section>
          <Card>
            <div className="p-4">
              <Text variant="headingMd" as="h2">
                Purchase Order Details
              </Text>
              <div className="mt-4">
                <DescriptionList
                  items={[
                    {
                      term: "PO Number",
                      description: <span className="font-mono">{po.poNumber}</span>,
                    },
                    { term: "Vendor", description: po.vendor.name },
                    { term: "Location", description: po.location.name },
                    {
                      term: "Status",
                      description: (
                        <Badge tone={statusBadge[po.status] || "info"}>
                          {po.status.replace(/_/g, " ")}
                        </Badge>
                      ),
                    },
                    {
                      term: "Expected Date",
                      description: po.expectedDate
                        ? new Date(po.expectedDate).toLocaleDateString()
                        : "—",
                    },
                    {
                      term: "Received Date",
                      description: po.receivedDate
                        ? new Date(po.receivedDate).toLocaleDateString()
                        : "—",
                    },
                  ]}
                />
              </div>
            </div>
          </Card>
        </Layout.Section>

        {/* ── Costs ────────────────────────────────────────── */}
        <Layout.Section>
          <Card>
            <div className="p-4">
              <Text variant="headingMd" as="h2">
                Costs
              </Text>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <Text variant="bodyMd" as="p">
                    Subtotal (line items)
                  </Text>
                  <Text variant="bodyMd" as="p">
                    ${subtotal.toFixed(2)}
                  </Text>
                </div>
                {shippingCost > 0 && (
                  <div className="flex justify-between">
                    <Text variant="bodyMd" as="p">
                      Shipping
                    </Text>
                    <Text variant="bodyMd" as="p">
                      ${shippingCost.toFixed(2)}
                    </Text>
                  </div>
                )}
                {customsDuties > 0 && (
                  <div className="flex justify-between">
                    <Text variant="bodyMd" as="p">
                      Customs Duties
                    </Text>
                    <Text variant="bodyMd" as="p">
                      ${customsDuties.toFixed(2)}
                    </Text>
                  </div>
                )}
                {otherCosts > 0 && (
                  <div className="flex justify-between">
                    <Text variant="bodyMd" as="p">
                      Other Costs
                    </Text>
                    <Text variant="bodyMd" as="p">
                      ${otherCosts.toFixed(2)}
                    </Text>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <Text variant="bodyMd" as="p">
                    Total
                  </Text>
                  <Text variant="bodyMd" as="p">
                    ${totalCost.toFixed(2)}
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </Layout.Section>

        {/* ── Line Items ───────────────────────────────────── */}
        <Layout.Section>
          <Card>
            <div className="p-4">
              <Text variant="headingMd" as="h2">
                Line Items
              </Text>
              <div className="mt-4">
                <IndexTable
                  resourceName={{ singular: "line item", plural: "line items" }}
                  itemCount={po.lineItems.length}
                  headings={[
                    { title: "Product" },
                    { title: "SKU" },
                    { title: "Qty Ordered", alignment: "end" },
                    { title: "Qty Received", alignment: "end" },
                    { title: "Unit Cost", alignment: "end" },
                    { title: "Landed Cost", alignment: "end" },
                    { title: "Status" },
                  ]}
                  selectable={false}
                >
                  {po.lineItems.map((li, index) => {
                    const itemStatus =
                      li.receivedQty >= li.quantity
                        ? "RECEIVED"
                        : li.receivedQty > 0
                          ? "PARTIAL"
                          : "PENDING";

                    return (
                      <IndexTable.Row key={li.id} id={li.id} position={index}>
                        <IndexTable.Cell>
                          <Link to={`/app/inventory/${li.inventoryItem.id}`}>
                            {li.inventoryItem.title}
                          </Link>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <span className="font-mono text-sm">
                            {li.inventoryItem.sku || "—"}
                          </span>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <span className="text-right">{li.quantity}</span>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <span className="text-right">{li.receivedQty}</span>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <span className="text-right">
                            ${Number(li.unitCost).toFixed(2)}
                          </span>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <span className="text-right">
                            {li.landedCost
                              ? `$${Number(li.landedCost).toFixed(2)}`
                              : "—"}
                          </span>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <Badge
                            tone={
                              itemStatus === "RECEIVED"
                                ? "success"
                                : itemStatus === "PARTIAL"
                                  ? "warning"
                                  : "info"
                            }
                          >
                            {itemStatus.replace(/_/g, " ")}
                          </Badge>
                        </IndexTable.Cell>
                      </IndexTable.Row>
                    );
                  })}
                </IndexTable>
              </div>
            </div>
          </Card>
        </Layout.Section>

        {/* ── Receiving History ────────────────────────────── */}
        {po.receivingEvents.length > 0 && (
          <Layout.Section>
            <Card>
              <div className="p-4">
                <Text variant="headingMd" as="h2">
                  Receiving History
                </Text>
                <div className="mt-4 space-y-3">
                  {po.receivingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 bg-gray-50 rounded"
                    >
                      <div className="flex justify-between items-center">
                        <Text variant="bodyMd" as="p">
                          Received by{" "}
                          <strong>{event.receivedBy}</strong>
                        </Text>
                        <Text variant="bodySm" as="p">
                          {new Date(event.createdAt).toLocaleString()}
                        </Text>
                      </div>
                      {event.notes && (
                        <Text variant="bodySm" as="p">
                          {event.notes}
                        </Text>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </Layout.Section>
        )}

        {/* ── Notes ────────────────────────────────────────── */}
        {po.notes && (
          <Layout.Section>
            <Card>
              <div className="p-4">
                <Text variant="headingMd" as="h2">
                  Notes
                </Text>
                <div className="mt-2">
                  <Text variant="bodyMd" as="p">
                    {po.notes}
                  </Text>
                </div>
              </div>
            </Card>
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
}
