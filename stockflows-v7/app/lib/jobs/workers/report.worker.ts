import { Worker, Job } from "bullmq";
import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";
import { sendLowStockEmail } from "~/lib/notifications/email";
import { createWorkerConnection } from "../redis-connection";

const connection = createWorkerConnection();

let reportWorker: Worker | null = null;

if (connection) {
  reportWorker = new Worker(
    "reports",
    async (job: Job) => {
      const log = logger.child({ jobId: job.id, worker: "reports" });
      log.info("Starting weekly report generation");

      const shops = await prisma.shop.findMany({
        where: { settings: { emailAlerts: true } },
        include: { settings: true, locations: true },
      });

      let generated = 0;

      for (const shop of shops) {
        try {
          const items = await prisma.inventoryItem.findMany({
            where: { shopId: shop.id },
            include: { location: true },
            orderBy: { quantity: "asc" },
            take: 50,
          });

          const totalSKUs = items.length;
          const lowStockItems = items.filter((i) => i.quantity <= i.reorderPoint);
          const outOfStockItems = items.filter((i) => i.quantity === 0);

          await sendLowStockEmail({
            shopDomain: shop.shopifyDomain,
            productName: "Weekly Inventory Report",
            locationName: `${shop.locations.length} locations`,
            currentQty: totalSKUs,
            reorderPoint: lowStockItems.length,
            urgency: outOfStockItems.length > 0 ? "CRITICAL" as const : "INFO" as const,
            recommendedQty: 0,
          });

          generated++;
          log.info({ shopId: shop.id, totalSKUs, lowStock: lowStockItems.length, outOfStock: outOfStockItems.length }, "Weekly report generated");
        } catch (error) {
          log.error({ err: error, shopId: shop.id }, "Failed to generate report for shop");
        }
      }

      log.info({ shopCount: shops.length, generated }, "Weekly report run complete");
      return { shopCount: shops.length, generated };
    },
    { connection, concurrency: 2, limiter: { max: 5, duration: 60_000 } }
  );

  reportWorker.on("failed", (job, error) => {
    logger.error({ jobId: job?.id, err: error }, "Report job failed");
  });

  reportWorker.on("completed", (job, result) => {
    logger.info({ jobId: job.id, result }, "Report job completed");
  });
} else {
  logger.info("Redis not configured — report worker disabled");
}

export { reportWorker };
