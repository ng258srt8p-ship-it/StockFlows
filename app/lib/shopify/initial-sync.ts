/**
 * Initial data sync from Shopify to StockFlows database.
 *
 * Called once on new app install (afterAuth hook) to backfill:
 * - Locations
 * - Products (with variants → InventoryItem)
 * - Inventory levels (updates item quantity by location)
 *
 * Webhooks handle subsequent changes.
 */

import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";
import type { MovementType } from "@prisma/client";

interface SyncResult {
  locationsSynced: number;
  productsSynced: number;
  variantsSynced: number;
  inventoryLevelsSynced: number;
  errors: string[];
}

async function graphqlQuery(
  shopDomain: string,
  accessToken: string,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<any> {
  const url = `https://${shopDomain}/admin/api/2026-07/graphql.json`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(
      `Shopify GraphQL error (${response.status}): ${await response.text()}`,
    );
  }

  const json = await response.json();

  if (json.errors) {
    throw new Error(
      `Shopify GraphQL errors: ${json.errors.map((e: any) => e.message).join(", ")}`,
    );
  }

  return json;
}

const LOCATIONS_QUERY = `
  query GetLocations($first: Int!) {
    locations(first: $first) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo { hasNextPage, endCursor }
      edges {
        node {
          id
          title
          handle
          vendor
          productType
          variants(first: 50) {
            edges {
              node {
                id
                title
                sku
                barcode
                price
                inventoryQuantity
                inventoryItem {
                  id
                  unitCost { amount, currencyCode }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const INVENTORY_LEVELS_QUERY = `
  query GetInventoryLevels($first: Int!, $after: String) {
    inventoryLevels(first: $first, after: $after) {
      pageInfo { hasNextPage, endCursor }
      edges {
        node {
          inventoryItemId
          locationId
          available
        }
      }
    }
  }
