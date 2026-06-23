import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  Form,
  useNavigation,
} from "@remix-run/react";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import { requirePermission } from "~/lib/auth/middleware";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Select,
  Button,
  Banner,
  Text,
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import type { InventoryItem, Location } from "@prisma/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type InventoryItemWithLocation = InventoryItem & { location: Location };

interface TransferLineItem {
  inventoryItemId: string;
  quantity: number;
}

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requirePermission(request, "inventory:write" as any);
  const { session } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { shopifyDomain: session.shop },
  });
  if (!shop) return json({ locations: [], items: [] });

  const [locations, items] = await Promise.all([
    prisma.location.findMany({
      where: { shopId: shop.id, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.inventoryItem.findMany({
      where: { shopId: shop.id },
      include: { location: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return json({ locations, items });
};

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

const TRANSFER_AUTO_APPROVE_THRESHOLD = 50;

export const action = async ({ request }: ActionFunctionArgs) => {
  const { user, shopId } = await requirePermission(request, "inventory:write" as any);
  const { session } = await authenticate.admin(request);

  const formData = await request.formData();

  const fromLocationId = formData.get("fromLocationId") as string | null;
  const toLocationId = formData.get("toLocationId") as string | null;
  const notes = (formData.get("notes") as string) || null;

  // Collect line items from form fields named lineItem_N__inventoryItemId and lineItem_N__quantity
  const lineItems: TransferLineItem[] = [];
  const lineItemKeys = Array.from(formData.keys()).filter((k) =>
    k.match(/^lineItem_\d+__inventoryItemId$/),
  );

  for (const key of lineItemKeys) {
    const match = key.match(/^lineItem_(\d+)__inventoryItemId$/);
    if (!match) continue;
    const idx = match[1];
    const itemId = formData.get(key) as string | null;
    const qtyRaw = formData.get(`lineItem_${idx}__quantity`) as string | null;

    if (itemId && qtyRaw) {
      const quantity = parseInt(qtyRaw, 10);
      if (!isNaN(quantity) && quantity > 0) {
        lineItems.push({ inventoryItemId: itemId, quantity });
      }
    }
  }

  // Validate
  const errors: Record<string, string> = {};

  if (!fromLocationId) {
    errors.fromLocationId = "Source location is required.";
  }
  if (!toLocationId) {
    errors.toLocationId = "Destination location is required.";
  }
  if (fromLocationId && toLocationId && fromLocationId === toLocationId) {
    errors.toLocationId = "Destination must be different from the source location.";
  }
  if (lineItems.length === 0) {
    errors.lineItems = "Add at least one line item to transfer.";
  }

  if (Object.keys(errors).length > 0) {
    return json({ errors }, { status: 400 });
  }

  // Calculate total units across all line items
  const totalUnits = lineItems.reduce((sum, li) => sum + li.quantity, 0);

  // Determine initial status: auto-approve small transfers
  const status =
    totalUnits < TRANSFER_AUTO_APPROVE_THRESHOLD ? "APPROVED" : "PENDING";

  const transfer = await prisma.stockTransfer.create({
    data: {
      shopId,
      fromLocationId: fromLocationId!,
      toLocationId: toLocationId!,
      status: status as any,
      lineItems: lineItems as any,
      notes,
      requestedBy: user.shopifyUserId,
      approvedBy: status === "APPROVED" ? user.shopifyUserId : null,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      shopId,
      userId: user.id,
      action: "inventory.transfer.create",
      entityType: "StockTransfer",
      entityId: transfer.id,
      newValue: {
        fromLocationId,
        toLocationId,
        totalUnits,
        status,
        lineItemCount: lineItems.length,
      },
    },
  });

  return redirect("/app/inventory");
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const AUTO_APPROVE_THRESHOLD = TRANSFER_AUTO_APPROVE_THRESHOLD;

export default function InventoryTransfer() {
  const { locations, items } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [fromLocationId, setFromLocationId] = useState("");
  const [toLocationId, setToLocationId] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<TransferLineItem[]>([
    { inventoryItemId: "", quantity: 1 },
  ]);

  // Items available at the selected "from" location
  const availableItems = (items as any[]).filter(
    (item: any) =>
      item.locationId === fromLocationId && item.quantity > 0,
  );

  const addItem = useCallback(() => {
    setLineItems((prev) => [
      ...prev,
      { inventoryItemId: "", quantity: 1 },
    ]);
  }, []);

  const removeItem = useCallback((index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateLineItem = useCallback(
    (index: number, field: keyof TransferLineItem, value: string | number) => {
      setLineItems((prev) =>
        prev.map((li, i) =>
          i === index ? { ...li, [field]: value } : li,
        ),
      );
    },
    [],
  );

  const totalUnits = lineItems.reduce((sum, li) => sum + (li.quantity || 0), 0);
  const willAutoApprove = totalUnits > 0 && totalUnits < AUTO_APPROVE_THRESHOLD;

  const locationOptions = (locations as any[]).map((l: any) => ({
    label: l.name,
    value: l.id,
  }));

  return (
    <Page
      title="Transfer Inventory"
      subtitle="Move stock from one location to another"
      breadcrumbs={[
        { content: "Inventory", url: "/app/inventory" },
        { content: "Transfer" },
      ]}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <div className="p-4">
              {actionData?.errors?.form && (
                <Banner tone="critical">
                  <p>{actionData.errors.form}</p>
                </Banner>
              )}

              {willAutoApprove && (
                <Banner tone="success">
                  <p>
                    This transfer totals {totalUnits} units and will be{" "}
                    <strong>auto-approved</strong> (under {AUTO_APPROVE_THRESHOLD} unit
                    threshold).
                  </p>
                </Banner>
              )}

              <Form method="post">
                <FormLayout>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Select
                        name="fromLocationId"
                        label="From Location"
                        options={[
                          { label: "Select source location...", value: "" },
                          ...locationOptions,
                        ]}
                        value={fromLocationId}
                        onChange={(value) => {
                          setFromLocationId(value);
                          // Reset line items when source changes
                          setLineItems([{ inventoryItemId: "", quantity: 1 }]);
                        }}
                        error={actionData?.errors?.fromLocationId}
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <Select
                        name="toLocationId"
                        label="To Location"
                        options={[
                          { label: "Select destination...", value: "" },
                          ...locationOptions.filter(
                            (o: { label: string; value: string }) =>
                              o.value !== fromLocationId,
                          ),
                        ]}
                        value={toLocationId}
                        onChange={setToLocationId}
                        error={actionData?.errors?.toLocationId}
                        required
                      />
                    </div>
                  </div>

                  {/* Line items section */}
                  <div>
                    <Text variant="headingSm" as="h3">
                      Line Items
                    </Text>
                    {actionData?.errors?.lineItems && (
                      <Banner tone="critical">
                        <p>{actionData.errors.lineItems}</p>
                      </Banner>
                    )}

                    {lineItems.map((li, index) => {
                      const itemOptions = (items as any[])
                        .filter(
                          (item: any) =>
                            item.locationId === fromLocationId &&
                            item.quantity > 0,
                        )
                        .map((item: any) => ({
                          label: `${item.title}${item.sku ? ` (${item.sku})` : ""} — ${item.quantity} available`,
                          value: item.id,
                        }));

                      return (
                        <div
                          key={index}
                          className="flex gap-2 items-end mb-2"
                        >
                          <input
                            type="hidden"
                            name={`lineItem_${index}__inventoryItemId`}
                            value={li.inventoryItemId}
                          />
                          <div className="flex-1">
                            <Select
                              label={index === 0 ? "Inventory Item" : undefined}
                              options={[
                                { label: "Select item...", value: "" },
                                ...itemOptions,
                              ]}
                              value={li.inventoryItemId}
                              onChange={(value) =>
                                updateLineItem(index, "inventoryItemId", value)
                              }
                              disabled={!fromLocationId}
                              required
                            />
                          </div>
                          <div style={{ width: 120 }}>
                            <TextField
                              name={`lineItem_${index}__quantity`}
                              label={index === 0 ? "Quantity" : undefined}
                              value={String(li.quantity)}
                              onChange={(value) =>
                                updateLineItem(
                                  index,
                                  "quantity",
                                  parseInt(value, 10) || 0,
                                )
                              }
                              required
                            />
                          </div>
                          {lineItems.length > 1 && (
                            <div style={{ paddingBottom: 2 }}>
                              <Button
                                onClick={() => removeItem(index)}
                                variant="tertiary"
                                tone="critical"
                              >
                                Remove
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <div className="mt-2">
                      <Button onClick={addItem} variant="secondary">
                        Add Line Item
                      </Button>
                    </div>
                  </div>

                  {/* Summary */}
                  {totalUnits > 0 && (
                    <div className="p-3 bg-gray-50 rounded">
                      <Text variant="headingSm" as="p">
                        Total units to transfer: <strong>{totalUnits}</strong>
                      </Text>
                    </div>
                  )}

                  <TextField
                    name="notes"
                    label="Notes"
                    value={notes}
                    onChange={(val, _id) => setNotes(val)}
                    multiline={3}
                    placeholder="Optional notes about this transfer"
                  />

                  <div className="flex gap-2">
                    <Button submit primary loading={isSubmitting}>
                      {isSubmitting
                        ? "Creating Transfer..."
                        : willAutoApprove
                          ? "Create & Auto-Approve Transfer"
                          : "Create Transfer"}
                    </Button>
                    <Button url="/app/inventory">Cancel</Button>
                  </div>
                </FormLayout>
              </Form>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
