import { Worker, Job } from "bullmq";
import { createWorkerConnection } from "../redis-connection";
import { logger } from "~/lib/logger";
import { processLevelUpdate, processItemUpsert } from "~/lib/services/inventory-sync";

const connection = createWorkerConnection();

interface JobData {
  shopDomain: string;
  changes?: Array<{
    inventoryItemId: string;
    locationId: string;
    available: number;
  }>;
  // Product variant upsert (from products/create or products/update webhook)
  product?: {
    title: string;
    productType: string | null;
    vendor: string | null;
  };
  variant?: {
    id: string;
    title: string | null;
    sku: string | null;
    barcode: string | null;
  };
  // Direct inventory item upsert (from inventory_items/create or update webhook)
  inventoryItem?: {
    id: string;
    sku: unknown;
    barcode: unknown;
    title: unknown;
    costPerUnit: unknown;
  };
}

let inventorySyncWorker: Worker<JobData> | null = null;

if (connection) {
  inventorySyncWorker = new Worker(
    "inventory-sync",
    async (job: Job<JobData>) => {
      const { shopDomain } = job.data;

      try {
        if (job.data.changes) {
          // Inventory level update
          await processLevelUpdate(shopDomain, job.data.changes, `webhook-${job.id}`);
        } else if (job.data.variant) {
          // Product variant upsert (from products webhook)
          await processItemUpsert(shopDomain, {
            id: job.data.variant.id,
            sku: job.data.variant.sku ?? undefined,
            barcode: job.data.variant.barcode ?? undefined,
          }, `webhook-${job.id}`);
        } else if (job.data.inventoryItem) {
          // Direct inventory item upsert (from inventory_items webhook)
          await processItemUpsert(shopDomain, job.data.inventoryItem as any, `webhook-${job.id}`);
        }
      } catch (error) {
        logger.error({ jobId: job.id, error: error instanceof Error ? error.message : String(error) }, "Worker failed to process inventory sync");
        throw error;
      }
    },
    {
      connection,
      concurrency: 5,
    },
  );

  inventorySyncWorker.on("completed", (job) => {
    logger.debug({ jobId: job.id }, "Inventory sync job completed");
  });

  inventorySyncWorker.on("failed", (job, error) => {
    logger.error(
      { jobId: job?.id, error: error.message },
      "Inventory sync job failed",
    );
  });
} else {
  logger.info("Redis not configured — inventory sync worker disabled");
}

export default inventorySyncWorker;
