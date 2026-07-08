import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate, useFetcher, useNavigation, useSearchParams } from "@remix-run/react";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import { generateAutoReorderPOs } from "~/lib/purchasing/auto-reorder";

export const loader = async ({ request }: LoaderFunctionArgs) => {
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
    shop = await prisma.shop.findUnique({ where: { shopifyDomain: "stockflows2.myshopify.com" } }) ?? await prisma.shop.findFirst();
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
    shop = await prisma.shop.findUnique({ where: { shopifyDomain: "stockflows2.myshopify.com" } }) ?? await prisma.shop.findFirst();
  }
  const shopId = shop?.id;
  if (!shopId) return json({ error: "No shop found" }, { status: 404 });

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "auto-reorder") {
    try {
      const user = await prisma.user.findFirst({ where: { shopId } });
      const userId = user?.id || "system";
      const results = await generateAutoReorderPOs(shopId, userId);
      if (results.length === 0) {
        return json({ success: false, message: "No POs created. Make sure vendors are assigned to your inventory items." });
      }
      const summary = results.map((r) => `${r.poNumber} (${r.vendorName}: ${r.totalUnits} units)`).join(", ");
      return json({ success: true, message: `Created ${results.length} PO: ${summary}` });
    } catch (error) {
      return json({ success: false, message: "Failed to generate POs. Please try again." });
    }
  }

  return json({ success: false, message: "Unknown action" }, { status: 400 });
};

const statusDisplay: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Waiting",
  PARTIALLY_RECEIVED: "Ready",
  RECEIVED: "Done",
  CLOSED: "Completed",
  CANCELLED: "Cancelled",
};

const statusColor: Record<string, string> = {
  DRAFT: "var(--warning)",
  SENT: "var(--info)",
  PARTIALLY_RECEIVED: "var(--success)",
  RECEIVED: "var(--success)",
  CLOSED: "var(--success)",
  CANCELLED: "var(--danger)",
};

const STATUS_FILTERS = [
  { label: "All", value: "all" },
  { label: "Draft", value: "DRAFT" },
  { label: "Waiting", value: "SENT" },
  { label: "Ready", value: "PARTIALLY_RECEIVED" },
  { label: "Done", value: "RECEIVED" },
];

export default function PurchasingList() {
  const { purchaseOrders, pendingAlertCount } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const fetcher = useFetcher();
  const isGenerating = fetcher.state !== "idle";
  const isLoading = navigation.state === "loading";
  const [searchParams, setSearchParams] = useSearchParams();
  const activeStatus = searchParams.get("status") || "all";

  const filteredPOs = activeStatus === "all"
    ? purchaseOrders
    : purchaseOrders.filter((po) => po.status === activeStatus);

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status !== "all") params.set("status", status);
    else params.delete("status");
    setSearchParams(params);
  };

  const fetcherResult = fetcher.data as { success?: boolean; message?: string } | null;

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            Purchase Orders
          </h1>
          <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
            {purchaseOrders.length} total
          </p>
        </div>
        <div className="flex gap-3">
          {pendingAlertCount > 0 && (
            <button
              onClick={() => fetcher.submit({ intent: "auto-reorder" }, { method: "post" })}
              disabled={isGenerating}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--accent-muted)",
                color: "var(--accent)",
                border: "none",
                cursor: isGenerating ? "not-allowed" : "pointer",
              }}
            >
              {isGenerating ? "Generating..." : `Auto-reorder (${pendingAlertCount})`}
            </button>
          )}
          <button
            onClick={() => navigate("/app/purchasing/new")}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: "var(--accent)",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            New PO
          </button>
        </div>
      </div>

      {/* Banner */}
      {fetcherResult && (
        <div
          className="flex items-center gap-3 p-4 rounded-lg mb-6"
          style={{
            backgroundColor: fetcherResult.success ? "var(--success-muted, #10B98115)" : "var(--danger-muted, #EF444415)",
            color: fetcherResult.success ? "var(--success, #10B981)" : "var(--danger, #EF4444)",
          }}
        >
          <span className="material-symbols-outlined">{fetcherResult.success ? "check_circle" : "warning"}</span>
          <p className="text-sm">{fetcherResult.message}</p>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleStatusFilter(filter.value)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: activeStatus === filter.value ? "var(--accent)" : "var(--bg-secondary)",
              color: activeStatus === filter.value ? "var(--bg-primary)" : "var(--text-secondary)",
              border: "none",
              cursor: "pointer",
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* PO Cards */}
      {filteredPOs.length === 0 ? (
        <div className="text-center py-12" style={{ color: "var(--text-tertiary)" }}>
          <span className="material-symbols-outlined text-4xl mb-2">shopping_cart</span>
          <p className="text-sm">No purchase orders match this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPOs.map((po) => {
            const totalValue = po.lineItems.reduce((s, li) => s + Number(li.unitCost || 0) * li.quantity, 0)
              + Number(po.shippingCost || 0) + Number(po.customsDuties || 0) + Number(po.otherCosts || 0);

            return (
              <div
                key={po.id}
                className="rounded-lg border p-5 hover:shadow-md transition-shadow cursor-pointer"
                style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
                onClick={() => navigate(`/app/purchasing/${po.id}`)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                      {po.vendor?.name ?? "Unknown Vendor"}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                      {po.poNumber}
                    </p>
                  </div>
                  <span
                    className="inline-block px-2.5 py-1 rounded-md text-xs font-medium"
                    style={{ backgroundColor: `${statusColor[po.status] ?? "var(--info)"}15`, color: statusColor[po.status] ?? "var(--info)" }}
                  >
                    {statusDisplay[po.status] ?? po.status}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                      ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Items</span>
                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                      {po.lineItems.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location</span>
                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                      {po.location?.name ?? "Default"}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-3 pt-3 border-t text-xs" style={{ borderColor: "var(--border)", color: "var(--text-tertiary)" }}>
                  Created {new Date(po.createdAt).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
