import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/lib/db/client";
import { authenticate } from "~/lib/shopify/server";
import { Page, Layout, Card, Text, Select } from "@shopify/polaris";
import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const COLORS = ["#4F46E5", "#60A5FA", "#EC4899", "#10B981", "#F59E0B", "#A78BFA"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div
      className="rounded-lg border border-[var(--border)] p-3"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <p className="text-sm font-medium text-[var(--text-primary)] mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
};

const emptyData = { stockLevels: [], poByMonth: [], forecastAccuracy: [], vendorDistribution: [] };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    let session: any = null;
    try {
      const auth = await authenticate.admin(request);
      session = auth.session;
    } catch (e) {
      // Not authenticated — fall back to default shop
    }

    let shop;
    if (session) {
      shop = await prisma.shop.findUnique({ where: { shopifyDomain: session.shop } });
    } else {
      shop = await prisma.shop.findUnique({ where: { shopifyDomain: "stockflows2.myshopify.com" } }) ?? await prisma.shop.findFirst();
    }

    if (!shop) return json(emptyData);

    // 1. Stock levels over time
    const movements = await prisma.stockMovement.findMany({
      where: { inventoryItem: { shopId: shop.id } },
      select: { createdAt: true, type: true, quantityChange: true },
      orderBy: { createdAt: "asc" },
    });

    const dailyMap = new Map<string, { total: number; inbound: number; outbound: number }>();
    movements.forEach((m) => {
      const date = m.createdAt.toISOString().slice(0, 10);
      if (!dailyMap.has(date)) dailyMap.set(date, { total: 0, inbound: 0, outbound: 0 });
      const day = dailyMap.get(date)!;
      const qty = Math.abs(m.quantityChange);
      day.total += m.quantityChange;
      if (m.type === "RECEIVING" || m.type === "RETURN" || m.type === "TRANSFER_IN") day.inbound += qty;
      else if (m.type === "SALE" || m.type === "TRANSFER_OUT" || m.type === "DAMAGE") day.outbound += qty;
    });

    const dates = Array.from(dailyMap.keys()).sort().slice(-30);
    let cumulative = 0;
    const stockLevels = dates.map((d) => {
      const day = dailyMap.get(d)!;
      cumulative += day.total;
      return { date: d.slice(5), stock: cumulative, inbound: day.inbound, outbound: day.outbound };
    });

    // 2. Purchase orders by month
    const pos = await prisma.purchaseOrder.findMany({
      where: { shopId: shop.id },
      select: { createdAt: true, totalCost: true },
      orderBy: { createdAt: "asc" },
    });

    const poMap = new Map<string, { orders: number; value: number }>();
    pos.forEach((po) => {
      const month = po.createdAt.toISOString().slice(0, 7);
      if (!poMap.has(month)) poMap.set(month, { orders: 0, value: 0 });
      const m = poMap.get(month)!;
      m.orders += 1;
      m.value += Number(po.totalCost || 0);
    });

    const poByMonth = Array.from(poMap.entries()).slice(-6).map(([month, data]) => ({
      month: month.slice(5), orders: data.orders, value: Math.round(data.value),
    }));

    // 3. Forecast accuracy
    const forecasts = await prisma.forecastResult.findMany({
      where: { inventoryItem: { shopId: shop.id } },
      include: { inventoryItem: { select: { title: true, sku: true, quantity: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    const forecastAccuracy = forecasts.map((f) => ({
      sku: f.inventoryItem.sku || f.inventoryItem.title.slice(0, 12),
      actual: f.inventoryItem.quantity,
      predicted: f.totalPredicted,
    }));

    // 4. Vendor distribution
    const vendorPOs = await prisma.purchaseOrder.groupBy({
      by: ["vendorId"],
      where: { shopId: shop.id },
      _count: { id: true },
    });

    const vendorIds = vendorPOs.map((v) => v.vendorId).filter(Boolean);
    const vendors = await prisma.vendor.findMany({
      where: { id: { in: vendorIds } },
      select: { id: true, name: true },
    });

    const vendorMap = new Map(vendors.map((v) => [v.id, v.name]));
    const vendorDistribution = vendorPOs.map((v) => ({
      name: vendorMap.get(v.vendorId) || "Unknown",
      orders: v._count.id,
      value: v._count.id,
    })).sort((a, b) => b.orders - a.orders);

    return json({ stockLevels, poByMonth, forecastAccuracy, vendorDistribution });
  } catch (e) {
    return json(emptyData);
  }
};

export default function Reports() {
  const { stockLevels, poByMonth, forecastAccuracy, vendorDistribution } = useLoaderData<typeof loader>();
  const [dateRange, setDateRange] = useState("30d");

  const handleExportCSV = () => {
    const rows = [
      "Date,Stock,Inbound,Outbound",
      ...stockLevels.map((s: any) => `${s.date},${s.stock},${s.inbound},${s.outbound}`),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stockflows-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Page title="Reports & Analytics">
      <Layout>
        <Layout.Section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text variant="headingMd" as="h2">Inventory insights and performance data</Text>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Select
                options={[
                  { label: "Last 7 days", value: "7d" },
                  { label: "Last 30 days", value: "30d" },
                  { label: "Last 90 days", value: "90d" },
                ]}
                value={dateRange}
                onChange={setDateRange}
              />
              <button
                onClick={handleExportCSV}
                style={{
                  padding: "6px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500,
                  backgroundColor: "var(--accent)", color: "white", border: "none", cursor: "pointer",
                }}
              >
                Export CSV
              </button>
            </div>
          </div>
        </Layout.Section>

        <Layout.Section>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Card>
              <div style={{ padding: 16 }}>
                <Text variant="headingSm" as="h3">Inventory Stock Levels</Text>
                <div style={{ height: 280, marginTop: 12 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stockLevels}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                      <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: "var(--text-secondary)", fontSize: 12 }} />
                      <Area type="monotone" dataKey="stock" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.15} name="Stock Level" />
                      <Area type="monotone" dataKey="inbound" stroke="#10B981" fill="#10B981" fillOpacity={0.15} name="Inbound" />
                      <Area type="monotone" dataKey="outbound" stroke="#EF4444" fill="#EF4444" fillOpacity={0.15} name="Outbound" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            <Card>
              <div style={{ padding: 16 }}>
                <Text variant="headingSm" as="h3">Purchase Orders by Month</Text>
                <div style={{ height: 280, marginTop: 12 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={poByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                      <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: "var(--text-secondary)", fontSize: 12 }} />
                      <Bar dataKey="orders" fill="#4F46E5" name="Orders" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="value" fill="#EC4899" name="Value ($)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            <Card>
              <div style={{ padding: 16 }}>
                <Text variant="headingSm" as="h3">Forecast Accuracy</Text>
                <div style={{ height: 280, marginTop: 12 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastAccuracy}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="sku" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                      <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: "var(--text-secondary)", fontSize: 12 }} />
                      <Line type="monotone" dataKey="actual" stroke="#4F46E5" strokeWidth={2} name="Actual" dot={{ fill: "#4F46E5" }} />
                      <Line type="monotone" dataKey="predicted" stroke="#EC4899" strokeWidth={2} name="Predicted" strokeDasharray="5 5" dot={{ fill: "#EC4899" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            <Card>
              <div style={{ padding: 16 }}>
                <Text variant="headingSm" as="h3">Vendor Order Distribution</Text>
                <div style={{ height: 280, marginTop: 12 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={vendorDistribution} cx="50%" cy="50%" outerRadius={100} dataKey="orders" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {vendorDistribution.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
