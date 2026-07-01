import { Queue } from "bullmq";

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

function createQueue(name: string, options: Record<string, unknown> = {}) {
  if (!connection) {
    // Return a mock queue that logs but does nothing
    return {
      add: async (jobName: string, data: unknown, opts?: Record<string, unknown>) => {
        console.log(`[MOCK QUEUE ${name}] Would add job: ${jobName}`, JSON.stringify(data));
        return { id: `mock-${Date.now()}`, name: jobName, data };
      },
      close: async () => {},
      on: () => {},
      isReady: () => false,
    } as any;
  }

  return new Queue(name, { connection, ...options });
}

export const inventorySyncQueue = createQueue("inventory-sync", {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

export const forecastQueue = createQueue("forecast", {
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 25 },
  },
});

export const alertQueue = createQueue("alerts", {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 100 },
  },
});

export const reportQueue = createQueue("reports", {
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "fixed", delay: 3000 },
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 25 },
  },
});

export const staffSyncQueue = createQueue("staff-sync", {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});