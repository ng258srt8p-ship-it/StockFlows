import { stringify } from "csv-stringify/sync";
import { logger } from "~/lib/logger";

// Lazy-loaded googleapis types — avoids hard dependency at bundle time
type SheetsClient = any; // Will be inferred from google.sheets() at runtime

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InventoryExportRow {
  sku: string;
  productName: string;
  locationName: string;
  quantity: number;
  reorderPoint: number;
  cost: number;
  lastUpdated: string;
}

export interface StockMovementExportRow {
  date: string;
  productName: string;
  locationName: string;
  type: string;
  quantityChange: number;
  quantityAfter: number;
  performedBy: string;
  notes: string;
}

// ---------------------------------------------------------------------------
// Google Sheets client — initialised lazily from service-account JSON.
// When GOOGLE_SERVICE_ACCOUNT is unset the module operates in stub mode.
// ---------------------------------------------------------------------------

let sheetsClient: SheetsClient | null = null;

async function getSheetsClient(): Promise<SheetsClient | null> {
  if (sheetsClient) return sheetsClient;

  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!serviceAccountJson) {
    return null;
  }

  try {
    const { google } = await import("googleapis");
    const credentials = JSON.parse(serviceAccountJson) as {
      client_email: string;
      private_key: string;
    };

    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    sheetsClient = google.sheets({ version: "v4", auth });
    return sheetsClient;
  } catch (error) {
    logger.error({ err: error }, "Failed to initialise Google Sheets client");
    return null;
  }
}

// ---------------------------------------------------------------------------
// CSV generation
// ---------------------------------------------------------------------------

/**
 * Convert an inventory array into a CSV string using csv-stringify.
 */
export function generateCSV(
  inventory: InventoryExportRow[],
): string {
  const headers = [
    "SKU",
    "Product Name",
    "Location",
    "Quantity",
    "Reorder Point",
    "Cost",
    "Last Updated",
  ];

  const rows = inventory.map((item) => [
    item.sku,
    item.productName,
    item.locationName,
    item.quantity,
    item.reorderPoint,
    item.cost,
    item.lastUpdated,
  ]);

  return stringify([headers, ...rows]);
}

// ---------------------------------------------------------------------------
// Google Sheets helpers
// ---------------------------------------------------------------------------

function inventoryToRows(
  items: InventoryExportRow[],
): (string | number)[][] {
  return [
    [
      "SKU",
      "Product Name",
      "Location",
      "Quantity",
      "Reorder Point",
      "Cost",
      "Last Updated",
    ],
    ...items.map((item) => [
      item.sku,
      item.productName,
      item.locationName,
      item.quantity,
      item.reorderPoint,
      item.cost,
      item.lastUpdated,
    ]),
  ];
}

function movementToRows(
  movements: StockMovementExportRow[],
): (string | number)[][] {
  return [
    [
      "Date",
      "Product Name",
      "Location",
      "Type",
      "Quantity Change",
      "Quantity After",
      "Performed By",
      "Notes",
    ],
    ...movements.map((m) => [
      m.date,
      m.productName,
      m.locationName,
      m.type,
      m.quantityChange,
      m.quantityAfter,
      m.performedBy,
      m.notes,
    ]),
  ];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Export inventory data to a Google Sheet. Overwrites the entire sheet with
 * the provided items (header row + data rows).
 *
 * Returns a stub message when Google credentials are not configured.
 */
export async function exportInventoryToSheets(
  spreadsheetId: string,
  items: InventoryExportRow[],
): Promise<{ message: string; updatedCells?: number }> {
  const sheets = await getSheetsClient();
  if (!sheets) {
    const csv = generateCSV(items);
    logger.info("Google Sheets credentials not set — returning CSV stub");
    return {
      message:
        "Google credentials not configured. CSV data returned instead. " +
        csv,
    };
  }

  try {
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Inventory!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: inventoryToRows(items) },
    });

    const updatedCells = response.data.updatedCells ?? 0;
    logger.info(
      { spreadsheetId, updatedCells },
      "Inventory exported to Google Sheets",
    );

    return { message: "Export completed successfully", updatedCells };
  } catch (error) {
    logger.error({ err: error, spreadsheetId }, "Failed to export to Google Sheets");
    throw error;
  }
}

/**
 * Export stock movement history to a Google Sheet.
 *
 * Returns a stub message when Google credentials are not configured.
 */
export async function exportStockMovements(
  spreadsheetId: string,
  movements: StockMovementExportRow[],
): Promise<{ message: string; updatedCells?: number }> {
  const sheets = await getSheetsClient();
  if (!sheets) {
    logger.info(
      "Google Sheets credentials not set — returning stub for stock movements",
    );
    return {
      message:
        "Google credentials not configured. Stock movement export skipped.",
    };
  }

  try {
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Movements!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: movementToRows(movements) },
    });

    const updatedCells = response.data.updatedCells ?? 0;
    logger.info(
      { spreadsheetId, updatedCells },
      "Stock movements exported to Google Sheets",
    );

    return { message: "Export completed successfully", updatedCells };
  } catch (error) {
    logger.error(
      { err: error, spreadsheetId },
      "Failed to export stock movements to Google Sheets",
    );
    throw error;
  }
}
