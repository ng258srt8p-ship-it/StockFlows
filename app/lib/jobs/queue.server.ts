import { Queue } from "bullmq";

const connectionOptions = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT ?? 6379),
  password: process.env.REDIS_PASSWORD ?? undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
} as any;

export const inventorySyncQueue = new Queue("inventory-sync", {
  connection: connectionOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

export const forecastQueue = new Queue("forecast", {
  connection: connectionOptions,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 25 },
  },
});

export const alertQueue = new Queue("alerts", {
  connection: connectionOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 100 },
  },
});

export const reportQueue = new Queue("reports", {
  connection: connectionOptions,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "fixed", delay: 3000 },
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 25 },
  },
});

export const staffSyncQueue = new Queue("staff-sync", {
  connection: connectionOptions,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 10 },
    removeOnFail: { count: 10 },
  },
});
