import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";

// ---------------------------------------------------------------------------
// Alert management
// ---------------------------------------------------------------------------

/**
 * Scan all inventory items for a shop and create ReorderAlert records for
 * any items whose quantity is at or below their reorder point.
 *
 * Existing PENDING alerts for the same item/location pair are skipped to
 * avoid duplicates.
 *
 * @param shopId - Shop to scan
 * @returns Array of newly created ReorderAlert records
 */
export async function checkReorderThresholds(shopId: string) {
  logger.info({ shopId }, "checkReorderThresholds: starting");

  const items = await prisma.inventoryItem.findMany({
    where: {
      shopId,
      reorderPoint: { gt: 0 },
    },
    include: { location: true },
  });

  const newAlerts: any[] = [];

  for (const item of items) {
    if (item.quantity > item.reorderPoint) {
      continue;
    }

    // Check for existing pending alert
    const existing = await prisma.reorderAlert.findFirst({
      where: {
        inventoryItemId: item.id,
        locationId: item.locationId,
        status: "PENDING",
      },
    });

    if (existing) {
      continue;
    }

    // Determine urgency based on how far below the reorder point
    const deficitRatio = 1 - item.quantity / item.reorderPoint;
    let urgency: "CRITICAL" | "WARNING" | "INFO";
    if (deficitRatio >= 0.5 || item.quantity === 0) {
      urgency = "CRITICAL";
    } else if (deficitRatio >= 0.25) {
      urgency = "WARNING";
    } else {
      urgency = "INFO";
    }

    const alert = await prisma.reorderAlert.create({
      data: {
        shopId,
        inventoryItemId: item.id,
        locationId: item.locationId,
        currentStock: item.quantity,
        reorderPoint: item.reorderPoint,
        recommendedQty: item.reorderQuantity || item.reorderPoint,
        urgency,
        status: "PENDING",
      },
    });

    newAlerts.push(alert);
  }

  logger.info(
    { shopId, newAlertCount: newAlerts.length },
    "checkReorderThresholds: done",
  );
  return newAlerts;
}

/**
 * Get all active (PENDING) alerts for a shop, with item and location data.
 *
 * @param shopId - Shop to query
 * @returns Array of PENDING ReorderAlert records with relations
 */
export async function getActiveAlerts(shopId: string) {
  logger.info({ shopId }, "getActiveAlerts: starting");

  const alerts = await prisma.reorderAlert.findMany({
    where: { shopId, status: "PENDING" },
    include: {
      InventoryItem: {
        select: { id: true, title: true, sku: true },
      },
      Location: {
        select: { id: true, name: true },
      },
    },
    orderBy: [{ urgency: "asc" }, { createdAt: "desc" }],
  });

  logger.info({ shopId, count: alerts.length }, "getActiveAlerts: done");
  return alerts;
}

/**
 * Acknowledge an alert, indicating someone has seen it and is acting on it.
 *
 * @param alertId - ID of the ReorderAlert to acknowledge
 * @returns The updated alert
 */
export async function acknowledgeAlert(alertId: string) {
  logger.info({ alertId }, "acknowledgeAlert: starting");

  const alert = await prisma.reorderAlert.findUnique({
    where: { id: alertId },
  });

  if (!alert) {
    throw new Error(`Alert ${alertId} not found`);
  }

  if (alert.status !== "PENDING") {
    throw new Error(
      `Cannot acknowledge alert in ${alert.status} status (expected PENDING)`,
    );
  }

  const updated = await prisma.reorderAlert.update({
    where: { id: alertId },
    data: {
      status: "ACKNOWLEDGED",
      actedAt: new Date(),
    },
  });

  logger.info({ alertId }, "acknowledgeAlert: done");
  return updated;
}

/**
 * Dismiss an alert, indicating it no longer requires action.
 *
 * @param alertId - ID of the ReorderAlert to dismiss
 * @returns The updated alert
 */
export async function dismissAlert(alertId: string) {
  logger.info({ alertId }, "dismissAlert: starting");

  const alert = await prisma.reorderAlert.findUnique({
    where: { id: alertId },
  });

  if (!alert) {
    throw new Error(`Alert ${alertId} not found`);
  }

  if (alert.status !== "PENDING") {
    throw new Error(
      `Cannot dismiss alert in ${alert.status} status (expected PENDING)`,
    );
  }

  const updated = await prisma.reorderAlert.update({
    where: { id: alertId },
    data: {
      status: "DISMISSED",
      actedAt: new Date(),
    },
  });

  logger.info({ alertId }, "dismissAlert: done");
  return updated;
}
