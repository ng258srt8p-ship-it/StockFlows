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

/**
 * Format a Date as "YYYY_MM" for partition table naming.
 */
function formatPartitionSuffix(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}_${month}`;
}

export const partitionWorker = new Worker(
  "partition",
  async (_job: Job) => {
    const log = logger.child({ worker: "partition" });

    log.info("Creating stock_movements partitions for the next 3 months");

    const now = new Date();
    const partitionsCreated: string[] = [];

    for (let offset = 0; offset < 3; offset++) {
      const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      const suffix = formatPartitionSuffix(target);
      const tableName = `stock_movements_${suffix}`;

      const sql = `CREATE TABLE IF NOT EXISTS "${tableName}" (
  LIKE "stock_movements" INCLUDING DEFAULTS INCLUDING CONSTRAINTS INCLUDING INDEXES
)`;

      try {
        await prisma.$executeRawUnsafe(sql);
        partitionsCreated.push(tableName);
        log.info({ tableName }, "Partition ensured");
      } catch (error) {
        log.error(
          { err: error, tableName },
          "Failed to create partition"
        );
        throw error;
      }
    }

    log.info(
      { partitions: partitionsCreated },
      "Partition creation complete"
    );

    return { partitions: partitionsCreated };
  },
  {
    connection,
    concurrency: 1,
  }
);

partitionWorker.on("failed", (job, error) => {
  logger.error({ jobId: job?.id, err: error }, "Partition job failed");
});

partitionWorker.on("completed", (job, result) => {
  logger.info({ jobId: job.id, result }, "Partition job completed");
});
