import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";
import { broadcastSSE } from "~/lib/sse/manager.server";
import { isValidGid } from "~/lib/shopify/id-normalize";

export interface InventoryChange {
  inventoryItemId: string; // Shopify Variant ID
  locationId: string;       // Shopify Location ID
  available: number;
}

export interface InventoryItemData {
  id: string;
  sku?: string;
  barcode?: string;
  title?: string;
  costPerUnit?: number;
}

/**
 * Processes inventory level updates (quantity changes).
 */
export async function processLevelUpdate(
  shopDomain: string,
  changes: InventoryChange[],
  jobReference: string
) {
  const log = logger.child({
    module: "inventory-sync-service",
    action: "level-update",
    shopDomain,
    jobReference,
  });

  log.info({ changesCount: changes.length }, "Processing inventory levels update");

  const shop = await prisma.shop.findUnique({
    where: { shopifyDomain: shopDomain },
  });

  if (!shop) {
    log.warn("Shop not found, skipping");
    throw new Error(`Shop ${shopDomain} not found`);
  }

  for (const change of changes) {
    // 1. Ensure Location exists in DB
    let location = await prisma.location.findUnique({
      where: { shopifyLocationId: change.locationId },
    });

    if (!location) {
      log.info({ shopifyLocationId: change.locationId }, "Location not found, creating JIT");
      location = await prisma.location.create({
        data: {
          shopId: shop.id,
          shopifyLocationId: change.locationId,
          name: `Shopify Location ${change.locationId}`,
        },
      });
    }

    // 2. Find or Create InventoryItem (JIT)
    // Validate that the inventoryItemId is a proper GID before proceeding
    if (!isValidGid(change.inventoryItemId, "InventoryItem")) {
      log.warn(
        { 
          inventoryItemId: change.inventoryItemId,
          reason: "Not a valid GID format - skipping JIT creation to prevent data corruption"
        },
        "Invalid inventoryItemId format - refusing JIT creation"
      );
      continue; // Skip this change entirely
    }

    let item = await prisma.inventoryItem.findFirst({
      where: {
        shopifyVariantId: change.inventoryItemId,
        locationId: location.id,
        shopId: shop.id,
      },
    });

    if (!item) {
      log.info({ shopifyVariantId: change.inventoryItemId }, "InventoryItem not found, creating JIT");
      item = await prisma.inventoryItem.create({
        data: {
          shopId: shop.id,
          locationId: location.id,
          shopifyVariantId: change.inventoryItemId,
          shopifyProductId: 'JIT-UNKNOWN', // Required field, using placeholder
          title: `JIT Item ${change.inventoryItemId}`,
          sku: `S-JIT-${change.inventoryItemId}`,
          quantity: 0,
          available: 0,
          reserved: 0,
        },
      });
    }

    // 3. Update quantity and handle movement
    const newQty = change.available;
    const changeQty = newQty - item.quantity;

    await prisma.inventoryItem.update({
      where: { id: item.id },
      data: {
        quantity: newQty,
        available: Math.max(0, newQty - item.reserved),
      },
    });

    if (changeQty !== 0) {
      // Idempotency Check
      const existingMovement = await prisma.stockMovement.findFirst({
        where: {
          inventoryItemId: item.id,
          reference: jobReference,
        },
      });

      if (!existingMovement) {
        await prisma.stockMovement.create({
          data: {
            inventoryItemId: item.id,
            locationId: location.id,
            type: "ADJUSTMENT",
            quantityChange: changeQty,
            reference: jobReference,
            notes: `Inventory level sync: ${changeQty > 0 ? "+" : ""}${changeQty}`,
          },
        });
      } else {
        log.debug({ reference: jobReference }, "Duplicate movement detected, skipping creation");
      }
    }
  }

  broadcastSSE(shopDomain, "inventory-update", {
    shopDomain,
    changes,
    timestamp: new Date().toISOString(),
  });

  log.info("Inventory levels sync completed successfully");
}

/**
 * Processes inventory item metadata updates (SKU, Barcode, etc).
 */
export async function processItemUpsert(
  shopDomain: string,
  itemData: InventoryItemData,
  jobReference: string
) {
  const log = logger.child({
    module: "inventory-sync-service",
    action: "item-upsert",
    shopDomain,
    jobReference,
  });

  log.info({ itemId: itemData.id }, "Processing inventory item upsert");

  const shop = await prisma.shop.findUnique({
    where: { shopifyDomain: shopDomain },
  });

  if (!shop) {
    log.warn("Shop not found, skipping");
    throw new Error(`Shop ${shopDomain} not found`);
  }

  // For metadata updates, we apply it to all instances of this variant across locations
  const items = await prisma.inventoryItem.findMany({
    where: {
      shopifyVariantId: itemData.id,
      shopId: shop.id,
    },
  });

  if (items.length === 0) {
    log.info({ itemId: itemData.id }, "No inventory items found for this variant, skipping metadata update");
    return;
  }

  for (const item of items) {
    await prisma.inventoryItem.update({
      where: { id: item.id },
      data: {
        title: itemData.title ?? item.title,
        sku: itemData.sku ?? item.sku,
        barcode: itemData.barcode ?? item.barcode,
        costPerUnit: itemData.costPerUnit ?? item.costPerUnit,
      },
    });
  }

  log.info({ count: items.length }, "Inventory item metadata updated");
}
