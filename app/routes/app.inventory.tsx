import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
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
  Button,
  Filters,
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import type { InventoryItem, Location } from "@prisma/client";

type InventoryWithLocation = InventoryItem & { location: Location };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requirePermission(request, "inventory:read");
  const { session } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { shopifyDomain: session.shop },
  });
  if (!shop) return json({ items: [], locations: [] });

  const url = new URL(request.url);
  const locationId = url.searchParams.get("location");
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";

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

  const [items, locations] = await Promise.all([
    prisma.inventoryItem.findMany({
      where,
      include: { location: true },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    prisma.location.findMany({
      where: { shopId: shop.id, isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return json({ items, locations });
};

export default function InventoryList() {
  const { items, locations } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

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

  const getStatus = (item: InventoryWithLocation) => {
    if (item.quantity === 0) return { label: "Out of Stock", status: "critical" as const };
    if (item.quantity <= item.reorderPoint) return { label: "Low Stock", status: "warning" as const };
    return { label: "In Stock", status: "success" as const };
  };

  return (
    <Page
      title="Inventory"
      subtitle={`${items.length} items`}
      primaryAction={{
        content: "Add Item",
        onAction: () => navigate("/app/inventory/new"),
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <div className="p-4">
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <TextField
                    placeholder="Search by SKU, product, or barcode..."
                    value={search}
                    onChange={handleSearch}
                    clearButton
                    onClearClick={() => handleSearch("")}
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
                  { title: "Location" },
                  { title: "Qty", alignment: "end" },
                  { title: "Reorder Pt", alignment: "end" },
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
                      <IndexTable.Cell>{item.location.name}</IndexTable.Cell>
                      <IndexTable.Cell>
                        <span className="text-right font-semibold">{item.quantity}</span>
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        <span className="text-right">{item.reorderPoint}</span>
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        <Badge tone={status.status}>{status.label}</Badge>
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        <span className="text-right">
                          {item.costPerUnit
                            ? `$${Number(item.costPerUnit).toFixed(2)}`
                            : "—"}
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
