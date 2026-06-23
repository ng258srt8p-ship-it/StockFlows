/**
 * Stocky data migration service.
 *
 * Parses CSV exports from Stocky and upserts the data into StockFlows
 * via Prisma. Each function returns an {@link ImportResult} summary
 * so the migration page can display imported / skipped / total counts.
 *
 * CSV parsing uses `csv-parse/sync` for simplicity since these are
 * one-off migration operations with reasonably sized files.
 */

import { parse } from "csv-parse/sync";
import { prisma } from "~/lib/db/client";
import logger from "~/lib/logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ImportResult {
  imported: number;
  skipped: number;
  total: number;
}

interface ProductRow {
  SKU: string;
  Name: string;
  Price?: string;
  Cost?: string;
  "Track inventory"?: string;
  Barcode?: string;
}

interface VendorRow {
  Name: string;
  Email?: string;
  "Lead time (days)"?: string;
  "Payment terms"?: string;
  Phone?: string;
}

interface PurchaseOrderRow {
  "PO Number": string;
  "Vendor Name": string;
  "Vendor Email"?: string;
  SKU: string;
  "Product Name"?: string;
  Quantity: string;
  "Unit Cost"?: string;
  "Expected Date"?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const log = logger.child({ module: "stocky-import" });

function parseCsv<T extends Record<string, unknown>>(
  csvContent: string,
): T[] {
  return parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  }) as T[];
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

/**
 * Parse a Stocky product CSV export and upsert inventory items.
 *
 * Matching is done by SKU against existing `InventoryItem` records for the
 * shop. New SKUs are inserted; duplicates are skipped.
 */
