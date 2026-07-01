import { Worker, Job } from "bullmq";
import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";
import { broadcastSSE } from "~/lib/sse/manager.server";

const hasRedis = Boolean(process.env.REDIS_HOST || process.env.REDIS_URL);

const connection = hasRedis
  ? {
      host: process.env.REDIS_HOST ?? "localhost",
      port: Number(process.env.REDIS_PORT ?? 6379),
      password: process.env.REDIS_PASSWORD ?? undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    }
  : null;

interface InventorySyncJobData {
  shopDomain: string;
  changes: Array<{
    inventoryItemId: string;
    locationId: string;
    available: number;
  }>;
}

let inventorySyncWorker: Worker<InventorySyncJobData> | null = null;

if (connection) {
  inventorySyncWorker = new Worker(
    "inventory-sync",
    async (job: Job<InventorySyncJobData>) => {
      const { shopDomain, changes } = job.data;
      const log = logger.child({
        jobId: job.id,
        shopDomain,
        worker: "inventory-sync",
      });

      log.info({ changeCount: changes.length }, "Processing inventory sync");

      const shop = await prisma.shop.findUnique({
        where: { shopifyDomain: shopDomain },
      });
      if (!shop) {
        log.warn("Shop not found, skipping sync");
        return;
      }

      let processed = 0;

      for (const change of changes) {
        try {
          // Find or create inventory item
          const item = await prisma.inventoryItem.findFirst({
            where: {
              shopifyVariantId: change.inventoryItemId,
              locationId: change.locationId,
            },
          });

          if (item) {
            const oldQty = item.quantity;
            const newQty = change.available;

            await prisma.inventoryItem.update({
              where: { id: item.id },
              data: {
                quantity: newQty,
                available: Math.max(0, newQty - item.reserved),
              },
            });

            // Record movement
            const delta = newQty - oldQty;
            if (delta !== 0) {
              await prisma.stockMovement.create({
                data: {
                  inventoryItemId: item.id,
                  locationId: change.locationId,
                  type: delta > 0 ? "RETURN" : "SALE",
                  quantityChange: delta,
                  reference: `webhook-sync-${job.id}`,
                },
              });
            }

            // Check reorder threshold
            if (newQty <= item.reorderPoint && oldQty > item.reorderPoint) {
              const urgency =
                newQty === 0 ? "CRITICAL" : newQty <= item.reorderPoint / 2 ? "WARNING" : "INFO";

              await prisma.reorderAlert.create({
                data: {
                  shopId: shop.id,
                  inventoryItemId: item.id,
                  locationId: change.locationId,
                  currentStock: newQty,
                  reorderPoint: item.reorderPoint,
                  recommendedQty: item.reorderQuantity || item.reorderPoint * 2,
                  urgency: urgency as "CRITICAL" | "WARNING" | "INFO",
                },
              });
            }

            // Broadcast SSE update
            broadcastSSE(shopDomain, "inventory-update", {
              itemId: item.id,
              variantId: item.shopifyVariantId,
              locationId: change.locationId,
              oldQuantity: oldQty,
              newQuantity: newQty,
            });

            processed++;
          }
        } catch (error) {
          log.error(
            { err: error, inventoryItemId: change.inventoryItemId },
            "Failed to sync inventory item"
          );
        }

        // Rate limit: 50ms between items
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      await job.updateProgress(processed);
      log.info({ processed, total: changes.length }, "Inventory sync complete");
      return { processed, total: changes.length };
    },
    {
      connection,
      concurrency: 5,
      limiter: {
        max: 100,
        duration: 60_000,
      },
    }
  );

  inventorySyncWorker.on("failed", (job, error) => {
    logger.error({ jobId: job?.id, err: error }, "Inventory sync job failed");
  });

  inventorySyncWorker.on("completed", (job, result) => {
    logger.debug({ jobId: job.id, result }, "Inventory sync job completed");
  });
} else {
  // Mock worker for when Redis is not available
  logger.info("Redis not configured — inventory-sync worker disabled");
}

export { inventorySyncWorker };
