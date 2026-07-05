import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate, useFetcher, useNavigation } from "@remix-run/react";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import { requirePermission } from "~/lib/auth/middleware";
import { generateAutoReorderPOs } from "~/lib/purchasing/auto-reorder";
import {
  Page,
  Layout,
  Card,
  IndexTable,
  Badge,
  Button,
  Banner,
  Text,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
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
  // Try Shopify authentication, fall back gracefully if no session
  let session: any;
  try {
    const auth = await authenticate.admin(request);
    session = auth.session;
  } catch (error) {
    session = null;
  }

  // Resolve the shop record
  let shop;
  if (session) {
    shop = await prisma.shop.findUnique({
      where: { shopifyDomain: session.shop },
    });
  } else {
    shop = await prisma.shop.findUnique({
      where: { shopifyDomain: "stockflows2.myshopify.com" },
    }) ?? await prisma.shop.findFirst();
  }

  if (!shop) return json({ purchaseOrders: [], pendingAlertCount: 0 });

  const [purchaseOrders, pendingAlertCount] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where: { shopId: shop.id },
      include: { vendor: true, location: true, lineItems: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.reorderAlert.count({
      where: { shopId: shop.id, status: "PENDING" },
    }),
  ]);

  return json({ purchaseOrders, pendingAlertCount });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  let session: any;
  try {
    const auth = await authenticate.admin(request);
    session = auth.session;
  } catch (error) {
    session = null;
  }

  let shop;
  if (session) {
    shop = await prisma.shop.findUnique({ where: { shopifyDomain: session.shop } });
  } else {
    shop = await prisma.shop.findUnique({ where: { shopifyDomain: "stockflows2.myshopify.com" } })
      ?? await prisma.shop.findFirst();
  }
  const shopId = shop?.id;
  if (!shopId) return json({ error: "No shop found" }, { status: 404 });

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "auto-reorder") {
    try {
      // Find the user ID from the session
      const user = await prisma.user.findFirst({
        where: { shopId },
      });
      const userId = user?.id || "system";

      const results = await generateAutoReorderPOs(shopId, userId);

      if (results.length === 0) {
        return json({
          success: false,
          message: "No POs created. Make sure vendors are assigned to your inventory items.",
        });
      }

      const summary = results
        .map((r) => `${r.poNumber} (${r.vendorName}: ${r.totalUnits} units)`)
        .join(", ");

      return json({
        success: true,
        message: `Created ${results.length} PO: ${summary}`,
      });
    } catch (error) {
      return json({
        success: false,
        message: "Failed to generate POs. Please try again.",
      });
    }
  }

  return json({ success: false, message: "Unknown action" }, { status: 400 });
};

export default function PurchasingList() {
  const { purchaseOrders, pendingAlertCount } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const fetcher = useFetcher();
  const isGenerating = fetcher.state !== "idle";
  const isLoading = navigation.state === "loading";

  if (isLoading) {
    return (
      <SkeletonPage title="Purchase Orders" subtitle="Manage vendor orders and receiving">
        <Layout>
          <Layout.Section>
            <Card>
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="w-24"><SkeletonBodyText /></div>
                    <div className="flex-1"><SkeletonBodyText /></div>
                    <div className="w-24"><SkeletonBodyText /></div>
                    <div className="w-16 text-right"><SkeletonBodyText /></div>
                    <div className="w-24"><SkeletonBodyText /></div>
                    <div className="w-24"><SkeletonBodyText /></div>
                    <div className="w-24"><SkeletonBodyText /></div>
                  </div>
                ))}
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </SkeletonPage>
    );
  }

  return (
    <Page
      title="Purchase Orders"
      subtitle="Manage vendor orders and receiving"
      primaryAction={{
        content: "Create PO",
        onAction: () => navigate("/app/purchasing/new"),
      }}
      secondaryActions={[
        {
          content: "Auto-generate POs",
          onAction: () =>
            fetcher.submit({ intent: "auto-reorder" }, { method: "post" }),
          loading: isGenerating,
          disabled: isGenerating || pendingAlertCount === 0,
        },
      ]}
    >
      <Layout>
        {/* Auto-reorder result banner */}
        {fetcher.data ? (
          <Layout.Section>
            <Banner
              tone={((fetcher.data as Record<string, unknown>).success ? "success" : "warning") as "success" | "warning"}
            >
              <p>{String((fetcher.data as Record<string, unknown>).message ?? "")}</p>
            </Banner>
          </Layout.Section>
        ) : null}

        {/* Pending alerts banner */}
        {pendingAlertCount > 0 && !fetcher.data && (
          <Layout.Section>
            <Banner tone="warning">
              <p>
                <strong>{pendingAlertCount} items</strong> need reordering.
                {" "}
                <button
                  type="button"
                  className="underline font-medium"
                  onClick={() =>
                    fetcher.submit({ intent: "auto-reorder" }, { method: "post" })
                  }
                >
                  Generate POs automatically
                </button>
                {" "}or create them manually.
              </p>
            </Banner>
          </Layout.Section>
        )}

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
