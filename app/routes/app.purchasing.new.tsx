import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { useState, useCallback } from "react";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Select,
  Button,
  Banner,
  IndexTable,
  Text,
} from "@shopify/polaris";
import { authenticate } from "~/lib/shopify/server";
import { requirePermission } from "~/lib/auth/middleware";
import { prisma } from "~/lib/db/client";
import { CreatePurchaseOrderSchema } from "~/lib/schemas/inventory";
import { Permission } from "~/lib/auth/permissions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LineItemDraft {
  inventoryItemId: string;
  quantity: string;
  unitCost: string;
}

interface ActionErrors {
  form?: string;
  vendorId?: string[];
  locationId?: string[];
  poNumber?: string[];
  expectedDate?: string[];
  notes?: string[];
  lineItems?: string[];
}

// ---------------------------------------------------------------------------
// Loader -- fetch vendors, locations, and inventory items for the shop
// ---------------------------------------------------------------------------

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requirePermission(request, Permission.PURCHASING_WRITE);
  const { session } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { shopifyDomain: session.shop },
  });
  if (!shop) {
    return json({ vendors: [], locations: [], items: [], nextPoNumber: "PO-0001" });
  }

  const [vendors, locations, items] = await Promise.all([
    prisma.vendor.findMany({
      where: { shopId: shop.id, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      where: { shopId: shop.id, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.inventoryItem.findMany({
      where: { shopId: shop.id },
      orderBy: { title: "asc" },
    }),
  ]);

  // Auto-generate next PO number
  const lastPO = await prisma.purchaseOrder.findFirst({
    where: { shopId: shop.id },
    orderBy: { createdAt: "desc" },
    select: { poNumber: true },
  });

  let nextPoNumber = "PO-0001";
  if (lastPO) {
    const match = lastPO.poNumber.match(/^PO-(\d+)$/);
    if (match) {
      const next = parseInt(match[1], 10) + 1;
      nextPoNumber = `PO-${String(next).padStart(4, "0")}`;
    } else {
      nextPoNumber = `PO-${Date.now()}`;
    }
  }

  return json({ vendors, locations, items, nextPoNumber });
};

// ---------------------------------------------------------------------------
// Action -- validate and create PO with line items
// ---------------------------------------------------------------------------

export const action = async ({ request }: ActionFunctionArgs) => {
  const { user, shopId } = await requirePermission(request, Permission.PURCHASING_WRITE);

  const formData = await request.formData();

  // Collect line items from form data (indexed by position)
  const rawLineItems: {
    inventoryItemId: string;
    quantity: string;
    unitCost: string;
    notes: string;
  }[] = [];

  let i = 0;
  while (formData.has(`lineItems[${i}].inventoryItemId`)) {
    rawLineItems.push({
      inventoryItemId: String(formData.get(`lineItems[${i}].inventoryItemId`) ?? ""),
      quantity: String(formData.get(`lineItems[${i}].quantity`) ?? "0"),
      unitCost: String(formData.get(`lineItems[${i}].unitCost`) ?? "0"),
      notes: String(formData.get(`lineItems[${i}].notes`) ?? ""),
    });
    i++;
  }

  const result = CreatePurchaseOrderSchema.safeParse({
    vendorId: formData.get("vendorId"),
    locationId: formData.get("locationId"),
    poNumber: formData.get("poNumber"),
    expectedDate: formData.get("expectedDate") || undefined,
    notes: formData.get("notes") || undefined,
    lineItems: rawLineItems,
  });

  if (!result.success) {
    return json(
      { errors: result.error.flatten().fieldErrors as ActionErrors },
      { status: 400 },
    );
  }

  const data = result.data;

  // Create PO + line items in a single transaction
  await prisma.$transaction(async (tx) => {
    const po = await tx.purchaseOrder.create({
      data: {
        shopId,
        vendorId: data.vendorId,
        locationId: data.locationId,
        poNumber: data.poNumber,
        status: "DRAFT",
        expectedDate: data.expectedDate ?? null,
        shippingCost: data.shippingCost,
        customsDuties: data.customsDuties,
        otherCosts: data.otherCosts,
        notes: data.notes,
        createdBy: user.id,
      },
    });

    await tx.pOLineItem.createMany({
      data: data.lineItems.map((li) => ({
        poId: po.id,
        inventoryItemId: li.inventoryItemId,
        quantity: li.quantity,
        unitCost: li.unitCost,
        notes: li.notes,
      })),
    });
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      shopId,
      userId: user.id,
      action: "purchasing.create",
      entityType: "PurchaseOrder",
      entityId: "",
      newValue: {
        poNumber: data.poNumber,
        vendorId: data.vendorId,
        locationId: data.locationId,
        lineItemCount: data.lineItems.length,
      },
    },
  });

  return redirect("/app/purchasing");
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function NewPurchaseOrder() {
  const { vendors, locations, items, nextPoNumber } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([
    { inventoryItemId: "", quantity: "1", unitCost: "0.00" },
  ]);

  // Filter inventory items to the selected location
  const filteredItems = selectedLocationId
    ? items.filter((item) => item.locationId === selectedLocationId)
    : items;

  const itemOptions = filteredItems.map((item) => ({
    label: item.sku ? `${item.title} (${item.sku})` : item.title,
    value: item.id,
  }));

  const addLineItem = useCallback(() => {
    setLineItems((prev) => [
      ...prev,
      { inventoryItemId: "", quantity: "1", unitCost: "0.00" },
    ]);
  }, []);

  const removeLineItem = useCallback((index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateLineItem = useCallback(
    (index: number, field: keyof LineItemDraft, value: string) => {
      setLineItems((prev) =>
        prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
      );
    },
    [],
  );

  return (
    <Page
      title="Create Purchase Order"
      breadcrumbs={[
        { content: "Purchasing", url: "/app/purchasing" },
        { content: "New PO" },
      ]}
    >
      <Layout>
        <Layout.Section>
          <Form method="post">
            <input type="hidden" name="poNumber" value={nextPoNumber} />

            {actionData?.errors?.form && (
              <div className="mb-4">
                <Banner tone="critical">
                  <p>{actionData.errors.form}</p>
                </Banner>
              </div>
            )}

            {/* ── PO Details ───────────────────────────────── */}
            <Card title="PO Details">
              <div className="p-4">
                <FormLayout>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <TextField
                        name="poNumber"
                        label="PO Number"
                        value={nextPoNumber}
                        readOnly
                        helpText="Auto-generated"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Select
                        name="vendorId"
                        label="Vendor"
                        options={[
                          { label: "Select a vendor", value: "" },
                          ...vendors.map((v) => ({ label: v.name, value: v.id })),
                        ]}
                        value={""}
                        error={actionData?.errors?.vendorId?.[0]}
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <Select
                        name="locationId"
                        label="Location"
                        options={[
                          { label: "Select a location", value: "" },
                          ...locations.map((l) => ({
                            label: l.name,
                            value: l.id,
                          })),
                        ]}
                        value={selectedLocationId}
                        onChange={(value) => setSelectedLocationId(value)}
                        error={actionData?.errors?.locationId?.[0]}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <TextField
                        name="expectedDate"
                        label="Expected Date"
                        type="date"
                        value=""
                        onChange={() => {}}
                        error={actionData?.errors?.expectedDate?.[0]}
                      />
                    </div>
                  </div>

                  <TextField
                    name="notes"
                    label="Notes"
                    value={notes}
                    onChange={(val) => setNotes(val)}
                    multiline={3}
                    placeholder="Optional notes about this purchase order"
                    error={actionData?.errors?.notes?.[0]}
                  />
                </FormLayout>
              </div>
            </Card>

            {/* ── Line Items ───────────────────────────────── */}
            <div className="mt-4">
              <Card title="Line Items">
                <div className="p-4">
                  {actionData?.errors?.lineItems && (
                    <div className="mb-4">
                      <Banner tone="critical">
                        <p>{actionData.errors.lineItems[0]}</p>
                      </Banner>
                    </div>
                  )}

                  {!selectedLocationId && (
                    <div className="mb-4">
                      <Banner tone="info">
                        <p>
                          Select a location above to filter inventory items for
                          line items.
                        </p>
                      </Banner>
                    </div>
                  )}

                  <IndexTable
                    resourceName={{
                      singular: "line item",
                      plural: "line items",
                    }}
                    itemCount={lineItems.length}
                    headings={[
                      { title: "Inventory Item" },
                      { title: "Quantity", alignment: "end" },
                      { title: "Unit Cost", alignment: "end" },
                      { title: "", alignment: "end" },
                    ]}
                    selectable={false}
                  >
                    {lineItems.map((lineItem, index) => (
                      <IndexTable.Row
                        key={index}
                        id={`line-${index}`}
                        position={index}
                      >
                        <IndexTable.Cell>
                          <input
                            type="hidden"
                            name={`lineItems[${index}].inventoryItemId`}
                            value={lineItem.inventoryItemId}
                          />
                          <input
                            type="hidden"
                            name={`lineItems[${index}].quantity`}
                            value={lineItem.quantity}
                          />
                          <input
                            type="hidden"
                            name={`lineItems[${index}].unitCost`}
                            value={lineItem.unitCost}
                          />
                          <input
                            type="hidden"
                            name={`lineItems[${index}].notes`}
                            value=""
                          />
                          <Select
                            options={[
                              { label: "Select item", value: "" },
                              ...itemOptions,
                            ]}
                            value={lineItem.inventoryItemId}
                            onChange={(value) =>
                              updateLineItem(index, "inventoryItemId", value)
                            }
                          />
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <TextField
                            name={`quantity-${index}`}
                            value={lineItem.quantity}
                            onChange={(value) =>
                              updateLineItem(index, "quantity", value)
                            }
                            type="number"
                          />
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <TextField
                            name={`unitCost-${index}`}
                            value={lineItem.unitCost}
                            onChange={(value) =>
                              updateLineItem(index, "unitCost", value)
                            }
                            type="number"
                          />
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <Button
                            variant="slim"
                            destructive
                            onClick={() => removeLineItem(index)}
                            disabled={lineItems.length === 1}
                          >
                            Remove
                          </Button>
                        </IndexTable.Cell>
                      </IndexTable.Row>
                    ))}
                  </IndexTable>

                  <div className="mt-3">
                    <Button onClick={addLineItem} disabled={!selectedLocationId}>
                      Add Line Item
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* ── Actions ──────────────────────────────────── */}
            <div className="mt-4">
              <Layout.Section>
                <div className="flex gap-2">
                  <Button submit primary loading={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Purchase Order"}
                  </Button>
                  <Button url="/app/purchasing">Cancel</Button>
                </div>
              </Layout.Section>
            </div>
          </Form>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
