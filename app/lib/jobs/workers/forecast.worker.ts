import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { prisma } from "~/lib/db/client";
import { logger } from "~/lib/logger";
import { runForecast } from "~/lib/forecasting/engine";

const connection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT ?? 6379),
  password: process.env.REDIS_PASSWORD ?? undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
} as any;

interface ForecastJobData {
  shopId: string;
  variantId?: string; // Optional: forecast single variant
  locationId?: string;
}

export const forecastWorker = new Worker(
  "forecast",
  async (job: Job<ForecastJobData>) => {
    const { shopId, variantId, locationId } = job.data;
    const log = logger.child({
      jobId: job.id,
      shopId,
      worker: "forecast",
    });

    log.info("Starting forecast run");

    // Get items to forecast
    const where: any = { shopId };
    if (variantId) where.shopifyVariantId = variantId;
    if (locationId) where.locationId = locationId;

    const items = await prisma.inventoryItem.findMany({ where });
    log.info({ itemCount: items.length }, "Items to forecast");

    let completed = 0;
    let errors = 0;

    for (const item of items) {
      try {
        // Gather sales history (last 90 days)
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

        // Aggregate daily sales
        const dailySales = aggregateDailySales(movements);

        if (dailySales.length < 7) {
          log.debug({ itemId: item.id }, "Insufficient data for forecast");
          continue;
        }

        // Run forecast
        const forecast = runForecast(dailySales, 30);

        // Save result
        await prisma.forecastResult.create({
          data: {
            inventoryItemId: item.id,
            locationId: item.locationId,
            forecastDate: new Date(),
            horizonDays: 30,
            predictedDaily: forecast.predictions,
            totalPredicted: forecast.totalPredicted,
            confidence: forecast.confidence,
            modelUsed: forecast.modelUsed,
            modelVersion: "1.0",
            factors: {
              avgDailySales: forecast.avgDailySales,
              trendDirection: forecast.trendDirection,
            },
          },
        });

        // Check for predicted stockout
        const daysUntilStockout = Math.floor(
          item.quantity / (forecast.avgDailySales || 1)
        );
        const vendor = await prisma.vendor.findFirst({
          where: {
            shopId,
            purchaseOrders: {
              some: {
                lineItems: { some: { inventoryItemId: item.id } },
              },
            },
          },
        });
        const leadTime = vendor?.leadTimeDays || 7;

        if (daysUntilStockout <= leadTime && item.quantity > 0) {
          await prisma.reorderAlert.create({
            data: {
              shopId,
              inventoryItemId: item.id,
              locationId: item.locationId,
              currentStock: item.quantity,
              reorderPoint: item.reorderPoint,
              recommendedQty: Math.ceil(
                forecast.avgDailySales * (leadTime + 14)
              ),
              urgency: daysUntilStockout <= 3 ? "CRITICAL" : "WARNING",
              notes: `Forecast predicts stockout in ${daysUntilStockout} days`,
            },
          });
        }

        completed++;
      } catch (error) {
        log.error({ err: error, itemId: item.id }, "Forecast failed for item");
        errors++;
      }
    }

    log.info({ completed, errors, total: items.length }, "Forecast run complete");
    return { completed, errors, total: items.length };
  },
  {
    connection,
    concurrency: 2,
    limiter: { max: 20, duration: 60_000 },
  }
);

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

forecastWorker.on("failed", (job, error) => {
  logger.error({ jobId: job?.id, err: error }, "Forecast job failed");
});
