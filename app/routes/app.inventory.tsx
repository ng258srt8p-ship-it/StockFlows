import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate, useSearchParams, useNavigation } from "@remix-run/react";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import { requirePermission } from "~/lib/auth/middleware";
import {
  Page,
  Layout,
  Card,
  IndexTable,
  TextField,
  Select,
  Badge,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import type { InventoryItem, Location } from "@prisma/client";

type InventoryWithLocation = InventoryItem & { location: Location };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

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

  if (!shop) return json({ items: [], locations: [], categories: [] });

  const locationId = url.searchParams.get("location");
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";
  const category = url.searchParams.get("category") || "";

  const where: any = { shopId: shop.id };
  if (locationId) where.locationId = locationId;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { barcode: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status === "low") where.quantity = { lte: prisma.inventoryItem.fields.reorderPoint };
  if (status === "out") where.quantity = 0;
  if (category) where.productType = category;

  const [allItems, locations] = await Promise.all([
    prisma.inventoryItem.findMany({
      where,
      include: { location: true },
      orderBy: { updatedAt: "desc" },
      take: 200,
    }),
    prisma.location.findMany({
      where: { shopId: shop.id, isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const items = allItems.filter((item) => item.title !== "Gift Card");

  // Compute velocity for each item: count SALE movements in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const itemIds = items.map((i) => i.id);
  const saleMovements = await prisma.stockMovement.groupBy({
    by: ["inventoryItemId"],
    where: {
      inventoryItemId: { in: itemIds },
      type: "SALE",
      createdAt: { gte: thirtyDaysAgo },
    },
    _sum: { quantityChange: true },
  });

  const velocityMap = new Map<string, number>();
  saleMovements.forEach((m) => {
    velocityMap.set(m.inventoryItemId, Math.abs(m._sum.quantityChange ?? 0));
  });

  const itemsWithVelocity = items.map((item) => {
    const sales = velocityMap.get(item.id) || 0;
    let velocity: string;
    if (sales > 50) velocity = "high";
    else if (sales > 10) velocity = "medium";
    else velocity = "low";
    return { ...item, velocity, salesCount: sales };
  });

  // Extract unique categories from productType field
  const categories = [...new Set(items.map((i) => i.productType).filter(Boolean))].sort() as string[];

  return json({ items: itemsWithVelocity, locations, categories });
};

export default function InventoryList() {
  const { items, locations, categories } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const activeCategory = searchParams.get("category") || "";

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      const params = new URLSearchParams(searchParams);
      if (value) params.set("search", value);
      else params.delete("search");
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  const handleLocationFilter = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value) params.set("location", value);
      else params.delete("location");
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  const handleCategoryFilter = useCallback(
    (cat: string) => {
      const params = new URLSearchParams(searchParams);
      if (cat) params.set("category", cat);
      else params.delete("category");
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  const getStatus = (item: any) => {
    if (item.quantity === 0) return { label: "Out of Stock", status: "critical" as const };
    if (item.quantity <= item.reorderPoint) return { label: "Low Stock", status: "warning" as const };
    return { label: "In Stock", status: "success" as const };
  };

  const getVelocityBadge = (velocity: string) => {
    switch (velocity) {
      case "high": return <Badge tone="critical">High</Badge>;
      case "medium": return <Badge tone="warning">Medium</Badge>;
      default: return <Badge tone="success">Low</Badge>;
    }
  };

  if (isLoading) {
    return (
      <SkeletonPage title="Inventory">
        <Layout>
          <Layout.Section>
            <Card>
              <div className="p-4">
                <SkeletonDisplayText size="small" />
                <div className="mt-4 space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <SkeletonBodyText key={i} />
                  ))}
                </div>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </SkeletonPage>
    );
  }

  return (
    <Page
      title="Inventory"
      subtitle={`${items.length} SKUs tracked`}
      primaryAction={{
        content: "Add Item",
        onAction: () => navigate("/app/inventory/new"),
      }}
    >
      <Layout>
        <Layout.Section>
          {/* Category filter buttons */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <button
              onClick={() => handleCategoryFilter("")}
              style={{
                padding: "6px 16px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                border: "none",
                cursor: "pointer",
                backgroundColor: !activeCategory ? "var(--accent)" : "var(--bg-secondary)",
                color: !activeCategory ? "white" : "var(--text-secondary)",
              }}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryFilter(cat)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: activeCategory === cat ? "var(--accent)" : "var(--bg-secondary)",
                  color: activeCategory === cat ? "white" : "var(--text-secondary)",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div className="p-4">
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <TextField
                    label="Search inventory"
                    labelHidden
                    placeholder="Search by SKU, product, or barcode..."
                    value={search}
                    onChange={handleSearch}
                    autoComplete="off"
                    clearButton
                    onClearButtonClick={() => handleSearch("")}
                  />
                </div>
                <div className="w-48">
                  <Select
                    options={[
                      { label: "All locations", value: "" },
                      ...locations.map((l) => ({ label: l.name, value: l.id })),
                    ]}
                    value={searchParams.get("location") || ""}
                    onChange={handleLocationFilter}
                  />
                </div>
              </div>

              <IndexTable
                resourceName={{ singular: "item", plural: "items" }}
                itemCount={items.length}
                headings={[
                  { title: "SKU" },
                  { title: "Product" },
                  { title: "Category" },
                  { title: "Location" },
                  { title: "Qty", alignment: "end" },
                  { title: "Reorder Pt", alignment: "end" },
                  { title: "Velocity" },
                  { title: "Status" },
                  { title: "Cost", alignment: "end" },
                ]}
                selectable={false}
                onRowClick={(_, row) => navigate(`/app/inventory/${row.id}`)}
              >
                {items.map((item, index) => {
                  const status = getStatus(item);
                  return (
                    <IndexTable.Row key={item.id} id={item.id} position={index}>
                      <IndexTable.Cell>
                        <span className="font-mono text-sm">{item.sku || "—"}</span>
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        <span className="font-medium">{item.title}</span>
                      </IndexTable.Cell>
                      <IndexTable.Cell>{item.productType || "—"}</IndexTable.Cell>
                      <IndexTable.Cell>{item.location.name}</IndexTable.Cell>
                      <IndexTable.Cell>
                        <span className="text-right font-semibold">{item.quantity}</span>
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        <span className="text-right">{item.reorderPoint}</span>
                      </IndexTable.Cell>
                      <IndexTable.Cell>{getVelocityBadge(item.velocity)}</IndexTable.Cell>
                      <IndexTable.Cell>
                        <Badge tone={status.status}>{status.label}</Badge>
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        <span className="text-right">
                          {item.costPerUnit ? `$${Number(item.costPerUnit).toFixed(2)}` : "—"}
                        </span>
                      </IndexTable.Cell>
                    </IndexTable.Row>
                  );
                })}
              </IndexTable>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
