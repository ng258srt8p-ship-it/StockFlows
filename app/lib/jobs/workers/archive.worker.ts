import { Worker, Job } from "bullmq";
import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";
import { createWorkerConnection } from "../redis-connection";

const connection = createWorkerConnection();

interface ArchiveJobData {
  movementAgeMonths?: number;
  forecastAgeMonths?: number;
}

let archiveWorker: Worker<ArchiveJobData> | null = null;

if (connection) {
  archiveWorker = new Worker(
    "archive",
    async (job: Job<ArchiveJobData>) => {
      const log = logger.child({ jobId: job.id, worker: "archive" });
      log.info("Starting data archival scan");

      const movementThresholdMonths = job.data.movementAgeMonths ?? 12;
      const forecastThresholdMonths = job.data.forecastAgeMonths ?? 6;

      const movementCutoff = new Date();
      movementCutoff.setMonth(movementCutoff.getMonth() - movementThresholdMonths);

      const forecastCutoff = new Date();
      forecastCutoff.setMonth(forecastCutoff.getMonth() - forecastThresholdMonths);

      const oldMovementsCount = await prisma.stockMovement.count({
        where: { createdAt: { lt: movementCutoff } },
      });

      const oldForecastsCount = await prisma.forecastResult.count({
        where: { createdAt: { lt: forecastCutoff } },
      });

      log.info({ movements: oldMovementsCount, forecasts: oldForecastsCount }, "Archival scan complete (dry run)");
      return { movementsArchived: oldMovementsCount, forecastsArchived: oldForecastsCount };
    },
    { connection, concurrency: 1 }
  );

  archiveWorker.on("failed", (job, error) => {
    logger.error({ jobId: job?.id, err: error }, "Archive job failed");
  });
} else {
  logger.info("Redis not configured — archive worker disabled");
}

export { archiveWorker };
