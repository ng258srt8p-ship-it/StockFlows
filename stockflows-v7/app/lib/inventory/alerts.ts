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
 * Detect significant velocity changes by comparing recent demand (last 7 days)
 * against the previous 7-day window. If demand has increased or decreased by
 * more than 50%, create an INFO-level alert.
 *
 * @param shopId - Shop to scan
 * @returns Array of newly created velocity-change alerts
 */
export async function checkVelocityChanges(shopId: string) {
  logger.info({ shopId }, "checkVelocityChanges: starting");

  const items = await prisma.inventoryItem.findMany({
    where: { shopId },
    include: { location: true },
  });

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const newAlerts: any[] = [];

  for (const item of items) {
    // Get movement sums for two 7-day windows
    const [recentSum, previousSum] = await Promise.all([
      prisma.stockMovement.aggregate({
        where: {
          inventoryItemId: item.id,
          type: "SALE",
          createdAt: { gte: sevenDaysAgo },
        },
        _sum: { quantityChange: true },
      }),
      prisma.stockMovement.aggregate({
        where: {
          inventoryItemId: item.id,
          type: "SALE",
          createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
        },
        _sum: { quantityChange: true },
      }),
    ]);

    const recentSales = Math.abs(recentSum._sum.quantityChange ?? 0);
    const previousSales = Math.abs(previousSum._sum.quantityChange ?? 0);

    // Skip if no meaningful sales data
    if (previousSales < 2 && recentSales < 2) continue;

    // Calculate percentage change
    const pctChange =
      previousSales === 0
        ? recentSales > 0
          ? 100
          : 0
        : ((recentSales - previousSales) / previousSales) * 100;

    // Only alert on significant changes (>50% increase or decrease)
    if (Math.abs(pctChange) < 50) continue;

    // Skip if there's already a recent velocity alert for this item
    const recentAlert = await prisma.reorderAlert.findFirst({
      where: {
        inventoryItemId: item.id,
        locationId: item.locationId,
        status: "PENDING",
        createdAt: { gte: sevenDaysAgo },
      },
    });
    if (recentAlert) continue;

    const direction = pctChange > 0 ? "increased" : "decreased";
    const alert = await prisma.reorderAlert.create({
      data: {
        shopId,
        inventoryItemId: item.id,
        locationId: item.locationId,
        currentStock: item.quantity,
        reorderPoint: item.reorderPoint,
        recommendedQty: item.reorderQuantity || item.reorderPoint,
        urgency: "INFO",
        status: "PENDING",
      },
    });

    newAlerts.push(alert);
    logger.info(
      {
        itemId: item.id,
        recentSales,
        previousSales,
        pctChange: Math.round(pctChange),
        direction,
      },
      "Velocity change detected",
    );
  }

  logger.info(
    { shopId, newAlertCount: newAlerts.length },
    "checkVelocityChanges: done",
  );
  return newAlerts;
}

/**
 * Detect items that are at risk of expiring (zero stock or critically low)
 * based on the forecast. If the forecast predicts stockout within the lead
 * time, create a WARNING alert.
 *
 * @param shopId - Shop to scan
 * @returns Array of newly created stockout-risk alerts
 */
export async function checkStockoutRisk(shopId: string) {
  logger.info({ shopId }, "checkStockoutRisk: starting");

  // Get latest forecast for each item
  const forecasts = await prisma.forecastResult.findMany({
    where: { inventoryItem: { shopId } },
    orderBy: { createdAt: "desc" },
    distinct: ["inventoryItemId"],
    include: { inventoryItem: true, location: true },
  });

  const newAlerts: any[] = [];

  for (const forecast of forecasts) {
    const avgDaily = forecast.totalPredicted / Math.max(forecast.horizonDays, 30);
    if (avgDaily <= 0) continue;

    const daysUntilStockout = forecast.inventoryItem.quantity / avgDaily;

    // Alert if stockout predicted within 14 days (assumed lead time)
    if (daysUntilStockout > 14) continue;

    // Skip if there's already a pending alert
    const existing = await prisma.reorderAlert.findFirst({
      where: {
        inventoryItemId: forecast.inventoryItem.id,
        locationId: forecast.locationId,
        status: "PENDING",
      },
    });
    if (existing) continue;

    const urgency = daysUntilStockout <= 3 ? "CRITICAL" : "WARNING";

    const alert = await prisma.reorderAlert.create({
      data: {
        shopId,
        inventoryItemId: forecast.inventoryItem.id,
        locationId: forecast.locationId,
        currentStock: forecast.inventoryItem.quantity,
        reorderPoint: forecast.inventoryItem.reorderPoint,
        recommendedQty: Math.ceil(avgDaily * 30),
        urgency,
        status: "PENDING",
      },
    });

    newAlerts.push(alert);
  }

  logger.info(
    { shopId, newAlertCount: newAlerts.length },
    "checkStockoutRisk: done",
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
      inventoryItem: {
        select: { id: true, title: true, sku: true },
      },
      location: {
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
