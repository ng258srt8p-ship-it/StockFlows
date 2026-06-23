import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
import { useState, useCallback } from "react";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import {
  Page,
  Layout,
  Card,
  IndexTable,
  Badge,
  Button,
  TextField,
} from "@shopify/polaris";
import type { Vendor } from "@prisma/client";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { shopifyDomain: session.shop },
  });
  if (!shop) return json({ vendors: [] });

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";

  const where: any = { shopId: shop.id };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { contactPerson: { contains: search, mode: "insensitive" } },
    ];
  }

  const vendors = await prisma.vendor.findMany({
    where,
    orderBy: { name: "asc" },
  });

  return json({ vendors });
};

export default function VendorList() {
  const { vendors } = useLoaderData<typeof loader>();
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
    [searchParams, setSearchParams],
  );

  return (
    <Page
      title="Vendors"
      subtitle={`${vendors.length} vendors`}
      primaryAction={{
        content: "Add Vendor",
        onAction: () => navigate("/app/purchasing/vendors/new"),
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <div className="p-4">
              <div className="mb-4">
                <TextField
                  placeholder="Search by name, email, or contact..."
                  value={search}
                  onChange={handleSearch}
                  clearButton
                  onClearButtonClick={() => handleSearch("")}
                />
              </div>

              <IndexTable
                resourceName={{ singular: "vendor", plural: "vendors" }}
                itemCount={vendors.length}
                headings={[
                  { title: "Name" },
                  { title: "Email" },
                  { title: "Lead Time (days)", alignment: "end" },
                  { title: "Reliability Score", alignment: "end" },
                  { title: "Payment Terms" },
                  { title: "Status" },
                ]}
                selectable={false}
                onRowClick={(_, row) =>
                  navigate(`/app/purchasing/vendors/${row.id}`)
                }
              >
                {vendors.map((vendor, index) => (
                  <IndexTable.Row key={vendor.id} id={vendor.id} position={index}>
                    <IndexTable.Cell>
                      <span className="font-medium">{vendor.name}</span>
                    </IndexTable.Cell>
                    <IndexTable.Cell>{vendor.email || "—"}</IndexTable.Cell>
                    <IndexTable.Cell>
                      <span className="text-right">{vendor.leadTimeDays}</span>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <span className="text-right">
                        {vendor.reliabilityScore.toFixed(1)}
                      </span>
                    </IndexTable.Cell>
                    <IndexTable.Cell>{vendor.paymentTerms || "—"}</IndexTable.Cell>
                    <IndexTable.Cell>
                      <Badge tone={vendor.isActive ? "success" : "critical"}>
                        {vendor.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </IndexTable.Cell>
                  </IndexTable.Row>
                ))}
              </IndexTable>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
