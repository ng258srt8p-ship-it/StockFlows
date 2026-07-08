import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";

/**
 * Reason strings used in the adjust-stock flow. Each maps to a
 * StockMovementType in the Prisma schema.
 */
const MOVEMENT_TYPE_MAP: Record<string, string> = {
  correction: "ADJUSTMENT",
  cycle_count: "CYCLE_COUNT",
  damage: "DAMAGE",
  return: "RETURN",
  receiving: "RECEIVING",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AdjustStockParams {
  itemId: string;
  locationId: string;
  delta: number;
  reason: string;
  notes?: string;
  userId: string;
  shopId: string;
}

interface InventorySummary {
  totalSKUs: number;
  lowStockItems: number;
  valueAtRisk: number;
}

interface SearchItemsParams {
  search?: string;
  locationId?: string;
  status?: "in_stock" | "low_stock" | "out_of_stock";
}

// ---------------------------------------------------------------------------
// Core inventory operations
// ---------------------------------------------------------------------------

/**
 * Adjust the stock quantity for an inventory item.
 *
 * Updates the item quantity, creates a StockMovement record, and writes an
 * AuditLog entry. Returns the new absolute quantity.
 *
 * @param params.itemId       - ID of the inventory item to adjust
 * @param params.locationId   - Location where the adjustment occurs
 * @param params.delta        - Positive to add stock, negative to remove
 * @param params.reason       - Human-readable reason (maps to movement type)
 * @param params.notes        - Optional free-form notes
 * @param params.userId       - ID of the user performing the adjustment
 * @param params.shopId       - Shop that owns the item
 * @returns The new absolute quantity after adjustment
 */
export async function adjustStock({
  itemId,
  locationId,
  delta,
  reason,
  notes,
  userId,
  shopId,
}: AdjustStockParams): Promise<number> {
  logger.info({ itemId, locationId, delta, reason }, "adjustStock: starting");

  const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
  if (!item) {
    throw new Error(`Inventory item ${itemId} not found`);
  }

  const newQty = item.quantity + delta;
  if (newQty < 0) {
    throw new Error(
      `Insufficient stock: current=${item.quantity}, delta=${delta}`,
    );
  }

  const [updatedItem] = await prisma.$transaction([
    prisma.inventoryItem.update({
      where: { id: itemId },
      data: {
        quantity: newQty,
        available: Math.max(0, newQty - item.reserved),
      },
    }),
    prisma.stockMovement.create({
      data: {
        inventoryItemId: itemId,
        locationId,
        type: (MOVEMENT_TYPE_MAP[reason] ?? "ADJUSTMENT") as any,
        quantityChange: delta,
        reference: `adjust-${reason}`,
        notes: notes ?? null,
        createdBy: userId,
      },
    }),
    prisma.auditLog.create({
      data: {
        shopId,
        userId,
        action: "inventory.adjust",
        entityType: "InventoryItem",
        entityId: itemId,
        oldValue: { quantity: item.quantity },
        newValue: { quantity: newQty, reason, notes },
      },
    }),
  ]);

  logger.info({ itemId, oldQty: item.quantity, newQty }, "adjustStock: done");
  return updatedItem.quantity;
}

/**
 * Return a high-level inventory summary for a shop.
 *
 * - **totalSKUs** -- distinct inventory items across all locations.
 * - **lowStockItems** -- items whose quantity is at or below their reorder point.
 * - **valueAtRisk** -- estimated dollar value of low-stock items
 *   (quantity * costPerUnit, summed).
 */
export async function getInventorySummary(
  shopId: string,
): Promise<InventorySummary> {
  logger.info({ shopId }, "getInventorySummary: starting");

  const items = await prisma.inventoryItem.findMany({
    where: { shopId },
    select: {
      id: true,
      quantity: true,
      reorderPoint: true,
      costPerUnit: true,
    },
  });

  const totalSKUs = items.length;

  let lowStockItems = 0;
  let valueAtRisk = 0;

  for (const item of items) {
    if (item.quantity <= item.reorderPoint) {
      lowStockItems++;
      if (item.costPerUnit) {
        valueAtRisk += Number(item.costPerUnit) * item.quantity;
      }
    }
  }

  logger.info({ shopId, totalSKUs, lowStockItems, valueAtRisk }, "getInventorySummary: done");
  return { totalSKUs, lowStockItems, valueAtRisk };
}

/**
 * Fetch a single inventory item with its location, recent movements,
 * active alerts, and forecast results.
 *
 * @param itemId - ID of the inventory item
 * @returns The item with all related data, or null if not found
 */
export async function getItemWithLocation(itemId: string) {
  logger.info({ itemId }, "getItemWithLocation: starting");

  const item = await prisma.inventoryItem.findUnique({
    where: { id: itemId },
    include: {
      location: true,
      movements: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      alerts: {
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
      },
      forecasts: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  logger.info({ itemId, found: !!item }, "getItemWithLocation: done");
  return item;
}

/**
 * Search inventory items for a shop with optional filters.
 *
 * @param shopId   - Shop to search within
 * @param params.search    - Free-text search against title, SKU, or barcode
 * @param params.locationId - Filter to a specific location
 * @param params.status    - Filter by stock status relative to reorder point
 * @returns Filtered list of inventory items with their locations
 */
export async function searchItems(
  shopId: string,
  { search, locationId, status }: SearchItemsParams,
) {
  logger.info({ shopId, search, locationId, status }, "searchItems: starting");

  const where: any = { shopId };

  if (locationId) {
    where.locationId = locationId;
  }

  if (search) {
    const searchTerm = search.trim();
    where.OR = [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { sku: { contains: searchTerm, mode: "insensitive" } },
      { barcode: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  // For status filtering we fetch all matching items then filter in JS because
  // the reorderPoint comparison requires two columns.
  let items = await prisma.inventoryItem.findMany({
    where,
    include: { location: true },
    orderBy: { title: "asc" },
  });

  if (status) {
    items = items.filter((item) => {
      switch (status) {
        case "out_of_stock":
          return item.quantity === 0;
        case "low_stock":
          return item.quantity > 0 && item.quantity <= item.reorderPoint;
        case "in_stock":
          return item.quantity > item.reorderPoint;
        default:
          return true;
      }
    });
  }

  logger.info({ shopId, resultCount: items.length }, "searchItems: done");
  return items;
}