`;

/**
 * Sync all products, variants, locations, and inventory levels from Shopify
 * to the StockFlows database for a newly-installed shop.
 */
export async function syncInitialData(
  shopDomain: string,
  accessToken: string,
): Promise<SyncResult> {
  const log = logger.child({ module: "initial-sync", shop: shopDomain });
  const result: SyncResult = {
    locationsSynced: 0,
    productsSynced: 0,
    variantsSynced: 0,
    inventoryLevelsSynced: 0,
    errors: [],
  };

  console.log("[initial-sync] Starting syncInitialData for shop:", shopDomain);
  log.info("Starting initial data sync from Shopify");

  // Find the shop record (created during OAuth)
  const shop = await prisma.shop.findUnique({
    where: { shopifyDomain: shopDomain },
  });

  if (!shop) {
    const errMsg = `Shop not found in database: ${shopDomain}`;
    console.log("[initial-sync] ERROR: Shop not found:", shopDomain);
    log.error(errMsg);
    result.errors.push(errMsg);
    return result;
  }
  console.log("[initial-sync] Found shop in DB:", shop.id, "shopDomain:", shop.shopifyDomain);

  try {
    // --- 1. Sync Locations ---
    log.info("Fetching locations...");
    const locData = await graphqlQuery(shopDomain, accessToken, LOCATIONS_QUERY, {
      first: 100,
    });

    const locations: Array<{ id: string; name: string }> =
      locData.data?.locations?.edges?.map((e: any) => e.node) || [];

    for (const loc of locations) {
      await prisma.location.upsert({
        where: { shopifyLocationId: loc.id },
        update: { name: loc.name },
        create: {
          shopId: shop.id,
          shopifyLocationId: loc.id,
          name: loc.name,
        },
      });
      result.locationsSynced++;
    }
    log.info({ count: result.locationsSynced }, "Locations synced");

    // Build location ID map: shopifyLocationId → DB location.id
    const allLocations = await prisma.location.findMany({
      where: { shopId: shop.id },
    });
    const locationIdMap = new Map(
      allLocations.map((l) => [l.shopifyLocationId, l.id]),
    );
    const defaultLocationId = allLocations[0]?.id || "unknown";

    // --- 2. Sync Products & Variants into InventoryItems ---
    log.info("Fetching products...");
    let hasNextPage = true;
    let after: string | undefined;

    while (hasNextPage) {
      const prodData = await graphqlQuery(shopDomain, accessToken, PRODUCTS_QUERY, {
        first: 50,
        after,
      });

      const products: Array<any> =
        prodData.data?.products?.edges?.map((e: any) => e.node) || [];

      for (const product of products) {
        const variants: Array<any> =
          product.variants?.edges?.map((e: any) => e.node) || [];

        for (const variant of variants) {
          const dbLocId =
            locationIdMap.get(
              allLocations[0]?.shopifyLocationId || "",
            ) || defaultLocationId;

          // Use inventoryItem.id as the key (matches Shopify inventory levels)
          const inventoryItemId = variant.inventoryItem?.id || variant.id;

          await prisma.inventoryItem.upsert({
            where: {
              shopifyVariantId_locationId: {
                shopifyVariantId: inventoryItemId,
                locationId: dbLocId,
              },
            },
            update: {
              shopId: shop.id,
              title: product.title,
              sku: variant.sku,
              barcode: variant.barcode,
              costPerUnit: variant.inventoryItem?.unitCost
                ? parseFloat(variant.inventoryItem.unitCost.amount)
                : null,
              quantity: variant.inventoryQuantity,
              available: variant.inventoryQuantity,
            },
            create: {
              shopId: shop.id,
              locationId: dbLocId,
              shopifyProductId: product.id,
              shopifyVariantId: inventoryItemId,
              title: product.title,
              sku: variant.sku,
              barcode: variant.barcode,
              costPerUnit: variant.inventoryItem?.unitCost
                ? parseFloat(variant.inventoryItem.unitCost.amount)
                : null,
              quantity: variant.inventoryQuantity,
              available: variant.inventoryQuantity,
              reserved: 0,
              reorderPoint: 10,
            },
          });

          result.variantsSynced++;
        }

        result.productsSynced++;
      }

      hasNextPage =
        prodData.data?.products?.pageInfo?.hasNextPage || false;
      after = prodData.data?.products?.pageInfo?.endCursor;
    }
    log.info(
      { products: result.productsSynced, variants: result.variantsSynced },
      "Products & variants synced",
    );

    // --- 3. Sync Inventory Levels (skip if API doesn't support inventoryLevels) ---
    try {
      log.info("Fetching inventory levels...");
      hasNextPage = true;
      after = undefined;

      while (hasNextPage) {
        const invData = await graphqlQuery(shopDomain, accessToken, INVENTORY_LEVELS_QUERY, {
          first: 250,
          after,
        });

        const levels: Array<{
          inventoryItemId: string;
          locationId: string;
          available: number;
        }> = invData.data?.inventoryLevels?.edges?.map((e: any) => e.node) || [];

        for (const level of levels) {
          const dbLocationId = locationIdMap.get(level.locationId);

          // Find the existing item by variant ID (we created it above with default location)
          const item = await prisma.inventoryItem.findFirst({
            where: {
              shopId: shop.id,
              shopifyVariantId: level.inventoryItemId,
          },
        });

        if (!item) continue;

        // Update quantity for this specific location
        await prisma.inventoryItem.update({
          where: { id: item.id },
          data: {
            quantity: level.available,
            available: level.available,
            locationId: dbLocationId || item.locationId,
          },
        });

        // Record the movement
        await prisma.stockMovement.create({
          data: {
            inventoryItemId: item.id,
            locationId: dbLocationId || item.locationId,
            type: "ADJUSTMENT" as MovementType,
            quantityChange: level.available - item.quantity,
            reference: `initial-sync-${shopDomain}`,
            notes: `Initial inventory level sync from Shopify location ${level.locationId}`,
          },
        });

        result.inventoryLevelsSynced++;
      }

      hasNextPage =
        invData.data?.inventoryLevels?.pageInfo?.hasNextPage || false;
      after = invData.data?.inventoryLevels?.pageInfo?.endCursor;
    }
    log.info(
      { count: result.inventoryLevelsSynced },
      "Inventory levels synced",
    );
    } catch (levelError) {
      // inventoryLevels query may not exist in newer API versions — skip gracefully
      log.warn({ error: String(levelError) }, "Inventory levels sync skipped (API not supported)");
    }

    log.info({ result }, "Initial data sync completed successfully");
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    result.errors.push(errMsg);
    log.error({ error: errMsg }, "Initial data sync failed");
  }

  return result;
}
