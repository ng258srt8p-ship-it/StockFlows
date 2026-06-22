import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CycleCountEntry {
  inventoryItemId: string;
  countedQuantity: number;
}

interface SubmitCycleCountParams {
  locationId: string;
  counts: CycleCountEntry[];
  userId: string;
}

// ---------------------------------------------------------------------------
// Cycle counting
// ---------------------------------------------------------------------------

/**
 * Start a cycle count at a given location.
 *
 * Fetches all inventory items at the location so the counting UI can
 * display them. Items are returned ordered by title.
 *
 * @param shopId     - Shop that owns the location
 * @param locationId - Location to count
 * @returns Array of inventory items at the location
 */
export async function startCycleCount(shopId: string, locationId: string) {
  logger.info({ shopId, locationId }, "startCycleCount: starting");

  const items = await prisma.inventoryItem.findMany({
    where: { shopId, locationId },
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
      sku: true,
      quantity: true,
      locationId: true,
    },
  });

  logger.info(
    { locationId, itemCount: items.length },
    "startCycleCount: done",
  );
  return items;
}

/**
 * Submit the results of a cycle count.
 *
 * For each counted item, the on-hand quantity is set to the physically counted
 * value (absolute, not delta). If the counted quantity differs from the system
 * quantity, a StockMovement of type CYCLE_COUNT is created with the delta.
 *
 * @param params.locationId - Location where the count took place
 * @param params.counts     - Array of { inventoryItemId, countedQuantity }
 * @param params.userId     - ID of the user who performed the count
 * @returns Summary of the cycle count submission
 */
export async function submitCycleCount({
  locationId,
  counts,
  userId,
}: SubmitCycleCountParams) {
  logger.info(
    { locationId, itemCount: counts.length },
    "submitCycleCount: starting",
  );

  let adjustedCount = 0;
  let matchCount = 0;

  await prisma.$transaction(async (tx) => {
    for (const entry of counts) {
      const item = await tx.inventoryItem.findUnique({
        where: { id: entry.inventoryItemId },
      });

      if (!item) {
        throw new Error(`Inventory item ${entry.inventoryItemId} not found`);
      }

      if (item.locationId !== locationId) {
        throw new Error(
          `Item ${entry.inventoryItemId} does not belong to location ${locationId}`,
        );
      }

      const delta = entry.countedQuantity - item.quantity;

      if (delta === 0) {
        matchCount++;
        continue;
      }

      // Update to the absolute counted quantity
      await tx.inventoryItem.update({
        where: { id: entry.inventoryItemId },
        data: {
          quantity: entry.countedQuantity,
          available: Math.max(0, entry.countedQuantity - item.reserved),
          lastCountedAt: new Date(),
        },
      });

      await tx.stockMovement.create({
        data: {
          inventoryItemId: entry.inventoryItemId,
          locationId,
          type: "CYCLE_COUNT",
          quantityChange: delta,
          reference: `cycle-count-${locationId}`,
          notes: `Cycle count: system=${item.quantity}, counted=${entry.countedQuantity}`,
          createdBy: userId,
        },
      });

      adjustedCount++;
    }

    // Mark all items at this location as counted
    await tx.inventoryItem.updateMany({
      where: { locationId },
      data: { lastCountedAt: new Date() },
    });
  });

  const summary = {
    totalItems: counts.length,
    matched: matchCount,
    adjusted: adjustedCount,
  };

  logger.info(summary, "submitCycleCount: done");
  return summary;
}