export async function importStockyProducts(
  csvContent: string,
  shopId: string,
): Promise<ImportResult> {
  const records = parseCsv<ProductRow>(csvContent);
  log.info({ shopId, totalRows: records.length }, "Starting product import");

  let imported = 0;
  let skipped = 0;

  for (const row of records) {
    const sku = row.SKU?.trim();
    if (!sku) {
      skipped++;
      continue;
    }

    try {
      const existing = await prisma.inventoryItem.findFirst({
        where: { shopId, sku },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.inventoryItem.create({
        data: {
          shopId,
          sku,
          title: row.Name?.trim() || sku,
          costPerUnit: row.Cost ? parseFloat(row.Cost) : null,
          barcode: row.Barcode?.trim() || null,
          quantity: 0,
          reserved: 0,
          available: 0,
          reorderPoint: 0,
          reorderQuantity: 0,
          // Imported items don't have Shopify IDs — use placeholder values
          // with the SKU as a unique marker
          shopifyProductId: `imported-product-${sku}`,
          shopifyVariantId: `imported-variant-${sku}`,
          locationId: "", // Will be assigned during sync
        },
      });

      imported++;
    } catch (error) {
      log.error({ shopId, sku, error }, "Failed to import product row");
      skipped++;
    }
  }

  const result = { imported, skipped, total: records.length };
  log.info({ shopId, ...result }, "Product import complete");
  return result;
}

// ---------------------------------------------------------------------------
// Vendors
// ---------------------------------------------------------------------------

/**
 * Parse a Stocky vendor CSV export and upsert vendors.
 *
 * Matches by name + shopId. Duplicate vendor names are skipped.
 */
export async function importStockyVendors(
  csvContent: string,
  shopId: string,
): Promise<ImportResult> {
  const records = parseCsv<VendorRow>(csvContent);
  log.info({ shopId, totalRows: records.length }, "Starting vendor import");

  let imported = 0;
  let skipped = 0;

  for (const row of records) {
    const name = row.Name?.trim();
    if (!name) {
      skipped++;
      continue;
    }

    try {
      const existing = await prisma.vendor.findFirst({
        where: { shopId, name },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.vendor.create({
        data: {
          shopId,
          name,
          email: row.Email?.trim() || null,
          phone: row.Phone?.trim() || null,
          leadTimeDays: row["Lead time (days)"]
            ? parseInt(row["Lead time (days)"], 10)
            : null,
          paymentTerms: row["Payment terms"]?.trim() || null,
          reliabilityScore: null,
          isActive: true,
        },
      });

      imported++;
    } catch (error) {
      log.error({ shopId, vendorName: name, error }, "Failed to import vendor row");
      skipped++;
    }
  }

  const result = { imported, skipped, total: records.length };
  log.info({ shopId, ...result }, "Vendor import complete");
  return result;
}

// ---------------------------------------------------------------------------
// Purchase Orders
// ---------------------------------------------------------------------------

/**
 * Parse a Stocky purchase order CSV export and create POs.
 *
 * Rows are grouped by PO Number. Each unique PO Number produces a single
 * `PurchaseOrder` record with `POLineItem` children. Vendor lookups are
 * resolved by name; if not found the PO is still created but the vendorId
 * is left null.
 */
export async function importStockyPurchaseOrders(
  csvContent: string,
  shopId: string,
): Promise<ImportResult> {
  const records = parseCsv<PurchaseOrderRow>(csvContent);
  log.info({ shopId, totalRows: records.length }, "Starting PO import");

  // Group rows by PO Number
  const grouped = new Map<string, PurchaseOrderRow[]>();
  for (const row of records) {
    const poNumber = row["PO Number"]?.trim();
    if (!poNumber) continue;
    const existing = grouped.get(poNumber) ?? [];
    existing.push(row);
    grouped.set(poNumber, existing);
  }

  let imported = 0;
  let skipped = 0;

  for (const [poNumber, rows] of grouped) {
    try {
      // Skip if PO already exists
      const existing = await prisma.purchaseOrder.findFirst({
        where: { shopId, poNumber },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Resolve vendor by name
      const vendorName = rows[0]["Vendor Name"]?.trim();
      let vendorId: string | null = null;

      if (vendorName) {
        const vendor = await prisma.vendor.findFirst({
          where: { shopId, name: vendorName },
        });
        vendorId = vendor?.id ?? null;

        // Auto-create vendor if not found
        if (!vendor) {
          const newVendor = await prisma.vendor.create({
            data: {
              shopId,
              name: vendorName,
              email: rows[0]["Vendor Email"]?.trim() || null,
              isActive: true,
              reliabilityScore: null,
              leadTimeDays: null,
              paymentTerms: null,
            },
          });
          vendorId = newVendor.id;
        }
      }

      // Resolve primary location for the shop
      const primaryLocation = await prisma.location.findFirst({
        where: { shopId, isActive: true },
      });

      // Parse expected date from first row
      const expectedDate = rows[0]["Expected Date"]
        ? new Date(rows[0]["Expected Date"])
        : null;

      // Create PO with line items
      const lineItems = rows
        .filter((r) => r.SKU?.trim())
        .map((r) => ({
          sku: r.SKU.trim(),
          quantity: parseInt(r.Quantity || "0", 10),
          unitCost: r["Unit Cost"] ? parseFloat(r["Unit Cost"]) : null,
        }));

      const shippingCost = lineItems.reduce(
        (sum, li) => sum + (li.unitCost && li.quantity ? li.unitCost * li.quantity : 0),
        0,
      );

      await prisma.purchaseOrder.create({
        data: {
          shopId,
          vendorId,
          locationId: primaryLocation?.id ?? null,
          poNumber,
          status: "DRAFT",
          expectedDate: isNaN(expectedDate?.getTime() ?? NaN) ? null : expectedDate,
          shippingCost: 0,
          customsDuties: 0,
          lineItems: {
            create: lineItems.map((li) => ({
              inventoryItemId: null, // Will be linked later if SKU matches
              quantity: li.quantity,
              receivedQty: 0,
              unitCost: li.unitCost ?? 0,
              landedCost: 0,
            })),
          },
        },
      });

      imported++;
    } catch (error) {
      log.error({ shopId, poNumber, error }, "Failed to import purchase order");
      skipped++;
    }
  }

  const result = { imported, skipped, total: grouped.size };
  log.info({ shopId, ...result }, "PO import complete");
  return result;
}
