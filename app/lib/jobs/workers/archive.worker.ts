import { Worker, Job } from "bullmq";
import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";

const connection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT ?? 6379),
  password: process.env.REDIS_PASSWORD ?? undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
} as any;

interface ArchiveJobData {
  /** Override the default 12-month threshold for stock movements (in months). */
  movementAgeMonths?: number;
  /** Override the default 6-month threshold for forecasts (in months). */
  forecastAgeMonths?: number;
}

export const archiveWorker = new Worker(
  "archive",
  async (job: Job<ArchiveJobData>) => {
    const log = logger.child({ jobId: job.id, worker: "archive" });

    log.info("Starting data archival scan");

    const movementThresholdMonths = job.data.movementAgeMonths ?? 12;
    const forecastThresholdMonths = job.data.forecastAgeMonths ?? 6;

    // Calculate cutoff dates
    const movementCutoff = new Date();
    movementCutoff.setMonth(movementCutoff.getMonth() - movementThresholdMonths);

    const forecastCutoff = new Date();
    forecastCutoff.setMonth(forecastCutoff.getMonth() - forecastThresholdMonths);

    // Count stock movements older than threshold
    const oldMovementsCount = await prisma.stockMovement.count({
      where: {
        createdAt: { lt: movementCutoff },
      },
    });

    log.info(
      {
        threshold: movementCutoff.toISOString(),
        months: movementThresholdMonths,
        count: oldMovementsCount,
      },
      "Stock movements eligible for archival"
    );

    // Count forecasts older than threshold
    const oldForecastsCount = await prisma.forecastResult.count({
      where: {
        createdAt: { lt: forecastCutoff },
      },
    });

    log.info(
      {
        threshold: forecastCutoff.toISOString(),
        months: forecastThresholdMonths,
        count: oldForecastsCount,
      },
      "Forecast results eligible for archival"
    );

    const totalRecords = oldMovementsCount + oldForecastsCount;

    if (totalRecords === 0) {
      log.info("No records eligible for archival — nothing to do");
      return { movementsArchived: 0, forecastsArchived: 0 };
    }

    log.info(
      {
        movements: oldMovementsCount,
        forecasts: oldForecastsCount,
        total: totalRecords,
      },
      "Archival scan complete (dry run — no records deleted)"
    );

    return {
      movementsArchived: oldMovementsCount,
      forecastsArchived: oldForecastsCount,
    };
  },
  {
    connection,
    concurrency: 1,
  }
);

archiveWorker.on("failed", (job, error) => {
  logger.error({ jobId: job?.id, err: error }, "Archive job failed");
});

archiveWorker.on("completed", (job, result) => {
  logger.info({ jobId: job.id, result }, "Archive job completed");
});
