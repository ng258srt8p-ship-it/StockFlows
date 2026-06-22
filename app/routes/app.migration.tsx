/**
 * Stocky migration page.
 *
 * Allows merchants to upload three types of CSV exports from Stocky
 * (products, vendors, purchase orders). For each file the page:
 *   1. Parses the CSV and shows a preview table
 *   2. On confirmation, runs the corresponding import function
 *   3. Displays the import results (imported / skipped / total)
 */

import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { requirePermission } from "~/lib/auth/middleware";
import { authenticate } from "~/lib/shopify/server";
import { prisma } from "~/lib/db/client";
import {
  Page,
  Layout,
  Card,
  Button,
  Banner,
  IndexTable,
  Text,
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import {
  importStockyProducts,
  importStockyVendors,
  importStockyPurchaseOrders,
} from "~/lib/services/stocky-import";
import type { ImportResult } from "~/lib/services/stocky-import";
import logger from "~/lib/logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CsvPreview {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

type MigrationType = "products" | "vendors" | "purchaseOrders";

interface MigrationState {
  products: { preview: CsvPreview | null; result: ImportResult | null };
  vendors: { preview: CsvPreview | null; result: ImportResult | null };
  purchaseOrders: { preview: CsvPreview | null; result: ImportResult | null };
}

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shopId } = await requirePermission(request, "settings:write");
  await authenticate.admin(request);

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  try {
    if (intent === "import") {
      const type = formData.get("type") as MigrationType;
      const csvContent = formData.get("csvContent") as string;

      if (!csvContent) {
        return json({ error: "No CSV data provided" }, { status: 400 });
      }

      let result: ImportResult;

      switch (type) {
        case "products":
          result = await importStockyProducts(csvContent, shopId);
          break;
        case "vendors":
          result = await importStockyVendors(csvContent, shopId);
          break;
        case "purchaseOrders":
          result = await importStockyPurchaseOrders(csvContent, shopId);
          break;
        default:
          return json({ error: "Invalid migration type" }, { status: 400 });
      }

      return json({ success: true, type, result });
    }

    return json({ error: "Unknown intent" }, { status: 400 });
  } catch (error) {
    logger.error({ shopId, intent, error }, "Migration action failed");
    return json({ error: "Migration failed. Please check your CSV and try again." }, { status: 500 });
  }
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseCsvPreview(csvContent: string, maxPreviewRows = 5): CsvPreview {
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [], totalRows: 0 };
  }

  const headers = lines[0]
    .split(",")
    .map((h) => h.replace(/^"|"$/g, "").trim());

  const rows = lines.slice(1, maxPreviewRows + 1).map((line) => {
    const values = line
      .split(",")
      .map((v) => v.replace(/^"|"$/g, "").trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? "";
    });
    return row;
  });

  return { headers, rows, totalRows: lines.length - 1 };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Migration() {
  const fetcher = useFetcher();

  const [state, setState] = useState<MigrationState>({
    products: { preview: null, result: null },
    vendors: { preview: null, result: null },
    purchaseOrders: { preview: null, result: null },
  });

  const [rawCsv, setRawCsv] = useState<Record<MigrationType, string>>({
    products: "",
    vendors: "",
    purchaseOrders: "",
  });

  const isSubmitting = fetcher.state === "submitting";

  // Handle fetcher response to store import results
  const lastResult = fetcher.data;
  if (lastResult?.success && lastResult.type && lastResult.result) {
    const type = lastResult.type as MigrationType;
    setState((prev) => ({
      ...prev,
      [type]: { preview: null, result: lastResult.result },
    }));
    // Clear the raw CSV after successful import
    setRawCsv((prev) => ({ ...prev, [type]: "" }));
  }

  const handleFileChange = useCallback(
    (type: MigrationType, event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const preview = parseCsvPreview(content);
        setRawCsv((prev) => ({ ...prev, [type]: content }));
        setState((prev) => ({
          ...prev,
          [type]: { preview, result: null },
        }));
      };
      reader.readAsText(file);
    },
    [],
  );

  const handleImport = useCallback(
    (type: MigrationType) => {
      const csvContent = rawCsv[type];
      if (!csvContent) return;

      fetcher.submit(
        { intent: "import", type, csvContent },
        { method: "post" },
      );

      // Clear preview after submit
      setState((prev) => ({
        ...prev,
        [type]: { preview: null, result: null },
      }));
    },
    [rawCsv, fetcher],
  );

  const handleReset = useCallback((type: MigrationType) => {
    setState((prev) => ({
      ...prev,
      [type]: { preview: null, result: null },
    }));
    setRawCsv((prev) => ({ ...prev, [type]: "" }));
  }, []);

  // -----------------------------------------------------------------------
  // Render helpers
  // -----------------------------------------------------------------------

  function renderPreviewTable(type: MigrationType) {
    const preview = state[type].preview;
    if (!preview || preview.rows.length === 0) return null;

    const headings = preview.headers.map((h) => ({ title: h }));

    const rows = preview.rows.map((row, idx) => ({
      id: `${type}-preview-${idx}`,
      ...row,
    }));

    return (
      <div className="mt-4 space-y-3">
        <Text variant="bodySm" fontWeight="semibold" tone="subdued">
          Preview ({Math.min(preview.totalRows, 5)} of {preview.totalRows} rows)
        </Text>

        <IndexTable
          resourceName={{ singular: "row", plural: "rows" }}
          headings={headings}
          selectable={false}
          itemCount={rows.length}
        >
          {rows.map((row, idx) => (
            <IndexTable.Row key={row.id} id={row.id} position={idx}>
              {preview.headers.map((h) => (
                <IndexTable.Cell key={h}>
                  <Text variant="bodySm">{row[h]}</Text>
                </IndexTable.Cell>
              ))}
            </IndexTable.Row>
          ))}
        </IndexTable>

        <div className="flex gap-2">
          <Button
            primary
            loading={isSubmitting}
            onClick={() => handleImport(type)}
          >
            Import {preview.totalRows} rows
          </Button>
          <Button onClick={() => handleReset(type)}>Cancel</Button>
        </div>
      </div>
    );
  }

  function renderResultBanner(type: MigrationType) {
    const result = state[type].result;
    if (!result) return null;

    return (
      <Banner tone="success" className="mt-4">
        <p>
          <strong>Import complete:</strong> {result.imported} imported,{" "}
          {result.skipped} skipped out of {result.total} total rows.
        </p>
      </Banner>
    );
  }

  function renderMigrationCard(
    type: MigrationType,
    title: string,
    description: string,
    sampleColumns: string,
  ) {
    return (
      <Card title={title}>
        <div className="p-4 space-y-3">
          <Text variant="bodyMd" as="p">
            {description}
          </Text>

          <Text variant="bodySm" tone="subdued">
            Expected columns: {sampleColumns}
          </Text>

          {state[type].result ? (
            renderResultBanner(type)
          ) : (
            <>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileChange(type, e)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              {renderPreviewTable(type)}
            </>
          )}
        </div>
      </Card>
    );
  }

  // -----------------------------------------------------------------------
  // Main render
  // -----------------------------------------------------------------------

  return (
    <Page
      title="Stocky Migration"
      subtitle="Import your data from a Stocky CSV export into StockFlows"
      breadcrumbs={[{ content: "Settings", url: "/app/settings" }]}
    >
      <Layout>
        <Layout.Section>
          <Banner tone="info">
            <p>
              Upload CSV files exported from Stocky. Each file type is
              processed independently. Duplicate records (matched by SKU,
              vendor name, or PO number) will be skipped automatically.
            </p>
          </Banner>
        </Layout.Section>

        <Layout.Section>
          <div className="space-y-4">
            {renderMigrationCard(
              "products",
              "Products",
              "Import product catalog data. Each row with a unique SKU will be created as a new inventory item.",
              "SKU, Name, Price, Cost, Track inventory, Barcode",
            )}
          </div>
        </Layout.Section>

        <Layout.Section>
          <div className="space-y-4">
            {renderMigrationCard(
              "vendors",
              "Vendors",
              "Import your supplier directory. Vendor names must be unique within your account.",
              "Name, Email, Lead time (days), Payment terms, Phone",
            )}
          </div>
        </Layout.Section>

        <Layout.Section>
          <div className="space-y-4">
            {renderMigrationCard(
              "purchaseOrders",
              "Purchase Orders",
              "Import historical purchase orders. Rows are grouped by PO Number. New vendors referenced in the CSV will be created automatically.",
              "PO Number, Vendor Name, Vendor Email, SKU, Product Name, Quantity, Unit Cost, Expected Date",
            )}
          </div>
        </Layout.Section>

        {/* Overall status */}
        {fetcher.data?.error && (
          <Layout.Section>
            <Banner tone="critical">
              <p>{fetcher.data.error}</p>
            </Banner>
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
}
