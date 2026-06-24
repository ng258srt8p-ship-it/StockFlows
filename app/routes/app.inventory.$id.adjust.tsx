import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, Form, useNavigation } from "@remix-run/react";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import { requirePermission } from "~/lib/auth/middleware";
import { AdjustInventorySchema } from "~/lib/schemas/inventory";
import {
  Page,
  Layout,
  Card,
  TextField,
  Select,
  Button,
  Text,
  Banner,
} from "@shopify/polaris";
import { useState, useRef } from "react";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  await requirePermission(request, "inventory:write" as any);
  const { session } = await authenticate.admin(request);

  const item = await prisma.inventoryItem.findUnique({
    where: { id: params.id },
    include: { location: true },
  });

  if (!item) throw new Response("Not found", { status: 404 });
  return json({ item });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { user, shopId } = await requirePermission(request, "inventory:adjust" as any);
  const { admin, session } = await authenticate.admin(request);

  const formData = await request.formData();
  const result = AdjustInventorySchema.safeParse({
    inventoryItemId: params.id,
    locationId: formData.get("locationId"),
    quantityChange: Number(formData.get("quantityChange")),
    reason: formData.get("reason"),
    notes: formData.get("notes") || undefined,
  });

  if (!result.success) {
    return json({ errors: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const { inventoryItemId, locationId, quantityChange, reason, notes } = result.data;

  // Get the item to find shopify IDs
  const item = await prisma.inventoryItem.findUnique({ where: { id: inventoryItemId } });
  if (!item) return json({ errors: { form: "Item not found" } }, { status: 404 });

  // Generate idempotency key
  const idempotencyKey = `adjust-${inventoryItemId}-${Date.now()}-${reason}`;

  // Call Shopify GraphQL inventoryAdjustQuantities
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
          reason,
          name: "available",
          referenceDocumentUri: `stockflows://adjust/${reason}/${inventoryItemId}`,
          changes: [
            {
              delta: quantityChange,
              inventoryItemId: item.shopifyVariantId.startsWith("gid://")
                ? item.shopifyVariantId
                : `gid://shopify/InventoryItem/${item.shopifyVariantId}`,
              locationId: item.locationId.startsWith("gid://")
                ? item.locationId
                : `gid://shopify/Location/${item.locationId}`,
            },
          ],
        },
        idempotencyKey,
      },
    }
  );

  const responseJson = await response.json();

  if (responseJson.data?.inventoryAdjustQuantities?.userErrors?.length > 0) {
    return json(
      { errors: { form: responseJson.data.inventoryAdjustQuantities.userErrors[0].message } },
      { status: 400 }
    );
  }

  // Update local DB
  const newQty = item.quantity + quantityChange;
  await prisma.inventoryItem.update({
    where: { id: inventoryItemId },
    data: {
      quantity: newQty,
      available: Math.max(0, newQty - item.reserved),
    },
  });

  // Record movement
  const typeMap: Record<string, any> = {
    correction: "ADJUSTMENT",
    cycle_count: "CYCLE_COUNT",
    damage: "DAMAGE",
    return: "RETURN",
    receiving: "RECEIVING",
  };

  await prisma.stockMovement.create({
    data: {
      inventoryItemId,
      locationId: item.locationId,
      type: typeMap[reason] || "ADJUSTMENT",
      quantityChange,
      reference: `adjust-${reason}`,
      notes,
      createdBy: user.shopifyUserId,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      shopId,
      userId: user.id,
      action: "inventory.adjust",
      entityType: "InventoryItem",
      entityId: inventoryItemId,
      oldValue: { quantity: item.quantity },
      newValue: { quantity: newQty, reason, notes },
    },
  });

  return redirect(`/app/inventory/${inventoryItemId}`);
};

export default function AdjustInventory() {
  const { item } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>() as Record<string, any> | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [reason, setReason] = useState("correction");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <Page
      title="Adjust Inventory"
      subtitle={`${item.title} — ${item.location.name}`}
      breadcrumbs={[{ content: "Inventory", url: "/app/inventory" }, { content: item.title, url: `/app/inventory/${item.id}` }]}
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

              <div className="mb-4 p-3 bg-gray-50 rounded">
                <Text variant="headingSm" as="p">
                  Current stock: <strong>{item.quantity}</strong> units
                </Text>
              </div>

              <Form method="post">
                <input type="hidden" name="locationId" value={item.locationId} />

                <div className="space-y-4">
                  <TextField
                    name="quantityChange"
                    label="Quantity adjustment"
                    type="number"
                    value={quantity}
                    onChange={(val) => setQuantity(val)}
                    autoComplete="off"
                    helpText="Positive to add stock, negative to remove"
                    error={actionData?.errors?.quantityChange?.[0]}
                  />

                  <Select
                    name="reason"
                    label="Reason"
                    options={[
                      { label: "Correction", value: "correction" },
                      { label: "Cycle Count", value: "cycle_count" },
                      { label: "Damage", value: "damage" },
                      { label: "Return", value: "return" },
                      { label: "Receiving", value: "receiving" },
                    ]}
                    value={reason}
                    onChange={setReason}
                  />

                  <TextField
                    name="notes"
                    label="Notes"
                    value={notes}
                    onChange={(val) => setNotes(val)}
                    autoComplete="off"
                    multiline={3}
                    placeholder="Optional notes about this adjustment"
                  />

                  <div className="flex gap-2">
                    <Button submit primary loading={isSubmitting}>
                      {isSubmitting ? "Adjusting..." : "Save Adjustment"}
                    </Button>
                    <Button url={`/app/inventory/${item.id}`}>Cancel</Button>
                  </div>
                </div>
              </Form>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
