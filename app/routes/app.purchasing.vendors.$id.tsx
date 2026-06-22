import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  useLoaderData,
  useActionData,
  useNavigation,
  Form,
} from "@remix-run/react";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  DescriptionList,
  Banner,
  Badge,
  Text,
  IndexTable,
} from "@shopify/polaris";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const vendor = await prisma.vendor.findUnique({
    where: { id: params.id },
  });

  if (!vendor) {
    throw new Response("Vendor not found", { status: 404 });
  }

  const purchaseOrders = await prisma.purchaseOrder.findMany({
    where: { vendorId: vendor.id },
    include: { location: true, lineItems: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return json({ vendor, purchaseOrders });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { shopifyDomain: session.shop },
  });
  if (!shop) {
    return json({ errors: { form: "Shop not found" } }, { status: 404 });
  }

  const formData = await request.formData();

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const contactPerson = String(formData.get("contactPerson") || "").trim();
  const leadTimeDays = parseInt(String(formData.get("leadTimeDays") || "7"), 10);
  const reliabilityScore = parseFloat(String(formData.get("reliabilityScore") || "1.0"));
  const paymentTerms = String(formData.get("paymentTerms") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const isActive = formData.get("isActive") === "on";

  if (!name) {
    return json(
      { errors: { name: "Vendor name is required" } },
      { status: 400 },
    );
  }

  // Verify vendor belongs to this shop
  const existing = await prisma.vendor.findFirst({
    where: { id: params.id, shopId: shop.id },
  });
  if (!existing) {
    throw new Response("Vendor not found", { status: 404 });
  }

  try {
    await prisma.vendor.update({
      where: { id: params.id },
      data: {
        name,
        email: email || null,
        phone: phone || null,
        contactPerson: contactPerson || null,
        leadTimeDays: isNaN(leadTimeDays) ? 7 : leadTimeDays,
        reliabilityScore: isNaN(reliabilityScore) ? 1.0 : reliabilityScore,
        paymentTerms: paymentTerms || null,
        notes: notes || null,
        isActive,
      },
    });

    return json({ success: true });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return json(
        { errors: { name: "A vendor with this name already exists" } },
        { status: 400 },
      );
    }
    return json(
      { errors: { form: "Failed to update vendor" } },
      { status: 500 },
    );
  }
};

const poStatusBadge: Record<
  string,
  "info" | "success" | "warning" | "critical"
> = {
  DRAFT: "info",
  SENT: "warning",
  PARTIALLY_RECEIVED: "warning",
  RECEIVED: "success",
  CLOSED: "success",
  CANCELLED: "critical",
};

export default function VendorDetail() {
  const { vendor, purchaseOrders } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Page
      title={vendor.name}
      subtitle={vendor.email || undefined}
      breadcrumbs={[
        { content: "Purchasing", url: "/app/purchasing" },
        { content: "Vendors", url: "/app/purchasing/vendors" },
        { content: vendor.name },
      ]}
      primaryAction={{
        content: "Save",
        onAction: undefined,
        submit: true,
        disabled: isSubmitting,
        loading: isSubmitting,
      }}
    >
      <Layout>
        {actionData?.success && (
          <Layout.Section>
            <Banner tone="success" title="Vendor updated">
              <p>The vendor details have been saved successfully.</p>
            </Banner>
          </Layout.Section>
        )}

        {actionData?.errors?.form && (
          <Layout.Section>
            <Banner tone="critical" title="Error">
              <p>{actionData.errors.form}</p>
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <div className="p-4">
              <Text variant="headingMd" as="h2">
                Vendor Details
              </Text>
              <Form method="post">
                <FormLayout>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                      label="Name"
                      name="name"
                      value={vendor.name}
                      requiredIndicator
                      error={actionData?.errors?.name}
                    />
                    <TextField
                      label="Email"
                      name="email"
                      type="email"
                      value={vendor.email || ""}
                    />
                    <TextField
                      label="Phone"
                      name="phone"
                      type="tel"
                      value={vendor.phone || ""}
                    />
                    <TextField
                      label="Contact Person"
                      name="contactPerson"
                      value={vendor.contactPerson || ""}
                    />
                    <TextField
                      label="Lead Time (days)"
                      name="leadTimeDays"
                      type="number"
                      value={String(vendor.leadTimeDays)}
                    />
                    <TextField
                      label="Reliability Score"
                      name="reliabilityScore"
                      type="number"
                      value={String(vendor.reliabilityScore)}
                      helpText="Score from 0.0 to 1.0"
                    />
                    <TextField
                      label="Payment Terms"
                      name="paymentTerms"
                      value={vendor.paymentTerms || ""}
                      placeholder="e.g. Net 30"
                    />
                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="isActive"
                          defaultChecked={vendor.isActive}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">Active</span>
                      </label>
                    </div>
                  </div>
                  <TextField
                    label="Notes"
                    name="notes"
                    value={vendor.notes || ""}
                    multiline={3}
                  />
                  <div className="flex justify-end">
                    <Button submit loading={isSubmitting}>
                      Save Changes
                    </Button>
                  </div>
                </FormLayout>
              </Form>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div className="p-4">
              <Text variant="headingMd" as="h2">
                Summary
              </Text>
              <DescriptionList
                items={[
                  { term: "Status", description: <Badge tone={vendor.isActive ? "success" : "critical"}>{vendor.isActive ? "Active" : "Inactive"}</Badge> },
                  { term: "Default Currency", description: vendor.defaultCurrency },
                  { term: "Created", description: new Date(vendor.createdAt).toLocaleDateString() },
                  { term: "Last Updated", description: new Date(vendor.updatedAt).toLocaleDateString() },
                  { term: "Total POs", description: String(purchaseOrders.length) },
                ]}
              />
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div className="p-4">
              <Text variant="headingMd" as="h2">
                Recent Purchase Orders
              </Text>
              {purchaseOrders.length === 0 ? (
                <p className="text-gray-500 mt-2">
                  No purchase orders from this vendor yet.
                </p>
              ) : (
                <div className="mt-2">
                  <IndexTable
                    resourceName={{
                      singular: "purchase order",
                      plural: "purchase orders",
                    }}
                    itemCount={purchaseOrders.length}
                    headings={[
                      { title: "PO #" },
                      { title: "Status" },
                      { title: "Location" },
                      { title: "Items", alignment: "end" },
                      { title: "Expected" },
                      { title: "Created" },
                    ]}
                    selectable={false}
                  >
                    {purchaseOrders.map((po, index) => (
                      <IndexTable.Row key={po.id} id={po.id} position={index}>
                        <IndexTable.Cell>
                          <span className="font-mono">{po.poNumber}</span>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <Badge tone={poStatusBadge[po.status] || "info"}>
                            {po.status.replace(/_/g, " ")}
                          </Badge>
                        </IndexTable.Cell>
                        <IndexTable.Cell>{po.location.name}</IndexTable.Cell>
                        <IndexTable.Cell>
                          <span className="text-right">
                            {po.lineItems.length}
                          </span>
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
                </div>
              )}
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
