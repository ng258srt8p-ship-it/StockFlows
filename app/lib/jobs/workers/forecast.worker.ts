import { Worker, Job } from "bullmq";
import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";
import { runForecast } from "~/lib/forecasting/engine";
import { createWorkerConnection } from "../redis-connection";

const connection = createWorkerConnection();

interface ForecastJobData {
  shopId: string;
  variantId?: string;
  locationId?: string;
}

let forecastWorker: Worker<ForecastJobData> | null = null;

if (connection) {
  forecastWorker = new Worker(
    "forecast",
    async (job: Job<ForecastJobData>) => {
      const { shopId } = job.data;
      const log = logger.child({ jobId: job.id, worker: "forecast" });
      log.info("Starting forecast run");

      const items = await prisma.inventoryItem.findMany({ where: { shopId } });
      log.info({ itemCount: items.length }, "Items to forecast");

      let completed = 0;

      for (const item of items) {
        try {
          const ninetyDaysAgo = new Date();
          ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

          const movements = await prisma.stockMovement.findMany({
            where: {
              inventoryItemId: item.id,
              type: "SALE",
              createdAt: { gte: ninetyDaysAgo },
            },
            orderBy: { createdAt: "asc" },
          });

          const dailySales = aggregateDailySales(movements);
          if (dailySales.length < 7) continue;

          const forecast = await runForecast(dailySales, 30);
          if (forecast.modelUsed === "none") continue;

          await prisma.forecastResult.upsert({
            where: {
              inventoryItemId_locationId_forecastDate: {
                inventoryItemId: item.id,
                locationId: item.locationId,
                forecastDate: new Date(),
              },
            },
            update: {
              horizonDays: 30,
              predictedDaily: forecast.predictions,
              totalPredicted: forecast.totalPredicted,
              confidence: forecast.confidence,
              modelUsed: forecast.modelUsed,
              modelVersion: "v1",
              factors: { avgDailySales: forecast.avgDailySales, trendDirection: forecast.trendDirection },
            },
            create: {
              inventoryItemId: item.id,
              locationId: item.locationId,
              forecastDate: new Date(),
              horizonDays: 30,
              predictedDaily: forecast.predictions,
              totalPredicted: forecast.totalPredicted,
              confidence: forecast.confidence,
              modelUsed: forecast.modelUsed,
              modelVersion: "v1",
              factors: { avgDailySales: forecast.avgDailySales, trendDirection: forecast.trendDirection },
            },
          });
          completed++;
        } catch (error) {
          log.error({ err: error, itemId: item.id }, "Forecast failed for item");
        }
      }

      log.info({ completed, total: items.length }, "Forecast run complete");
      return { completed, total: items.length };
    },
    { connection, concurrency: 2, limiter: { max: 20, duration: 60_000 } }
  );

  forecastWorker.on("failed", (job, error) => {
    logger.error({ jobId: job?.id, err: error }, "Forecast job failed");
  });
} else {
  logger.info("Redis not configured — forecast worker disabled");
}

export { forecastWorker };

function aggregateDailySales(
  movements: Array<{ createdAt: Date; quantityChange: number }>
): Array<{ date: string; qty: number }> {
  const dailyMap = new Map<string, number>();
  for (const m of movements) {
    const dateStr = m.createdAt.toISOString().split("T")[0];
    const current = dailyMap.get(dateStr) || 0;
    dailyMap.set(dateStr, current + Math.abs(m.quantityChange));
  }
  return Array.from(dailyMap.entries())
    .map(([date, qty]) => ({ date, qty }))
    .sort((a, b) => a.date.localeCompare(b.date));
}