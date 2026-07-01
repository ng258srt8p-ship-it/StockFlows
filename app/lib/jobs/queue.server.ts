import { Queue } from "bullmq";

// ---------------------------------------------------------------------------
// Lazy Redis connection — only connect when REDIS_HOST or REDIS_URL is set.
// This prevents ioredis from spamming connection errors when Redis is not
// configured (e.g. local dev, Railway without Redis add-on).
// ---------------------------------------------------------------------------

const hasRedis = Boolean(process.env.REDIS_HOST || process.env.REDIS_URL);

const connectionOptions = hasRedis
  ? {
      host: process.env.REDIS_HOST ?? "localhost",
      port: Number(process.env.REDIS_PORT ?? 6379),
      password: process.env.REDIS_PASSWORD ?? undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    }
  : null;

function createLazyQueue(name: string, opts?: Record<string, unknown>) {
  if (!connectionOptions) return null;
  return new Queue(name, {
    connection: connectionOptions,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
      ...opts,
    },
  });
}

export const inventorySyncQueue = createLazyQueue("inventory-sync");
export const forecastQueue = createLazyQueue("forecast", { attempts: 2, backoff: { type: "exponential", delay: 5000 } });
export const alertQueue = createLazyQueue("alerts", { backoff: { type: "exponential", delay: 1000 }, removeOnComplete: { count: 200 }, removeOnFail: { count: 100 } });
export const reportQueue = createLazyQueue("reports", { attempts: 2, backoff: { type: "fixed", delay: 3000 } });
export const staffSyncQueue = createLazyQueue("staff-sync");
