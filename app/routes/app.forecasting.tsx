import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import { Page, Layout, Card, Text, Badge, IndexTable } from "@shopify/polaris";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { shopifyDomain: session.shop },
  });
  if (!shop) return json({ forecasts: [], accuracy: 0 });

  const forecasts = await prisma.forecastResult.findMany({
    where: { shopId: shop.id },
    include: { inventoryItem: true, location: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const avgConfidence =
    forecasts.length > 0
      ? forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length
      : 0;

  return json({
    forecasts: forecasts.map((f) => ({
      ...f,
      predictedDaily: f.predictedDaily as Array<{ date: string; yhat: number }>,
    })),
    accuracy: Math.round(avgConfidence * 100),
  });
};

export default function Forecasting() {
  const { forecasts, accuracy } = useLoaderData<typeof loader>();

  return (
    <Page title="Forecasting" subtitle={`Average accuracy: ${accuracy}%`}>
      <Layout>
        <Layout.Section>
          <Card>
            <div className="p-4">
              <Text variant="headingMd" as="h2">
                Recent Forecasts
              </Text>
              <IndexTable
                resourceName={{ singular: "forecast", plural: "forecasts" }}
                itemCount={forecasts.length}
                headings={[
                  { title: "Product" },
                  { title: "Location" },
                  { title: "Model" },
                  { title: "Confidence" },
                  { title: "30-Day Pred." },
                  { title: "Generated" },
                ]}
                selectable={false}
              >
                {forecasts.map((f, index) => (
                  <IndexTable.Row key={f.id} id={f.id} position={index}>
                    <IndexTable.Cell>{f.inventoryItem.title}</IndexTable.Cell>
                    <IndexTable.Cell>{f.location.name}</IndexTable.Cell>
                    <IndexTable.Cell>
                      <Badge>{f.modelUsed}</Badge>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <Badge
                        status={
                          f.confidence >= 0.8
                            ? "success"
                            : f.confidence >= 0.6
                              ? "warning"
                              : "critical"
                        }
                      >
                        {Math.round(f.confidence * 100)}%
                      </Badge>
                    </IndexTable.Cell>
                    <IndexTable.Cell>{f.totalPredicted} units</IndexTable.Cell>
                    <IndexTable.Cell>
                      {new Date(f.createdAt).toLocaleDateString()}
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
