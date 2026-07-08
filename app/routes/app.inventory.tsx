import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { prisma } from "~/lib/db/client";
import { authenticate } from "~/lib/shopify/server";
import { useState } from "react";

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

  if (!shop) return json({ items: [], totalStockValue: 0 });

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const locationId = url.searchParams.get("location") || "";

  const items = await prisma.inventoryItem.findMany({
    where: {
      shopId: shop.id,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { location: true },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  const totalStockValue = items.reduce(
    (sum, item) => sum + (item.costPerUnit ? Number(item.costPerUnit) * item.quantity : 0),
    0
  );

  return json({
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      sku: item.sku,
      quantity: item.quantity,
      reorderPoint: item.reorderPoint,
      reorderQuantity: item.reorderQuantity,
      costPerUnit: item.costPerUnit ? Number(item.costPerUnit) : null,
      category: (item as any).category ?? (item.sku?.startsWith("PSB") ? "Footwear" : item.sku?.startsWith("PSG") ? "Accessories" : item.sku?.startsWith("HSG") ? "Apparel" : "General"),
      location: item.location?.name ?? "Default",
      vendor: (item as any).vendor ?? "Default Vendor",
      velocity: (item as any).velocity ?? "medium",
    })),
    totalStockValue,
  });
};

function getStockBadge(qty: number, reorderPoint: number): { label: string; color: string } {
  if (qty === 0) return { label: "Out of Stock", color: "var(--danger)" };
  if (qty <= reorderPoint) return { label: "Low Stock", color: "var(--warning)" };
  return { label: "In Stock", color: "var(--success)" };
}

function getVelocityBadge(velocity: string): { label: string; color: string } {
  switch (velocity) {
    case "high": return { label: "High", color: "var(--danger)" };
    case "medium": return { label: "Medium", color: "var(--warning)" };
    case "low": return { label: "Low", color: "var(--success)" };
    default: return { label: velocity, color: "var(--info)" };
  }
}

export default function Inventory() {
  const data = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  if (!data.items.length) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Inventory</h1>
        <p className="mb-6" style={{ color: "var(--text-secondary)" }}>0 SKUs tracked</p>
        <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: "var(--accent-muted)", color: "var(--accent)" }}>
          <span className="material-symbols-outlined">inventory_2</span>
          <p className="text-sm font-medium">No inventory items yet. Sync your Shopify products to get started.</p>
        </div>
      </div>
    );
  }

  const { items } = data;
  const categories = ["all", ...Array.from(new Set(items.map((i) => i.category)))];

  const search = searchParams.get("search") || "";
  const categoryFilter = searchParams.get("category") || "all";

  const filtered = items.filter((i) => {
    const matchesSearch =
      !search ||
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      (i.sku && i.sku.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || i.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (value: string) => {
    setSearchInput(value);
    const params = new URLSearchParams(searchParams);
    if (value) params.set("search", value);
    else params.delete("search");
    setSearchParams(params);
  };

  const handleCategoryFilter = (cat: string) => {
    const params = new URLSearchParams(searchParams);
    if (cat === "all") params.delete("category");
    else params.set("category", cat);
    setSearchParams(params);
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          Inventory
        </h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          {items.length} SKUs tracked
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-tertiary)", fontSize: 18 }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Search by title or SKU..."
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg text-sm border outline-none focus:ring-2 transition-shadow"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryFilter(cat)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: categoryFilter === cat ? "var(--accent)" : "var(--bg-secondary)",
              color: categoryFilter === cat ? "var(--bg-primary)" : "var(--text-secondary)",
            }}
          >
            {cat === "all" ? "All" : cat}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--bg-tertiary)" }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Product</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>SKU</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Category</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Qty</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Reorder Pt</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Status</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Velocity</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--text-secondary)" }}>Location</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center" style={{ color: "var(--text-tertiary)" }}>
                    No items match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const stock = getStockBadge(item.quantity, item.reorderPoint);
                  const velocity = getVelocityBadge(item.velocity);
                  return (
                    <tr
                      key={item.id}
                      className="border-t transition-colors hover:opacity-80"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                          {item.title}
                        </span>
                        {item.costPerUnit && (
                          <span className="ml-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
                            (${item.costPerUnit.toFixed(2)}/unit)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                        {item.sku ?? "—"}
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                        {item.category}
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                        {item.reorderPoint}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block px-2.5 py-1 rounded-md text-xs font-medium"
                          style={{ backgroundColor: `${stock.color}15`, color: stock.color }}
                        >
                          {stock.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block px-2.5 py-1 rounded-md text-xs font-medium"
                          style={{ backgroundColor: `${velocity.color}15`, color: velocity.color }}
                        >
                          {velocity.label}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                        {item.location}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
