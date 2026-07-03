import { Worker, Job } from "bullmq";
import { createWorkerConnection } from "../redis-connection";
import { logger } from "~/lib/logger";
import { processLevelUpdate } from "~/lib/services/inventory-sync";

const connection = createWorkerConnection();

interface JobData {
  shopDomain: string;
  changes: Array<{
    inventoryItemId: string;
    locationId: string;
    available: number;
  }>;
}

let inventorySyncWorker: Worker<JobData> | null = null;

if (connection) {
  inventorySyncWorker = new Worker(
    "inventory-sync",
    async (job: Job<JobData>) => {
      const { shopDomain, changes } = job.data;
      
      try {
        await processLevelUpdate(shopDomain, changes, `webhook-${job.id}`);
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
