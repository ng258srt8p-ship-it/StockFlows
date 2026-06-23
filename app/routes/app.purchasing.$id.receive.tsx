import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  useLoaderData,
  useActionData,
  Form,
  useNavigation,
} from "@remix-run/react";
import { useState, useCallback } from "react";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import { requirePermission } from "~/lib/auth/middleware";
import { BarcodeScanner } from "~/components/receiving/BarcodeScanner";
import {
  Page,
  Layout,
  Card,
  TextField,
  Button,
  Banner,
  Badge,
  Checkbox,
  Text,
} from "@shopify/polaris";

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
    },
  });

  if (!po) {
    throw new Response("Purchase order not found", { status: 404 });
  }

  if (po.status !== "SENT" && po.status !== "PARTIALLY_RECEIVED") {
    throw new Response("This purchase order cannot be received in its current status.", {
      status: 400,
    });
  }

  return json({ po });
};

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { user, shopId, admin } = await requirePermission(
    request,
    "purchasing:receive" as any,
  );

  const po = await prisma.purchaseOrder.findUnique({
    where: { id: params.id },
    include: {
      lineItems: { include: { inventoryItem: true } },
    },
  });

  if (!po) {
    return json({ errors: { form: "Purchase order not found." } }, { status: 404 });
  }

  if (po.status !== "SENT" && po.status !== "PARTIALLY_RECEIVED") {
    return json(
      { errors: { form: "This purchase order cannot be received in its current status." } },
      { status: 400 },
    );
  }

  // Parse form data to get receiving quantities for each line item
  const receivedItems: { lineItemId: string; quantity: number }[] = [];
  let hasErrors = false;
  const errors: Record<string, string> = {};
  const parsedFormData = await request.clone().formData();

  for (const li of po.lineItems) {
    const rawQty = parsedFormData.get(`qty_${li.id}`) as string | null;
    const qty = parseInt(rawQty ?? "0", 10);

    if (isNaN(qty) || qty < 0) {
      errors[`qty_${li.id}`] = "Must be a non-negative number.";
      hasErrors = true;
      continue;
    }

    const remaining = li.quantity - li.receivedQty;
    if (qty > remaining) {
      errors[`qty_${li.id}`] = `Cannot receive more than ${remaining} (remaining).`;
      hasErrors = true;
      continue;
    }

    if (qty > 0) {
      receivedItems.push({ lineItemId: li.id, quantity: qty });
    }
  }

  if (hasErrors) {
    return json({ errors }, { status: 400 });
  }

  if (receivedItems.length === 0) {
    return json(
      { errors: { form: "No quantities entered. Please specify items to receive." } },
      { status: 400 },
    );
  }

  // Process each received line item
  const receivingEventLineItems: Record<string, number> = {};

  for (const received of receivedItems) {
    const li = po.lineItems.find((l) => l.id === received.lineItemId)!;

    // Update the POLineItem receivedQty
    const newReceivedQty = li.receivedQty + received.quantity;
    await prisma.pOLineItem.update({
      where: { id: li.id },
      data: { receivedQty: newReceivedQty },
    });

    receivingEventLineItems[li.id] = received.quantity;

    // Update local inventory count
    const item = li.inventoryItem;
    const newQuantity = item.quantity + received.quantity;
    const newAvailable = Math.max(0, newQuantity - item.reserved);

    await prisma.inventoryItem.update({
      where: { id: item.id },
      data: {
        quantity: newQuantity,
        available: newAvailable,
      },
    });

    // Update Shopify inventory via GraphQL
    const idempotencyKey = `receive-${po.id}-${li.id}-${Date.now()}`;

    const response = await admin.graphql(
      `mutation inventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!, $idempotencyKey: String!) {
        inventoryAdjustQuantities(input: $input) @idempotent(key: $idempotencyKey) {
          inventoryAdjustmentGroup {
            createdAt
            reason
            changes { name delta }
          }
          userErrors { field message }
        }
      }`,
      {
        variables: {
          input: {
            reason: "RECEIVING",
            name: "available",
            referenceDocumentUri: `stockflows://receive/${po.id}/${li.id}`,
            changes: [
              {
                delta: received.quantity,
                inventoryItemId: item.shopifyVariantId.startsWith("gid://")
                  ? item.shopifyVariantId
                  : `gid://shopify/InventoryItem/${item.shopifyVariantId}`,
                locationId: po.locationId.startsWith("gid://")
                  ? po.locationId
                  : `gid://shopify/Location/${po.locationId}`,
              },
            ],
          },
          idempotencyKey,
        },
      },
    );

    const responseJson = await response.json();

    if (responseJson.data?.inventoryAdjustQuantities?.userErrors?.length > 0) {
      return json(
        {
          errors: {
            form: `Shopify error: ${responseJson.data.inventoryAdjustQuantities.userErrors[0].message}`,
          },
        },
        { status: 400 },
      );
    }

    // Record stock movement
    await prisma.stockMovement.create({
      data: {
        inventoryItemId: item.id,
        locationId: po.locationId,
        type: "RECEIVING",
        quantityChange: received.quantity,
        reference: `PO ${po.poNumber} - Line ${li.id}`,
        notes: `Received ${received.quantity} units from PO ${po.poNumber}`,
        createdBy: user.shopifyUserId,
      },
    });
  }

  // Create ReceivingEvent
  await prisma.receivingEvent.create({
    data: {
      poId: po.id,
      lineItems: receivingEventLineItems,
      receivedBy: user.email,
      notes: `Received ${receivedItems.length} line item(s)`,
    },
  });

  // Determine new PO status
  const updatedLineItems = await prisma.pOLineItem.findMany({
    where: { poId: po.id },
  });

  const allFullyReceived = updatedLineItems.every((li) => li.receivedQty >= li.quantity);
  const anyPartiallyReceived = updatedLineItems.some((li) => li.receivedQty > 0);

  const newStatus = allFullyReceived
    ? "RECEIVED"
    : anyPartiallyReceived
      ? "PARTIALLY_RECEIVED"
      : po.status;

  const updateData: Record<string, any> = { status: newStatus };
  if (allFullyReceived) {
    updateData.receivedDate = new Date();
  }

  await prisma.purchaseOrder.update({
    where: { id: po.id },
    data: updateData,
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      shopId,
      userId: user.id,
      action: "purchaseOrder.receive",
      entityType: "PurchaseOrder",
      entityId: po.id,
      oldValue: { status: po.status },
      newValue: {
        status: newStatus,
        receivedItems: receivedItems.map((r) => ({
          lineItemId: r.lineItemId,
          quantity: r.quantity,
        })),
      },
    },
  });

  return redirect(`/app/purchasing/${po.id}`);
};

