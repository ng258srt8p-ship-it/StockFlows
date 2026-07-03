/**
 * Shared Redis connection module for StockFlows workers and BullMQ queues.
 *
 * Consolidates Redis connection logic from queue.server.ts and all worker files
 * to use a single connection configuration that reads from REDIS_URL first.
 *
 * NOTE: This file MUST have .server.ts suffix to prevent client-side bundling.
 * Renamed to redis-connection.server.ts for this reason.
 */

const hasRedis = Boolean(process.env.REDIS_HOST || process.env.REDIS_URL);

if (!hasRedis) {
  console.log("[jobs] Redis not configured — background workers disabled");
}

const redisUrl = process.env.REDIS_URL;

/**
 * Build a BullMQ-compatible connection options object from env vars.
 * Returns an ioredis connection options object (not a URL string) to avoid
 * BullMQ internal connection handling issues with URL parsing.
 */
function buildConnectionConfig() {
  if (redisUrl) {
    // Parse the URL manually to build a proper ioredis config object
    try {
      const parsed = new URL(redisUrl);
      const config: Record<string, unknown> = {
        host: parsed.hostname,
        port: parseInt(parsed.port, 10) || 6379,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      };
      if (parsed.username) config.username = decodeURIComponent(parsed.username);
      if (parsed.password) config.password = decodeURIComponent(parsed.password);
      if (parsed.protocol === "rediss:") config.tls = {};
      return config;
    } catch (e) {
      console.error("[jobs] Failed to parse REDIS_URL:", e);
      return null;
    }
  }

  if (process.env.REDIS_HOST) {
    return {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT ?? 6379),
      password: process.env.REDIS_PASSWORD ?? undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    };
  }

  return null;
}

/**
 * Create BullMQ connection config.
 * Returns an ioredis connection options object or null.
 */
export function createBullMQConnection() {
  const config = buildConnectionConfig();
  if (config) {
    console.log("[jobs] BullMQ connecting to Redis:", config.host, ":", config.port);
  }
  return config;
}

/**
 * Create worker connection config.
 * Returns an ioredis connection options object or null.
 */
export function createWorkerConnection() {
  if (!hasRedis) {
    return null;
  }
  return buildConnectionConfig();
}

/**
 * Get Redis configuration for logging purposes.
 */
export function getRedisConfig() {
  if (redisUrl) {
    return { type: "REDIS_URL (Upstash)", target: "Upstash" } as const;
  } else if (process.env.REDIS_HOST) {
    return { type: "REDIS_HOST (local)", target: process.env.REDIS_HOST } as const;
  }
  return null;
}

/**
 * Health check for external use.
 */
export async function checkRedisHealth() {
  if (!hasRedis) {
    return { healthy: false, reason: "Redis not configured" };
  }

  try {
    const { default: IORedis } = await import("ioredis");
    const config = buildConnectionConfig();
    if (!config) return { healthy: false, reason: "No connection config" };

    const redis = new IORedis(config as any);
    await redis.connect();
    const ping = await redis.ping();
    await redis.quit();
    return { healthy: ping === "PONG", reason: "OK" };
  } catch (error) {
    return { healthy: false, reason: error instanceof Error ? error.message : "Unknown error" };
  }
}

export default {
  createBullMQConnection,
  createWorkerConnection,
  getRedisConfig,
  checkRedisHealth,
};