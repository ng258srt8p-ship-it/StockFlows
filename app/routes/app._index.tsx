import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/lib/db/client";
import { authenticate } from "~/lib/shopify/server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  let session: any = null;
  try {
    const auth = await authenticate.admin(request);
    session = auth.session;
  } catch (e) {
    session = null;
  }

  let shop;
  if (session) {
    shop = await prisma.shop.findUnique({ where: { shopifyDomain: session.shop } });
  } else {
    shop =
      (await prisma.shop.findUnique({ where: { shopifyDomain: "stockflows2.myshopify.com" } })) ??
      (await prisma.shop.findFirst());
  }

  if (!shop) return json({ stats: null, alerts: [], recentMovements: [] });

  const [totalItems, totalLocations, totalPOs, totalVendors] = await Promise.all([
    prisma.inventoryItem.count({ where: { shopId: shop.id } }),
    prisma.location.count({ where: { shopId: shop.id } }),
    prisma.purchaseOrder.count({ where: { shopId: shop.id } }),
    prisma.vendor.count({ where: { shopId: shop.id } }),
  ]);

  // Recent alerts
  const alerts = await prisma.reorderAlert.findMany({
    where: { shop: { shopifyDomain: session?.shop ?? "stockflows2.myshopify.com" }, status: "PENDING" },
    include: { inventoryItem: { select: { title: true, sku: true } }, location: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Recent stock movements
  const recentMovements = await prisma.stockMovement.findMany({
    where: { inventoryItem: { shopId: shop.id } },
    include: { inventoryItem: { select: { title: true, sku: true } } },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const pendingAlerts = alerts.filter((a) => a.status === "PENDING");

  return json({
    stats: {
      totalItems,
      totalLocations,
      totalPOs,
      totalVendors,
    },
    alerts: pendingAlerts.map((a) => ({
      id: a.id,
      title: a.inventoryItem.title,
      sku: a.inventoryItem.sku,
      urgency: a.urgency,
      currentStock: a.currentStock,
      reorderPoint: a.reorderPoint,
      location: a.location.name,
    })),
    recentMovements: recentMovements.map((m) => ({
      id: m.id,
      title: m.inventoryItem.title,
      sku: m.inventoryItem.sku,
      type: m.type,
      quantityChange: m.quantityChange,
      location: "Default",
      createdAt: m.createdAt.toISOString(),
    })),
  });
};

const urgencyLabel: Record<string, string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

const urgencyColor: Record<string, string> = {
  CRITICAL: "var(--danger)",
  HIGH: "var(--warning)",
  MEDIUM: "var(--info)",
  LOW: "var(--success)",
};

const typeIcon: Record<string, string> = {
  SALE: "shopping_cart",
  RECEIVING: "move_down",
  TRANSFER_IN: "move_down",
  TRANSFER_OUT: "move_up",
  RETURN: "undo",
  DAMAGE: "error",
};

const typeColor: Record<string, string> = {
  SALE: "var(--danger)",
  RECEIVING: "var(--success)",
  TRANSFER_IN: "var(--success)",
  TRANSFER_OUT: "var(--warning)",
  RETURN: "var(--info)",
  DAMAGE: "var(--danger)",
};

export default function Dashboard() {
  const data = useLoaderData<typeof loader>();

  if (!data.stats) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent)" }}>
          <span className="material-symbols-outlined">info</span>
          <p className="text-sm font-medium">No shop data available. Sync inventory to get started.</p>
        </div>
      </div>
    );
  }

  const { stats, alerts, recentMovements } = data;

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          Dashboard
        </h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          Overview of your inventory operations
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Items" value={String(stats.totalItems)} icon="inventory_2" />
        <StatCard label="Locations" value={String(stats.totalLocations)} icon="store" />
        <StatCard label="POs Created" value={String(stats.totalPOs)} icon="shopping_cart" />
        <StatCard label="Vendors" value={String(stats.totalVendors)} icon="business" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts Card */}
        <div className="rounded-lg border p-5" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Alerts
            </h2>
            <span className="material-symbols-outlined" style={{ color: "var(--text-tertiary)" }}>
              notifications
            </span>
          </div>
          {alerts.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              No alerts. All items are well-stocked.
            </p>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {alert.title}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                      {alert.sku ?? "No SKU"} — {alert.location}
                    </p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="text-xs font-medium" style={{ color: urgencyColor[alert.urgency] ?? "var(--text-secondary)" }}>
                      {urgencyLabel[alert.urgency] ?? alert.urgency}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      Stock: {alert.currentStock} / {alert.reorderPoint}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Card */}
        <div className="rounded-lg border p-5" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Recent Activity
            </h2>
            <span className="material-symbols-outlined" style={{ color: "var(--text-tertiary)" }}>
              history
            </span>
          </div>
          {recentMovements.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              No recent activity.
            </p>
          ) : (
            <div className="space-y-2">
              {recentMovements.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)" }}
                >
                  <span
                    className="material-symbols-outlined text-lg flex-shrink-0"
                    style={{ color: typeColor[m.type] ?? "var(--text-secondary)" }}
                  >
                    {typeIcon[m.type] ?? "arrow_right_alt"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {m.quantityChange > 0 ? "+" : ""}
                      {m.quantityChange} — {m.title}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                      {m.type.replace(/_/g, " ")} — {m.location}
                    </p>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>
                    {new Date(m.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <div
      className="rounded-lg border p-5 hover:transition-colors"
      style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          {label}
        </span>
        {icon && (
          <span className="material-symbols-outlined" style={{ color: "var(--text-tertiary)", fontSize: 20 }}>
            {icon}
          </span>
        )}
      </div>
      <span className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
        {value}
      </span>
    </div>
  );
}