// ---------------------------------------------------------------------------
// Helper to read form data from a Request (used in action)
// ---------------------------------------------------------------------------

async function formData_get(request: Request, key: string): Promise<string | null> {
  const formData = await request.clone().formData();
  return formData.get(key) as string | null;
}

// Synchronous wrapper for use in loops where the formData is already parsed
function getFormValue(formData: FormData, key: string): string | null {
  return formData.get(key) as string | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReceiveShipment() {
  const { po } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [scannerActive, setScannerActive] = useState(false);

  // Track quantities locally for the scanner auto-fill feature
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const li of po.lineItems) {
      initial[li.id] = 0;
    }
    return initial;
  });

  const handleBarcodeScan = useCallback(
    (barcode: string) => {
      // Find the line item whose inventory item barcode matches
      const matched = po.lineItems.find(
        (li) => li.inventoryItem.barcode === barcode,
      );
      if (!matched) return;

      const remaining = matched.quantity - matched.receivedQty;
      const current = quantities[matched.id] || 0;

      if (current < remaining) {
        setQuantities((prev) => ({
          ...prev,
          [matched.id]: current + 1,
        }));
      }
    },
    [po.lineItems, quantities],
  );

  const getRemaining = (li: (typeof po.lineItems)[number]) =>
    li.quantity - li.receivedQty;

  return (
    <Page
      title={`Receive Shipment — ${po.poNumber}`}
      breadcrumbs={[
        { content: "Purchasing", url: "/app/purchasing" },
        { content: po.poNumber, url: `/app/purchasing/${po.id}` },
        { content: "Receive" },
      ]}
    >
      <Layout>
        {/* ── Scanner ──────────────────────────────────────── */}
        <Layout.Section>
          <div className="flex items-center justify-between mb-2">
            <Text variant="headingMd" as="h2">
              Barcode Scanner
            </Text>
            <Button
              size="slim"
              onClick={() => setScannerActive((prev) => !prev)}
            >
              {scannerActive ? "Disable Scanner" : "Enable Scanner"}
            </Button>
          </div>
          <BarcodeScanner
            onScan={handleBarcodeScan}
            isActive={scannerActive}
          />
        </Layout.Section>

        {/* ── Receiving Form ───────────────────────────────── */}
        <Layout.Section>
          <Card>
            <div className="p-4">
              {actionData?.errors?.form && (
                <Banner tone="critical">
                  <p>{actionData.errors.form}</p>
                </Banner>
              )}

              <Text variant="headingMd" as="h2">
                Line Items to Receive
              </Text>
              <Text variant="bodySm" as="p">
                Enter the quantity you are receiving for each item. You can also
                use the barcode scanner above to increment quantities
                automatically.
              </Text>

              <Form method="post" className="mt-4">
                {po.lineItems.map((li) => {
                  const remaining = getRemaining(li);
                  const fullyReceived = li.receivedQty >= li.quantity;
                  const qty = quantities[li.id] || 0;
                  const hasError = actionData?.errors?.[`qty_${li.id}`];

                  return (
                    <div
                      key={li.id}
                      className="p-4 border rounded mb-3"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Text variant="bodyMd" as="p" fontWeight="semibold">
                            {li.inventoryItem.title}
                          </Text>
                          <div className="flex gap-2 mt-1">
                            {li.inventoryItem.sku && (
                              <Text variant="bodySm" as="p">
                                SKU: {li.inventoryItem.sku}
                              </Text>
                            )}
                            {li.inventoryItem.barcode && (
                              <Text variant="bodySm" as="p">
                                Barcode: {li.inventoryItem.barcode}
                              </Text>
                            )}
                          </div>
                        </div>
                        {fullyReceived ? (
                          <Badge tone="success">Fully Received</Badge>
                        ) : li.receivedQty > 0 ? (
                          <Badge tone="warning">
                            Partial ({li.receivedQty}/{li.quantity})
                          </Badge>
                        ) : (
                          <Badge tone="info">Pending</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4 items-end">
                        <div>
                          <Text variant="bodySm" as="p">
                            Ordered: {li.quantity}
                          </Text>
                          <Text variant="bodySm" as="p">
                            Already Received: {li.receivedQty}
                          </Text>
                          <Text variant="bodySm" as="p">
                            Remaining: {remaining}
                          </Text>
                        </div>

                        <div>
                          <input type="hidden" name={`lineItemId_${li.id}`} value={li.id} />
                          <TextField
                            name={`qty_${li.id}`}
                            label="Receiving Now"
                            type="number"
                            value={String(qty)}
                            onChange={(val) => {
                              const num = parseInt(val, 10);
                              setQuantities((prev) => ({
                                ...prev,
                                [li.id]: isNaN(num) ? 0 : Math.max(0, Math.min(num, remaining)),
                              }));
                            }}
                            error={hasError}
                            min={0}
                            max={remaining}
                            disabled={fullyReceived}
                            autoComplete="off"
                          />
                        </div>

                        <div className="text-right">
                          <Text variant="bodyMd" as="p">
                            Unit Cost: ${Number(li.unitCost).toFixed(2)}
                          </Text>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="flex gap-2 mt-4">
                  <Button
                    submit
                    primary
                    loading={isSubmitting}
                    disabled={
                      isSubmitting ||
                      Object.values(quantities).every((q) => q === 0)
                    }
                  >
                    {isSubmitting ? "Receiving..." : "Confirm Receipt"}
                  </Button>
                  <Button url={`/app/purchasing/${po.id}`}>Cancel</Button>
                </div>
              </Form>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
